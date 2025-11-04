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

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

const CommentModal: React.FC<CommentModalProps> = ({
  visible,
  onClose,
  recipeId,
  currentUserId,
  currentUserAvatar,
  onCommentCountChange,
}) => {
  const [comments, setComments] = useState<CommentResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [commentText, setCommentText] = useState('');
  const [replyingTo, setReplyingTo] = useState<CommentResponse | null>(null);
  const [editingComment, setEditingComment] = useState<CommentResponse | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  const insets = useSafeAreaInsets();
  const inputRef = useRef<TextInput>(null);
  const flatListRef = useRef<FlatList>(null);
  const slideAnim = useRef(new Animated.Value(SCREEN_HEIGHT)).current;
  const isConnected = useWebSocketStatus();
  const totalComments = useMemo(
    () => comments.reduce((sum, c) => sum + 1 + (c.replies?.length || 0), 0),
    [comments]
  );

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

  const loadComments = useCallback(async () => {
    try {
      setLoading(true);
      const data = await commentService.getCommentsByRecipe(recipeId);
      setComments(data);
      console.log('📥 Loaded', data.length, 'comments');
    } catch (error) {
      console.error('❌ Load error:', error);
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
      console.log('🔔 NEW_COMMENT:', newComment.commentId);

      setComments((prev) => {
        // Nếu là reply
        if (newComment.parentCommentId) {
          return prev.map((c) =>
            c.commentId === newComment.parentCommentId
              ? {
                  ...c,
                  replies: [...(c.replies || []), newComment],
                  replyCount: (c.replyCount || 0) + 1,
                }
              : c
          );
        }

        // Nếu là comment gốc
        if (prev.some((c) => c.commentId === newComment.commentId)) return prev;
        return [newComment, ...prev];
      });
    },
    [recipeId]
  );

  const handleUpdateComment = useCallback(
    (data: any) => {
      if (data.recipeId !== recipeId) return;
      const updated = data.comment;
      console.log('✏️ UPDATE_COMMENT:', updated.commentId);

      setComments((prev) =>
        prev.map((c) => {
          if (c.commentId === updated.commentId)
            return { ...c, content: updated.content, updatedAt: updated.updatedAt };
          if (c.replies?.some((r) => r.commentId === updated.commentId)) {
            return {
              ...c,
              replies: c.replies.map((r) =>
                r.commentId === updated.commentId
                  ? { ...r, content: updated.content, updatedAt: updated.updatedAt }
                  : r
              ),
            };
          }
          return c;
        })
      );
    },
    [recipeId]
  );

  const handleDeleteComment = useCallback(
    (data: any) => {
      if (data.recipeId !== recipeId) return;
      const deletedId = data.comment.commentId;
      console.log('🗑️ DELETE_COMMENT:', deletedId);

      setComments((prev) =>
        prev
          .filter((c) => c.commentId !== deletedId)
          .map((c) => ({
            ...c,
            replies: c.replies?.filter((r) => r.commentId !== deletedId) || [],
            replyCount: Math.max(0, (c.replyCount || 0) - 1),
          }))
      );
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

      await commentService.createComment({
        recipeId,
        content: text,
        parentCommentId: replyingTo?.commentId,
      });

      setReplyingTo(null);
    } catch (error: any) {
      console.error('❌ Submit error:', error);
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
            console.error('❌ Delete error:', error);
            Alert.alert('Lỗi', 'Không thể xóa bình luận');
          }
        },
      },
    ]);
  };

  // ========================================================================
  // RENDER COMMENT
  // ========================================================================
  const renderComment = useCallback(
    (comment: CommentResponse, isReply: boolean = false) => {
      const isOwner = comment.userId === currentUserId;
      const timeAgo = getTimeAgo(comment.createdAt);

      return (
        <View
          key={comment.commentId}
          style={[styles.commentContainer, isReply && styles.replyContainer]}
        >
          <Image
            source={{ uri: comment.userAvatar || 'https://via.placeholder.com/40' }}
            style={styles.avatar}
          />
          <View style={styles.commentContent}>
            <View style={styles.commentBubble}>
              <Text style={styles.userName}>{comment.userName}</Text>
              <Text style={styles.commentText}>{comment.content}</Text>
            </View>

            <View style={styles.commentMeta}>
              <Text style={styles.timeAgo}>{timeAgo}</Text>

              {!isReply && (
                <TouchableOpacity
                  onPress={() => {
                    setReplyingTo(comment);
                    setEditingComment(null);
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

            {!isReply && comment.replies?.length ? (
              <View style={styles.repliesContainer}>
                {comment.replies.map((reply) => renderComment(reply, true))}
              </View>
            ) : null}
          </View>
        </View>
      );
    },
    [currentUserId]
  );


  // ========================================================================
  // RENDER UI
  // ========================================================================
  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={onClose}>
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
                data={comments}
                keyExtractor={(item) => item.commentId}
                renderItem={({ item }) => renderComment(item)}
                contentContainerStyle={styles.listContent}
                keyboardShouldPersistTaps="handled"
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
                    : <>💬 Trả lời <Text style={styles.replyingToName}>{replyingTo?.userName}</Text></>}
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
                placeholder={replyingTo ? `Trả lời ${replyingTo.userName}...` : 'Viết bình luận...'}
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
    marginLeft: 48,
    marginTop: 12,
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