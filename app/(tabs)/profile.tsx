import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../../styles/colors';
import { useAuth } from '../../context/AuthContext';
import { router } from 'expo-router';

export default function ProfileScreen() {
  const { user, logout } = useAuth();

  const handleAdminPanel = () => {
    Alert.alert(
      'Admin Panel',
      'Chuyển đến trang quản trị?',
      [
        {
          text: 'Hủy',
          style: 'cancel',
        },
        {
          text: 'Đi đến',
          onPress: () => {
            // TODO: Navigate to admin panel
            Alert.alert('Thông báo', 'Tính năng admin panel đang được phát triển');
          },
        },
      ]
    );
  };

  const handleChangePassword = () => {
    router.push('/changePassword' as any);
  };

  const handleLogout = () => {
    Alert.alert(
      'Đăng xuất',
      'Bạn có chắc chắn muốn đăng xuất không?',
      [
        {
          text: 'Hủy',
          style: 'cancel',
        },
        {
          text: 'Đăng xuất',
          style: 'destructive',
          onPress: async () => {
            try {
              await logout();
              router.replace('/auth/registerForm' as any);
            } catch (error) {
              Alert.alert('Lỗi', 'Đã có lỗi xảy ra khi đăng xuất');
            }
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Trang cá nhân</Text>
        </View>

        {/* User Info */}
        <View style={styles.userInfo}>
          <Text style={styles.label}>Tên đăng nhập:</Text>
          <Text style={styles.value}>{user?.username || 'Chưa có thông tin'}</Text>

          <Text style={styles.label}>Email:</Text>
          <Text style={styles.value}>{user?.email || 'Chưa có thông tin'}</Text>

          <Text style={styles.label}>Họ và tên:</Text>
          <Text style={styles.value}>{user?.fullname || 'Chưa có thông tin'}</Text>

          <Text style={styles.label}>Vai trò:</Text>
          <Text style={styles.value}>{user?.role || 'USER'}</Text>
        </View>

        {/* Change Password Button */}
        <TouchableOpacity style={styles.changePasswordButton} onPress={handleChangePassword}>
          <Text style={styles.changePasswordButtonText}>🔑 Đổi mật khẩu</Text>
        </TouchableOpacity>

        {/* Admin Button - Chỉ hiển thị cho ADMIN */}
        {user?.role === 'ADMIN' && (
          <TouchableOpacity style={styles.adminButton} onPress={handleAdminPanel}>
            <Text style={styles.adminButtonText}>🛠️ Quản trị hệ thống</Text>
          </TouchableOpacity>
        )}

        {/* Logout Button */}
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutButtonText}>Đăng xuất</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.text.primary,
  },
  userInfo: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 30,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text.secondary,
    marginTop: 15,
    marginBottom: 5,
  },
  value: {
    fontSize: 16,
    color: Colors.text.primary,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  adminButton: {
    backgroundColor: Colors.primary,
    borderRadius: 8,
    paddingVertical: 15,
    paddingHorizontal: 30,
    alignItems: 'center',
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  adminButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  changePasswordButton: {
    backgroundColor: '#28a745',
    borderRadius: 8,
    paddingVertical: 15,
    paddingHorizontal: 30,
    alignItems: 'center',
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  changePasswordButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  logoutButton: {
    backgroundColor: '#dc3545',
    borderRadius: 8,
    paddingVertical: 15,
    paddingHorizontal: 30,
    alignItems: 'center',
    marginTop: 'auto',
    marginBottom: 50,
  },
  logoutButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});