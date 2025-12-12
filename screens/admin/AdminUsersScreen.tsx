import { router, useFocusEffect } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import AdminHeader from "../../components/admin/management/AdminHeader";
import SearchBar from "../../components/admin/management/SearchBar";
import UserDetailModal from "../../components/admin/management/UserDetailModal";
import UserList from "../../components/admin/management/UserList";
import CustomAlert from "../../components/ui/CustomAlert";
import { useCustomAlert } from "../../hooks/useCustomAlert";
import { AdminUser, adminUserService } from "../../services/adminUserService";

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
      } else {
        setLoading(true);
      }

      const response = await adminUserService.getAllUsers(search, page, 20);

      if (reset) {
        setUsers(response.content);
      } else {
        setUsers(prev => [...prev, ...response.content]);
      }

      setCurrentPage(page);
      setHasMore(!response.last);
      setTotalElements(response.totalElements);
    } catch (err: any) {
      setError(err.message || 'Không thể tải danh sách người dùng');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadUsers();
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadUsers(0, searchQuery, true);
    }, [searchQuery])
  );

  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    loadUsers(0, searchQuery, true);
  }, [loadUsers, searchQuery]);

  const handleSearch = useCallback(() => {
    loadUsers(0, searchQuery, true);
  }, [loadUsers, searchQuery]);

  const handleLoadMore = useCallback(() => {
    if (!loading && hasMore && !refreshing) {
      loadUsers(currentPage + 1, searchQuery, false);
    }
  }, [loadUsers, currentPage, searchQuery, loading, hasMore, refreshing]);

  const handleViewUser = async (user: AdminUser) => {
    try {
      // Load thông tin chi tiết mới nhất từ server
      const updatedUser = await adminUserService.getUserById(user.userId);
      setSelectedUser(updatedUser);
      setShowUserDetailModal(true);
    } catch (error: any) {
      showError('Lỗi', error.message || 'Không thể tải thông tin người dùng');
    }
  };

  const handleEditUser = (userId: string) => {
    // Đóng modal nếu đang mở
    if (showUserDetailModal) {
      setShowUserDetailModal(false);
    }
    
    // Chuyển hướng đến trang chỉnh sửa người dùng với userId
    router.push(`/admin/users/edit/${userId}` as any);
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
      <AdminHeader
        title="Người Dùng"
        onBack={() => router.back()}
        onExitAdmin={handleExitAdmin}
      />

      <SearchBar
        value={searchQuery}
        onChangeText={setSearchQuery}
        onSearch={handleSearch}
        placeholder="Tìm kiếm theo tên, email..."
      />

      <View style={styles.listSection}>
        <UserList
          users={users}
          loading={loading}
          refreshing={refreshing}
          error={error}
          totalElements={totalElements}
          hasMore={hasMore}
          onRefresh={handleRefresh}
          onLoadMore={handleLoadMore}
          onViewUser={handleViewUser}
          onEditUser={handleEditUser}
          onBanUser={handleBanUser}
          onDeleteUser={handleDeleteUser}
          onRetry={() => loadUsers(0, searchQuery, true)}
        />
      </View>

      <UserDetailModal
        visible={showUserDetailModal}
        user={selectedUser}
        onClose={() => setShowUserDetailModal(false)}
        onEdit={handleEditUser}
        onBan={handleBanUser}
        onDelete={handleDeleteUser}
      />

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
  listSection: {
    flex: 1,
    backgroundColor: "#d1f4e0",
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    paddingTop: 24,
  },
});

