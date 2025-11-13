// app/notifications/index.tsx
import { useAuth } from '@/context/AuthContext';
import { notificationService } from '@/services/notificationService';
import websocketService from '@/services/websocketService';
import { Colors } from '@/styles/colors';
import { Notification, NotificationType } from '@/types/notification';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function NotificationsScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const userId = user?.userId;

  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  // Lấy danh sách thông báo
  const fetchNotifications = async (pageNum: number = 0, isRefresh: boolean = false) => {
    if (!userId) return;

    try {
      if (pageNum === 0) {
        setLoading(true);
      } else {
        setLoadingMore(true);
      }

      const result = await notificationService.getNotifications(userId, pageNum, 20);

      if (isRefresh || pageNum === 0) {
        setNotifications(result.notifications);
      } else {
        setNotifications((prev) => [...prev, ...result.notifications]);
      }

      setHasMore(!result.pagination.isLast);
      setPage(pageNum);
    } catch (error: any) {
      console.log('❌ Error fetching notifications:', error);
      Alert.alert('Lỗi', error.message || 'Không thể tải thông báo');
    } finally {
      setLoading(false);
      setRefreshing(false);
      setLoadingMore(false);
    }
  };

  // Lấy số lượng thông báo chưa đọc
  const fetchUnreadCount = async () => {
    if (!userId) return;

    try {
      const count = await notificationService.getUnreadCount(userId);
      setUnreadCount(count);
    } catch (error: any) {
      console.log('❌ Error fetching unread count:', error);
    }
  };

  // WebSocket listeners for real-time notifications
  useEffect(() => {
    if (!userId) return;

    console.log('👂 Setting up notification WebSocket listeners');

    // Handler for new notification
    const handleNewNotification = (data: any) => {
      console.log('🔔 New notification received:', data);

      if (data.action === 'NEW' && data.notification) {
        const newNotif = data.notification;

        // Add to list if not exists
        setNotifications((prev) => {
          const exists = prev.some((n) => n.notificationId === newNotif.notificationId);
          if (exists) {
            console.log('⚠️ Notification already exists');
            return prev;
          }
          return [newNotif, ...prev];
        });

        // Update unread count
        setUnreadCount((prev) => prev + 1);

        // Show local notification badge (optional)
        console.log('✅ New notification added to list');
      }
    };

    // Handler for read notification
    const handleReadNotification = (data: any) => {
      console.log('👁️ Read notification received:', data);

      if (data.action === 'READ' && data.notification) {
        setNotifications((prev) =>
          prev.map((n) =>
            n.notificationId === data.notification.notificationId
              ? { ...n, isRead: true, readAt: data.notification.readAt }
              : n
          )
        );

        setUnreadCount((prev) => Math.max(0, prev - 1));
      }
    };

    // Handler for delete notification
    const handleDeleteNotification = (data: any) => {
      console.log('🗑️ Delete notification received:', data);

      if (data.action === 'DELETE' && data.notification) {
        const deletedId = data.notification.notificationId;

        setNotifications((prev) => {
          const deletedNotif = prev.find((n) => n.notificationId === deletedId);
          if (deletedNotif && !deletedNotif.isRead) {
            setUnreadCount((count) => Math.max(0, count - 1));
          }
          return prev.filter((n) => n.notificationId !== deletedId);
        });
      }
    };

    // Handler for read all
    const handleReadAllNotifications = (data: any) => {
      console.log('✅ Read all notifications received:', data);

      if (data.action === 'READ_ALL') {
        setNotifications((prev) =>
          prev.map((n) => ({ ...n, isRead: true, readAt: new Date().toISOString() }))
        );
        setUnreadCount(0);
      }
    };

    // Register listeners
    websocketService.on('NEW_NOTIFICATION', handleNewNotification);
    websocketService.on('READ_NOTIFICATION', handleReadNotification);
    websocketService.on('DELETE_NOTIFICATION', handleDeleteNotification);
    websocketService.on('READ_ALL_NOTIFICATIONS', handleReadAllNotifications);

    // Cleanup
    return () => {
      console.log('👋 Cleaning up notification listeners');
      websocketService.off('NEW_NOTIFICATION', handleNewNotification);
      websocketService.off('READ_NOTIFICATION', handleReadNotification);
      websocketService.off('DELETE_NOTIFICATION', handleDeleteNotification);
      websocketService.off('READ_ALL_NOTIFICATIONS', handleReadAllNotifications);
    };
  }, [userId]);

  // Initial load
  useEffect(() => {
    if (userId) {
      fetchNotifications();
      fetchUnreadCount();
    }
  }, [userId]);

  // Đánh dấu thông báo là đã đọc
  const markAsRead = async (notificationId: string) => {
    if (!userId) return;

    try {
      await notificationService.markAsRead(userId, notificationId);

      // Update local state (WebSocket will also update it)
      setNotifications((prev) =>
        prev.map((notif) =>
          notif.notificationId === notificationId
            ? { ...notif, isRead: true, readAt: new Date().toISOString() }
            : notif
        )
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (error: any) {
      console.log('❌ Error marking as read:', error);
    }
  };

  // Đánh dấu tất cả thông báo là đã đọc
  const markAllAsRead = async () => {
    if (!userId || unreadCount === 0) return;

    try {
      const updatedCount = await notificationService.markAllAsRead(userId);

      // Update local state (WebSocket will also update it)
      setNotifications((prev) =>
        prev.map((notif) => ({ ...notif, isRead: true, readAt: new Date().toISOString() }))
      );
      setUnreadCount(0);

      Alert.alert('Thành công', `Đã đánh dấu ${updatedCount} thông báo là đã đọc`);
    } catch (error: any) {
      console.log('❌ Error marking all as read:', error);
      Alert.alert('Lỗi', error.message || 'Không thể cập nhật thông báo');
    }
  };

  // Xóa một thông báo
  const deleteNotification = (notificationId: string) => {
    if (!userId) return;

    Alert.alert('Xác nhận', 'Bạn có chắc muốn xóa thông báo này?', [
      { text: 'Hủy', style: 'cancel' },
      {
        text: 'Xóa',
        style: 'destructive',
        onPress: async () => {
          try {
            await notificationService.deleteNotification(userId, notificationId);

            // Update local state (WebSocket will also update it)
            setNotifications((prev) => {
              const deletedNotif = prev.find((n) => n.notificationId === notificationId);
              if (deletedNotif && !deletedNotif.isRead) {
                setUnreadCount((count) => Math.max(0, count - 1));
              }
              return prev.filter((notif) => notif.notificationId !== notificationId);
            });
          } catch (error: any) {
            console.log('❌ Error deleting notification:', error);
            Alert.alert('Lỗi', error.message || 'Không thể xóa thông báo');
          }
        },
      },
    ]);
  };

  // Xử lý khi nhấn vào thông báo
  const handleNotificationPress = (notification: Notification) => {
    if (!userId) return;

    // Mark as read if unread
    if (!notification.isRead) {
      markAsRead(notification.notificationId);
    }

    // Navigate based on notification type
    switch (notification.type) {
      case NotificationType.FOLLOW:
        if (notification.relatedId) {
          router.push(`/profile/${notification.relatedId}`);
        }
        break;
      case NotificationType.LIKE:
      case NotificationType.COMMENT:
      case NotificationType.RATING:
      case NotificationType.SHARE:
      case NotificationType.RECIPE_PUBLISHED:
      case NotificationType.MENTION:
        if (notification.relatedId) {
          // Navigate to recipe detail
          //router.push(`/recipe/${notification.relatedId}`);
        }
        break;
      case NotificationType.SYSTEM:
        // System notifications might not have navigation
        break;
      default:
        break;
    }
  };

  // Lấy biểu tượng cho thông báo
  const getNotificationIcon = (type: NotificationType) => {
    const icons = {
      [NotificationType.FOLLOW]: { name: 'person-add' as const, color: Colors.primary },
      [NotificationType.LIKE]: { name: 'heart' as const, color: Colors.primary },
      [NotificationType.COMMENT]: { name: 'chatbubble' as const, color: Colors.secondary },
      [NotificationType.RATING]: { name: 'star' as const, color: Colors.secondary },
      [NotificationType.MENTION]: { name: 'at' as const, color: Colors.text.secondary },
      [NotificationType.SHARE]: { name: 'share-social' as const, color: Colors.text.secondary },
      [NotificationType.RECIPE_PUBLISHED]: {
        name: 'restaurant' as const,
        color: Colors.secondary,
      },
      [NotificationType.SYSTEM]: { name: 'notifications' as const, color: Colors.text.secondary },
    };
    return icons[type] || icons[NotificationType.SYSTEM];
  };

  // Định dạng thời gian
  const getTimeAgo = (dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (seconds < 60) return 'Vừa xong';
    if (seconds < 3600) return `${Math.floor(seconds / 60)} phút trước`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)} giờ trước`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)} ngày trước`;
    return date.toLocaleDateString('vi-VN');
  };

  // Xử lý làm mới
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchNotifications(0, true);
    fetchUnreadCount();
  }, [userId]);

  // Tải thêm thông báo
  const loadMore = () => {
    if (!loadingMore && hasMore) {
      fetchNotifications(page + 1);
    }
  };

  // Render mục thông báo
  const renderNotificationItem = ({ item }: { item: Notification }) => {
    const icon = getNotificationIcon(item.type);

    return (
      <TouchableOpacity
        style={[styles.notificationItem, !item.isRead && styles.unreadNotification]}
        onPress={() => handleNotificationPress(item)}
        activeOpacity={0.7}
      >
        <View style={[styles.iconContainer, { backgroundColor: icon.color + '20' }]}>
          <Ionicons name={icon.name} size={24} color={icon.color} />
        </View>

        <View style={styles.notificationContent}>
          <Text style={styles.notificationTitle}>{item.title}</Text>
          <Text style={styles.notificationMessage} numberOfLines={2}>
            {item.message}
          </Text>
          <Text style={styles.notificationTime}>{getTimeAgo(item.createdAt)}</Text>
        </View>

        {!item.isRead && <View style={styles.unreadDot} />}

        <TouchableOpacity
          style={styles.deleteButton}
          onPress={(e) => {
            e.stopPropagation();
            deleteNotification(item.notificationId);
          }}
        >
          <Ionicons name="trash-outline" size={20} color={Colors.primary} />
        </TouchableOpacity>
      </TouchableOpacity>
    );
  };

  // Render trạng thái rỗng
  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="notifications-off-outline" size={80} color={Colors.gray[300]} />
      <Text style={styles.emptyTitle}>Chưa có thông báo</Text>
      <Text style={styles.emptySubtitle}>Các thông báo của bạn sẽ xuất hiện ở đây</Text>
    </View>
  );

  // Render chân trang
  const renderFooter = () => {
    if (!loadingMore) return null;
    return (
      <View style={styles.footerLoader}>
        <ActivityIndicator size="small" color={Colors.primary} />
      </View>
    );
  };

  if (loading && page === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <Header router={router} unreadCount={unreadCount} />
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>Đang tải thông báo...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Header router={router} unreadCount={unreadCount} />

      {/* Connection status indicator */}
      {!websocketService.isConnected() && (
        <View style={styles.connectionWarning}>
          <Ionicons name="warning-outline" size={16} color={Colors.warning} />
          <Text style={styles.connectionWarningText}>
            Đang kết nối lại... Thông báo thời gian thực tạm thời không khả dụng
          </Text>
        </View>
      )}

      {/* Nút hành động */}
      {notifications.length > 0 && (
        <View style={styles.actionBar}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={markAllAsRead}
            disabled={unreadCount === 0}
          >
            <Ionicons
              name="checkmark-done"
              size={20}
              color={unreadCount === 0 ? Colors.gray[300] : Colors.primary}
            />
            <Text
              style={[
                styles.actionButtonText,
                unreadCount === 0 && styles.actionButtonTextDisabled,
              ]}
            >
              Đọc tất cả
            </Text>
          </TouchableOpacity>


        </View>
      )}

      {/* Danh sách thông báo */}
      <FlatList
        data={notifications}
        renderItem={renderNotificationItem}
        keyExtractor={(item) => item.notificationId}
        ListEmptyComponent={renderEmptyState}
        ListFooterComponent={renderFooter}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[Colors.primary]}
            tintColor={Colors.primary}
          />
        }
        onEndReached={loadMore}
        onEndReachedThreshold={0.5}
        contentContainerStyle={notifications.length === 0 ? styles.emptyListContainer : undefined}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

// Component Header
const Header = ({ router, unreadCount }: { router: any; unreadCount?: number }) => (
  <View style={styles.header}>
    <TouchableOpacity
      onPress={() => (router.canGoBack() ? router.back() : router.replace('/(tabs)/home'))}
      style={styles.backButton}
    >
      <Ionicons name="arrow-back" size={24} color={Colors.text.primary} />
    </TouchableOpacity>

    <View style={styles.headerCenter}>
      <Text style={styles.headerTitle}>Thông báo</Text>
      {unreadCount! > 0 && (
        <View style={styles.unreadBadge}>
          <Text style={styles.unreadBadgeText}>{unreadCount}</Text>
        </View>
      )}
    </View>

    <View style={{ width: 24 }} />
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: Colors.text.light,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  backButton: {
    padding: 4,
  },
  headerCenter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text.primary,
  },
  unreadBadge: {
    backgroundColor: Colors.primary,
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 2,
    minWidth: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  unreadBadgeText: {
    color: Colors.white,
    fontSize: 12,
    fontWeight: 'bold',
  },
  connectionWarning: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#FFF3CD',
    borderBottomWidth: 1,
    borderBottomColor: '#FFE69C',
  },
  connectionWarningText: {
    flex: 1,
    fontSize: 12,
    color: '#856404',
  },
  actionBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: Colors.gray[100],
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.primary,
  },
  actionButtonTextDisabled: {
    color: Colors.gray[300],
  },
  notificationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    gap: 12,
  },
  unreadNotification: {
    backgroundColor: Colors.gray[50],
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  notificationContent: {
    flex: 1,
    gap: 4,
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text.primary,
  },
  notificationMessage: {
    fontSize: 14,
    color: Colors.text.light,
    lineHeight: 20,
  },
  notificationTime: {
    fontSize: 12,
    color: Colors.gray[300],
    marginTop: 2,
  },
  unreadDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Colors.primary,
    marginRight: 8,
  },
  deleteButton: {
    padding: 8,
  },
  emptyListContainer: {
    flexGrow: 1,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingVertical: 64,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: Colors.text.primary,
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: Colors.gray[300],
    textAlign: 'center',
  },
  footerLoader: {
    paddingVertical: 20,
    alignItems: 'center',
  },
});