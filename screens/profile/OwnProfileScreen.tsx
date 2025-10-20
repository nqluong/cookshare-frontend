import RecipeGrid from "@/components/profile/RecipeGrid";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  Modal,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "../../context/AuthContext";
import { userService } from "../../services/userService";
import { Colors } from "../../styles/colors";
import { UserProfile } from "../../types/user.types";

export default function OwnProfileScreen() {

  const canGoBack = router.canGoBack();
  const { user, logout } = useAuth();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showSettingsMenu, setShowSettingsMenu] = useState(false);

  useEffect(() => {
    if (user?.username) {
      loadProfile();
    }
  }, [user]);

  const loadProfile = async () => {
    if (!user?.username) return;

    try {
      const profile = await userService.getUserByUsername(user.username);
      setUserProfile(profile);
    } catch (error: any) {
      console.error("Error loading profile:", error);
      Alert.alert("Lỗi", error.message || "Không thể tải thông tin cá nhân");
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadProfile();
    setRefreshing(false);
  };

  const handleLogout = () => {
    Alert.alert("Đăng xuất", "Bạn có chắc chắn muốn đăng xuất không?", [
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
            Alert.alert("Lỗi", "Đã có lỗi xảy ra khi đăng xuất");
          }
        },
      },
    ]);
  };

  const handleChangePassword = () => {
    setShowSettingsMenu(false);
    router.push('/changePassword' as any);
  };

  const handleAdminPanel = () => {
    setShowSettingsMenu(false);
    Alert.alert("Admin Panel", "Tính năng admin panel đang được phát triển!");
  };

  const toggleSettingsMenu = () => {
    setShowSettingsMenu(!showSettingsMenu);
  };

  const formatNumber = (num: number): string => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  // Render header content
  const renderHeader = () => (
    <>
      {/* Header (Title & Settings Icon) */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={toggleSettingsMenu}
          style={styles.settingsButton}
        >
          <Ionicons
            name="settings-outline"
            size={24}
            color={Colors.text.primary}
          />
        </TouchableOpacity>
      </View>

      {/* Avatar & Basic Info */}
      <View style={styles.avatarSection}>
        {/* Avatar */}
        <View style={styles.avatarContainer}>
          {userProfile?.avatarUrl ? (
            <Image
              source={{ uri: userProfile.avatarUrl }}
              style={styles.avatar}
            />
          ) : (
            <Image
              source={require("../../assets/images/default-avatar.png")}
              style={styles.avatar}
            />
          )}
          {/* Edit Icon */}
          <TouchableOpacity style={styles.editAvatarButton}>
            <MaterialCommunityIcons
              name="account-edit-outline"
              size={16}
              color={Colors.text.primary}
            />
          </TouchableOpacity>
        </View>

        {/* Name and Bio */}
        <Text style={styles.fullNameText}>
          {userProfile?.fullName || user?.fullName || "Tên người dùng"}
        </Text>
        <Text style={styles.bioText}>
          {userProfile?.bio || "Yêu thích nấu ăn & chia sẻ công thức ngon"}
        </Text>
      </View>

      {/* Stats (Đã follow, Follower, Thích) */}
      <View style={styles.statsContainer}>
        <TouchableOpacity
          style={styles.statItem}
          onPress={() =>
            router.push({
              pathname: `/profile/follows/${userProfile?.userId}`,
              params: { initialTab: "following" },
            } as any)
          }
        >
          <Text style={styles.statNumber}>
            {formatNumber(userProfile?.followingCount || 2)}
          </Text>
          <Text style={styles.statLabel}>Đã follow</Text>
        </TouchableOpacity>

        <View style={styles.statsDivider} />

        <TouchableOpacity
          style={styles.statItem}
          onPress={() =>
            router.push({
              pathname: `/profile/follows/${userProfile?.userId}`,
              params: { initialTab: "followers" },
            } as any)
          }
        >
          <Text style={styles.statNumber}>
            {formatNumber(userProfile?.followerCount || 999)}
          </Text>
          <Text style={styles.statLabel}>Follower</Text>
        </TouchableOpacity>

        <View style={styles.statsDivider} />

        <View style={styles.statItem}>
          <Text style={styles.statNumber}>
            {formatNumber(userProfile?.totalLikes || 0)}
          </Text>
          <Text style={styles.statLabel}>Thích</Text>
        </View>
      </View>

      {/* Recipe Tabs */}
      <View style={styles.tabContainer}>
        <TouchableOpacity style={styles.tabItemActive}>
          <Text style={styles.tabTextActive}>Công thức đã đăng</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.tabItem}>
          <Text style={styles.tabText}>Công thức đã lưu</Text>
        </TouchableOpacity>
      </View>
    </>
  );

  const data = [{}];
  const renderItem = () => <RecipeGrid userId={userProfile?.userId || ""} />;

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        ListHeaderComponent={renderHeader}
        data={data}
        renderItem={renderItem}
        keyExtractor={(item, index) => index.toString()}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        contentContainerStyle={styles.scrollContent}
      />

      <Modal
          visible={showSettingsMenu}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setShowSettingsMenu(false)}
        >
          <TouchableOpacity
            style={styles.modalOverlay}
            activeOpacity={1}
            onPress={() => setShowSettingsMenu(false)}
          >
            <View style={styles.settingsMenu}>
              {/* Change Password Option */}
              <TouchableOpacity
                style={styles.menuItem}
                onPress={handleChangePassword}
              >
                <Ionicons name="key-outline" size={20} color={Colors.text.primary} />
                <Text style={styles.menuText}>Đổi mật khẩu</Text>
              </TouchableOpacity>

              {/* Admin Panel Option (only for ADMIN role) */}
              {user?.role === 'ADMIN' && (
                <TouchableOpacity
                  style={styles.menuItem}
                  onPress={handleAdminPanel}
                >
                  <Ionicons name="shield-outline" size={20} color={Colors.primary} />
                  <Text style={[styles.menuText, { color: Colors.primary }]}>Admin Panel</Text>
                </TouchableOpacity>
              )}

              {/* Logout Option */}
              <TouchableOpacity
                style={[styles.menuItem, styles.menuItemDanger]}
                onPress={() => {
                  setShowSettingsMenu(false);
                  handleLogout();
                }}
              >
                <Ionicons name="log-out-outline" size={20} color="#ef4444" />
                <Text style={[styles.menuText, { color: "#ef4444" }]}>Đăng xuất</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContent: {
    paddingBottom: 0,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  safeArea: {
    backgroundColor: Colors.white,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
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
    fontWeight: '700',
    color: Colors.text.primary,
  },
  placeholder: {
    width: 32,
  },
  settingsButton: {
    padding: 8,
    marginLeft: "auto",
  },

  avatarSection: {
    alignItems: "center",
    paddingVertical: 0,
    backgroundColor: "#fff",
  },
  avatarContainer: {
    width: 110,
    height: 110,
    justifyContent: "center",
    alignItems: "center",
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#f0f0f0",
    borderWidth: 2,
    borderColor: "#ffc0cb",
  },
  editAvatarButton: {
    position: "absolute",
    right: 5,
    bottom: 5,
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 3,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    zIndex: 10,
  },
  fullNameText: {
    fontSize: 18,
    fontWeight: "bold",
    color: Colors.text.primary,
    marginTop: 8,
  },
  bioText: {
    fontSize: 13,
    color: Colors.text.secondary,
    textAlign: "center",
    marginTop: 4,
    paddingHorizontal: 40,
    lineHeight: 18,
    marginBottom: 10,
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    backgroundColor: "#fff",
    paddingHorizontal: 10,
    paddingVertical: 15,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: "#e0e0e0",
  },
  statItem: {
    flex: 1,
    alignItems: "center",
  },
  statNumber: {
    fontSize: 18,
    fontWeight: "bold",
    color: Colors.text.primary,
  },
  statLabel: {
    fontSize: 12,
    color: Colors.text.secondary,
    marginTop: 2,
  },
  statsDivider: {
    width: 1,
    height: "100%",
    backgroundColor: "#e0e0e0",
  },

  tabContainer: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  tabItem: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 10,
  },
  tabItemActive: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 3,
    borderBottomColor: Colors.primary,
  },
  tabText: {
    fontSize: 15,
    color: Colors.text.secondary,
    fontWeight: "500",
  },
  tabTextActive: {
    fontSize: 15,
    color: Colors.primary,
    fontWeight: "600",
  },

  // Settings Menu Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'flex-start',
    alignItems: 'flex-end',
    paddingTop: 60,
    paddingRight: 16,
  },
  settingsMenu: {
    backgroundColor: 'white',
    borderRadius: 12,
    minWidth: 200,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 8,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  menuItemDanger: {
    borderBottomWidth: 0,
  },
  menuText: {
    fontSize: 16,
    color: Colors.text.primary,
    marginLeft: 12,
    fontWeight: '500',
  },
});
