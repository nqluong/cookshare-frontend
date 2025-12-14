import RecipeGrid from "@/components/profile/RecipeGrid";
import { useAuth } from "@/context/AuthContext";
import { useFollowWebSocket } from "@/hooks/useFollowWebSocket";
import { followService } from "@/services/followService";
import { userService } from "@/services/userService";
import { UserProfile } from "@/types/user.types";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Colors } from "../../styles/colors";

export default function UserProfileScreen() {
  const { userId } = useLocalSearchParams<{ userId: string }>();
  const { user: currentUser, updateAuthUser } = useAuth();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isFollowing, setIsFollowing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isFollowLoading, setIsFollowLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [currentProfileId, setCurrentProfileId] = useState<string | null>(null);

  //  Load current user profile ID
  useEffect(() => {
    const loadCurrentProfileId = async () => {
      if (!currentUser?.username) return;
      try {
        const profile = await userService.getUserByUsername(
          currentUser.username
        );
        setCurrentProfileId(profile.userId);
      } catch (error) {
        console.error("Error loading current user profile:", error);
      }
    };
    loadCurrentProfileId();
  }, [currentUser]);

  // Load profile và check follow status
  useEffect(() => {
    if (userId) {
      loadUserProfile();
      if (currentProfileId) {
        checkFollowStatus();
      }
    }
  }, [userId, currentProfileId]);

  const loadUserProfile = async () => {
    try {
      const profile = await userService.getUserById(userId);
      setUser(profile);
    } catch (error: any) {
      console.error("Error loading profile:", error);
      Alert.alert("Lỗi", error.message || "Không thể tải thông tin người dùng");
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  const checkFollowStatus = async () => {
    if (!currentProfileId) return;

    try {
      const response = await followService.checkFollowStatus(
        currentProfileId,
        userId
      );
      setIsFollowing(response.data);
    } catch (error) {
      console.error("Error checking follow status:", error);
    }
  };

  // WEBSOCKET: Listen to follow updates
  useFollowWebSocket({
    userId,
    onFollowUpdate: (data) => {
      console.log("👥 [Profile] Follow update received:", data);

      if (data.action === "FOLLOW") {
        console.log("✅ Someone followed this user");

        //  Update follower count
        setUser((prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            followerCount: (prev.followerCount ?? 0) + 1,
          };
        });

        //  Nếu người follow là current user → update isFollowing
        if (data.followerId === currentProfileId) {
          console.log(" Current user followed this profile");
          setIsFollowing(true);
        }
      } else if (data.action === "UNFOLLOW") {
        console.log(" Someone unfollowed this user");

        //  Update follower count
        setUser((prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            followerCount: Math.max(0, (prev.followerCount ?? 0) - 1),
          };
        });

        //  Nếu người unfollow là current user → update isFollowing
        if (data.followerId === currentProfileId) {
          console.log("❌ Current user unfollowed this profile");
          setIsFollowing(false);
        }
      }
    },
  });

  // Handle Follow/Unfollow
  const handleFollowPress = async () => {
    if (!currentProfileId || !updateAuthUser) {
      Alert.alert("Lỗi", "Vui lòng đăng nhập");
      return;
    }

    setIsFollowLoading(true);
    try {
      if (isFollowing) {
        // Unfollow
        await followService.unfollowUser(currentProfileId, userId);

        // Optimistic update - WebSocket sẽ confirm lại
        setIsFollowing(false);
        setUser((prev) =>
          prev
            ? {
                ...prev,
                followerCount: Math.max(0, (prev.followerCount ?? 0) - 1),
              }
            : null
        );

        if (currentUser) {
          updateAuthUser({
            followingCount: Math.max(0, (currentUser.followingCount ?? 0) - 1),
          });
        }
      } else {
        // Follow
        await followService.followUser(currentProfileId, userId);

        // Optimistic update - WebSocket sẽ confirm lại
        setIsFollowing(true);
        setUser((prev) =>
          prev
            ? { ...prev, followerCount: (prev.followerCount ?? 0) + 1 }
            : null
        );

        if (currentUser) {
          updateAuthUser({
            followingCount: (currentUser.followingCount ?? 0) + 1,
          });
        }
      }
    } catch (error: any) {
      console.error(" Follow/Unfollow error:", error);
      Alert.alert("Lỗi", error.message || "Có lỗi xảy ra");

      //  Rollback optimistic update
      setIsFollowing(!isFollowing);

      // Reload để đảm bảo state đúng
      await Promise.all([loadUserProfile(), checkFollowStatus()]);
    } finally {
      setIsFollowLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([loadUserProfile(), checkFollowStatus()]);
    setRefreshing(false);
  };

  const formatNumber = (num: number): string => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const renderHeader = () => {
    if (!user) return null;
    const followingCount = user.followingCount ?? 0;
    const followerCount = user.followerCount ?? 0;
    const totalLikes = user.totalLikes ?? 0;

    return (
      <>
        {/* === Header (Back & Share Icon) === */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backButton}
          >
            <Ionicons name="arrow-back" size={24} color={Colors.text.primary} />
          </TouchableOpacity>
          {/* <TouchableOpacity
            onPress={() => Alert.alert("Chia sẻ", "Chức năng đang phát triển")}
            style={styles.shareButton}
          >
            <FontAwesome name="share" size={24} color={Colors.text.primary} />
          </TouchableOpacity> */}
        </View>

        {/* === Avatar & Basic Info === */}
        <View style={styles.avatarSection}>
          <View style={styles.avatarContainer}>
            {user.avatarUrl ? (
              <Image source={{ uri: user.avatarUrl }} style={styles.avatar} />
            ) : (
              <Image
                source={require("../../assets/images/default-avatar.png")}
                style={styles.avatar}
              />
            )}
          </View>

          <Text style={styles.fullNameText}>{user.fullName}</Text>
          <Text style={styles.bioText}>{user.bio || ""}</Text>
        </View>

        {/* === Stats === */}
        <View style={styles.statsContainer}>
          <TouchableOpacity
            style={styles.statItem}
            onPress={() =>
              router.push({
                pathname: `/profile/follows/${userId}`,
                params: { initialTab: "following" },
              } as any)
            }
          >
            <Text style={styles.statNumber}>
              {formatNumber(followingCount)}
            </Text>
            <Text style={styles.statLabel}>Đã follow</Text>
          </TouchableOpacity>

          <View style={styles.statsDivider} />

          <TouchableOpacity
            style={styles.statItem}
            onPress={() =>
              router.push({
                pathname: `/profile/follows/${userId}`,
                params: { initialTab: "followers" },
              } as any)
            }
          >
            <Text style={styles.statNumber}>{formatNumber(followerCount)}</Text>
            <Text style={styles.statLabel}>Follower</Text>
          </TouchableOpacity>

          <View style={styles.statsDivider} />

          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{formatNumber(totalLikes)}</Text>
            <Text style={styles.statLabel}>Thích</Text>
          </View>
        </View>

        {/* === Actions === */}
        <View style={[styles.actionsContainer, styles.container]}>
          {/* Follow Button */}
          <TouchableOpacity
            style={[
              styles.followButton,
              isFollowing ? styles.followingButton : styles.notFollowingButton,
            ]}
            onPress={handleFollowPress}
            disabled={isFollowLoading}
          >
            {isFollowLoading ? (
              <ActivityIndicator
                size="small"
                color={isFollowing ? "#000" : "#fff"}
              />
            ) : (
              <Text
                style={[
                  styles.followButtonText,
                  isFollowing ? styles.followingText : styles.notFollowingText,
                ]}
              >
                {isFollowing ? "Đã follow" : "Follow"}
              </Text>
            )}
          </TouchableOpacity>

          {/* Message Button */}
          {/* <TouchableOpacity
            style={styles.messageButton}
            onPress={() => router.push(`/messages/${user.username}` as any)}
          >
            <Text style={styles.messageButtonText}>Nhắn tin</Text>
          </TouchableOpacity> */}
        </View>

        {/* === Recipe Tabs === */}
        <View style={styles.tabContainer}>
          <TouchableOpacity style={styles.tabItemActive}>
            <Text style={styles.tabTextActive}>Công thức đã đăng</Text>
          </TouchableOpacity>
        </View>
      </>
    );
  };

  const data = [{}];
  const isOwnProfile =
    currentProfileId && userId && currentProfileId === userId;

  const renderItem = () => {
    return (
      <RecipeGrid
        userId={userId || ""}
        isOwnProfile={isOwnProfile || false}
        currentProfileId={currentProfileId || ""}
      />
    );
  };

  // --- Render Chính ---

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FF385C" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={data}
        renderItem={renderItem}
        keyExtractor={(item, index) => index.toString()}
        ListHeaderComponent={renderHeader}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        contentContainerStyle={styles.scrollContent}
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
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: "#fff",
  },
  backButton: {
    padding: 8,
  },
  shareButton: {
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
  actionsContainer: {
    flexDirection: "row",
    padding: 16,
    gap: 12,
    backgroundColor: "#fff",
    justifyContent: "center",
  },
  followButton: {
    width: 150,
    height: 42,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    alignSelf: "center",
  },
  notFollowingButton: {
    backgroundColor: "#FF385C",
  },
  followingButton: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  followButtonText: {
    fontSize: 15,
    fontWeight: "600",
  },
  notFollowingText: {
    color: "#fff",
  },
  followingText: {
    color: "#000",
  },
  messageButton: {
    flex: 1,
    height: 42,
    borderRadius: 8,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#e0e0e0",
    justifyContent: "center",
    alignItems: "center",
  },
  messageButtonText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#000",
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
});
