import { getImageUrl } from '@/config/api.config';
import websocketService from '@/services/websocketService';
import { Colors } from '@/styles/colors';
import { Notification, NotificationType } from '@/types/notification';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
    Animated,
    Image,
    Platform,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export function NotificationToastProvider({ children }: { children: React.ReactNode }) {
  const [notification, setNotification] = useState<Notification | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const slideAnim = useRef(new Animated.Value(-100)).current;
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ✅ Show toast
  const showToast = useCallback((notif: Notification) => {
    // Clear previous timer
    if (hideTimer.current) {
      clearTimeout(hideTimer.current);
    }

    setNotification(notif);
    setIsVisible(true);

    // Slide in animation
    Animated.spring(slideAnim, {
      toValue: 0,
      useNativeDriver: true,
      tension: 65,
      friction: 10,
    }).start();

    // Auto hide after 4s
    hideTimer.current = setTimeout(() => {
      hideToast();
    }, 4000);
  }, [slideAnim]);

  // ✅ Hide toast
  const hideToast = useCallback(() => {
    Animated.timing(slideAnim, {
      toValue: -100,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      setIsVisible(false);
      setNotification(null);
    });

    if (hideTimer.current) {
      clearTimeout(hideTimer.current);
      hideTimer.current = null;
    }
  }, [slideAnim]);

  // ✅ Listen to WebSocket notifications
  useEffect(() => {
    const handleNewNotification = (data: any) => {
      console.log('🔔 [Toast] New notification received:', data);

      if (data.action === 'NEW' && data.notification) {
        const notif = data.notification as Notification;

        // ✅ Chỉ hiện toast cho một số loại thông báo quan trọng
        const importantTypes = [
          NotificationType.LIKE,
          NotificationType.COMMENT,
          NotificationType.FOLLOW,
          NotificationType.MENTION,
          NotificationType.RECIPE_PUBLISHED,
          NotificationType.RECIPE_STATUS,
          NotificationType.REPORT_REVIEW,
          NotificationType.WARNING,
          NotificationType.ACCOUNT_STATUS,
        ];

        if (importantTypes.includes(notif.type)) {
          showToast(notif);
        }
      }
    };

    websocketService.on('NEW_NOTIFICATION', handleNewNotification);

    return () => {
      websocketService.off('NEW_NOTIFICATION', handleNewNotification);
      if (hideTimer.current) {
        clearTimeout(hideTimer.current);
      }
    };
  }, [showToast]);

  // ✅ Handle tap
  const handlePress = () => {
    hideToast();

    if (!notification) return;

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
          router.push({
            pathname: `/_recipe-detail/${notification.recipeId}`,
            params: {
              openComments: 'true',
              focusCommentId: notification.relatedId,
            },
          } as any);
        }
        break;

      case NotificationType.LIKE:
      case NotificationType.RECIPE_PUBLISHED:
        if (notification.relatedId) {
          router.push(
            `/_recipe-detail/${notification.relatedId}?from=/(tabs)/notifications`
          );
        }
        break;

      default:
        // Navigate to notifications screen
        router.push('/notifications');
        break;
    }
  };

  // ✅ Render message based on type
  const renderMessage = () => {
    if (!notification) return null;

    const actorName = notification.actorName || 'Người dùng';

    switch (notification.type) {
      case NotificationType.FOLLOW:
        return (
          <>
            <Text style={styles.actorName}>{actorName}</Text>
            <Text style={styles.message}> đã bắt đầu theo dõi bạn</Text>
          </>
        );

      case NotificationType.LIKE:
        return (
          <>
            <Text style={styles.actorName}>{actorName}</Text>
            <Text style={styles.message}> đã thích công thức của bạn</Text>
          </>
        );

      case NotificationType.COMMENT:
        return (
          <>
            <Text style={styles.actorName}>{actorName}</Text>
            <Text style={styles.message}> đã bình luận về công thức của bạn</Text>
          </>
        );

      case NotificationType.MENTION:
        return (
          <>
            <Text style={styles.actorName}>{actorName}</Text>
            <Text style={styles.message}> đã trả lời bình luận của bạn</Text>
          </>
        );

      case NotificationType.RECIPE_PUBLISHED:
        return (
          <>
            <Text style={styles.actorName}>{actorName}</Text>
            <Text style={styles.message}> vừa đăng công thức mới</Text>
          </>
        );

      default:
        return <Text style={styles.message}>{notification.message}</Text>;
    }
  };

  if (!isVisible || !notification) {
    return <>{children}</>;
  }

  return (
    <>
      {children}

      {/* Toast Overlay */}
      <Animated.View
        style={[
          styles.toastContainer,
          {
            top: insets.top + 8,
            transform: [{ translateY: slideAnim }],
          },
        ]}
      >
        <TouchableOpacity
          activeOpacity={0.9}
          onPress={handlePress}
          style={styles.toast}
        >
          {/* Close button */}
          <TouchableOpacity
            style={styles.closeButton}
            onPress={hideToast}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons name="close" size={18} color={Colors.text.secondary} />
          </TouchableOpacity>

          {/* Avatar */}
          <View style={styles.avatarContainer}>
            {notification.actorAvatar ? (
              <Image
                source={{ uri: getImageUrl(notification.actorAvatar) }}
                style={styles.avatar}
              />
            ) : (
              <View style={[styles.avatar, styles.defaultAvatar]}>
                <Ionicons name="notifications" size={20} color={Colors.primary} />
              </View>
            )}
          </View>

          {/* Content */}
          <View style={styles.content}>
            <Text style={styles.messageText} numberOfLines={2}>
              {renderMessage()}
            </Text>
          </View>

          {/* Recipe thumbnail (if available) */}
          {notification.recipeImage && (
            <Image
              source={{ uri: getImageUrl(notification.recipeImage) }}
              style={styles.recipeThumb}
            />
          )}
        </TouchableOpacity>
      </Animated.View>
    </>
  );
}

const styles = StyleSheet.create({
  toastContainer: {
    position: 'absolute',
    left: 16,
    right: 16,
    zIndex: 9999,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  toast: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 12,
    gap: 12,
  },
  closeButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    zIndex: 1,
    padding: 4,
  },
  avatarContainer: {
    flexShrink: 0,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.gray[100],
  },
  defaultAvatar: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.primary + '20',
  },
  content: {
    flex: 1,
    paddingRight: 24, // Space for close button
  },
  messageText: {
    fontSize: 14,
    lineHeight: 20,
    color: Colors.text.primary,
  },
  actorName: {
    fontWeight: '600',
    color: Colors.text.primary,
  },
  message: {
    fontWeight: '400',
    color: Colors.text.primary,
  },
  recipeThumb: {
    width: 44,
    height: 44,
    borderRadius: 6,
    backgroundColor: Colors.gray[100],
  },
});