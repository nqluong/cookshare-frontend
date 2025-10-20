import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "../../context/AuthContext";
import { Colors } from "../../styles/colors";

interface MenuItem {
  id: string;
  title: string;
  icon: string;
  iconLibrary: "Ionicons" | "MaterialCommunityIcons";
  color: string;
  backgroundColor: string;
  route?: string;
}

export default function AdminMenuScreen() {
  const { user } = useAuth();

  const menuItems: MenuItem[] = [
    {
      id: "recipes",
      title: "Công Thức",
      icon: "book",
      iconLibrary: "Ionicons",
      color: "#fff",
      backgroundColor: "#3b82f6", // Blue
      route: "/admin/recipes",
    },
    {
      id: "ingredients",
      title: "Nguyên Liệu",
      icon: "nutrition",
      iconLibrary: "Ionicons",
      color: "#fff",
      backgroundColor: "#93c5fd", // Light blue
      route: "/admin/ingredients",
    },
    {
      id: "users",
      title: "Người Dùng",
      icon: "account",
      iconLibrary: "MaterialCommunityIcons",
      color: "#fff",
      backgroundColor: "#93c5fd", // Light blue
      route: "/admin/users",
    },
    {
      id: "posts",
      title: "Bài Đăng",
      icon: "image",
      iconLibrary: "Ionicons",
      color: "#fff",
      backgroundColor: "#93c5fd", // Light blue
    },
    {
      id: "gifts",
      title: "Gifts",
      icon: "gift",
      iconLibrary: "Ionicons",
      color: "#fff",
      backgroundColor: "#93c5fd", // Light blue
    },
    {
      id: "more",
      title: "",
      icon: "add",
      iconLibrary: "Ionicons",
      color: "#fff",
      backgroundColor: "#93c5fd", // Light blue
    },
  ];

  const handleMenuPress = (item: MenuItem) => {
    if (item.route) {
      router.push(item.route as any);
    }
  };

  const renderIcon = (item: MenuItem) => {
    if (item.iconLibrary === "MaterialCommunityIcons") {
      return (
        <MaterialCommunityIcons
          name={item.icon as any}
          size={40}
          color={item.color}
        />
      );
    }
    return <Ionicons name={item.icon as any} size={40} color={item.color} />;
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={Colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Danh Mục</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity 
            style={styles.dashboardButton}
            onPress={() => router.push('/admin/dashboard' as any)}
          >
            <Ionicons name="stats-chart-outline" size={24} color={Colors.text.primary} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.notificationButton}>
            <Ionicons name="notifications-outline" size={24} color={Colors.text.primary} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Greeting */}
        <View style={styles.greetingContainer}>
          <Text style={styles.greetingText}>Chào, {user?.fullName || "Admin"}</Text>
        </View>

        {/* Stats Cards */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <View style={styles.statIconContainer}>
              <Ionicons name="document-text" size={20} color="#1a73e8" />
            </View>
            <Text style={styles.statLabel}>Tổng Số Công Thức</Text>
            <Text style={styles.statValue}>2000</Text>
          </View>

          <View style={styles.statCard}>
            <View style={[styles.statIconContainer, { backgroundColor: "#e8f0fe" }]}>
              <Ionicons name="people" size={20} color="#5f6368" />
            </View>
            <Text style={styles.statLabel}>Người Dùng</Text>
            <Text style={[styles.statValue, { color: "#5f6368" }]}>1000</Text>
          </View>
        </View>

        {/* Menu Grid */}
        <View style={styles.menuSection}>
          <View style={styles.menuGrid}>
            {menuItems.map((item, index) => (
              <TouchableOpacity
                key={item.id}
                style={[
                  styles.menuItem,
                  { backgroundColor: item.backgroundColor },
                ]}
                onPress={() => handleMenuPress(item)}
              >
                <View style={styles.menuIconContainer}>
                  {renderIcon(item)}
                </View>
                {item.title && (
                  <Text style={styles.menuTitle}>{item.title}</Text>
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#10b981", // Green background
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#10b981",
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: Colors.text.primary,
  },
  headerActions: {
    flexDirection: "row",
    gap: 8,
  },
  dashboardButton: {
    padding: 4,
  },
  notificationButton: {
    padding: 4,
  },
  scrollView: {
    flex: 1,
  },
  greetingContainer: {
    paddingHorizontal: 24,
    paddingTop: 8,
    paddingBottom: 16,
    backgroundColor: "#10b981",
  },
  greetingText: {
    fontSize: 28,
    fontWeight: "700",
    color: Colors.text.primary,
  },
  statsContainer: {
    flexDirection: "row",
    paddingHorizontal: 16,
    gap: 12,
    marginBottom: 24,
    backgroundColor: "#10b981",
  },
  statCard: {
    flex: 1,
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    gap: 8,
  },
  statIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: "#e8f5e9",
    alignItems: "center",
    justifyContent: "center",
  },
  statLabel: {
    fontSize: 12,
    color: Colors.text.secondary,
  },
  statValue: {
    fontSize: 24,
    fontWeight: "700",
    color: "#10b981",
  },
  menuSection: {
    backgroundColor: "#d1f4e0",
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    paddingTop: 32,
    paddingHorizontal: 20,
    paddingBottom: 32,
    minHeight: 500,
  },
  menuGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 16,
  },
  menuItem: {
    width: "47%",
    aspectRatio: 1,
    borderRadius: 20,
    padding: 20,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
  },
  menuIconContainer: {
    marginBottom: 8,
  },
  menuTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: "#1f2937",
    textAlign: "center",
  },
});

