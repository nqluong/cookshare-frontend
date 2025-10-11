import { Image } from 'expo-image';
import { Platform, StyleSheet, View, TouchableOpacity, Alert } from 'react-native';

import { HelloWave } from '@/components/hello-wave';
import ParallaxScrollView from '@/components/parallax-scroll-view';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Link } from 'expo-router';
import { useAuth } from '@/context/AuthContext';

export default function HomeScreen() {
  const { user, logout } = useAuth();

  const handleLogout = () => {
    Alert.alert(
      'Xác nhận đăng xuất',
      'Bạn có chắc chắn muốn đăng xuất?',
      [
        {
          text: 'Hủy',
          style: 'cancel',
        },
        {
          text: 'Đăng xuất',
          style: 'destructive',
          onPress: logout,
        },
      ]
    );
  };

  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#A1CEDC', dark: '#1D3D47' }}
      headerImage={
        <Image
          source={require('@/assets/images/partial-react-logo.png')}
          style={styles.reactLogo}
        />
      }>
      <ThemedView style={styles.titleContainer}>
        <ThemedText type="title">Chào mừng, {user?.fullname || user?.username}!</ThemedText>
        <HelloWave />
      </ThemedView>

      <ThemedView style={styles.userInfoContainer}>
        <ThemedText type="subtitle">Thông tin tài khoản</ThemedText>
        <ThemedText>Tên đăng nhập: <ThemedText type="defaultSemiBold">{user?.username}</ThemedText></ThemedText>
        <ThemedText>Email: <ThemedText type="defaultSemiBold">{user?.email}</ThemedText></ThemedText>
        <ThemedText>Họ và tên: <ThemedText type="defaultSemiBold">{user?.fullname}</ThemedText></ThemedText>
        
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <ThemedText style={styles.logoutButtonText}>Đăng xuất</ThemedText>
        </TouchableOpacity>
      </ThemedView>

      <ThemedView style={styles.stepContainer}>
        <ThemedText type="subtitle">CookShare - Chia sẻ công thức nấu ăn</ThemedText>
        <ThemedText>
          Chào mừng bạn đến với ứng dụng chia sẻ công thức nấu ăn. Tại đây bạn có thể:
        </ThemedText>
        <ThemedText>• Khám phá các công thức mới</ThemedText>
        <ThemedText>• Chia sẻ công thức của riêng bạn</ThemedText>
        <ThemedText>• Kết nối với cộng đồng yêu nấu ăn</ThemedText>
      </ThemedView>

      <ThemedView style={styles.stepContainer}>
        <Link href="/modal">
          <Link.Trigger>
            <ThemedText type="subtitle">Khám phá thêm</ThemedText>
          </Link.Trigger>
          <Link.Preview />
          <Link.Menu>
            <Link.MenuAction title="Công thức" icon="cube" onPress={() => alert('Xem công thức')} />
            <Link.MenuAction
              title="Chia sẻ"
              icon="square.and.arrow.up"
              onPress={() => alert('Chia sẻ công thức')}
            />
          </Link.Menu>
        </Link>
      </ThemedView>
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  stepContainer: {
    gap: 8,
    marginBottom: 8,
  },
  userInfoContainer: {
    gap: 8,
    marginBottom: 16,
    padding: 16,
    backgroundColor: 'rgba(0, 123, 255, 0.1)',
    borderRadius: 12,
  },
  logoutButton: {
    backgroundColor: '#dc3545',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 12,
  },
  logoutButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
  },
  reactLogo: {
    height: 178,
    width: 290,
    bottom: 0,
    left: 0,
    position: 'absolute',
  },
});
