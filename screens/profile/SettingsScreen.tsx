import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { Image } from 'expo-image';
import { router } from "expo-router";
import React, { useMemo } from "react";
import {
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import CustomAlert from "../../components/ui/CustomAlert";
import { useAuth } from "../../context/AuthContext";
import { useCustomAlert } from "../../hooks/useCustomAlert";
import { Colors } from "../../styles/colors";

interface SettingItem {
  id: string;
  title: string;
  subtitle?: string;
  icon: string;
  iconLibrary: "Ionicons" | "MaterialCommunityIcons";
  iconColor?: string;
  iconBgColor?: string;
  type: "navigation" | "toggle" | "action";
  action?: () => void;
  route?: string;
  showArrow?: boolean;
  value?: boolean;
  onToggle?: (value: boolean) => void;
  adminOnly?: boolean;
}

export default function SettingsScreen() {
  const { user, logout } = useAuth();
  const { alert, showAlert, hideAlert } = useCustomAlert();
  const [notificationsEnabled, setNotificationsEnabled] = React.useState(true);
  const [darkModeEnabled, setDarkModeEnabled] = React.useState(false);

  // Memoize avatar URL để tránh re-render không cần thiết
  const avatarUrl = useMemo(() => user?.avatarUrl, [user?.avatarUrl]);

  const handleLogout = () => {
    showAlert({
      title: "Đăng xuất",
      message: "Bạn có chắc chắn muốn đăng xuất không?",
      type: "warning",
      buttons: [
        {
          text: "Hủy",
          style: "cancel",
        },
        {
          text: "Đăng xuất",
          style: "destructive",
          onPress: async () => {
            try {
              await logout();
              router.replace("/auth/login" as any);
            } catch (error) {
              showAlert({
                title: "Lỗi",
                message: "Đã có lỗi xảy ra khi đăng xuất",
                type: "error",
              });
            }
          },
        },
      ],
    });
  };

  const handleChangePassword = () => {
    router.push("/changePassword" as any);
  };

  const handleAdminDashboard = () => {
    router.push("/admin/home" as any);
  };

  const handleProfileDetails = () => {
    router.push("/profile/details" as any);
  };

  const handlePrivacy = () => {
    showAlert({
      title: "Quyền riêng tư",
      message: "Tính năng đang được phát triển!",
      type: "info",
    });
  };

  const handleLanguage = () => {
    showAlert({
      title: "Ngôn ngữ",
      message: "Tính năng đang được phát triển!",
      type: "info",
    });
  };

  const handleHelp = () => {
    showAlert({
      title: "Trợ giúp",
      message: "Tính năng đang được phát triển!",
      type: "info",
    });
  };

  const handleAbout = () => {
    showAlert({
      title: "Về ứng dụng",
      message: "CookShare v1.0.0\nỨng dụng chia sẻ công thức nấu ăn",
      type: "info",
    });
  };

  const settingSections: { title: string; items: SettingItem[] }[] = [
    {
      title: "Tài khoản",
      items: [
        {
          id: "profile-details",
          title: "Thông tin chi tiết",
          subtitle: "Xem và chỉnh sửa thông tin cá nhân",
          icon: "person-circle-outline",
          iconLibrary: "Ionicons",
          iconColor: "#3b82f6",
          iconBgColor: "#dbeafe",
          type: "navigation",
          showArrow: true,
          action: handleProfileDetails,
        },
        {
          id: "change-password",
          title: "Đổi mật khẩu",
          subtitle: "Thay đổi mật khẩu của bạn",
          icon: "key-outline",
          iconLibrary: "Ionicons",
          iconColor: "#10b981",
          iconBgColor: "#d1fae5",
          type: "navigation",
          showArrow: true,
          action: handleChangePassword,
        },
        {
          id: "privacy",
          title: "Quyền riêng tư",
          subtitle: "Quản lý quyền riêng tư của bạn",
          icon: "shield-checkmark-outline",
          iconLibrary: "Ionicons",
          iconColor: "#8b5cf6",
          iconBgColor: "#ede9fe",
          type: "navigation",
          showArrow: true,
          action: handlePrivacy,
        },
      ],
    },
    {
      title: "Quản trị viên",
      items: [
        {
          id: "admin-dashboard",
          title: "Trang quản trị",
          subtitle: "Truy cập bảng điều khiển admin",
          icon: "shield-outline",
          iconLibrary: "Ionicons",
          iconColor: "#ef4444",
          iconBgColor: "#fee2e2",
          type: "navigation",
          showArrow: true,
          action: handleAdminDashboard,
          adminOnly: true,
        },
      ],
    },
    {
      title: "Cài đặt chung",
      items: [
        {
          id: "notifications",
          title: "Thông báo",
          subtitle: "Nhận thông báo từ ứng dụng",
          icon: "notifications-outline",
          iconLibrary: "Ionicons",
          iconColor: "#f59e0b",
          iconBgColor: "#fef3c7",
          type: "toggle",
          value: notificationsEnabled,
          onToggle: setNotificationsEnabled,
        },
        {
          id: "dark-mode",
          title: "Chế độ tối",
          subtitle: "Giao diện tối cho màn hình",
          icon: "moon-outline",
          iconLibrary: "Ionicons",
          iconColor: "#6366f1",
          iconBgColor: "#e0e7ff",
          type: "toggle",
          value: darkModeEnabled,
          onToggle: setDarkModeEnabled,
        },
        {
          id: "language",
          title: "Ngôn ngữ",
          subtitle: "Tiếng Việt",
          icon: "language-outline",
          iconLibrary: "Ionicons",
          iconColor: "#06b6d4",
          iconBgColor: "#cffafe",
          type: "navigation",
          showArrow: true,
          action: handleLanguage,
        },
      ],
    },
    {
      title: "Hỗ trợ",
      items: [
        {
          id: "help",
          title: "Trợ giúp & Hỗ trợ",
          icon: "help-circle-outline",
          iconLibrary: "Ionicons",
          iconColor: "#14b8a6",
          iconBgColor: "#ccfbf1",
          type: "navigation",
          showArrow: true,
          action: handleHelp,
        },
        {
          id: "about",
          title: "Về ứng dụng",
          icon: "information-circle-outline",
          iconLibrary: "Ionicons",
          iconColor: "#64748b",
          iconBgColor: "#f1f5f9",
          type: "navigation",
          showArrow: true,
          action: handleAbout,
        },
      ],
    },
  ];

  const renderIcon = (item: SettingItem) => {
    if (item.iconLibrary === "MaterialCommunityIcons") {
      return (
        <MaterialCommunityIcons
          name={item.icon as any}
          size={22}
          color={item.iconColor || Colors.text.primary}
        />
      );
    }
    return (
      <Ionicons
        name={item.icon as any}
        size={22}
        color={item.iconColor || Colors.text.primary}
      />
    );
  };

  const renderSettingItem = (item: SettingItem) => {
    // Don't show admin items for non-admin users
    if (item.adminOnly && user?.role !== "ADMIN") {
      return null;
    }

    if (item.type === "toggle") {
      return (
        <View key={item.id} style={styles.settingItem}>
          <View style={styles.settingItemLeft}>
            <View
              style={[
                styles.iconContainer,
                { backgroundColor: item.iconBgColor || Colors.gray[100] },
              ]}
            >
              {renderIcon(item)}
            </View>
            <View style={styles.settingTextContainer}>
              <Text style={styles.settingTitle}>{item.title}</Text>
              {item.subtitle && (
                <Text style={styles.settingSubtitle}>{item.subtitle}</Text>
              )}
            </View>
          </View>
          <Switch
            value={item.value}
            onValueChange={item.onToggle}
            trackColor={{ false: Colors.gray[300], true: Colors.primary }}
            thumbColor="#fff"
          />
        </View>
      );
    }

    return (
      <TouchableOpacity
        key={item.id}
        style={styles.settingItem}
        onPress={item.action}
        activeOpacity={0.7}
      >
        <View style={styles.settingItemLeft}>
          <View
            style={[
              styles.iconContainer,
              { backgroundColor: item.iconBgColor || Colors.gray[100] },
            ]}
          >
            {renderIcon(item)}
          </View>
          <View style={styles.settingTextContainer}>
            <Text style={styles.settingTitle}>{item.title}</Text>
            {item.subtitle && (
              <Text style={styles.settingSubtitle}>{item.subtitle}</Text>
            )}
          </View>
        </View>
        {item.showArrow && (
          <Ionicons
            name="chevron-forward"
            size={20}
            color={Colors.text.light}
          />
        )}
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <CustomAlert
        visible={alert.visible}
        title={alert.title}
        message={alert.message}
        type={alert.type}
        buttons={alert.buttons}
        onClose={hideAlert}
      />
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={Colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Cài đặt</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* User Info Card */}
        <View style={styles.userCard}>
          <View style={styles.userAvatar}>
            {avatarUrl ? (
              <Image
                key={avatarUrl}
                source={{ uri: avatarUrl }}
                style={styles.userAvatarImage}
                cachePolicy="memory-disk" // Cache aggressively
                contentFit="cover"
                transition={200}
                onError={(error) => {
                  console.log('Lỗi load avatar trong Settings:', error);
                }}
                onLoad={() => {
                  console.log('Avatar loaded trong Settings (from cache or network)');
                }}
              />
            ) : (
              <Ionicons name="person" size={32} color={Colors.primary} />
            )}
          </View>
          <View style={styles.userInfo}>
            <Text style={styles.userName}>{user?.fullName || "Người dùng"}</Text>
            <Text style={styles.userEmail}>{user?.email || ""}</Text>
            {user?.role === "ADMIN" && (
              <View style={styles.adminBadge}>
                <Ionicons name="shield-checkmark" size={14} color="#fff" />
                <Text style={styles.adminBadgeText}>Admin</Text>
              </View>
            )}
          </View>
        </View>

        {/* Settings Sections */}
        {settingSections.map((section) => {
          // Filter out admin section if user is not admin
          const visibleItems = section.items.filter(
            (item) => !item.adminOnly || user?.role === "ADMIN"
          );

          if (visibleItems.length === 0) return null;

          return (
            <View key={section.title} style={styles.section}>
              <Text style={styles.sectionTitle}>{section.title}</Text>
              <View style={styles.sectionContent}>
                {section.items.map(renderSettingItem)}
              </View>
            </View>
          );
        })}

        {/* Logout Button */}
        <TouchableOpacity
          style={styles.logoutButton}
          onPress={handleLogout}
          activeOpacity={0.8}
        >
          <Ionicons name="log-out-outline" size={22} color="#fff" />
          <Text style={styles.logoutButtonText}>Đăng xuất</Text>
        </TouchableOpacity>

        {/* Version Info */}
        <Text style={styles.versionText}>Phiên bản 1.0.0</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray[100],
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: Colors.text.primary,
  },
  placeholder: {
    width: 32,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
  },
  userCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  userAvatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#fee2e2",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 16,
    overflow: "hidden",
  },
  userAvatarImage: {
    width: 64,
    height: 64,
    borderRadius: 32,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 18,
    fontWeight: "700",
    color: Colors.text.primary,
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: Colors.text.secondary,
    marginBottom: 8,
  },
  adminBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.primary,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: "flex-start",
    gap: 4,
  },
  adminBadgeText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#fff",
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.text.secondary,
    marginBottom: 12,
    marginLeft: 4,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  sectionContent: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  settingItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray[100],
  },
  settingItemLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  settingTextContainer: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.text.primary,
    marginBottom: 2,
  },
  settingSubtitle: {
    fontSize: 13,
    color: Colors.text.secondary,
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#ef4444",
    borderRadius: 16,
    padding: 16,
    marginTop: 8,
    gap: 8,
    shadowColor: "#ef4444",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  logoutButtonText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#fff",
  },
  versionText: {
    fontSize: 12,
    color: Colors.text.light,
    textAlign: "center",
    marginTop: 24,
  },
});

