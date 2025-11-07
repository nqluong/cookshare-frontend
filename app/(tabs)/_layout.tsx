import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import { Platform, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from '../../styles/colors';

export default function TabLayout() {
  const insets = useSafeAreaInsets();

  return (
    <Tabs
      initialRouteName='home'
      screenOptions={{
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: Colors.text.light,
        tabBarStyle: {
          borderTopWidth: 1,
          borderTopColor: Colors.border,
          height: Platform.OS === 'android' ? 50 + insets.bottom : 60,
          paddingBottom: Platform.OS === 'android' ? Math.max(insets.bottom, 12) : 8,
          paddingTop: 8,
          elevation: 8, // Shadow cho Android
          shadowColor: '#000', // Shadow cho iOS
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.1,
          shadowRadius: 3,
        },
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: '',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="search"
        options={{
          title: '',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="search" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="add"
        options={{
          title: '',
          tabBarIcon: ({ color, size }) => (
            <View style={{
              width: 56,
              height: 56,
              borderRadius: 28,
              backgroundColor: Colors.primary,
              justifyContent: 'center',
              alignItems: 'center',
              marginTop: -20,
            }}>
              <Ionicons name="add" size={28} color="white" />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="notifications"
        options={{
          title: '',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="notifications" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: '',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person" size={size} color={color} />
          ),
        }}
      />
      {/* Hide trong tab bar */}
      <Tabs.Screen
        name="_view-all"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="_recipe-detail/[id]"
        options={{
          href: null, // Hide from tab bar (đủ rồi, không cần tabBarButton)
        }}
      />
      <Tabs.Screen
        name="_recipe-edit/[recipeId]"
        options={{
          href: null,
        }}
      />
    </Tabs>
  );
}