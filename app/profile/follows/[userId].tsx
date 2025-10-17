import UserFollowsScreen from '@/screens/profile/UserFollowsScreen';
import { Stack } from 'expo-router';

export default function FollowersPage() {
  return (
    <>
      <Stack.Screen
        options={{
          title: 'Follows',
          headerBackTitle: 'Quay lại',
          headerTitleAlign: 'center',
        }}
      />
      <UserFollowsScreen />
    </>
  );
}