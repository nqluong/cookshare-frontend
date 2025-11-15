// components/CommentModal.tsx - CLEAN VERSION: Only WebSocket-driven comments
import { commentService } from '@/services/commentService';
import { useWebSocketStatus } from '@/services/useWebSocketStatus';
import websocketService from '@/services/websocketService';
import { CommentResponse } from '@/types/comment';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Animated,
  Dimensions,
  FlatList,
  Image,
  Keyboard,
  Modal,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface CommentModalProps {
  visible: boolean;
  onClose: () => void;
  recipeId: string;
  currentUserId: string;
  currentUserAvatar?: string;
  onCommentCountChange?: (newCount: number) => void;
}

type SortOption = 'relevant' | 'newest' | 'oldest';

interface CommentWithExpandedReplies extends CommentResponse {
  expandedRepliesCount?: number;
}

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

const CommentModal: React.FC<CommentModalProps> = ({
  visible,
  onClose,
  recipeId,
  currentUserId,
  currentUserAvatar,
  onCommentCountChange,
}) => {
  const [comments, setComments] = useState<CommentWithExpandedReplies[]>([]);
  const [loading, setLoading] = useState(true);
  const [commentText, setCommentText] = useState('');
  const [replyingTo, setReplyingTo] = useState<CommentResponse | null>(null);
  const [editingComment, setEditingComment] = useState<CommentResponse | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const [sortOption, setSortOption] = useState<SortOption>('relevant');
  const [showSortModal, setShowSortModal] = useState(false);
  const [scrollToCommentId, setScrollToCommentId] = useState<string | null>(null);

  const insets = useSafeAreaInsets();
  const inputRef = useRef<TextInput>(null);
  const flatListRef = useRef<FlatList>(null);
  const slideAnim = useRef(new Animated.Value(SCREEN_HEIGHT)).current;
  const isConnected = useWebSocketStatus();

  const totalComments = useMemo(
    () => countAllCommentsRecursive(comments),
    [comments]
  );

  const sortedComments = useMemo(() => {
    const sorted = [...comments];
    if (sortOption === 'newest') {
      sorted.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    } else if (sortOption === 'oldest') {
      sorted.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    }
    // 'relevant' giữ nguyên thứ tự từ server
    return sorted;
  }, [comments, sortOption]);

  // ========================================================================
  // KEYBOARD
  // ========================================================================
  useEffect(() => {
    const showListener = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
      (e) => setKeyboardHeight(e.endCoordinates.height)
    );
    const hideListener = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
      () => setKeyboardHeight(0)
    );

    return () => {
      showListener.remove();
      hideListener.remove();
    };
  }, []);

  // ========================================================================
  // MODAL ANIMATION + LOAD COMMENTS
  // ========================================================================
  useEffect(() => {
    if (visible) {
      Animated.spring(slideAnim, {
        toValue: 0,
        useNativeDriver: true,
        bounciness: 0,
      }).start();
      loadComments();
    } else {
      Animated.timing(slideAnim, {
        toValue: SCREEN_HEIGHT,
        duration: 250,
        useNativeDriver: true,
      }).start();
      setCommentText('');
      setReplyingTo(null);
      setEditingComment(null);
      setKeyboardHeight(0);
    }
  }, [visible]);

  useEffect(() => {
    onCommentCountChange?.(totalComments);
  }, [totalComments, onCommentCountChange]);

  // Auto-scroll to comment
  useEffect(() => {
    if (scrollToCommentId && flatListRef.current) {
      const index = sortedComments.findIndex(c => c.commentId === scrollToCommentId);
      if (index !== -1) {
        setTimeout(() => {
          flatListRef.current?.scrollToIndex({ index, animated: true, viewPosition: 0.5 });
          setScrollToCommentId(null);
        }, 300);
      }
    }
  }, [scrollToCommentId, sortedComments]);

  const loadComments = useCallback(async () => {
    try {
      setLoading(true);
      const data = await commentService.getCommentsByRecipe(recipeId);
      const normalized = normalizeCommentsRecursive(data);
      setComments(normalized);
      console.log('📥 Loaded', normalized.length, 'comments');
    } catch (error) {
      console.log('❌ Load error:', error);
      Alert.alert('Lỗi', 'Không thể tải bình luận');
    } finally {
      setLoading(false);
    }
  }, [recipeId]);

  // ========================================================================
  // WEBSOCKET EVENTS
  // ========================================================================
  const handleNewComment = useCallback(
    (data: any) => {
      if (data.recipeId !== recipeId) return;
      const newComment: CommentResponse = data.comment;

      setComments((prev) => {
        // Hàm đệ quy: tìm cha và thêm reply ở MỌI CẤP ĐỘ
        const addReplyRecursively = (
          comments: CommentWithExpandedReplies[]
        ): { updated: boolean; comments: CommentWithExpandedReplies[] } => {
          let updated = false;

          const newComments = comments.map((comment) => {
            // Nếu comment này là cha trực tiếp → thêm reply
            if (comment.commentId === newComment.parentCommentId) {
              updated = true;
              const updatedReplies = [...(comment.replies || []), newComment];
              return {
                ...comment,
                replies: updatedReplies,
                replyCount: (comment.replyCount || 0) + 1,
                expandedRepliesCount: updatedReplies.length, // HIỆN TẤT CẢ
              };
            }

            // Nếu không phải cha → tìm đệ quy trong replies của nó
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

        // Nếu là comment gốc
        if (!newComment.parentCommentId) {
          if (prev.some((c) => c.commentId === newComment.commentId)) return prev;
          return [newComment, ...prev];
        }

        // Nếu là reply → tìm cha ở mọi cấp
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
        return comments.map((c) => {
          if (c.commentId === updated.commentId) {
            return { ...c, content: updated.content, updatedAt: updated.updatedAt };
          }
          if (c.replies) return { ...c, replies: updateRecursively(c.replies) };
          return c;
        });
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

  // ========================================================================
  // WEBSOCKET SUBSCRIBE / UNSUBSCRIBE
  // ========================================================================
  useEffect(() => {
    if (!visible || !isConnected) return;

    websocketService.on('NEW_COMMENT', handleNewComment);
    websocketService.on('UPDATE_COMMENT', handleUpdateComment);
    websocketService.on('DELETE_COMMENT', handleDeleteComment);
    websocketService.subscribeToRecipeComments(recipeId);

    return () => {
      websocketService.off('NEW_COMMENT', handleNewComment);
      websocketService.off('UPDATE_COMMENT', handleUpdateComment);
      websocketService.off('DELETE_COMMENT', handleDeleteComment);
      websocketService.unsubscribeFromRecipeComments(recipeId);
    };
  }, [visible, isConnected, recipeId, handleNewComment, handleUpdateComment, handleDeleteComment]);

  // ========================================================================
  // SUBMIT COMMENT (NO OPTIMISTIC)
  // ========================================================================
  const handleSubmit = async () => {
    const text = commentText.trim();
    if (!text) return;

    try {
      setSubmitting(true);
      setCommentText('');
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

      // Scroll to new comment
      if (replyingTo) {
        setScrollToCommentId(replyingTo.commentId);
      } else {
        setScrollToCommentId(newComment.commentId);
      }
    } catch (error: any) {
      console.log('❌ Submit error:', error);
      Alert.alert('Lỗi', error.message || 'Không thể gửi bình luận');
      setCommentText(text);
    } finally {
      setSubmitting(false);
    }
  };

  // ========================================================================
  // DELETE COMMENT
  // ========================================================================
  const handleDelete = async (comment: CommentResponse) => {
    const isParent = !comment.parentCommentId;
    const replyCount = comment.replyCount || 0;
    const message = isParent && replyCount > 0
      ? `Bình luận này có ${replyCount} trả lời. Xóa sẽ xóa tất cả. Bạn có chắc?`
      : 'Bạn có chắc muốn xóa bình luận này?';

    Alert.alert('Xóa bình luận', message, [
      { text: 'Hủy', style: 'cancel' },
      {
        text: 'Xóa',
        style: 'destructive',
        onPress: async () => {
          try {
            await commentService.deleteComment(comment.commentId);
          } catch (error) {
            console.log('❌ Delete error:', error);
            Alert.alert('Lỗi', 'Không thể xóa bình luận');
          }
        },
      },
    ]);
  };

  // ========================================================================
  // EXPAND/COLLAPSE REPLIES
  // ========================================================================
  const handleExpandReplies = (commentId: string) => {
    const expandRecursive = (comments: CommentWithExpandedReplies[]): CommentWithExpandedReplies[] => {
      return comments.map((c) => {
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

    setComments((prev) => expandRecursive(prev));
  };


  // ========================================================================
  // RENDER COMMENT
  // ========================================================================
  const renderComment = useCallback(
    (comment: CommentWithExpandedReplies, isReply: boolean = false) => {
      const isOwner = comment.userId === currentUserId;
      const timeAgo = getTimeAgo(comment.createdAt);
      const hasReplies = comment.replies && comment.replies.length > 0;
      const expandedCount = comment.expandedRepliesCount || 0;
      const visibleReplies = hasReplies ? comment.replies!.slice(0, expandedCount) : [];
      const totalDescendants = countDescendants(comment);
      const totalDirectReplies = comment.replies ? comment.replies.length : 0;
      const remainingReplies = Math.max(0, totalDirectReplies - expandedCount);

      return (
        <View
          key={comment.commentId}
          style={[styles.commentContainer, isReply && styles.replyContainer]}
        >
          <Image
            source={{ uri: comment.userAvatar || 'https://via.placeholder.com/40' }}
            style={[styles.avatar, isReply && styles.avatarReply]}
          />
          <View style={styles.commentContent}>
            <View style={styles.commentBubble}>
              <Text style={styles.userName}>{comment.fullName}</Text>
              <Text style={styles.commentText}>{comment.content}</Text>
            </View>

            <View style={styles.commentMeta}>
              <Text style={styles.timeAgo}>{timeAgo}</Text>

              {(
                <TouchableOpacity
                  onPress={() => {
                    setReplyingTo(comment);
                    setEditingComment(null);
                    setScrollToCommentId(comment.commentId);
                    inputRef.current?.focus();
                  }}
                  style={styles.metaButton}
                >
                  <Text style={styles.metaText}>Trả lời</Text>
                </TouchableOpacity>
              )}

              {isOwner && (
                <>
                  <TouchableOpacity
                    onPress={() => {
                      setEditingComment(comment);
                      setCommentText(comment.content);
                      setReplyingTo(null);
                      inputRef.current?.focus();
                    }}
                    style={styles.metaButton}
                  >
                    <Text style={styles.metaText}>Sửa</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => handleDelete(comment)}
                    style={styles.metaButton}
                  >
                    <Text style={[styles.metaText, styles.deleteText]}>Xóa</Text>
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
                    {visibleReplies.map((reply) => renderComment(reply, true))}
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
    [currentUserId]
  );

  // ========================================================================
  // RENDER SORT MODAL
  // ========================================================================
  const renderSortModal = () => (
    <Modal visible={showSortModal} transparent animationType="fade">
      <TouchableOpacity
        style={styles.sortModalOverlay}
        activeOpacity={1}
        onPress={() => setShowSortModal(false)}
      >
        <View style={styles.sortModalContent}>
          <TouchableOpacity
            style={styles.sortOption}
            onPress={() => {
              setSortOption('relevant');
              setShowSortModal(false);
            }}
          >
            <View style={styles.sortOptionRow}>
              <Text style={styles.sortOptionText}>Phù hợp nhất</Text>
              {sortOption === 'relevant' && <Text style={styles.checkMark}>✓</Text>}
            </View>
            <Text style={styles.sortOptionDesc}>
              Hiển thị bình luận của bạn và những bình luận có nhiều lượt tương tác nhất trước tiên.
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.sortOption}
            onPress={() => {
              setSortOption('newest');
              setShowSortModal(false);
            }}
          >
            <View style={styles.sortOptionRow}>
              <Text style={styles.sortOptionText}>Mới nhất</Text>
              {sortOption === 'newest' && <Text style={styles.checkMark}>✓</Text>}
            </View>
            <Text style={styles.sortOptionDesc}>
              Hiển thị tất cả bình luận, mới nhất trước tiên.
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.sortOption}
            onPress={() => {
              setSortOption('oldest');
              setShowSortModal(false);
            }}
          >
            <View style={styles.sortOptionRow}>
              <Text style={styles.sortOptionText}>Tất cả bình luận</Text>
              {sortOption === 'oldest' && <Text style={styles.checkMark}>✓</Text>}
            </View>
            <Text style={styles.sortOptionDesc}>
              Hiển thị tất cả bình luận, bao gồm cả nội dung có thể là spam.
            </Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </Modal>
  );

  // ========================================================================
  // RENDER UI
  // ========================================================================
  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={onClose}>
      {renderSortModal()}
      <View style={styles.modalOverlay}>
        <TouchableOpacity style={styles.modalBackdrop} activeOpacity={1} onPress={onClose} />
        <Animated.View
          style={[
            styles.modalContent,
            { transform: [{ translateY: slideAnim }], marginBottom: Platform.OS === 'ios' ? keyboardHeight : 0 },
          ]}
        >
          <View style={styles.modalHeader}>
            <View style={styles.modalHandle} />
            <Text style={styles.modalTitle}>Bình luận ({totalComments})</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
          </View>

          {/* SORT BUTTON */}
          <TouchableOpacity
            style={styles.sortButton}
            onPress={() => setShowSortModal(true)}
          >
            <Text style={styles.sortButtonText}>
              {sortOption === 'relevant' && 'Phù hợp nhất'}
              {sortOption === 'newest' && 'Mới nhất'}
              {sortOption === 'oldest' && 'Tất cả bình luận'}
            </Text>
            <Text style={styles.sortButtonIcon}>▼</Text>
          </TouchableOpacity>

          <View style={styles.contentContainer}>
            {loading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#FF6B6B" />
              </View>
            ) : comments.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>💬</Text>
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
                onScrollToIndexFailed={(info) => {
                  setTimeout(() => {
                    flatListRef.current?.scrollToIndex({ index: info.index, animated: true });
                  }, 100);
                }}
              />
            )}
          </View>

          {/* INPUT */}
          <View style={[styles.inputContainer, { paddingBottom: Math.max(insets.bottom, 16) }]}>
            {(replyingTo || editingComment) && (
              <View style={styles.replyingToBar}>
                <Text style={styles.replyingToText}>
                  {editingComment
                    ? '✏️ Đang chỉnh sửa'
                    : <>💬 Trả lời <Text style={styles.replyingToName}>{replyingTo?.fullName}</Text></>}
                </Text>
                <TouchableOpacity onPress={() => { setReplyingTo(null); setEditingComment(null); setCommentText(''); }}>
                  <Text style={styles.cancelReply}>✕</Text>
                </TouchableOpacity>
              </View>
            )}
            <View style={styles.inputRow}>
              <Image
                source={{ uri: currentUserAvatar || 'https://via.placeholder.com/36' }}
                style={styles.inputAvatar}
              />
              <TextInput
                ref={inputRef}
                style={styles.input}
                placeholder={replyingTo ? `Trả lời ${replyingTo.fullName}...` : 'Viết bình luận...'}
                placeholderTextColor="#999"
                value={commentText}
                onChangeText={setCommentText}
                multiline
              />
              <TouchableOpacity
                style={[styles.sendButton, (!commentText.trim() || submitting) && styles.sendButtonDisabled]}
                onPress={handleSubmit}
                disabled={!commentText.trim() || submitting}
              >
                {submitting
                  ? <ActivityIndicator size="small" color="#FFF" />
                  : <Text style={styles.sendButtonText}>{editingComment ? '✓' : '➤'}</Text>}
              </TouchableOpacity>
            </View>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
};

// ========================================================================
// HELPERS
// ========================================================================
function getTimeAgo(dateString: string) {
  const date = new Date(dateString);
  const now = new Date();
  const diff = Math.floor((now.getTime() - date.getTime()) / 1000);
  if (diff < 60) return 'Vừa xong';
  if (diff < 3600) return `${Math.floor(diff / 60)} phút`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} giờ`;
  if (diff < 604800) return `${Math.floor(diff / 86400)} ngày`;
  return date.toLocaleDateString('vi-VN');
}

function normalizeCommentsRecursive(comments: any[]): any[] {
  return comments.map((c) => {
    const clones: any = {
      ...c,
      expandedRepliesCount: 0, // KHỞI TẠO luôn = 0
      replies: c.replies && c.replies.length ? normalizeCommentsRecursive(c.replies) : [],
    };
    return clones;
  });
}

function countAllCommentsRecursive(comments: any[]): number {
  if (!comments || comments.length === 0) return 0;
  return comments.reduce((sum, c) => sum + 1 + countAllCommentsRecursive(c.replies || []), 0);
}

// trả về tổng số "hậu duệ" (không tính chính comment)
function countDescendants(comment: any): number {
  return countAllCommentsRecursive(comment.replies || []);
}

// ============================================================================
// STYLES
// ============================================================================
const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalBackdrop: {
    flex: 1,
  },
  modalContent: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFF',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    height: SCREEN_HEIGHT * 0.9,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 5,
    flexDirection: 'column',
  },
  contentContainer: {
    flex: 1,
    overflow: 'hidden',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  modalHandle: {
    position: 'absolute',
    top: 8,
    width: 40,
    height: 4,
    backgroundColor: '#DDD',
    borderRadius: 2,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  closeButton: {
    position: 'absolute',
    right: 16,
    padding: 4,
  },
  closeButtonText: {
    fontSize: 24,
    color: '#666',
    fontWeight: '300',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 48,
    marginBottom: 12,
  },
  emptySubtext: {
    fontSize: 16,
    color: '#666',
    fontWeight: '500',
  },
  emptyHint: {
    fontSize: 14,
    color: '#999',
    marginTop: 4,
  },
  listContent: {
    padding: 16,
    paddingBottom: 8,
  },
  commentContainer: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  replyContainer: {
    marginLeft: 10,
    marginTop: 8,
  },
  optimisticComment: {
    opacity: 1,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E0E0E0',
  },
  avatarReply: {
    width: 25,
    height: 25,
    borderRadius: 12.5,
    backgroundColor: '#E0E0E0',
  },
  commentContent: {
    flex: 1,
    marginLeft: 12,
  },
  commentBubble: {
    backgroundColor: '#F0F0F0',
    borderRadius: 18,
    paddingHorizontal: 12,
    paddingVertical: 8,
    alignSelf: 'flex-start',
    maxWidth: '85%',
  },
  userName: {
    fontWeight: '600',
    fontSize: 13,
    color: '#333',
    marginBottom: 2,
  },
  commentText: {
    fontSize: 14,
    color: '#000',
    lineHeight: 18,
  },
  commentMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    marginLeft: 12,
  },
  timeAgo: {
    fontSize: 12,
    color: '#65676B',
  },
  metaButton: {
    marginLeft: 12,
  },
  metaText: {
    fontSize: 12,
    color: '#65676B',
    fontWeight: '600',
  },
  deleteText: {
    color: '#F44336',
  },
  repliesContainer: {
    marginTop: 4,
    marginLeft: -10,
  },
  expandButton: {
    marginTop: 8,
    marginLeft: 12,
  },
  expandButtonText: {
    fontSize: 13,
    color: '#65676B',
    fontWeight: '600',
  },
  sortButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    backgroundColor: '#F8F8F8',
  },
  sortButtonText: {
    fontSize: 13,
    color: '#333',
    fontWeight: '600',
  },
  sortButtonIcon: {
    fontSize: 10,
    color: '#666',
  },
  sortModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sortModalContent: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    width: '85%',
    maxWidth: 400,
  },
  sortOption: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  sortOptionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  sortOptionText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
  },
  sortOptionDesc: {
    fontSize: 12,
    color: '#666',
    lineHeight: 16,
  },
  checkMark: {
    fontSize: 18,
    color: '#1877F2',
    fontWeight: 'bold',
  },
  inputContainer: {
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    backgroundColor: '#FFF',
    paddingTop: 8,
  },
  replyingToBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#E3F2FD',
    paddingVertical: 6,
    paddingHorizontal: 12,
    marginHorizontal: 12,
    marginBottom: 6,
    borderRadius: 6,
  },
  replyingToText: {
    fontSize: 12,
    color: '#1976D2',
  },
  replyingToName: {
    fontWeight: '600',
    color: '#1565C0',
  },
  cancelReply: {
    fontSize: 16,
    color: '#1976D2',
    fontWeight: '500',
    paddingHorizontal: 4,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingBottom: 8,
  },
  inputAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#E0E0E0',
    marginRight: 8,
  },
  input: {
    flex: 1,
    backgroundColor: '#F0F2F5',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
    fontSize: 14,
    maxHeight: 100,
    marginRight: 8,
    color: '#000',
  },
  sendButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FF6B6B',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: '#CCC',
  },
  sendButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default CommentModal;