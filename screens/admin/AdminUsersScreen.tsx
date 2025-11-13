import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { router } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Modal,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import CustomAlert from "../../components/ui/CustomAlert";
import { useCustomAlert } from "../../hooks/useCustomAlert";
import { AdminUser, adminUserService } from "../../services/adminUserService";
import { Colors } from "../../styles/colors";

export default function AdminUsersScreen() {
  const [searchQuery, setSearchQuery] = useState("");

  const handleExitAdmin = () => {
    router.replace('/(tabs)/home' as any);
  };
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [totalElements, setTotalElements] = useState(0);
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [showUserDetailModal, setShowUserDetailModal] = useState(false);

  const { alert, showSuccess, showError, showWarning, hideAlert } = useCustomAlert();

  const loadUsers = useCallback(async (page: number = 0, search: string = "", reset: boolean = true) => {
    try {
      if (reset) {
        setLoading(true);
        setError(null);
      }

      const response = await adminUserService.getAllUsers(search, page, 10);

      if (reset) {
        setUsers(response.content);
      } else {
        setUsers(prev => [...prev, ...response.content]);
      }

      setCurrentPage(page);
      setHasMore(!response.last);
      setTotalElements(response.totalElements);
    } catch (err: any) {
      console.log('Error loading users:', err);
      setError(err.message || 'Không thể tải danh sách người dùng');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadUsers();
  }, []);

  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    loadUsers(0, searchQuery, true);
  }, [loadUsers, searchQuery]);

  const handleSearch = useCallback(() => {
    loadUsers(0, searchQuery, true);
  }, [loadUsers, searchQuery]);

  const handleLoadMore = useCallback(() => {
    if (!loading && hasMore) {
      loadUsers(currentPage + 1, searchQuery, false);
    }
  }, [loadUsers, currentPage, searchQuery, loading, hasMore]);

  const handleViewUser = (user: AdminUser) => {
    setSelectedUser(user);
    setShowUserDetailModal(true);
  };

  const handleEditUser = (userId: string) => {
    // Navigate to edit user screen or show edit modal
    showWarning('Chỉnh sửa', 'Chức năng chỉnh sửa sẽ được phát triển');
  };

  const handleBanUser = (user: AdminUser) => {
    const action = user.isActive ? 'cấm' : 'gỡ cấm';
    const capitalizedAction = action.charAt(0).toUpperCase() + action.slice(1);

    showWarning(
      `${capitalizedAction} người dùng`,
      `Bạn có chắc chắn muốn ${action} người dùng "${user.fullName}"?`,
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: capitalizedAction,
          style: user.isActive ? 'destructive' : 'default',
          onPress: async () => {
            try {
              setLoading(true);
              if (user.isActive) {
                await adminUserService.banUser(user.userId, 'Bị cấm bởi admin');
              } else {
                await adminUserService.unbanUser(user.userId);
              }
              // Refresh the list
              await loadUsers(0, searchQuery, true);
              showSuccess('Thành công', `Đã ${action} người dùng thành công`);
            } catch (err: any) {
              showError('Lỗi', err.message || `Không thể ${action} người dùng`);
            } finally {
              setLoading(false);
            }
          }
        }
      ]
    );
  };

  const handleDeleteUser = (user: AdminUser) => {
    showError(
      'Xóa người dùng',
      `Bạn có chắc chắn muốn xóa người dùng "${user.fullName}"? Hành động này không thể hoàn tác.`,
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Xóa',
          style: 'destructive',
          onPress: async () => {
            try {
              setLoading(true);
              await adminUserService.deleteUser(user.userId);
              // Refresh the list
              await loadUsers(0, searchQuery, true);
              showSuccess('Thành công', 'Đã xóa người dùng thành công');
            } catch (err: any) {
              showError('Lỗi', err.message || 'Không thể xóa người dùng');
            } finally {
              setLoading(false);
            }
          }
        }
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={Colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Người Dùng</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.notificationButton}>
            <Ionicons name="notifications-outline" size={24} color={Colors.text.primary} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.exitButton} onPress={handleExitAdmin}>
            <Ionicons name="exit-outline" size={24} color={Colors.text.primary} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={20} color={Colors.text.light} />
          <TextInput
            style={styles.searchInput}
            placeholder="Tìm kiếm theo tên, email..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor={Colors.text.light}
            onSubmitEditing={handleSearch}
            returnKeyType="search"
          />
        </View>
        <TouchableOpacity style={styles.searchButton} onPress={handleSearch}>
          <Ionicons name="search" size={24} color={Colors.text.primary} />
        </TouchableOpacity>
      </View>

      {/* Users List */}
      <View style={styles.listSection}>
        {loading && users.length === 0 ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={Colors.primary} />
            <Text style={styles.loadingText}>Đang tải danh sách người dùng...</Text>
          </View>
        ) : error ? (
          <View style={styles.errorContainer}>
            <Ionicons name="alert-circle-outline" size={48} color="#ef4444" />
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity style={styles.retryButton} onPress={() => loadUsers(0, searchQuery, true)}>
              <Text style={styles.retryButtonText}>Thử lại</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <ScrollView
            style={styles.scrollView}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
            }
            onScroll={({ nativeEvent }) => {
              const { layoutMeasurement, contentOffset, contentSize } = nativeEvent;
              const isCloseToBottom = layoutMeasurement.height + contentOffset.y >= contentSize.height - 20;
              if (isCloseToBottom && hasMore && !loading) {
                handleLoadMore();
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
                  <View key={user.userId} style={styles.userItem}>
                    <View style={styles.userAvatar}>
                      {user.avatarUrl ? (
                        <Image
                          source={{ uri: user.avatarUrl }}
                          style={styles.avatar}
                          contentFit="cover"
                        />
                      ) : (
                        <Image
                          source={require("../../assets/images/default-avatar.png")}
                          style={styles.avatar}
                          contentFit="cover"
                        />
                      )}
                    </View>

                    <View style={styles.userInfo}>
                      <View style={styles.userNameContainer}>
                        <Text style={styles.userName}>{user.fullName}</Text>
                      </View>
                      <View style={styles.userStats}>
                        <View style={styles.statItem}>
                          <Ionicons name="people-outline" size={16} color={Colors.text.secondary} />
                          <Text style={styles.statText}>{user.followerCount}</Text>
                        </View>
                        <View style={styles.statItem}>
                          <Ionicons name="book-outline" size={16} color={Colors.text.secondary} />
                          <Text style={styles.statText}>{user.recipeCount}</Text>
                        </View>
                      </View>
                      <View style={[
                        styles.statusBadge,
                        { backgroundColor: user.isActive ? '#10b981' : '#ef4444' }
                      ]}>
                        <Text style={styles.statusText}>
                          {user.isActive ? 'Hoạt động' : 'Bị cấm'}
                        </Text>
                      </View>
                    </View>

                    <View style={styles.userActions}>
                      <TouchableOpacity
                        style={styles.actionButton}
                        onPress={() => handleViewUser(user)}
                      >
                        <Ionicons name="eye-outline" size={20} color={Colors.text.secondary} />
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={styles.actionButton}
                        onPress={() => handleEditUser(user.userId)}
                      >
                        <Ionicons name="create-outline" size={20} color={Colors.text.secondary} />
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={styles.actionButton}
                        onPress={() => handleBanUser(user)}
                      >
                        <Ionicons
                          name={user.isActive ? "ban" : "checkmark-circle"}
                          size={20}
                          color={user.isActive ? "#ef4444" : "#10b981"}
                        />
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={styles.actionButton}
                        onPress={() => handleDeleteUser(user)}
                      >
                        <Ionicons name="trash-outline" size={20} color="#ef4444" />
                      </TouchableOpacity>
                    </View>
                  </View>
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
        )}
      </View>

      {/* User Detail Modal */}
      <Modal
        visible={showUserDetailModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowUserDetailModal(false)}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => setShowUserDetailModal(false)}
            >
              <Ionicons name="close" size={24} color={Colors.text.primary} />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Chi tiết người dùng</Text>
            <View style={styles.modalHeaderSpacer} />
          </View>

          {selectedUser && (
            <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
              {/* User Avatar and Basic Info */}
              <View style={styles.modalUserHeader}>
                <View style={styles.modalUserAvatar}>
                  {selectedUser.avatarUrl ? (
                    <Image
                      source={{ uri: selectedUser.avatarUrl }}
                      style={styles.modalAvatar}
                      contentFit="cover"
                    />
                  ) : (
                    <Image
                      source={require("../../assets/images/default-avatar.png")}
                      style={styles.modalAvatar}
                      contentFit="cover"
                    />
                  )}
                </View>
                <View style={styles.modalUserInfo}>
                  <Text style={styles.modalUserName}>{selectedUser.fullName}</Text>
                  <Text style={styles.modalUserEmail}>{selectedUser.email}</Text>
                  <View style={[
                    styles.modalStatusBadge,
                    { backgroundColor: selectedUser.isActive ? '#10b981' : '#ef4444' }
                  ]}>
                    <Text style={styles.modalStatusText}>
                      {selectedUser.isActive ? 'Hoạt động' : 'Bị cấm'}
                    </Text>
                  </View>
                </View>
              </View>

              {/* User Details */}
              <View style={styles.modalDetailsSection}>
                <Text style={styles.modalSectionTitle}>Thông tin cơ bản</Text>

                <View style={styles.modalDetailRow}>
                  <Text style={styles.modalDetailLabel}>Username:</Text>
                  <Text style={styles.modalDetailValue}>{selectedUser.username}</Text>
                </View>

                <View style={styles.modalDetailRow}>
                  <Text style={styles.modalDetailLabel}>Email:</Text>
                  <Text style={styles.modalDetailValue}>{selectedUser.email}</Text>
                </View>

                <View style={styles.modalDetailRow}>
                  <Text style={styles.modalDetailLabel}>Tên đầy đủ:</Text>
                  <Text style={styles.modalDetailValue}>{selectedUser.fullName}</Text>
                </View>

                <View style={styles.modalDetailRow}>
                  <Text style={styles.modalDetailLabel}>Vai trò:</Text>
                  <Text style={styles.modalDetailValue}>{selectedUser.role}</Text>
                </View>

                <View style={styles.modalDetailRow}>
                  <Text style={styles.modalDetailLabel}>Xác thực email:</Text>
                  <View style={styles.modalDetailValue}>
                    <Ionicons
                      name={selectedUser.emailVerified ? "checkmark-circle" : "close-circle"}
                      size={20}
                      color={selectedUser.emailVerified ? "#10b981" : "#ef4444"}
                    />
                    <Text style={[
                      styles.modalDetailValue,
                      { color: selectedUser.emailVerified ? "#10b981" : "#ef4444", marginLeft: 4 }
                    ]}>
                      {selectedUser.emailVerified ? "Đã xác thực" : "Chưa xác thực"}
                    </Text>
                  </View>
                </View>
              </View>

              {/* Statistics */}
              <View style={styles.modalDetailsSection}>
                <Text style={styles.modalSectionTitle}>Thống kê</Text>

                <View style={styles.modalStatsGrid}>
                  <View style={styles.modalStatCard}>
                    <Ionicons name="people-outline" size={24} color="#6366f1" />
                    <Text style={styles.modalStatNumber}>{selectedUser.followerCount}</Text>
                    <Text style={styles.modalStatLabel}>Người theo dõi</Text>
                  </View>

                  <View style={styles.modalStatCard}>
                    <Ionicons name="person-add-outline" size={24} color="#10b981" />
                    <Text style={styles.modalStatNumber}>{selectedUser.followingCount}</Text>
                    <Text style={styles.modalStatLabel}>Đang theo dõi</Text>
                  </View>

                  <View style={styles.modalStatCard}>
                    <Ionicons name="book-outline" size={24} color="#f59e0b" />
                    <Text style={styles.modalStatNumber}>{selectedUser.recipeCount}</Text>
                    <Text style={styles.modalStatLabel}>Công thức</Text>
                  </View>
                </View>
              </View>

              {/* Activity Info */}
              <View style={styles.modalDetailsSection}>
                <Text style={styles.modalSectionTitle}>Hoạt động</Text>

                <View style={styles.modalDetailRow}>
                  <Text style={styles.modalDetailLabel}>Tham gia:</Text>
                  <Text style={styles.modalDetailValue}>
                    {new Date(selectedUser.createdAt).toLocaleDateString('vi-VN', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </Text>
                </View>

                <View style={styles.modalDetailRow}>
                  <Text style={styles.modalDetailLabel}>Hoạt động cuối:</Text>
                  <Text style={styles.modalDetailValue}>
                    {new Date(selectedUser.lastActive).toLocaleDateString('vi-VN', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </Text>
                </View>
              </View>

              {/* Action Buttons */}
              <View style={styles.modalActions}>
                <TouchableOpacity
                  style={[styles.modalActionButton, styles.modalEditButton]}
                  onPress={() => {
                    setShowUserDetailModal(false);
                    handleEditUser(selectedUser.userId);
                  }}
                >
                  <Ionicons name="create-outline" size={20} color="#fff" />
                  <Text style={styles.modalActionButtonText}>Chỉnh sửa</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.modalActionButton,
                    selectedUser.isActive ? styles.modalBanButton : styles.modalUnbanButton
                  ]}
                  onPress={() => {
                    setShowUserDetailModal(false);
                    handleBanUser(selectedUser);
                  }}
                >
                  <Ionicons
                    name={selectedUser.isActive ? "ban" : "checkmark-circle"}
                    size={20}
                    color="#fff"
                  />
                  <Text style={styles.modalActionButtonText}>
                    {selectedUser.isActive ? 'Cấm' : 'Gỡ cấm'}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.modalActionButton, styles.modalDeleteButton]}
                  onPress={() => {
                    setShowUserDetailModal(false);
                    handleDeleteUser(selectedUser);
                  }}
                >
                  <Ionicons name="trash-outline" size={20} color="#fff" />
                  <Text style={styles.modalActionButtonText}>Xóa</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          )}
        </SafeAreaView>
      </Modal>

      {/* Custom Alert */}
      <CustomAlert
        visible={alert.visible}
        title={alert.title}
        message={alert.message}
        type={alert.type}
        buttons={alert.buttons}
        onClose={hideAlert}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#10b981",
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  modalAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#10b981",
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: Colors.text.primary,
  },
  headerActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  notificationButton: {
    padding: 4,
  },
  exitButton: {
    padding: 4,
  },
  searchContainer: {
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
    backgroundColor: "#10b981",
  },
  searchBar: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 25,
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: Colors.text.primary,
  },
  searchButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  listSection: {
    flex: 1,
    backgroundColor: "#d1f4e0",
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    paddingTop: 24,
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 20,
  },
  userItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  userAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#e0e7ff",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.text.primary,
    marginBottom: 4,
  },
  userRecipes: {
    fontSize: 13,
    color: Colors.text.secondary,
  },
  userActions: {
    flexDirection: "row",
    gap: 12,
  },
  actionButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.gray[100],
    alignItems: "center",
    justifyContent: "center",
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
  },
  retryButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
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
  userNameContainer: {
    marginBottom: 4,
  },
  statusBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    marginTop: 4,
  },
  statusText: {
    fontSize: 12,
    color: "#fff",
    fontWeight: "600",
  },
  userEmail: {
    fontSize: 14,
    color: Colors.text.secondary,
    marginBottom: 4,
  },
  userDate: {
    fontSize: 12,
    color: Colors.text.light,
    marginTop: 4,
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
  userStats: {
    flexDirection: "row",
    gap: 16,
    marginTop: 4,
  },
  statItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  statText: {
    fontSize: 12,
    color: Colors.text.secondary,
    fontWeight: "500",
  },
  // Modal styles
  modalContainer: {
    flex: 1,
    backgroundColor: "#fff",
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  modalCloseButton: {
    padding: 4,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: Colors.text.primary,
  },
  modalHeaderSpacer: {
    width: 32,
  },
  modalContent: {
    flex: 1,
    paddingHorizontal: 16,
  },
  modalUserHeader: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  modalUserAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#e0e7ff",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 16,
  },
  modalUserInfo: {
    flex: 1,
  },
  modalUserName: {
    fontSize: 20,
    fontWeight: "600",
    color: Colors.text.primary,
    marginBottom: 4,
  },
  modalUserEmail: {
    fontSize: 14,
    color: Colors.text.secondary,
    marginBottom: 8,
  },
  modalStatusBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 16,
  },
  modalStatusText: {
    fontSize: 12,
    color: "#fff",
    fontWeight: "600",
  },
  modalDetailsSection: {
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
  },
  modalSectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.text.primary,
    marginBottom: 12,
  },
  modalDetailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
  },
  modalDetailLabel: {
    fontSize: 14,
    color: Colors.text.secondary,
    fontWeight: "500",
  },
  modalDetailValue: {
    fontSize: 14,
    color: Colors.text.primary,
    flex: 1,
    textAlign: "right",
    flexDirection: "row",
    alignItems: "center",
  },
  modalStatsGrid: {
    flexDirection: "row",
    gap: 12,
  },
  modalStatCard: {
    flex: 1,
    backgroundColor: "#f8fafc",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  modalStatNumber: {
    fontSize: 20,
    fontWeight: "700",
    color: Colors.text.primary,
    marginTop: 8,
    marginBottom: 4,
  },
  modalStatLabel: {
    fontSize: 12,
    color: Colors.text.secondary,
    textAlign: "center",
  },
  modalActions: {
    flexDirection: "row",
    gap: 12,
    paddingVertical: 20,
  },
  modalActionButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  modalEditButton: {
    backgroundColor: "#3b82f6",
  },
  modalBanButton: {
    backgroundColor: "#ef4444",
  },
  modalUnbanButton: {
    backgroundColor: "#10b981",
  },
  modalDeleteButton: {
    backgroundColor: "#6b7280",
  },
  modalActionButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
});

