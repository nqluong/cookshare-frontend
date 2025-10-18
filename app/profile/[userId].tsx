
import UserProfileScreen from '@/screens/profile/UserProfileScreen';
import { Stack } from 'expo-router';

export default function UserProfilePage() {
  return (
    <>
      <Stack.Screen
        options={{
          headerShown: false,
        }}
      />
      <UserProfileScreen />
    </>
  );
}