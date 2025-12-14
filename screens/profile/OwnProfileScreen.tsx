import CollectionListTab from "@/components/profile/CollectionListTab";
import RecipeGrid from "@/components/profile/RecipeGrid";
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

  // Cập nhật userProfile khi followingCount hoặc followerCount thay đổi trong AuthContext
  useEffect(() => {
    if (user && userProfile) {
      setUserProfile(prev => prev ? {
        ...prev,
        followingCount: user.followingCount,
        followerCount: user.followerCount,
      } : null);
    }
  }, [user?.followingCount, user?.followerCount]);

  // Chỉ reload khi avatar thay đổi (detect từ AuthContext)
  useFocusEffect(
    useCallback(() => {
      // Kiểm tra nếu avatar trong context khác với avatar đã load
      if (user?.avatarUrl && user.avatarUrl !== lastLoadedAvatarUrl) {
        console.log('🔄 Avatar changed, reloading profile...');
        loadProfile();
      }
    }, [user?.avatarUrl, lastLoadedAvatarUrl])
  );

  // Nếu bị điều hướng về profile với param reload -> reload profile and notify child to refetch
  useFocusEffect(
    useCallback(() => {
      if (reload) {
        console.log('🔁 reload param detected, refreshing profile and recipes');
        loadProfile();
        setRefreshKey(k => k + 1);
      }
    }, [reload])
  );

  const loadProfile = async () => {
    if (!user?.username) {
      console.log('⚠️ [OwnProfile] No username available, skipping load');
      setLoading(false);
      return;
    }

    try {
      console.log('📥 [OwnProfile] Loading profile for username:', user.username);
      const profile = await userService.getUserByUsername(user.username);
      console.log('🔍 [OwnProfile] Profile loaded successfully');
      console.log('🖼️ [OwnProfile] Avatar URL:', profile.avatarUrl);
      setUserProfile(profile);
      setLastLoadedAvatarUrl(profile.avatarUrl || null);
    } catch (error: any) {
      console.error("❌ [OwnProfile] Error loading profile:", error.message);

      // Fallback: Use user from context nếu có
      if (user) {
        console.log('💡 [OwnProfile] Using user data from context as fallback');
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

  const onRefresh = async () => {
    setRefreshing(true);
    await loadProfile();
    setRefreshKey(k => k + 1); // Trigger recipe reload
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
      {/* Header (Title & Settings Icon) */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={handleSettings}
          style={styles.settingsButton}
        >
          <Ionicons
            name="settings-outline"
            size={24}
            color={Colors.text.primary}
          />
        </TouchableOpacity>
      </View>

      <View style={styles.avatarSection}>
        <View style={styles.avatarContainer}>
          {userProfile?.avatarUrl ? (
            <>
              <Image
                key={userProfile.avatarUrl} // Force re-mount when URL changes
                source={{ uri: userProfile.avatarUrl }}
                style={styles.avatar}
                cachePolicy="memory-disk"
                contentFit="cover"
                transition={200}
                recyclingKey={userProfile.avatarUrl} // Help with cache
                onError={(error) => {
                  console.error('❌ Lỗi load avatar:', error);
                  console.log('URL gây lỗi:', userProfile.avatarUrl);
                }}
                onLoad={() => {
                  console.log('✅ Avatar loaded successfully');
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

  safeArea: {
    backgroundColor: Colors.white,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
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
  },
  avatarSection: {
    alignItems: "center",
    paddingVertical: 20,
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
    backgroundColor: "rgba(0, 0, 0, 0.3)",
    justifyContent: "flex-start",
    alignItems: "flex-end",
    paddingTop: 60,
    paddingRight: 16,
  },
  settingsMenu: {
    backgroundColor: "white",
    borderRadius: 12,
    minWidth: 200,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 8,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  menuItemDanger: {
    borderBottomWidth: 0,
  },
  menuText: {
    fontSize: 16,
    color: Colors.text.primary,
    marginLeft: 12,
    fontWeight: "500",
  },

  // Dev Button Styles
  devButton: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    backgroundColor: '#FF6B35',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 25,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    zIndex: 9999,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.4,
    shadowRadius: 6,
    elevation: 8,
  },
  devButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
});