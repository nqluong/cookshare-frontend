import { Stack } from 'expo-router';

export default function ProfileLayout() {
    return (
        <Stack
            screenOptions={{
                animation: 'slide_from_right',
            }}
        >
            <Stack.Screen
                name="details"
                options={{
                    headerShown: false, // Chỉ ẩn header cho trang details
                }}
            />
            {/* Các screen khác sẽ dùng cấu hình mặc định */}
        </Stack>
    );
}

