// app/notifications/index.tsx
import { getImageUrl } from "@/config/api.config";
import { useAuth } from "@/context/AuthContext";
import { notificationService } from "@/services/notificationService";
import websocketService from "@/services/websocketService";
import { Colors } from "@/styles/colors";
import { Notification, NotificationType } from "@/types/notification";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Animated,
  FlatList,
  Image,
  PanResponder,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// SwipeableNotificationItem Component
const SwipeableNotificationItem = ({
  item,
  onPress,
  onDelete,
}: {
  item: Notification;
  onPress: () => void;
  onDelete: () => void;
}) => {
  const translateX = useRef(new Animated.Value(0)).current;
  const [showDelete, setShowDelete] = useState(false);

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gestureState) => {
        return Math.abs(gestureState.dx) > 10;
      },
      onPanResponderMove: (_, gestureState) => {
        if (gestureState.dx < 0) {
          translateX.setValue(Math.max(gestureState.dx, -80));
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dx < -40) {
          Animated.spring(translateX, {
            toValue: -80,
            useNativeDriver: true,
          }).start();
          setShowDelete(true);
        } else {
          Animated.spring(translateX, {
            toValue: 0,
            useNativeDriver: true,
          }).start();
          setShowDelete(false);
        }
      },
    })
  ).current;

  const handleDelete = () => {
    Animated.timing(translateX, {
      toValue: -400,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      onDelete();
    });
  };

  const getTimeAgo = (dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (seconds < 60) return "Vừa xong";
    if (seconds < 3600) return `${Math.floor(seconds / 60)} phút`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)} giờ`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)} ngày`;

    const month = date.toLocaleString("vi-VN", {
      month: "short",
      day: "numeric",
    });
    return month;
  };

  const renderContent = () => {
    const avatarUrl = item.actorAvatar || "https://i.pravatar.cc/150";

    switch (item.type) {
      case NotificationType.FOLLOW:
        return (
          <View style={styles.notificationContent}>
            <View style={styles.avatarContainer}>
              <Image
                source={
                  item.actorAvatar
                    ? { uri: getImageUrl(item.actorAvatar) }
                    : require("../assets/images/default-avatar.png")
                }
                style={styles.avatar}
              />
              {!item.isRead && <View style={styles.unreadDot} />}
            </View>
            <View style={styles.textContainer}>
              <Text style={styles.message}>
                {item.message}{" "}
                <Text style={styles.timeAgo}>{getTimeAgo(item.createdAt)}</Text>
              </Text>
            </View>
          </View>
        );

      case NotificationType.COMMENT:
        return (
          <View style={styles.notificationContent}>
            <View style={styles.avatarContainer}>
              <Image
                source={
                  item.actorAvatar
                    ? { uri: getImageUrl(item.actorAvatar) }
                    : require("../assets/images/default-avatar.png")
                }
                style={styles.avatar}
              />
              {!item.isRead && <View style={styles.unreadDot} />}
            </View>
            <View style={styles.textContainer}>
              <Text style={styles.message}>
                {item.message}{" "}
                <Text style={styles.timeAgo}>{getTimeAgo(item.createdAt)}</Text>
              </Text>
            </View>
            {item.recipeImage && (
              <Image
                source={{ uri: getImageUrl(item.recipeImage) }}
                style={styles.recipeThumb}
              />
            )}
          </View>
        );

      case NotificationType.MENTION:
        return (
          <View style={styles.notificationContent}>
            <View style={styles.avatarContainer}>
              <Image
                source={
                  item.actorAvatar
                    ? { uri: getImageUrl(item.actorAvatar) }
                    : require("../assets/images/default-avatar.png")
                }
                style={styles.avatar}
              />
              {!item.isRead && <View style={styles.unreadDot} />}
            </View>
            <View style={styles.textContainer}>
              <Text style={styles.message}>
                {item.message}{" "}
                <Text style={styles.timeAgo}>{getTimeAgo(item.createdAt)}</Text>
              </Text>
            </View>
            {item.recipeImage && (
              <Image
                source={{ uri: getImageUrl(item.recipeImage) }}
                style={styles.recipeThumb}
              />
            )}
          </View>
        );

      case NotificationType.LIKE:
        return (
          <View style={styles.notificationContent}>
            <View style={styles.avatarContainer}>
              <Image
                source={
                  item.actorAvatar
                    ? { uri: getImageUrl(item.actorAvatar) }
                    : require("../assets/images/default-avatar.png")
                }
                style={styles.avatar}
              />
              {!item.isRead && <View style={styles.unreadDot} />}
            </View>
            <View style={styles.textContainer}>
              <Text style={styles.message}>
                {item.message}{" "}
                <Text style={styles.timeAgo}>{getTimeAgo(item.createdAt)}</Text>
              </Text>
            </View>
            {item.recipeImage && (
              <Image
                source={{ uri: getImageUrl(item.recipeImage) }}
                style={styles.recipeThumb}
              />
            )}
          </View>
        );

      case NotificationType.RECIPE_PUBLISHED:
        return (
          <View style={styles.notificationContent}>
            <View style={styles.avatarContainer}>
              <Image
                source={
                  item.actorAvatar
                    ? { uri: getImageUrl(item.actorAvatar) }
                    : require("../assets/images/default-avatar.png")
                }
                style={styles.avatar}
              />
              {!item.isRead && <View style={styles.unreadDot} />}
            </View>
            <View style={styles.textContainer}>
              <Text style={styles.message}>
                <Text style={styles.actorName}>
                  {item.actorName || "Người dùng"}
                </Text>
                {" vừa đăng công thức mới"}
                {item.recipeTitle && (
                  <>
                    {': "'}
                    <Text style={styles.recipeTitle}>{item.recipeTitle}</Text>
                    {'"'}
                  </>
                )}
                {". "}
                <Text style={styles.timeAgo}>{getTimeAgo(item.createdAt)}</Text>
              </Text>
            </View>
            {item.recipeImage && (
              <Image
                source={{ uri: getImageUrl(item.recipeImage) }}
                style={styles.recipeThumb}
              />
            )}
          </View>
        );

      case NotificationType.SYSTEM:
        return (
          <View style={styles.notificationContent}>
            <View style={styles.avatarContainer}>
              <View style={[styles.avatar, styles.systemAvatar]}>
                <Ionicons
                  name="notifications"
                  size={24}
                  color={Colors.primary}
                />
              </View>
              {!item.isRead && <View style={styles.unreadDot} />}
            </View>
            <View style={styles.textContainer}>
              <Text style={styles.message}>
                {item.message}{" "}
                <Text style={styles.timeAgo}>{getTimeAgo(item.createdAt)}</Text>
              </Text>
            </View>
            {item.recipeImage && (
              <Image
                source={{ uri: getImageUrl(item.recipeImage) }}
                style={styles.recipeThumb}
              />
            )}
          </View>
        );

      case NotificationType.RECIPE_STATUS:
        return (
          <View style={styles.notificationContent}>
            <View style={styles.avatarContainer}>
              <View style={[styles.avatar, styles.systemAvatar]}>
                <Ionicons
                  name="notifications"
                  size={24}
                  color={Colors.primary}
                />
              </View>
              {!item.isRead && <View style={styles.unreadDot} />}
            </View>
            <View style={styles.textContainer}>
              <Text style={styles.message}>
                {item.message}{" "}
                <Text style={styles.timeAgo}>{getTimeAgo(item.createdAt)}</Text>
              </Text>
            </View>
          </View>
        );

      case NotificationType.REPORT_REVIEW:
        return (
          <View style={styles.notificationContent}>
            <View style={styles.avatarContainer}>
              <View style={[styles.avatar, styles.systemAvatar]}>
                <Ionicons
                  name="notifications"
                  size={24}
                  color={Colors.primary}
                />
              </View>
              {!item.isRead && <View style={styles.unreadDot} />}
            </View>
            <View style={styles.textContainer}>
              <Text style={styles.message}>
                {item.message}{" "}
                <Text style={styles.timeAgo}>{getTimeAgo(item.createdAt)}</Text>
              </Text>
            </View>
          </View>
        );

      case NotificationType.WARNING:
        return (
          <View style={styles.notificationContent}>
            <View style={styles.avatarContainer}>
              <View style={[styles.avatar, styles.systemAvatar]}>
                <Ionicons
                  name="notifications"
                  size={24}
                  color={Colors.primary}
                />
              </View>
              {!item.isRead && <View style={styles.unreadDot} />}
            </View>
            <View style={styles.textContainer}>
              <Text style={styles.message}>
                {item.message}{" "}
                <Text style={styles.timeAgo}>{getTimeAgo(item.createdAt)}</Text>
              </Text>
            </View>
          </View>
        );

      case NotificationType.ACCOUNT_STATUS:
        return (
          <View style={styles.notificationContent}>
            <View style={styles.avatarContainer}>
              <View style={[styles.avatar, styles.systemAvatar]}>
                <Ionicons
                  name="notifications"
                  size={24}
                  color={Colors.primary}
                />
              </View>
              {!item.isRead && <View style={styles.unreadDot} />}
            </View>
            <View style={styles.textContainer}>
              <Text style={styles.message}>
                {item.message}{" "}
                <Text style={styles.timeAgo}>{getTimeAgo(item.createdAt)}</Text>
              </Text>
            </View>
          </View>
        );

      default:
        return (
          <View style={styles.notificationContent}>
            <View style={styles.avatarContainer}>
              <Image source={{ uri: avatarUrl }} style={styles.avatar} />
              {!item.isRead && <View style={styles.unreadDot} />}
            </View>
            <View style={styles.textContainer}>
              <Text style={styles.message}>
                {item.message}{" "}
                <Text style={styles.timeAgo}>{getTimeAgo(item.createdAt)}</Text>
              </Text>
            </View>
          </View>
        );
    }
  };

  return (
    <View style={styles.swipeContainer}>
      <View style={styles.deleteContainer}>
        <TouchableOpacity style={styles.deleteButton} onPress={handleDelete}>
          <Text style={styles.deleteText}>Xóa</Text>
        </TouchableOpacity>
      </View>

      <Animated.View
        style={[
          styles.notificationItem,
          !item.isRead && styles.unreadNotification,
          { transform: [{ translateX }] },
        ]}
        {...panResponder.panHandlers}
      >
        <TouchableOpacity
          style={styles.notificationTouchable}
          onPress={onPress}
          activeOpacity={0.9}
        >
          {renderContent()}
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
};

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
  const [selectedPeriod, setSelectedPeriod] = useState<
    "today" | "week" | "month"
  >("today");

  // Lấy danh sách thông báo
  const fetchNotifications = async (
    pageNum: number = 0,
    isRefresh: boolean = false
  ) => {
    if (!userId) return;

    try {
      if (pageNum === 0) {
        setLoading(true);
      } else {
        setLoadingMore(true);
      }

      const result = await notificationService.getNotifications(
        userId,
        pageNum,
        20
      );

      if (isRefresh || pageNum === 0) {
        setNotifications(result.notifications);
      } else {
        setNotifications((prev) => [...prev, ...result.notifications]);
      }

      setHasMore(!result.pagination.isLast);
      setPage(pageNum);
    } catch (error: any) {
      console.log(" Error fetching notifications:", error);
      Alert.alert("Lỗi", error.message || "Không thể tải thông báo");
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
      console.log(" Error fetching unread count:", error);
    }
  };

  // WebSocket listeners for real-time notifications
  useEffect(() => {
    if (!userId) return;

    console.log(" [Notifications] Setting up WebSocket listeners");

    //  Handlers
    const handleNewNotification = (data: any) => {
      console.log(" [Notifications] New notification:", data);

      if (data.action === "NEW" && data.notification) {
        const newNotif = data.notification;

        setNotifications((prev) => {
          //  Kiểm tra duplicate
          const exists = prev.some(
            (n) => n.notificationId === newNotif.notificationId
          );
          if (exists) {
            console.log(" [Notifications] Duplicate notification, skipping");
            return prev;
          }
          console.log(" [Notifications] Adding new notification");
          return [newNotif, ...prev];
        });

        setUnreadCount((prev) => prev + 1);
      }
    };

    const handleReadNotification = (data: any) => {
      console.log(" [Notifications] Read notification:", data);

      if (data.action === "READ" && data.notification) {
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

    const handleDeleteNotification = (data: any) => {
      console.log(" [Notifications] Delete notification:", data);

      if (data.action === "DELETE" && data.notification) {
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

    const handleReadAllNotifications = (data: any) => {
      console.log(" [Notifications] Read all notifications:", data);

      if (data.action === "READ_ALL") {
        setNotifications((prev) =>
          prev.map((n) => ({
            ...n,
            isRead: true,
            readAt: new Date().toISOString(),
          }))
        );
        setUnreadCount(0);
      }
    };

    //  Register listeners
    websocketService.on("NEW_NOTIFICATION", handleNewNotification);
    websocketService.on("READ_NOTIFICATION", handleReadNotification);
    websocketService.on("DELETE_NOTIFICATION", handleDeleteNotification);
    websocketService.on("READ_ALL_NOTIFICATIONS", handleReadAllNotifications);

    //  Cleanup
    return () => {
      console.log(" [Notifications] Cleaning up listeners");
      websocketService.off("NEW_NOTIFICATION", handleNewNotification);
      websocketService.off("READ_NOTIFICATION", handleReadNotification);
      websocketService.off("DELETE_NOTIFICATION", handleDeleteNotification);
      websocketService.off(
        "READ_ALL_NOTIFICATIONS",
        handleReadAllNotifications
      );
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
      console.log(" Error marking as read:", error);
    }
  };

  // Xóa một thông báo
  const deleteNotification = async (notificationId: string) => {
    if (!userId) return;

    try {
      await notificationService.deleteNotification(userId, notificationId);

      // Update local state (WebSocket will also update it)
      setNotifications((prev) => {
        const deletedNotif = prev.find(
          (n) => n.notificationId === notificationId
        );
        if (deletedNotif && !deletedNotif.isRead) {
          setUnreadCount((count) => Math.max(0, count - 1));
        }
        return prev.filter((notif) => notif.notificationId !== notificationId);
      });
    } catch (error: any) {
      console.log(" Error deleting notification:", error);
      Alert.alert("Lỗi", error.message || "Không thể xóa thông báo");
    }
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
        if (notification.actorId) {
          router.push(`/profile/${notification.actorId}`);
        }
        break;

      case NotificationType.COMMENT:
      case NotificationType.MENTION:
        if (notification.recipeId && notification.relatedId) {
          // Navigate to recipe and open comment modal, focus on specific comment
          router.push({
            pathname: `/_recipe-detail/${notification.recipeId}`,
            params: {
              openComments: "true",
              focusCommentId: notification.relatedId,
              from: "/(tabs)/notifications",
            },
          } as any);
        }
        break;

      case NotificationType.LIKE:
      case NotificationType.RECIPE_PUBLISHED:
      case NotificationType.SYSTEM:
        if (notification.relatedId) {
          router.push(
            `/_recipe-detail/${notification.relatedId}?from=/(tabs)/notifications`
          );
        }
        break;

      default:
        break;
    }
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

  // Group notifications by period
  const groupNotificationsByPeriod = () => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);

    return {
      today: notifications.filter((n) => new Date(n.createdAt) >= today),
      week: notifications.filter((n) => {
        const date = new Date(n.createdAt);
        return date < today && date >= weekAgo;
      }),
      month: notifications.filter((n) => {
        const date = new Date(n.createdAt);
        return date < weekAgo && date >= monthAgo;
      }),
    };
  };

  const grouped = groupNotificationsByPeriod();
  const currentNotifications = grouped[selectedPeriod];

  // Render trạng thái rỗng
  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Ionicons
        name="notifications-off-outline"
        size={80}
        color={Colors.gray[300]}
      />
      <Text style={styles.emptyTitle}>Chưa có thông báo</Text>
      <Text style={styles.emptySubtitle}>
        Các thông báo của bạn sẽ xuất hiện ở đây
      </Text>
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
        <Header unreadCount={unreadCount} />
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>Đang tải thông báo...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Header unreadCount={unreadCount} />

      {/* Connection status indicator */}
      {!websocketService.isConnected() && (
        <View style={styles.connectionWarning}>
          <Ionicons name="warning-outline" size={16} color={Colors.warning} />
          <Text style={styles.connectionWarningText}>
            Đang kết nối lại... Thông báo thời gian thực tạm thời không khả dụng
          </Text>
        </View>
      )}

      {/* Period Tabs */}
      <View style={styles.periodTabs}>
        <TouchableOpacity
          style={[
            styles.periodTab,
            selectedPeriod === "today" && styles.periodTabActive,
          ]}
          onPress={() => setSelectedPeriod("today")}
        >
          <Text
            style={[
              styles.periodTabText,
              selectedPeriod === "today" && styles.periodTabTextActive,
            ]}
          >
            Hôm nay
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.periodTab,
            selectedPeriod === "week" && styles.periodTabActive,
          ]}
          onPress={() => setSelectedPeriod("week")}
        >
          <Text
            style={[
              styles.periodTabText,
              selectedPeriod === "week" && styles.periodTabTextActive,
            ]}
          >
            Tuần này
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.periodTab,
            selectedPeriod === "month" && styles.periodTabActive,
          ]}
          onPress={() => setSelectedPeriod("month")}
        >
          <Text
            style={[
              styles.periodTabText,
              selectedPeriod === "month" && styles.periodTabTextActive,
            ]}
          >
            Tháng này
          </Text>
        </TouchableOpacity>
      </View>

      {/* Danh sách thông báo */}
      <FlatList
        data={currentNotifications}
        renderItem={({ item }) => (
          <SwipeableNotificationItem
            item={item}
            onPress={() => handleNotificationPress(item)}
            onDelete={() => deleteNotification(item.notificationId)}
          />
        )}
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
        contentContainerStyle={
          currentNotifications.length === 0
            ? styles.emptyListContainer
            : undefined
        }
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

// Component Header
const Header = ({ unreadCount }: { unreadCount?: number }) => (
  <View style={styles.header}>
    <View style={styles.headerCenter}>
      <Text style={styles.headerTitle}>Thông báo</Text>
      {unreadCount! > 0 && (
        <View style={styles.unreadBadge}>
          <Text style={styles.unreadBadgeText}>{unreadCount}</Text>
        </View>
      )}
    </View>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: Colors.text.light,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  headerCenter: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: Colors.text.primary,
  },
  unreadBadge: {
    backgroundColor: Colors.primary,
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 2,
    minWidth: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  unreadBadgeText: {
    color: Colors.white,
    fontSize: 12,
    fontWeight: "700",
  },
  connectionWarning: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: "#FFF3CD",
    borderBottomWidth: 1,
    borderBottomColor: "#FFE69C",
  },
  connectionWarningText: {
    flex: 1,
    fontSize: 12,
    color: "#856404",
  },
  periodTabs: {
    flexDirection: "row",
    backgroundColor: Colors.white,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  periodTab: {
    flex: 1,
    paddingVertical: 8,
    alignItems: "center",
  },
  periodTabActive: {
    borderBottomWidth: 2,
    borderBottomColor: Colors.primary,
  },
  periodTabText: {
    fontSize: 15,
    fontWeight: "600",
    color: Colors.text.secondary,
  },
  periodTabTextActive: {
    color: Colors.primary,
  },
  swipeContainer: {
    position: "relative",
  },
  deleteContainer: {
    position: "absolute",
    right: 0,
    top: 0,
    bottom: 0,
    width: 80,
    backgroundColor: Colors.primary,
    justifyContent: "center",
    alignItems: "center",
  },
  deleteButton: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  deleteText: {
    color: Colors.white,
    fontWeight: "600",
    fontSize: 14,
  },
  notificationItem: {
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  unreadNotification: {
    backgroundColor: Colors.gray[50],
  },
  notificationTouchable: {
    width: "100%",
  },
  notificationContent: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    gap: 12,
  },
  avatarContainer: {
    position: "relative",
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.gray[100],
  },
  systemAvatar: {
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: Colors.primary + "20",
  },
  unreadDot: {
    position: "absolute",
    top: 0,
    right: 0,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: Colors.primary,
    borderWidth: 2,
    borderColor: Colors.white,
  },
  textContainer: {
    flex: 1,
  },
  message: {
    fontSize: 14,
    lineHeight: 20,
    color: Colors.text.primary,
  },
  actorName: {
    fontWeight: "600",
    color: Colors.text.primary,
  },
  recipeTitle: {
    fontWeight: "600",
    color: Colors.text.primary,
  },
  timeAgo: {
    fontSize: 13,
    color: Colors.text.secondary,
  },
  followButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  followButtonText: {
    color: Colors.white,
    fontSize: 13,
    fontWeight: "600",
  },
  recipeThumb: {
    width: 48,
    height: 48,
    borderRadius: 4,
    backgroundColor: Colors.gray[100],
  },
  emptyListContainer: {
    flexGrow: 1,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 64,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: Colors.text.primary,
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: Colors.gray[300],
    textAlign: "center",
  },
  footerLoader: {
    paddingVertical: 20,
    alignItems: "center",
  },
});
