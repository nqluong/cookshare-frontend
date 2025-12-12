import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack, useRootNavigationState, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import 'react-native-reanimated';

import { AuthProvider, useAuth } from '@/context/AuthContext';
import { useColorScheme } from '@/hooks/use-color-scheme';

export const unstable_settings = {
  initialRouteName: 'index',
};

function RootLayoutNav() {
  const { isAuthenticated, loading } = useAuth();
  const segments = useSegments();
  const router = useRouter();
  const navigationState = useRootNavigationState();

  useEffect(() => {
    // Đợi navigation state sẵn sàng
    if (!navigationState?.key) return;
    if (loading) return; // Đợi auth state được khôi phục

    const segmentString = segments.join('/');
    const inAuthGroup = segmentString.includes('auth');

    // Cho phép user đã đăng nhập truy cập changePassword
    const isChangePasswordRoute = segmentString.includes('changePassword');

    // Bỏ qua index route vì nó tự redirect
    const isIndexRoute = segmentString === '' || (segments[0] as string) === 'index';
    if (isIndexRoute) return;

    if (!isAuthenticated && !inAuthGroup) {
      // Chưa đăng nhập và không ở trong auth group -> chuyển đến login
      router.replace('/auth/login' as any);
    } else if (isAuthenticated && inAuthGroup && !isChangePasswordRoute) {
      // Đã đăng nhập và đang ở auth group (nhưng không phải changePassword) -> chuyển về trang home
      router.replace('/(tabs)/home' as any);
    }
  }, [isAuthenticated, loading, segments, navigationState?.key]);

  return (
    <Stack>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="auth" options={{ headerShown: false }} />
      <Stack.Screen name="changePassword" options={{ headerShown: false }} />
      <Stack.Screen name="admin" options={{ headerShown: false }} />
      <Stack.Screen name="profile" options={{ headerShown: false }} />
      <Stack.Screen name="settings" options={{ headerShown: false }} />
      <Stack.Screen name="collection" options={{ headerShown: false }} />
    </Stack>
  );
}

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <AuthProvider>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <RootLayoutNav />
        <StatusBar style="auto" />
      </ThemeProvider>
    </AuthProvider>
  );
}
