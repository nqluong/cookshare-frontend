// components/admin/management/UserList.tsx
import { Ionicons } from "@expo/vector-icons";
import { ActivityIndicator, RefreshControl, ScrollView, StyleSheet, Text, View } from "react-native";
import { AdminUser } from "../../../services/adminUserService";
import { Colors } from "../../../styles/colors";
import UserItem from "./UserItem";

interface UserListProps {
  users: AdminUser[];
  loading: boolean;
  refreshing: boolean;
  error: string | null;
  totalElements: number;
  hasMore: boolean;
  onRefresh: () => void;
  onLoadMore: () => void;
  onViewUser: (user: AdminUser) => void;
  onEditUser: (userId: string) => void;
  onBanUser: (user: AdminUser) => void;
  onDeleteUser: (user: AdminUser) => void;
  onRetry: () => void;
}

export default function UserList({
  users,
  loading,
  refreshing,
  error,
  totalElements,
  hasMore,
  onRefresh,
  onLoadMore,
  onViewUser,
  onEditUser,
  onBanUser,
  onDeleteUser,
  onRetry,
}: UserListProps) {
  if (loading && users.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={styles.loadingText}>Đang tải danh sách người dùng...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="alert-circle-outline" size={48} color="#ef4444" />
        <Text style={styles.errorText}>{error}</Text>
        <Text
          style={styles.retryButton}
          onPress={onRetry}
        >
          Thử lại
        </Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.scrollView}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
      onScroll={({ nativeEvent }) => {
        const { layoutMeasurement, contentOffset, contentSize } = nativeEvent;
        const isCloseToBottom = layoutMeasurement.height + contentOffset.y >= contentSize.height - 20;
        if (isCloseToBottom && hasMore && !loading) {
          onLoadMore();
        }
      }}
      scrollEventThrottle={400}
    >
      {users.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="people-outline" size={48} color={Colors.text.light} />
          <Text style={styles.emptyText}>Không tìm thấy người dùng nào</Text>
        </View>
      ) : (
        <>
          <View style={styles.statsContainer}>
            <Text style={styles.statsText}>
              Tổng: {totalElements} người dùng
            </Text>
          </View>
          {users.map((user) => (
            <UserItem
              key={user.userId}
              user={user}
              onView={onViewUser}
              onEdit={onEditUser}
              onBan={onBanUser}
              onDelete={onDeleteUser}
            />
          ))}
          {loading && users.length > 0 && (
            <View style={styles.loadingMoreContainer}>
              <ActivityIndicator size="small" color={Colors.primary} />
              <Text style={styles.loadingMoreText}>Đang tải thêm...</Text>
            </View>
          )}
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
    paddingHorizontal: 20,
  },
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 40,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: Colors.text.secondary,
  },
  errorContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  errorText: {
    marginTop: 12,
    fontSize: 16,
    color: Colors.text.secondary,
    textAlign: "center",
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
    overflow: "hidden",
  },
  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 40,
  },
  emptyText: {
    marginTop: 12,
    fontSize: 16,
    color: Colors.text.secondary,
  },
  statsContainer: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: "#f8fafc",
    borderRadius: 8,
    marginBottom: 16,
  },
  statsText: {
    fontSize: 14,
    color: Colors.text.secondary,
    fontWeight: "500",
  },
  loadingMoreContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 20,
  },
  loadingMoreText: {
    marginLeft: 8,
    fontSize: 14,
    color: Colors.text.secondary,
  },
});
