import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import CustomAlert from "../../components/ui/CustomAlert";
import { useCustomAlert } from "../../hooks/useCustomAlert";
import { useAuth } from "../../context/AuthContext";
import adminStatisticApi, { getDefaultDateRange } from "../../services/adminStatisticsService";
import { Colors } from "../../styles/colors";

interface QuickStat {
  icon: any;
  label: string;
  value: string;
  color: string;
  bgColor: string;
  onPress?: () => void;
}

export default function AdminHomeScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const { alert, showError, hideAlert } = useCustomAlert();

  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState(getDefaultDateRange());
  const [stats, setStats] = useState({
    totalRecipes: 0,
    totalUsers: 0,
    totalLikes: 0,
    totalSearches: 0,
    engagementRate: 0,
    searchSuccessRate: 0,
  });

  useEffect(() => {
    fetchQuickStats();
  }, []);

  const fetchQuickStats = async () => {
    try {
      const dateRange = getDefaultDateRange();

      const [interactionData, searchData] = await Promise.all([
        adminStatisticApi.getInteractionOverview(dateRange),
        adminStatisticApi.getSearchOverview(dateRange),
      ]);
      console.log('Interaction Data:', interactionData);
      console.log('Search Data:', searchData);

      setStats({
        totalRecipes: interactionData.totalRecipes,
        totalUsers: searchData.totalUsers,
        totalLikes: interactionData.totalLikes,
        totalSearches: searchData.totalSearches,
        engagementRate: interactionData.engagementRate,
        searchSuccessRate: searchData.successRate,
      });
<<<<<<< HEAD
    } catch (error) {
      console.log('Error fetching stats:', error);
=======
    } catch (error: any) {
      console.error('Error fetching stats:', error);
      showError(
        'Lỗi tải dữ liệu',
        error?.message || 'Không thể tải dữ liệu thống kê. Vui lòng thử lại.'
      );
>>>>>>> update-home
    } finally {
      setLoading(false);
    }
  };

  const handleExitAdmin = () => {
    router.replace('/(tabs)/home' as any);
  };

  const quickStats: QuickStat[] = [
    {
      icon: "document-text",
      label: "Công Thức",
      value: loading ? "..." : stats.totalRecipes.toString(),
      color: "#1a73e8",
      bgColor: "#e8f0fe",
      onPress: () => router.push('/admin/recipes'),
    },
    {
      icon: "people",
      label: "Người Dùng",
      value: loading ? "..." : stats.totalUsers.toString(),
      color: "#5f6368",
      bgColor: "#f1f3f4",
      onPress: () => router.push('/admin/users'),
    },
    {
      icon: "heart",
      label: "Tổng Likes",
      value: loading ? "..." : formatNumber(stats.totalLikes),
      color: "#ef4444",
      bgColor: "#fee2e2",
    },
    {
      icon: "search",
      label: "Tìm Kiếm",
      value: loading ? "..." : formatNumber(stats.totalSearches),
      color: "#6366f1",
      bgColor: "#eef2ff",
    },
    {
      icon: "trending-up",
      label: "Mức Tương Tác",
      value: loading ? "..." : `${stats.engagementRate.toFixed(1)}%`,
      color: "#10b981",
      bgColor: "#d1fae5",
    },
    {
      icon: "checkmark-circle",
      label: "Tìm Kiếm thành công",
      value: loading ? "..." : `${stats.searchSuccessRate.toFixed(1)}%`,
      color: "#f59e0b",
      bgColor: "#fef3c7",
    },
  ];

  const menuItems = [
    {
      icon: "stats-chart",
      label: "Thống Kê Chi Tiết",
      description: "Xem phân tích tương tác & tìm kiếm",
      color: "#10b981",
      onPress: () => router.push('/admin/statistics' as any),
    },
    {
      icon: "restaurant",
      label: "Quản Lý Công Thức",
      description: "Duyệt và quản lý công thức",
      color: "#3b82f6",
      onPress: () => router.push('/admin/recipes' as any),
    },
    // {
    //   icon: "leaf",
    //   label: "Quản Lý Nguyên Liệu",
    //   description: "Thêm, sửa nguyên liệu",
    //   color: "#f59e0b",
    //   onPress: () => router.push('/admin/ingredients' as any),
    // },
    {
      icon: "people",
      label: "Quản Lý Người Dùng",
      description: "Xem danh sách người dùng",
      color: "#8b5cf6",
      onPress: () => router.push('/admin/users' as any),
    },
  ];

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerGreeting}>Chào,</Text>
          <Text style={styles.headerTitle}>{user?.fullName || "Admin"}</Text>
        </View>
        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.notificationButton}>
            <Ionicons name="notifications-outline" size={24} color="#fff" />
            <View style={styles.badge}>
              <Text style={styles.badgeText}>3</Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity style={styles.exitButton} onPress={handleExitAdmin}>
            <Ionicons name="exit-outline" size={24} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Quick Stats Grid */}
        <View style={styles.statsSection}>
          <Text style={styles.sectionTitle}>Tổng Quan Nhanh</Text>
          <Text style={styles.dateRangeText}>
            Từ {formatDate(dateRange.startDate)} đến {formatDate(dateRange.endDate)}
          </Text>
          <View style={styles.statsGrid}>
            {quickStats.map((stat, index) => (
              <TouchableOpacity
                key={index}
                style={styles.statCard}
                onPress={stat.onPress}
                disabled={!stat.onPress}
              >
                <View style={[styles.statIconContainer, { backgroundColor: stat.bgColor }]}>
                  <Ionicons name={stat.icon} size={24} color={stat.color} />
                </View>
                <Text style={styles.statValue}>{stat.value}</Text>
                <Text style={styles.statLabel}>{stat.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Menu Items */}
        <View style={styles.menuSection}>
          <Text style={styles.sectionTitle}>Quản Lý</Text>
          {menuItems.map((item, index) => (
            <TouchableOpacity
              key={index}
              style={styles.menuItem}
              onPress={item.onPress}
            >
              <View style={[styles.menuIconContainer, { backgroundColor: `${item.color}15` }]}>
                <Ionicons name={item.icon as keyof typeof Ionicons.glyphMap} size={28} color={item.color} />
              </View>
              <View style={styles.menuContent}>
                <Text style={styles.menuLabel}>{item.label}</Text>
                <Text style={styles.menuDescription}>{item.description}</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={Colors.text.primary} />
            </TouchableOpacity>
          ))}
        </View>

        {/* Bottom Spacing */}
        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Custom Alert */}
      <CustomAlert
        visible={alert.visible}
        title={alert.title}
        message={alert.message}
        type={alert.type}
        buttons={alert.buttons}
        onClose={hideAlert}
      />
    </SafeAreaView>
  );
}

const formatNumber = (num: number): string => {
  if (num >= 1000000) {
    return `${(num / 1000000).toFixed(1)}M`;
  }
  if (num >= 1000) {
    return `${(num / 1000).toFixed(1)}K`;
  }
  return num.toString();
};

const formatDate = (dateStr: string | undefined): string => {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  return date.toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f9fafb",
  },
  dateRangeText: {
    fontSize: 14,
    color: Colors.text.secondary,
    marginBottom: 16,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 20,
    backgroundColor: "#10b981",
  },
  headerGreeting: {
    fontSize: 14,
    color: "rgba(255,255,255,0.8)",
    marginBottom: 4,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#fff",
  },
  headerActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  notificationButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  badge: {
    position: "absolute",
    top: -2,
    right: -2,
    backgroundColor: "#ef4444",
    width: 18,
    height: 18,
    borderRadius: 9,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#10b981",
  },
  badgeText: {
    fontSize: 10,
    fontWeight: "700",
    color: "#fff",
  },
  exitButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  scrollView: {
    flex: 1,
  },
  statsSection: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: Colors.text.primary,
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  statCard: {
    width: "31%",
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  statIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  statValue: {
    fontSize: 20,
    fontWeight: "700",
    color: Colors.text.primary,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 11,
    color: Colors.text.secondary,
    textAlign: "center",
  },
  menuSection: {
    padding: 16,
    paddingTop: 0,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  menuIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 16,
  },
  menuContent: {
    flex: 1,
  },
  menuLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.text.primary,
    marginBottom: 4,
  },
  menuDescription: {
    fontSize: 13,
    color: Colors.text.secondary,
  },
});