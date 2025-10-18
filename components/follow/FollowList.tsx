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
  userId: string;
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
      console.error("Error loading current user:", error);
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
            console.error(`Error checking follow status for ${user.username}:`, error);
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
      console.error("Error loading users:", error);
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

      const updateUser = (user: FollowUser) => {
          if (user.userId === targetUserId) {
              return { ...user, isFollowing: !isFollowing };
          }
          return user;
      }

      setUsers((prev) => prev.map(updateUser));
      setFilteredUsers((prev) => prev.map(updateUser));

        const currentCount = currentUser?.followingCount ?? 0;
        const newFollowingCount = isFollowing ? currentCount - 1 : currentCount + 1;

        updateAuthUser({ followingCount: newFollowingCount });

        // 3. THÔNG BÁO CHO COMPONENT CHA (PROFILE) CẬP NHẬT FOLLOWER COUNT CỦA NGƯỜI BỊ ẢNH HƯỞNG
        if (onCountUpdate) {
            const change = isFollowing ? -1 : 1;
            onCountUpdate(change); 
        }
      
    } catch (error) {
      console.error("Error toggling follow:", error);
    }finally {
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
        isFollowLoading={followLoadingStates[item.userId] || false} // TRUYỀN TRẠNG THÁI LOADING
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
