import CollectionListTab from "@/components/profile/CollectionListTab";
import RecipeGrid from "@/components/profile/RecipeGrid";
import { moderateScale, scale, verticalScale } from "@/constants/layout";
import { useFollowWebSocket } from "@/hooks/useFollowWebSocket";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { Image } from 'expo-image';
import { router, useFocusEffect, useLocalSearchParams } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "../../context/AuthContext";
import { userService } from "../../services/userService";
import { Colors } from "../../styles/colors";
import { UserProfile } from "../../types/user.types";

export default function OwnProfileScreen() {

  const canGoBack = router.canGoBack();
  const { user, logout, __DEV_toggleOfflineMode, __DEV_isForceOffline } = useAuth();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const { reload } = useLocalSearchParams<{ reload?: string }>();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [refreshKey, setRefreshKey] = useState<number>(0);
  const [showSettingsMenu, setShowSettingsMenu] = useState(false);
  const [activeTab, setActiveTab] = useState<"recipes" | "collections">(
    "recipes"
  );
  const [lastLoadedAvatarUrl, setLastLoadedAvatarUrl] = useState<string | null>(null);
  const isOwner = userProfile?.userId === user?.userId;

  // Load profile lần đầu
  useEffect(() => {
    if (user?.username) {
      loadProfile();
    }
  }, [user?.username]);

  useEffect(() => {
  if (!userProfile || !user) return;

  if (
    userProfile.followerCount !== user.followerCount ||
    userProfile.followingCount !== user.followingCount
  ) {
    setUserProfile(prev => prev ? {
      ...prev,
      followerCount: user.followerCount,
      followingCount: user.followingCount,
    } : prev);
  }
}, [user?.followerCount, user?.followingCount]);


  useFocusEffect(
  useCallback(() => {
    if (reload) {
      loadProfile();
      setRefreshKey(k => k + 1);
      return;
    }

    if (user?.avatarUrl && user.avatarUrl !== lastLoadedAvatarUrl) {
      loadProfile();
    }
  }, [reload, user?.avatarUrl, lastLoadedAvatarUrl])
);

  const loadProfile = async () => {
    if (!user?.username) {
      setLoading(false);
      return;
    }

    try {
      const profile = await userService.getUserByUsername(user.username);
      setUserProfile(profile);
      setLastLoadedAvatarUrl(profile.avatarUrl || null);
    } catch (error: any) {
      console.error("[OwnProfile] Error loading profile:", error.message);

      // Fallback: Use user from context nếu có
      if (user) {
        setUserProfile({
          userId: user.userId,
          username: user.username,
          email: user.email,
          fullName: user.fullName,
          avatarUrl: user.avatarUrl,
          bio: user.bio,
          followerCount: user.followerCount || 0,
          followingCount: user.followingCount || 0,
          recipeCount: user.recipeCount || 0,
        } as UserProfile);
      }

      // Chỉ show alert nếu không có fallback data
      if (!user) {
        Alert.alert("Lỗi", error.message || "Không thể tải thông tin cá nhân");
      }
    } finally {
      setLoading(false);
    }
  };

  // WEBSOCKET: Listen to follow updates
    useFollowWebSocket({
      userId: userProfile?.userId,
      onFollowUpdate: (data) => {
        console.log('Realtime follow update:', data);
    // Cập nhật userProfile followerCount
    setUserProfile(prev => prev ? {
      ...prev,
      followerCount: data.action === 'FOLLOW'
        ? (prev.followerCount ?? 0) + 1
        : (prev.followerCount ?? 0) - 1
    } : prev);
      },
    });

  const onRefresh = async () => {
    setRefreshing(true);
    await loadProfile();
    setRefreshKey(k => k + 1); 
    setRefreshing(false);
  };

  const handleSettings = () => {
    router.push('/settings' as any);
  };


  const formatNumber = (num: number): string => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const renderHeader = () => (
    <>
      {/* Avatar Section with Settings Button */}
      <View style={styles.profileHeader}>
        {/* Settings Button - Top Right Corner */}
        <TouchableOpacity
          onPress={handleSettings}
          style={styles.settingsButton}
          activeOpacity={0.7}
        >
          <Ionicons
            name="settings-outline"
            size={scale(24)}
            color={Colors.text.primary}
          />
        </TouchableOpacity>

        <View style={styles.avatarSection}>
          <View style={styles.avatarContainer}>
            {userProfile?.avatarUrl ? (
              <>
                <Image
                  key={userProfile.avatarUrl}
                  source={{ uri: userProfile.avatarUrl }}
                  style={styles.avatar}
                  cachePolicy="memory-disk"
                  contentFit="cover"
                  transition={200}
                  recyclingKey={userProfile.avatarUrl}
                  onError={(error) => {
                    console.error('Lỗi load avatar:', error);
                    console.log('URL gây lỗi:', userProfile.avatarUrl);
                  }}
                  onLoad={() => {
                    console.log('Avatar loaded successfully');
                  }}
                />
              </>
            ) : (
              <Image
                source={require("../../assets/images/default-avatar.png")}
                style={styles.avatar}
                contentFit="cover"
              />
            )}
          </View>

          <Text style={styles.fullNameText}>
            {userProfile?.fullName || user?.fullName || "Tên người dùng"}
          </Text>
          <Text style={styles.bioText}>
            {userProfile?.bio || "Yêu thích nấu ăn & chia sẻ công thức ngon"}
          </Text>
        </View>
      </View>

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
            {formatNumber(userProfile?.followingCount || 0)}
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
            {formatNumber(userProfile?.followerCount || 0)}
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

      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={
            activeTab === "recipes" ? styles.tabItemActive : styles.tabItem
          }
          onPress={() => setActiveTab("recipes")}
        >
          <Text
            style={
              activeTab === "recipes" ? styles.tabTextActive : styles.tabText
            }
          >
            Công thức đã đăng
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={
            activeTab === "collections" ? styles.tabItemActive : styles.tabItem
          }
          onPress={() => setActiveTab("collections")}
        >
          <Text
            style={
              activeTab === "collections"
                ? styles.tabTextActive
                : styles.tabText
            }
          >
            Bộ sưu tập
          </Text>
        </TouchableOpacity>
      </View>
    </>
  );

  const renderTabContent = () => {
    if (!userProfile?.userId) return null;

    if (activeTab === "recipes") {
      return <RecipeGrid userId={userProfile.userId} refreshKey={refreshKey} isOwnProfile={true} currentProfileId={userProfile.userId} />;
    } else {
      return <CollectionListTab userId={userProfile.userId} />;
    }
  };

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
      {/* 🧪 Dev-only: Offline Mode Toggle Button */}
      {__DEV__ && __DEV_toggleOfflineMode && (
        <TouchableOpacity
          onPress={__DEV_toggleOfflineMode}
          style={styles.devButton}
        >
          <MaterialCommunityIcons
            name={__DEV_isForceOffline ? "wifi-off" : "wifi"}
            size={16}
            color="#fff"
          />
          <Text style={styles.devButtonText}>
            {__DEV_isForceOffline ? '📴 Offline' : '🌐 Online'}
          </Text>
        </TouchableOpacity>
      )}

      <FlatList
        ListHeaderComponent={renderHeader}
        data={[{}]}
        renderItem={() => renderTabContent()} // Chỉ render content theo tab
        keyExtractor={(item, index) => index.toString()}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        contentContainerStyle={styles.scrollContent}
        ListEmptyComponent={null} // Không cần EmptyComponent vì CollectionListTab tự xử lý
      />

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
  profileHeader: {
    position: "relative",
    backgroundColor: "#fff",
  },
  settingsButton: {
    position: "absolute",
    top: verticalScale(12),
    right: scale(16),
    zIndex: 10,
    backgroundColor: Colors.white,
    borderRadius: scale(20),
    padding: scale(8),
    shadowColor: "#000",
    shadowOffset: { width: 0, height: verticalScale(2) },
    shadowOpacity: 0.1,
    shadowRadius: scale(3),
    elevation: 3,
  },
  avatarSection: {
    alignItems: "center",
    paddingVertical: verticalScale(20),
    backgroundColor: "#fff",
  },
  avatarContainer: {
    width: scale(110),
    height: scale(110),
    justifyContent: "center",
    alignItems: "center",
  },
  avatar: {
    width: scale(100),
    height: scale(100),
    borderRadius: scale(50),
    backgroundColor: "#f0f0f0",
    borderWidth: scale(2),
    borderColor: "#ffc0cb",
  },
  fullNameText: {
    fontSize: moderateScale(18),
    fontWeight: "bold",
    color: Colors.text.primary,
    marginTop: verticalScale(12),
  },
  bioText: {
    fontSize: moderateScale(13),
    color: Colors.text.secondary,
    textAlign: "center",
    marginTop: verticalScale(4),
    paddingHorizontal: scale(40),
    lineHeight: verticalScale(18),
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    backgroundColor: "#fff",
    paddingHorizontal: scale(10),
    paddingVertical: verticalScale(15),
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: "#e0e0e0",
  },
  statItem: {
    flex: 1,
    alignItems: "center",
  },
  statNumber: {
    fontSize: moderateScale(18),
    fontWeight: "bold",
    color: Colors.text.primary,
  },
  statLabel: {
    fontSize: moderateScale(12),
    color: Colors.text.secondary,
    marginTop: verticalScale(2),
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
    paddingVertical: verticalScale(10),
  },
  tabItemActive: {
    flex: 1,
    alignItems: "center",
    paddingVertical: verticalScale(10),
    borderBottomWidth: scale(3),
    borderBottomColor: Colors.primary,
  },
  tabText: {
    fontSize: moderateScale(15),
    color: Colors.text.secondary,
    fontWeight: "500",
  },
  tabTextActive: {
    fontSize: moderateScale(15),
    color: Colors.primary,
    fontWeight: "600",
  },

  // Settings Menu Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.3)",
    justifyContent: "flex-start",
    alignItems: "flex-end",
    paddingTop: verticalScale(60),
    paddingRight: scale(16),
  },
  settingsMenu: {
    backgroundColor: "white",
    borderRadius: scale(12),
    minWidth: scale(200),
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: verticalScale(2),
    },
    shadowOpacity: 0.25,
    shadowRadius: scale(8),
    elevation: 8,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: scale(16),
    paddingVertical: verticalScale(14),
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  menuItemDanger: {
    borderBottomWidth: 0,
  },
  menuText: {
    fontSize: moderateScale(16),
    color: Colors.text.primary,
    marginLeft: scale(12),
    fontWeight: "500",
  },

  // Dev Button Styles
  devButton: {
    position: 'absolute',
    bottom: verticalScale(20),
    left: scale(20),
    backgroundColor: '#FF6B35',
    paddingVertical: verticalScale(10),
    paddingHorizontal: scale(14),
    borderRadius: scale(25),
    flexDirection: 'row',
    alignItems: 'center',
    gap: scale(6),
    zIndex: 9999,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: verticalScale(3) },
    shadowOpacity: 0.4,
    shadowRadius: scale(6),
    elevation: 8,
  },
  devButtonText: {
    color: '#fff',
    fontSize: moderateScale(12),
    fontWeight: 'bold',
  },
});