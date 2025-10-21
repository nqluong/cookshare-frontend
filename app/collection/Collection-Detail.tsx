import CollectionDetailScreen from '@/screens/collection/CollectionDetailScreen';
import { Stack } from 'expo-router';

export default function CollectionDetailPage() {
  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <CollectionDetailScreen />
    </>
  );
}