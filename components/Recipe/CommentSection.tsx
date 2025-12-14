// components/CommentModal.tsx - FIXED: Sort, Keyboard, Avatar touchable area
import { useWebSocketStatus } from "@/hooks/useWebSocketStatus";
import { commentService } from "@/services/commentService";
import websocketService from "@/services/websocketService";
import { CommentResponse } from "@/types/comment";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  FlatList,
  Image,
  Keyboard,
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface CommentModalProps {
  visible: boolean;
  onClose: () => void;
  recipeId: string;
  currentUserId: string;
  currentUserAvatar?: string;
  onCommentCountChange?: (newCount: number) => void;
  focusCommentId?: string | null;
}

type SortOption = "relevant" | "newest" | "oldest";

interface CommentWithExpandedReplies extends CommentResponse {
  expandedRepliesCount?: number;
}

const { height: SCREEN_HEIGHT } = Dimensions.get("window");

const CommentModal: React.FC<CommentModalProps> = ({
  visible,
  onClose,
  recipeId,
  currentUserId,
  currentUserAvatar,
  onCommentCountChange,
  focusCommentId,
}) => {
  const [comments, setComments] = useState<CommentWithExpandedReplies[]>([]);
  const [loading, setLoading] = useState(true);
  const [commentText, setCommentText] = useState("");
  const [replyingTo, setReplyingTo] = useState<CommentResponse | null>(null);
  const [editingComment, setEditingComment] = useState<CommentResponse | null>(
    null
  );
  const [submitting, setSubmitting] = useState(false);
  const [isKeyboardOpen, setIsKeyboardOpen] = useState(false);
  const [sortOption, setSortOption] = useState<SortOption>("relevant");
  const [showSortModal, setShowSortModal] = useState(false);
  const [scrollToCommentId, setScrollToCommentId] = useState<string | null>(
    null
  );
  const [highlightedCommentId, setHighlightedCommentId] = useState<
    string | null
  >(null);
  const hasProcessedFocusRef = useRef(false);

  const insets = useSafeAreaInsets();
  const inputRef = useRef<TextInput>(null);
  const flatListRef = useRef<FlatList>(null);
  const isConnected = useWebSocketStatus();
  const router = useRouter();

  const totalComments = useMemo(
    () => countAllCommentsRecursive(comments),
    [comments]
  );

  // ==================== FIX 1: Sort cả parent và replies ====================
  const sortedComments = useMemo(() => {
    const sortRecursive = (
      commentsList: CommentWithExpandedReplies[]
    ): CommentWithExpandedReplies[] => {
      const sorted = [...commentsList];

      if (sortOption === "newest") {
        sorted.sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
      } else if (sortOption === "oldest") {
        sorted.sort(
          (a, b) =>
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        );
      }

      // Đệ quy sort replies
      return sorted.map((comment) => ({
        ...comment,
        replies:
          comment.replies && comment.replies.length > 0
            ? sortRecursive(comment.replies)
            : comment.replies,
      }));
    };

    return sortRecursive(comments);
  }, [comments, sortOption]);

  // ==================== KEYBOARD LISTENER ====================
  useEffect(() => {
    const show = Keyboard.addListener("keyboardDidShow", () =>
      setIsKeyboardOpen(true)
    );
    const hide = Keyboard.addListener("keyboardDidHide", () =>
      setIsKeyboardOpen(false)
    );

    return () => {
      show.remove();
      hide.remove();
    };
  }, []);

  useEffect(() => {
    if (!visible) {
      hasProcessedFocusRef.current = false;
      setHighlightedCommentId(null);
    }
  }, [visible]);

  // ==================== LOAD COMMENTS ====================
  useEffect(() => {
    if (visible) {
      loadComments();
    }
  }, [visible]);

  useEffect(() => {
    if (replyingTo) {
      const newMention = `@${replyingTo.fullName} `;
      setCommentText(newMention);
      Keyboard.dismiss();
      setTimeout(() => {
        inputRef.current?.focus();
      }, 200);
    } else {
      if (commentText.startsWith("@") && !editingComment) {
        setCommentText("");
      }
    }
  }, [replyingTo]);

  useEffect(() => {
    onCommentCountChange?.(totalComments);
  }, [totalComments, onCommentCountChange]);

  useEffect(() => {
    if (scrollToCommentId && flatListRef.current) {
      const findCommentIndex = (
        commentId: string,
        comments: CommentWithExpandedReplies[]
      ): { parentIndex: number; isReply: boolean } | null => {
        const directIndex = comments.findIndex(
          (c) => c.commentId === commentId
        );
        if (directIndex !== -1) {
          return { parentIndex: directIndex, isReply: false };
        }

        for (let i = 0; i < comments.length; i++) {
          const comment = comments[i];
          if (comment.replies && comment.replies.length > 0) {
            const found = findInReplies(commentId, comment.replies);
            if (found) {
              return { parentIndex: i, isReply: true };
            }
          }
        }

        return null;
      };

      const findInReplies = (
        commentId: string,
        replies: CommentWithExpandedReplies[]
      ): boolean => {
        for (const reply of replies) {
          if (reply.commentId === commentId) return true;
          if (reply.replies && reply.replies.length > 0) {
            if (findInReplies(commentId, reply.replies)) return true;
          }
        }
        return false;
      };

      const result = findCommentIndex(scrollToCommentId, sortedComments);

      if (result) {
        setTimeout(() => {
          flatListRef.current?.scrollToIndex({
            index: result.parentIndex,
            animated: true,
            viewPosition: result.isReply ? 0.3 : 0.5,
          });
          setScrollToCommentId(null);
        }, 500);
      } else {
        setScrollToCommentId(null);
      }
    }
  }, [scrollToCommentId, sortedComments]);

  useEffect(() => {
    if (
      visible &&
      focusCommentId &&
      !loading &&
      comments.length > 0 &&
      !hasProcessedFocusRef.current
    ) {
      hasProcessedFocusRef.current = true;

      const timer = setTimeout(() => {
        handleFocusComment(focusCommentId);
      }, 300);

      return () => clearTimeout(timer);
    }
  }, [visible, focusCommentId, loading]);

  const handleFocusComment = useCallback((targetCommentId: string) => {
    const parentsToExpand: string[] = [];

    const findParentPath = (
      commentsList: CommentWithExpandedReplies[],
      path: string[] = []
    ): boolean => {
      for (const comment of commentsList) {
        if (comment.commentId === targetCommentId) {
          parentsToExpand.push(...path);
          return true;
        }

        if (comment.replies && comment.replies.length > 0) {
          if (findParentPath(comment.replies, [...path, comment.commentId])) {
            return true;
          }
        }
      }
      return false;
    };

    setComments((currentComments) => {
      findParentPath(currentComments);

      if (parentsToExpand.length > 0) {
        let updated = [...currentComments];

        parentsToExpand.forEach((parentId) => {
          updated = expandCommentById(updated, parentId, Infinity);
        });

        return updated;
      }

      return currentComments;
    });

    setTimeout(() => {
      setScrollToCommentId(targetCommentId);
      setHighlightedCommentId(targetCommentId);

      setTimeout(() => {
        setHighlightedCommentId(null);
      }, 3000);
    }, 500);
  }, []);

  const expandCommentById = (
    commentsList: CommentWithExpandedReplies[],
    commentId: string,
    count: number
  ): CommentWithExpandedReplies[] => {
    return commentsList.map((c) => {
      if (c.commentId === commentId) {
        return {
          ...c,
          expandedRepliesCount: Math.min(count, c.replies?.length || 0),
        };
      }
      if (c.replies && c.replies.length > 0) {
        return {
          ...c,
          replies: expandCommentById(c.replies, commentId, count),
        };
      }
      return c;
    });
  };

  const loadComments = useCallback(async () => {
    try {
      setLoading(true);
      const data = await commentService.getCommentsByRecipe(recipeId);
      const normalized = normalizeCommentsRecursive(data);
      setComments(normalized);
    } catch (error) {
      Alert.alert("Lỗi", "Không thể tải bình luận");
    } finally {
      setLoading(false);
    }
  }, [recipeId]);

  // ==================== WEBSOCKET ====================
  const handleNewComment = useCallback(
    (data: any) => {
      if (data.recipeId !== recipeId) return;
      const newComment: CommentResponse = data.comment;

      setComments((prev) => {
        const addReplyRecursively = (
          comments: CommentWithExpandedReplies[]
        ): { updated: boolean; comments: CommentWithExpandedReplies[] } => {
          let updated = false;
          const newComments = comments.map((comment) => {
            if (comment.commentId === newComment.parentCommentId) {
              updated = true;
              const updatedReplies = [...(comment.replies || []), newComment];
              return {
                ...comment,
                replies: updatedReplies,
                replyCount: (comment.replyCount || 0) + 1,
                expandedRepliesCount: updatedReplies.length,
              };
            }
            if (comment.replies && comment.replies.length > 0) {
              const result = addReplyRecursively(comment.replies);
              if (result.updated) {
                updated = true;
                return {
                  ...comment,
                  replies: result.comments,
                  replyCount: (comment.replyCount || 0) + 1,
                };
              }
            }
            return comment;
          });
          return { updated, comments: newComments };
        };

        if (!newComment.parentCommentId) {
          if (prev.some((c) => c.commentId === newComment.commentId))
            return prev;
          return [newComment, ...prev];
        }
        const result = addReplyRecursively(prev);
        return result.updated ? result.comments : prev;
      });
    },
    [recipeId]
  );

  const handleUpdateComment = useCallback(
    (data: any) => {
      if (data.recipeId !== recipeId) return;
      const updated = data.comment;
      const updateRecursively = (
        comments: CommentWithExpandedReplies[]
      ): CommentWithExpandedReplies[] => {
        return comments.map((c) =>
          c.commentId === updated.commentId
            ? { ...c, content: updated.content, updatedAt: updated.updatedAt }
            : c.replies
            ? { ...c, replies: updateRecursively(c.replies) }
            : c
        );
      };
      setComments(updateRecursively);
    },
    [recipeId]
  );

  const handleDeleteComment = useCallback(
    (data: any) => {
      if (data.recipeId !== recipeId) return;
      const deletedId = data.comment.commentId;
      const removeRecursively = (
        comments: CommentWithExpandedReplies[]
      ): CommentWithExpandedReplies[] => {
        return comments
          .filter((c) => c.commentId !== deletedId)
          .map((c) => ({
            ...c,
            replies: c.replies ? removeRecursively(c.replies) : [],
            replyCount: Math.max(0, (c.replyCount || 0) - 1),
          }));
      };
      setComments(removeRecursively);
    },
    [recipeId]
  );

  useEffect(() => {
    if (!visible || !isConnected) return;
    websocketService.on("NEW_COMMENT", handleNewComment);
    websocketService.on("UPDATE_COMMENT", handleUpdateComment);
    websocketService.on("DELETE_COMMENT", handleDeleteComment);
    websocketService.subscribeToRecipeComments(recipeId);

    return () => {
      websocketService.off("NEW_COMMENT", handleNewComment);
      websocketService.off("UPDATE_COMMENT", handleUpdateComment);
      websocketService.off("DELETE_COMMENT", handleDeleteComment);
      websocketService.unsubscribeFromRecipeComments(recipeId);
    };
  }, [
    visible,
    isConnected,
    recipeId,
    handleNewComment,
    handleUpdateComment,
    handleDeleteComment,
  ]);

  // ==================== SUBMIT ====================
  const handleSubmit = async () => {
    const text = commentText.trim();
    if (!text || submitting) return;

    try {
      setSubmitting(true);
      setCommentText("");
      Keyboard.dismiss();

      if (editingComment) {
        await commentService.updateComment(editingComment.commentId, text);
        setEditingComment(null);
        return;
      }

      const newComment = await commentService.createComment({
        recipeId,
        content: text,
        parentCommentId: replyingTo?.commentId,
      });

      setReplyingTo(null);
      if (replyingTo) setScrollToCommentId(replyingTo.commentId);
      else setScrollToCommentId(newComment.commentId);
    } catch (error: any) {
      Alert.alert("Lỗi", error.message || "Không thể gửi bình luận");
      setCommentText(text);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (comment: CommentResponse) => {
    const message =
      !comment.parentCommentId && (comment.replyCount || 0) > 0
        ? `Bình luận này có ${comment.replyCount} trả lời. Xóa sẽ xóa tất cả. Bạn có chắc?`
        : "Bạn có chắc muốn xóa bình luận này?";

    Alert.alert("Xóa bình luận", message, [
      { text: "Hủy", style: "cancel" },
      {
        text: "Xóa",
        style: "destructive",
        onPress: () => commentService.deleteComment(comment.commentId),
      },
    ]);
  };

  const handleExpandReplies = useCallback((commentId: string) => {
    setComments((prev) => {
      const expandRecursive = (
        commentsList: CommentWithExpandedReplies[]
      ): CommentWithExpandedReplies[] => {
        return commentsList.map((c) => {
          if (c.commentId === commentId) {
            return {
              ...c,
              expandedRepliesCount: Math.min(
                (c.expandedRepliesCount || 0) + 5,
                c.replies?.length || 0
              ),
            };
          }
          if (c.replies && c.replies.length > 0) {
            return {
              ...c,
              replies: expandRecursive(c.replies),
            };
          }
          return c;
        });
      };

      return expandRecursive(prev);
    });
  }, []);

  // ==================== FIX 3: Avatar chỉ touchable ở vùng avatar ====================
  const renderComment = useCallback(
    (comment: CommentWithExpandedReplies, isReply = false, depth = 0) => {
      const isOwner = comment.userId === currentUserId;
      const timeAgo = getTimeAgo(comment.createdAt);
      const hasReplies = comment.replies && comment.replies.length > 0;
      const expandedCount = comment.expandedRepliesCount || 0;
      const visibleReplies = hasReplies
        ? comment.replies!.slice(0, expandedCount)
        : [];
      const totalDescendants = countDescendants(comment);
      const remainingReplies = Math.max(
        0,
        (comment.replies?.length || 0) - expandedCount
      );
      const isHighlighted = comment.commentId === highlightedCommentId;

      return (
        <View
          key={comment.commentId}
          style={[
            styles.commentContainer,
            isReply && styles.replyContainer,
            depth >= 2 && { marginLeft: 16 },
          ]}
        >
          <TouchableOpacity
            onPress={() => {
              onClose();
              router.push(
                isOwner ? "/(tabs)/profile" : `/profile/${comment.userId}`
              );
            }}
            style={styles.avatarTouchable}
          >
            <Image
              source={{
                uri: comment.userAvatar || "https://via.placeholder.com/40",
              }}
              style={[styles.avatar, isReply && styles.avatarReply]}
            />
          </TouchableOpacity>

          <View style={styles.commentContent}>
            <View
              style={[
                styles.commentBubble,
                isHighlighted && styles.highlightedComment,
              ]}
            >
              <Text style={styles.userName}>{comment.fullName}</Text>
              <Text style={styles.commentText}>{comment.content}</Text>
            </View>

            <View style={styles.commentMeta}>
              <Text style={styles.timeAgo}>{timeAgo}</Text>
              <TouchableOpacity
                onPress={() => {
                  Keyboard.dismiss();
                  setReplyingTo(comment);
                  setEditingComment(null);
                  setScrollToCommentId(comment.commentId);
                }}
                style={styles.metaButton}
              >
                <Text style={styles.metaText}>Trả lời</Text>
              </TouchableOpacity>

              {isOwner && (
                <>
                  <TouchableOpacity
                    onPress={() => {
                      Keyboard.dismiss();
                      setEditingComment(comment);
                      setCommentText(comment.content);
                      setReplyingTo(null);
                      setTimeout(() => inputRef.current?.focus(), 200);
                    }}
                    style={styles.metaButton}
                  >
                    <Text style={styles.metaText}>Sửa</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => handleDelete(comment)}
                    style={styles.metaButton}
                  >
                    <Text style={[styles.metaText, styles.deleteText]}>
                      Xóa
                    </Text>
                  </TouchableOpacity>
                </>
              )}
            </View>

            {hasReplies && (
              <View style={styles.repliesContainer}>
                {expandedCount === 0 ? (
                  <TouchableOpacity
                    onPress={() => handleExpandReplies(comment.commentId)}
                    style={styles.expandButton}
                  >
                    <Text style={styles.expandButtonText}>
                      Xem {totalDescendants} câu trả lời
                    </Text>
                  </TouchableOpacity>
                ) : (
                  <>
                    {visibleReplies.map((reply) =>
                      renderComment(reply, true, depth + 1)
                    )}
                    {remainingReplies > 0 && (
                      <TouchableOpacity
                        onPress={() => handleExpandReplies(comment.commentId)}
                        style={styles.expandButton}
                      >
                        <Text style={styles.expandButtonText}>
                          Xem thêm {remainingReplies} câu trả lời
                        </Text>
                      </TouchableOpacity>
                    )}
                  </>
                )}
              </View>
            )}
          </View>
        </View>
      );
    },
    [currentUserId, onClose, router, highlightedCommentId, handleExpandReplies]
  );

  const renderSortModal = () => (
    <Modal visible={showSortModal} transparent animationType="fade">
      <TouchableOpacity
        style={styles.sortModalOverlay}
        activeOpacity={1}
        onPress={() => setShowSortModal(false)}
      >
        <View style={styles.sortModalContent}>
          {(["relevant", "newest", "oldest"] as SortOption[]).map((opt) => (
            <TouchableOpacity
              key={opt}
              style={styles.sortOption}
              onPress={() => {
                setSortOption(opt);
                setShowSortModal(false);
              }}
            >
              <View style={styles.sortOptionRow}>
                <Text style={styles.sortOptionText}>
                  {opt === "relevant"
                    ? "Phù hợp nhất"
                    : opt === "newest"
                    ? "Mới nhất"
                    : "Tất cả bình luận"}
                </Text>
                {sortOption === opt && (
                  <Ionicons name="checkmark-done" size={20} color="#1877F2" />
                )}
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </TouchableOpacity>
    </Modal>
  );

  // ==================== RENDER ====================
  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={false}
      onRequestClose={onClose}
      presentationStyle="pageSheet"
    >
      {renderSortModal()}

      <View style={{ flex: 1, backgroundColor: "#FFF" }}>
        <View style={styles.modalHeader}>
          <View style={styles.modalHandle} />
          <Text style={styles.modalTitle}>Bình luận ({totalComments})</Text>
          <TouchableOpacity
            onPress={onClose}
            style={styles.closeButton}
            activeOpacity={0.7}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons name="close-circle" size={28} color="#666" />
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={styles.sortButton}
          onPress={() => setShowSortModal(true)}
        >
          <Text style={styles.sortButtonText}>
            {sortOption === "relevant" && "Phù hợp nhất"}
            {sortOption === "newest" && "Mới nhất"}
            {sortOption === "oldest" && "Tất cả bình luận"}
          </Text>
          <MaterialIcons name="keyboard-arrow-down" size={20} color="#666" />
        </TouchableOpacity>

        <View style={styles.contentContainer}>
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#FF6B6B" />
            </View>
          ) : comments.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptySubtext}>Chưa có bình luận nào</Text>
              <Text style={styles.emptyHint}>Hãy là người đầu tiên!</Text>
            </View>
          ) : (
            <FlatList
              ref={flatListRef}
              data={sortedComments}
              keyExtractor={(item) => item.commentId}
              renderItem={({ item }) => renderComment(item)}
              contentContainerStyle={styles.listContent}
              keyboardShouldPersistTaps="handled"
              keyboardDismissMode="on-drag"
            />
          )}
        </View>

        <View
          style={[
            styles.inputContainer,
            {
              paddingBottom: insets.bottom + (isKeyboardOpen ? 16 : 8),
            },
          ]}
        >
          {(replyingTo || editingComment) && (
            <View style={styles.replyingToBar}>
              <Text style={styles.replyingToText}>
                {editingComment ? (
                  "Đang chỉnh sửa"
                ) : (
                  <>
                    Trả lời{" "}
                    <Text style={styles.replyingToName}>
                      {replyingTo?.fullName}
                    </Text>
                  </>
                )}
              </Text>
              <TouchableOpacity
                onPress={() => {
                  setReplyingTo(null);
                  setEditingComment(null);
                  setCommentText("");
                }}
              >
                <Text style={styles.cancelReply}>X</Text>
              </TouchableOpacity>
            </View>
          )}

          <View style={styles.inputRow}>
            <Image
              source={{
                uri: currentUserAvatar || "https://via.placeholder.com/36",
              }}
              style={styles.inputAvatar}
            />

            <View style={{ flex: 1 }}>
              <TextInput
                ref={inputRef}
                style={styles.input}
                placeholder="Viết bình luận..."
                placeholderTextColor="#999"
                value={commentText}
                onChangeText={setCommentText}
                multiline
                autoFocus={false}
              />
            </View>

            <TouchableOpacity
              style={[
                styles.sendButton,
                (!commentText.trim() || submitting) &&
                  styles.sendButtonDisabled,
              ]}
              onPress={handleSubmit}
              disabled={!commentText.trim() || submitting}
            >
              {submitting ? (
                <ActivityIndicator size="small" color="#FFF" />
              ) : editingComment ? (
                <MaterialIcons name="check" size={22} color="#FFF" />
              ) : (
                <MaterialIcons
                  name="send"
                  size={22}
                  color="#FFF"
                  style={{ transform: [{ rotate: "-30deg" }], marginTop: -2 }}
                />
              )}
            </TouchableOpacity>
          </View>
        </View>
        {isKeyboardOpen && (
          <TouchableOpacity
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
            }}
            activeOpacity={1}
            onPress={Keyboard.dismiss}
          />
        )}
      </View>
    </Modal>
  );
};

// ==================== HELPERS ====================
function getTimeAgo(dateString: string) {
  const date = new Date(dateString);
  const now = new Date();
  const diff = Math.floor((now.getTime() - date.getTime()) / 1000);
  if (diff < 60) return "Vừa xong";
  if (diff < 3600) return `${Math.floor(diff / 60)} phút`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} giờ`;
  if (diff < 604800) return `${Math.floor(diff / 86400)} ngày`;
  return date.toLocaleDateString("vi-VN");
}

function normalizeCommentsRecursive(comments: any[]): any[] {
  return comments.map((c) => ({
    ...c,
    expandedRepliesCount: 0,
    replies:
      c.replies && c.replies.length
        ? normalizeCommentsRecursive(c.replies)
        : [],
  }));
}

function countAllCommentsRecursive(comments: any[]): number {
  if (!comments || comments.length === 0) return 0;
  return comments.reduce(
    (sum, c) => sum + 1 + countAllCommentsRecursive(c.replies || []),
    0
  );
}

function countDescendants(comment: any): number {
  return countAllCommentsRecursive(comment.replies || []);
}

// ==================== STYLES ====================
const styles = StyleSheet.create({
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
  },
  modalHandle: {
    position: "absolute",
    top: 8,
    width: 40,
    height: 4,
    backgroundColor: "#DDD",
    borderRadius: 2,
  },
  modalTitle: { fontSize: 16, fontWeight: "600", color: "#333" },
  closeButton: { position: "absolute", right: 16, padding: 4 },
  closeButtonText: { fontSize: 25, color: "#0b0b0bff", fontWeight: "300" },
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 40,
  },
  emptyText: { fontSize: 48, marginBottom: 12 },
  emptySubtext: { fontSize: 16, color: "#666", fontWeight: "500" },
  emptyHint: { fontSize: 14, color: "#999", marginTop: 4 },
  listContent: { padding: 16, paddingBottom: 5 },
  commentContainer: {
    flexDirection: "row",
    marginBottom: 5,
  },
  replyContainer: {
    marginLeft: 5,
    marginTop: 8,
  },
  avatarTouchable: {
    alignSelf: "flex-start",
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#E0E0E0",
  },
  avatarReply: {
    width: 25,
    height: 25,
    borderRadius: 12.5,
    backgroundColor: "#E0E0E0",
  },
  commentContent: {
    flex: 1,
    marginLeft: 12,
  },
  commentBubble: {
    backgroundColor: "#F0F0F0",
    borderRadius: 18,
    paddingHorizontal: 12,
    paddingVertical: 8,
    alignSelf: "flex-start",
    maxWidth: "85%",
  },
  highlightedComment: {
    backgroundColor: "#FFF9C4",
  },
  userName: {
    fontWeight: "600",
    fontSize: 13,
    color: "#333",
    marginBottom: 2,
  },
  commentText: {
    fontSize: 14,
    color: "#000",
    lineHeight: 18,
  },
  commentMeta: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
    marginLeft: 12,
  },
  timeAgo: { fontSize: 12, color: "#65676B" },
  metaButton: { marginLeft: 12 },
  metaText: { fontSize: 12, color: "#65676B", fontWeight: "600" },
  deleteText: { color: "#F44336" },
  repliesContainer: { marginTop: 4, marginLeft: -10 },
  expandButton: { marginTop: 2, marginLeft: 8 },
  expandButtonText: { fontSize: 13, color: "#65676B", fontWeight: "600" },
  sortButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
    backgroundColor: "#F8F8F8",
  },
  sortButtonText: { fontSize: 13, color: "#333", fontWeight: "600" },
  sortModalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.4)",
    justifyContent: "center",
    alignItems: "center",
  },
  sortModalContent: {
    backgroundColor: "#FFF",
    borderRadius: 12,
    padding: 16,
    width: "85%",
    maxWidth: 400,
  },
  sortOption: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
  },
  sortOptionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  sortOptionText: { fontSize: 15, fontWeight: "600", color: "#333" },
  inputContainer: {
    borderTopWidth: 1,
    borderTopColor: "#E0E0E0",
    backgroundColor: "#FFF",
    paddingTop: 8,
  },
  replyingToBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#E3F2FD",
    paddingVertical: 6,
    paddingHorizontal: 12,
    marginHorizontal: 12,
    marginBottom: 6,
    borderRadius: 6,
  },
  replyingToText: { fontSize: 12, color: "#1976D2" },
  replyingToName: { fontWeight: "600", color: "#1565C0" },
  cancelReply: {
    fontSize: 16,
    color: "#1976D2",
    fontWeight: "500",
    paddingHorizontal: 4,
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingBottom: 8,
  },
  inputAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#E0E0E0",
    marginRight: 8,
  },
  input: {
    flex: 1,
    backgroundColor: "#F0F2F5",
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
    fontSize: 14,
    maxHeight: 100,
    marginRight: 8,
    color: "#000",
  },
  sendButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#FF6B6B",
    justifyContent: "center",
    alignItems: "center",
  },
  sendButtonDisabled: { backgroundColor: "#CCC" },
  contentContainer: { flex: 1, overflow: "hidden" },
});

export default CommentModal;
