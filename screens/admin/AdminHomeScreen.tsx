import { Ionicons } from "@expo/vector-icons";
import {
    Image,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "../../context/AuthContext";
import { Colors } from "../../styles/colors";

interface TopRecipe {
  id: string;
  name: string;
  image: any;
  time: string;
  likes: string;
  rank: string;
}

export default function AdminHomeScreen() {
  const { user } = useAuth();

  // Mock data cho biểu đồ tuần
  const weeklyData = [
    { week: "Tuần 1", users: 5, recipes: 3 },
    { week: "Tuần 2", users: 8, recipes: 6 },
    { week: "Tuần 3", users: 12, recipes: 10 },
    { week: "Tuần 4", users: 16, recipes: 14 },
  ];

  // Mock top recipes
  const topRecipes: TopRecipe[] = [
    {
      id: "1",
      name: "Chung Lê",
      image: require("../../assets/images/default-avatar.png"),
      time: "45'",
      likes: "1.5k",
      rank: "Top 1",
    },
    {
      id: "2",
      name: "",
      image: require("../../assets/images/default-avatar.png"),
      time: "45'",
      likes: "1.3k",
      rank: "Top 2",
    },
    {
      id: "3",
      name: "",
      image: require("../../assets/images/default-avatar.png"),
      time: "45'",
      likes: "1.2k",
      rank: "Top 3",
    },
  ];

  const renderBarChart = () => {
    const maxValue = Math.max(...weeklyData.map((d) => Math.max(d.users, d.recipes)));

    return (
      <View style={styles.chartContainer}>
        {weeklyData.map((item, index) => {
          const userHeight = (item.users / maxValue) * 120;
          const recipeHeight = (item.recipes / maxValue) * 120;

          return (
            <View key={index} style={styles.barGroup}>
              <View style={styles.barsWrapper}>
                <View style={[styles.bar, styles.userBar, { height: userHeight }]} />
                <View style={[styles.bar, styles.recipeBar, { height: recipeHeight }]} />
              </View>
              <Text style={styles.barLabel}>{item.week}</Text>
            </View>
          );
        })}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Chào, {user?.fullName || "Chung"}</Text>
        <TouchableOpacity style={styles.notificationButton}>
          <Ionicons name="notifications-outline" size={24} color={Colors.text.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
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

          {/* Bar Chart */}
          {renderBarChart()}

          {/* Tab Buttons */}
          <View style={styles.tabContainer}>
            <TouchableOpacity style={styles.tabButton}>
              <Text style={styles.tabButtonText}>Ngày</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.tabButton, styles.tabButtonActive]}>
              <Text style={[styles.tabButtonText, styles.tabButtonTextActive]}>Tuần</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.tabButton}>
              <Text style={styles.tabButtonText}>Tháng</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Top Recipes */}
        <View style={styles.topRecipesSection}>
          {topRecipes.map((item) => (
            <TouchableOpacity key={item.id} style={styles.recipeItem}>
              <Image source={item.image} style={styles.recipeImage} />
              
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

              {item.name && <Text style={styles.recipeName}>{item.name}</Text>}

              <View style={styles.rankBadge}>
                <Text style={styles.rankText}>{item.rank}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#10b981",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#10b981",
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "700",
    color: Colors.text.primary,
  },
  notificationButton: {
    padding: 4,
  },
  scrollView: {
    flex: 1,
  },
  statsContainer: {
    flexDirection: "row",
    paddingHorizontal: 16,
    gap: 12,
    marginTop: 8,
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
    justifyContent: "space-around",
    alignItems: "flex-end",
    height: 180,
    marginBottom: 20,
    paddingHorizontal: 10,
  },
  barGroup: {
    alignItems: "center",
    flex: 1,
  },
  barsWrapper: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 4,
    height: 140,
  },
  bar: {
    width: 16,
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
  },
  userBar: {
    backgroundColor: "#6366f1",
  },
  recipeBar: {
    backgroundColor: "#10b981",
  },
  barLabel: {
    fontSize: 11,
    color: Colors.text.secondary,
    marginTop: 6,
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
    paddingBottom: 100,
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
  recipeImage: {
    width: 60,
    height: 60,
    borderRadius: 12,
    marginRight: 12,
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

