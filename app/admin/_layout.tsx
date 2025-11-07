import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import { Platform } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function AdminLayout() {
  const insets = useSafeAreaInsets();

  return (
    <Tabs
      initialRouteName="home"
      screenOptions={{
        tabBarActiveTintColor: "#10b981",
        tabBarInactiveTintColor: "#6B7280",
        tabBarStyle: {
          backgroundColor: "#d1f4e0",
          borderTopWidth: 0,
          height: Platform.OS === "android" ? 50 + insets.bottom : 70,
          paddingBottom: Platform.OS === "android" ? Math.max(insets.bottom, 12) : 12,
          paddingTop: 12,
          elevation: 0,
          shadowOpacity: 0,
        },
        headerShown: false,
        tabBarShowLabel: false,
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: "",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home-outline" size={26} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="dashboard"
        options={{
          title: "",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="stats-chart-outline" size={26} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="menu"
        options={{
          title: "",
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons
              name={focused ? "layers" : "layers-outline"}
              size={28}
              color={focused ? "#10b981" : color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person-outline" size={26} color={color} />
          ),
        }}
      />
      {/* Hide these from tab bar */}
      <Tabs.Screen
        name="ingredients"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="users"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="recipes"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="statistics"
        options={{
          href: null,
        }}
      />

      <Tabs.Screen
        name="recipes/[id]"
        options={{
          href: null,
        }}
      />

            <Tabs.Screen
        name="recipes/index"
        options={{
          href: null,
        }}
      />

    </Tabs>
  );
}

