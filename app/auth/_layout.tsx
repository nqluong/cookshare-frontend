import { Stack } from 'expo-router';

export default function AuthLayout() {
    return (
        <Stack
            screenOptions={{
                headerShown: false, // Ẩn header cho tất cả màn hình auth
            }}
        >
            <Stack.Screen name="login" />
            <Stack.Screen name="register" />
            <Stack.Screen name="registerForm" />
            <Stack.Screen name="forgotPassword" />
            <Stack.Screen name="changePassword" />
        </Stack>
    );
}
