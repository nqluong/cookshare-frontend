import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useState } from "react";
import {
    Dimensions,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "../../context/AuthContext";
import { Colors } from "../../styles/colors";

const { width } = Dimensions.get("window");

interface RecipeRankItem {
  id: string;
  name: string;
  author: string;
  time: string;
  likes: string;
  rank: string;
  image?: string;
}

type TabType = "Ngày" | "Tuần" | "Tháng";

export default function AdminDashboardScreen() {
  const { user } = useAuth();
  const [selectedTab, setSelectedTab] = useState<TabType>("Tuần");

  // Mock data for the chart (weekly data for 4 weeks)
  const weeklyData = [
    { week: "Tuần 1", value: 120, maxValue: 150 },
    { week: "Tuần 2", value: 200, maxValue: 150 },
    { week: "Tuần 3", value: 260, maxValue: 150 },
    { week: "Tuần 4", value: 340, maxValue: 150 },
  ];

  // Mock data for top recipes
  const topRecipes: RecipeRankItem[] = [
    { id: "1", name: "Chung Lê", author: "Top 1", time: "45'", likes: "1.5k", rank: "Top 1" },
    { id: "2", name: "", author: "", time: "45'", likes: "1.3k", rank: "Top 2" },
    { id: "3", name: "", author: "", time: "45'", likes: "1.2k", rank: "Top 3" },
  ];

  const renderBarChart = () => {
    const maxValue = Math.max(...weeklyData.map((d) => d.maxValue));

    return (
      <View style={styles.chartContainer}>
        {/* Y-axis labels */}
        <View style={styles.yAxisContainer}>
          <Text style={styles.yAxisLabel}>15k</Text>
          <Text style={styles.yAxisLabel}>10k</Text>
          <Text style={styles.yAxisLabel}>5k</Text>
          <Text style={styles.yAxisLabel}>1k</Text>
        </View>

        {/* Bars */}
        <View style={styles.barsContainer}>
          {weeklyData.map((item, index) => {
            const heightPercentage = (item.value / maxValue) * 100;
            const barHeight = (heightPercentage / 100) * 180; // 180 is max height in pixels

            return (
              <View key={index} style={styles.barWrapper}>
                <View style={styles.barColumn}>
                  <View style={[styles.bar, { height: barHeight }]} />
                </View>
                <Text style={styles.barLabel}>{item.week}</Text>
              </View>
            );
          })}
        </View>
      </View>
    );
  };

  const renderTopRecipeItem = (item: RecipeRankItem) => (
    <TouchableOpacity key={item.id} style={styles.recipeItem}>
      {/* Recipe Image */}
      <View style={styles.recipeImageContainer}>
        <View style={styles.recipeImagePlaceholder}>
          <Ionicons name="image" size={32} color={Colors.text.light} />
        </View>
      </View>

      {/* Recipe Info */}
      <View style={styles.recipeInfo}>
        <View style={styles.recipeTimeContainer}>
          <Ionicons name="time-outline" size={16} color="#ef4444" />
          <Text style={styles.recipeTime}>{item.time}</Text>
        </View>
        <View style={styles.recipeLikesContainer}>
          <Ionicons name="heart" size={16} color="#ef4444" />
          <Text style={styles.recipeLikes}>{item.likes}</Text>
        </View>
      </View>

      {/* Recipe Author/Name */}
      {item.name && <Text style={styles.recipeName}>{item.name}</Text>}

      {/* Rank Badge */}
      <View style={styles.rankBadge}>
        <Text style={styles.rankText}>{item.rank}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={Colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Tổng Quan</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity 
            style={styles.menuButton}
            onPress={() => router.push('/admin/menu' as any)}
          >
            <Ionicons name="grid-outline" size={24} color={Colors.text.primary} />
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

        {/* Chart Section */}
        <View style={styles.chartSection}>
          <View style={styles.chartHeader}>
            <Text style={styles.chartTitle}>Tháng 9</Text>
            <View style={styles.chartActions}>
              <TouchableOpacity style={styles.chartIconButton}>
                <Ionicons name="search" size={20} color="#10b981" />
              </TouchableOpacity>
              <TouchableOpacity style={styles.chartIconButton}>
                <Ionicons name="calendar" size={20} color="#10b981" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Chart */}
          {renderBarChart()}

          {/* Tab Buttons */}
          <View style={styles.tabContainer}>
            {(["Ngày", "Tuần", "Tháng"] as TabType[]).map((tab) => (
              <TouchableOpacity
                key={tab}
                style={[
                  styles.tabButton,
                  selectedTab === tab && styles.tabButtonActive,
                ]}
                onPress={() => setSelectedTab(tab)}
              >
                <Text
                  style={[
                    styles.tabButtonText,
                    selectedTab === tab && styles.tabButtonTextActive,
                  ]}
                >
                  {tab}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Top Recipes Section */}
        <View style={styles.topRecipesSection}>
          {topRecipes.map(renderTopRecipeItem)}
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
  menuButton: {
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
    marginBottom: 16,
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
  chartSection: {
    backgroundColor: "#d1f4e0",
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    paddingTop: 24,
    paddingHorizontal: 20,
    paddingBottom: 24,
    minHeight: 400,
  },
  chartHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: Colors.text.primary,
  },
  chartActions: {
    flexDirection: "row",
    gap: 8,
  },
  chartIconButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  chartContainer: {
    flexDirection: "row",
    height: 220,
    marginBottom: 20,
  },
  yAxisContainer: {
    justifyContent: "space-between",
    paddingRight: 8,
    paddingVertical: 10,
  },
  yAxisLabel: {
    fontSize: 10,
    color: Colors.text.secondary,
  },
  barsContainer: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "flex-end",
    paddingBottom: 20,
  },
  barWrapper: {
    flex: 1,
    alignItems: "center",
  },
  barColumn: {
    height: 180,
    justifyContent: "flex-end",
    alignItems: "center",
  },
  bar: {
    width: 40,
    backgroundColor: "#10b981",
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
  },
  barLabel: {
    fontSize: 11,
    color: Colors.text.secondary,
    marginTop: 6,
    textAlign: "center",
  },
  tabContainer: {
    flexDirection: "row",
    backgroundColor: "#c8eed9",
    borderRadius: 25,
    padding: 4,
    gap: 4,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 20,
    alignItems: "center",
  },
  tabButtonActive: {
    backgroundColor: "#10b981",
  },
  tabButtonText: {
    fontSize: 14,
    fontWeight: "500",
    color: Colors.text.secondary,
  },
  tabButtonTextActive: {
    color: "#fff",
    fontWeight: "600",
  },
  topRecipesSection: {
    backgroundColor: "#d1f4e0",
    paddingHorizontal: 20,
    paddingBottom: 32,
  },
  recipeItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 12,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  recipeImageContainer: {
    marginRight: 12,
  },
  recipeImagePlaceholder: {
    width: 60,
    height: 60,
    borderRadius: 12,
    backgroundColor: Colors.gray[100],
    alignItems: "center",
    justifyContent: "center",
  },
  recipeInfo: {
    flex: 1,
    gap: 6,
  },
  recipeTimeContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  recipeTime: {
    fontSize: 13,
    color: Colors.text.secondary,
    fontWeight: "500",
  },
  recipeLikesContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  recipeLikes: {
    fontSize: 13,
    color: "#ef4444",
    fontWeight: "600",
  },
  recipeName: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.text.primary,
    marginRight: 12,
  },
  rankBadge: {
    backgroundColor: Colors.gray[100],
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  rankText: {
    fontSize: 12,
    fontWeight: "600",
    color: Colors.text.primary,
  },
});

