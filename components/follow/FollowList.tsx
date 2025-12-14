// FILE: components/profile/FollowList.tsx - WITH WEBSOCKET

import { useFollowWebSocket } from "@/hooks/useFollowWebSocket";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useAuth } from "../../context/AuthContext";
import { followService } from "../../services/followService";
import { userService } from "../../services/userService";
import { FollowUser } from "../../types/follow.types";
import FollowItem from "./FollowItem";

interface FollowListProps {
  userId: string; // ID của user đang được xem (profile owner)
  type: "followers" | "following";
  onCountUpdate?: (change: 1 | -1) => void;
}

export default function FollowList({ userId, type, onCountUpdate }: FollowListProps) {
  const { user: currentUser, updateAuthUser } = useAuth();
  const [users, setUsers] = useState<FollowUser[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<FollowUser[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [followLoadingStates, setFollowLoadingStates] = useState<{ [key: string]: boolean }>({});

  // Load current user ID
  useEffect(() => {
    loadCurrentUser();
  }, []);

  useEffect(() => {
    if (currentUserId) {
      loadUsers(true);
    }
  }, [currentUserId, userId, type]);

  const loadCurrentUser = async () => {
    if (!currentUser?.username) return;

    try {
      const profile = await userService.getUserByUsername(currentUser.username);
      setCurrentUserId(profile.userId);
    } catch (error) {
      console.log("Error loading current user:", error);
    }
  };

  // WEBSOCKET: Listen to follow updates
  useFollowWebSocket({
    userId, // Profile owner's ID
    onFollowUpdate: (data) => {
      console.log('👥 [FollowList] Follow update:', data);

      const { action, followerId, followingId } = data;

      // ========================================
      // CASE 1: TAB "FOLLOWERS" (Danh sách người follow userId)
      // ========================================
      if (type === 'followers') {
        if (action === 'FOLLOW' && followingId === userId) {
          // Có người mới follow userId
          console.log('New follower detected');

          // Thêm follower mới vào danh sách (nếu chưa có)
          setUsers((prev) => {
            const exists = prev.some(u => u.userId === followerId);
            if (exists) {
              console.log('Follower already in list');
              return prev;
            }

            // Load thông tin user mới
            loadNewFollower(followerId);
            return prev;
          });

          // Update count cho parent
          onCountUpdate?.(1);
        } else if (action === 'UNFOLLOW' && followingId === userId) {
          // Có người unfollow userId
          console.log('Follower removed');

          // Xóa khỏi danh sách
          setUsers((prev) => prev.filter(u => u.userId !== followerId));
          setFilteredUsers((prev) => prev.filter(u => u.userId !== followerId));

          // Update count cho parent
          onCountUpdate?.(-1);
        }
      }

      // ========================================
      // CASE 2: TAB "FOLLOWING" (Danh sách người mà userId đang follow)
      // ========================================
      else if (type === 'following') {
        if (action === 'FOLLOW' && followerId === userId) {
          // userId follow người mới
          console.log('New following detected');

          // Thêm vào danh sách (nếu chưa có)
          setUsers((prev) => {
            const exists = prev.some(u => u.userId === followingId);
            if (exists) {
              console.log('User already in following list');
              return prev;
            }

            // Load thông tin user mới
            loadNewFollowing(followingId);
            return prev;
          });

          // Update count cho parent
          onCountUpdate?.(1);
        } else if (action === 'UNFOLLOW' && followerId === userId) {
          // userId unfollow người nào đó
          console.log(' Following removed');

          // Xóa khỏi danh sách
          setUsers((prev) => prev.filter(u => u.userId !== followingId));
          setFilteredUsers((prev) => prev.filter(u => u.userId !== followingId));

          // Update count cho parent
          onCountUpdate?.(-1);
        }
      }

      // ========================================
      // CASE 3: CẬP NHẬT TRẠNG THÁI isFollowing
      // ========================================
      // Nếu current user là người follow/unfollow → update isFollowing status
      if (followerId === currentUserId) {
        const updateFollowStatus = (user: FollowUser) => {
          if (user.userId === followingId) {
            return {
              ...user,
              isFollowing: action === 'FOLLOW',
            };
          }
          return user;
        };

        setUsers(prev => prev.map(updateFollowStatus));
        setFilteredUsers(prev => prev.map(updateFollowStatus));
      }
    },
  });

  // Load thông tin follower mới
  const loadNewFollower = async (followerId: string) => {
    try {
      const userProfile = await userService.getUserById(followerId);
      
      // Check follow status
      let isFollowing = false;
      if (currentUserId && followerId !== currentUserId) {
        const response = await followService.checkFollowStatus(currentUserId, followerId);
        isFollowing = response.data;
      }

      const newFollower: FollowUser = {
        userId: userProfile.userId,
        username: userProfile.username,
        fullName: userProfile.fullName,
        avatarUrl: userProfile.avatarUrl ?? null,
        bio: userProfile.bio ?? null,
        followerCount: userProfile.followerCount,
        followingCount: userProfile.followingCount,
        isFollowing,
      };

      setUsers((prev) => [newFollower, ...prev]);
      setFilteredUsers((prev) => [newFollower, ...prev]);
      
      console.log('New follower added to list:', userProfile.username);
    } catch (error) {
      console.log('Error loading new follower:', error);
    }
  };

  // Load thông tin following mới
  const loadNewFollowing = async (followingId: string) => {
    try {
      const userProfile = await userService.getUserById(followingId);
      
      // Nếu currentUser là userId (chính mình) → tất cả following đều là true
      const isFollowing = currentUserId === userId;

      const newFollowing: FollowUser = {
        userId: userProfile.userId,
        username: userProfile.username,
        fullName: userProfile.fullName,
        avatarUrl: userProfile.avatarUrl ?? null,
        bio: userProfile.bio ?? null,
        followerCount: userProfile.followerCount,
        followingCount: userProfile.followingCount,
        isFollowing,
      };

      setUsers((prev) => [newFollowing, ...prev]);
      setFilteredUsers((prev) => [newFollowing, ...prev]);
      
      console.log(' New following added to list:', userProfile.username);
    } catch (error) {
      console.log(' Error loading new following:', error);
    }
  };

  const checkFollowStatus = async (userList: FollowUser[]): Promise<FollowUser[]> => {
    if (!currentUserId || !userList.length) {
      return userList.map(user => ({ ...user, isFollowing: false }));
    }

    const isViewingOwnFollowing = type === "following" && currentUserId === userId;

    if (isViewingOwnFollowing) {
      return userList.map(user => ({
        ...user,
        isFollowing: user.userId !== currentUserId
      }));
    }

    const checkPromises = userList.map(async (user) => {
      if (user.userId === currentUserId) return { ...user, isFollowing: false };

      try {
        const response = await followService.checkFollowStatus(
          currentUserId,
          user.userId
        );
        return { ...user, isFollowing: response.data };
      } catch (error) {
        console.log(`Error checking follow status for ${user.username}:`, error);
        return { ...user, isFollowing: false };
      }
    });

    return Promise.all(checkPromises);
  };

  const loadUsers = async (refresh = false) => {
    if (refresh) {
      setPage(0);
      setUsers([]);
      setHasMore(true);
      setIsLoading(true);
    }

    if (!hasMore && !refresh) return;

    try {
      const currentPage = refresh ? 0 : page;
      const response =
        type === "followers"
          ? await followService.getFollowers(userId, currentPage, 20)
          : await followService.getFollowing(userId, currentPage, 20);

      let newUsers = response.data.content as FollowUser[];

      if (currentUserId) {
        newUsers = await checkFollowStatus(newUsers);
      }

      setUsers((prev) => (refresh ? newUsers : [...prev, ...newUsers]));
      setFilteredUsers((prev) => (refresh ? newUsers : [...prev, ...newUsers]));
      setHasMore(!response.data.last);
      setPage((prev) => (refresh ? 1 : prev + 1));
    } catch (error) {
      console.log("Error loading users:", error);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (query.trim() === "") {
      setFilteredUsers(users);
    } else {
      const filtered = users.filter(
        (user) =>
          user.username.toLowerCase().includes(query.toLowerCase()) ||
          user.fullName.toLowerCase().includes(query.toLowerCase())
      );
      setFilteredUsers(filtered);
    }
  };

  const handleFollowPress = async (
    targetUserId: string,
    isFollowing: boolean
  ) => {
    if (!currentUserId || !updateAuthUser) return;

    setFollowLoadingStates(prev => ({ ...prev, [targetUserId]: true }));
    try {
      if (isFollowing) {
        await followService.unfollowUser(currentUserId, targetUserId);
      } else {
        await followService.followUser(currentUserId, targetUserId);
      }

      //  Optimistic update - WebSocket sẽ confirm lại
      const updateUser = (user: FollowUser) => {
        if (user.userId === targetUserId) {
          return { ...user, isFollowing: !isFollowing };
        }
        return user;
      };

      setUsers((prev) => prev.map(updateUser));
      setFilteredUsers((prev) => prev.map(updateUser));

      // Update current user's following count
      const currentCount = currentUser?.followingCount ?? 0;
      const newFollowingCount = isFollowing ? currentCount - 1 : currentCount + 1;
      updateAuthUser({ followingCount: newFollowingCount });

      // Thông báo cho component cha cập nhật follower count
      if (onCountUpdate) {
        const change = isFollowing ? -1 : 1;
        onCountUpdate(change);
      }

    } catch (error) {
      console.log("Error toggling follow:", error);
      
      // Rollback nếu API fail
      const rollbackUser = (user: FollowUser) => {
        if (user.userId === targetUserId) {
          return { ...user, isFollowing };
        }
        return user;
      };
      
      setUsers((prev) => prev.map(rollbackUser));
      setFilteredUsers((prev) => prev.map(rollbackUser));
    } finally {
      setFollowLoadingStates(prev => ({ ...prev, [targetUserId]: false }));
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    loadUsers(true);
  };

  const renderItem = ({ item }: { item: FollowUser }) => {
    const isCurrentUser = item.userId === currentUserId;

    return (
      <FollowItem
        user={item}
        onPress={() => router.push(`/profile/${item.userId}` as any)}
        onFollowPress={() => handleFollowPress(item.userId, !!item.isFollowing)}
        showFollowButton={!isCurrentUser}
        isFollowLoading={followLoadingStates[item.userId] || false}
      />
    );
  };

  if (isLoading && users.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FF385C" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBox}>
          <Ionicons
            name="search"
            size={20}
            color="#999"
            style={styles.searchIcon}
          />
          <TextInput
            style={styles.searchInput}
            placeholder="Tìm kiếm"
            value={searchQuery}
            onChangeText={handleSearch}
            autoCapitalize="none"
            autoCorrect={false}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => handleSearch("")}>
              <Ionicons name="close-circle" size={20} color="#999" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <FlatList
        data={filteredUsers}
        renderItem={renderItem}
        keyExtractor={(item) => item.userId}
        onEndReached={() => {
          if (hasMore && !isLoading && searchQuery === "") {
            loadUsers();
          }
        }}
        onEndReachedThreshold={0.5}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
        ListFooterComponent={
          isLoading && users.length > 0 ? (
            <ActivityIndicator
              size="small"
              color="#FF385C"
              style={{ marginVertical: 20 }}
            />
          ) : null
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>
              {type === "followers" ? "Chưa có follower nào" : "Chưa follow ai"}
            </Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  searchContainer: {
    backgroundColor: "#fff",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 40,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: "#000",
  },
  emptyContainer: {
    paddingVertical: 60,
    alignItems: "center",
  },
  emptyText: {
    fontSize: 16,
    color: "#999",
  },
});