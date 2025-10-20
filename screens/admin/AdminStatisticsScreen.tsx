import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import {
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Colors } from "../../styles/colors";

type TimeFilter = "Ngày" | "Tuần" | "Tháng" | "Năm";

export default function AdminStatisticsScreen() {
  const [selectedFilter, setSelectedFilter] = useState<TimeFilter>("Tháng");

  // Mock data for monthly chart
  const monthlyData = [
    { month: 1, users: 20, recipes: 10 },
    { month: 2, users: 30, recipes: 15 },
    { month: 3, users: 35, recipes: 20 },
    { month: 4, users: 40, recipes: 25 },
    { month: 5, users: 50, recipes: 30 },
    { month: 6, users: 60, recipes: 35 },
    { month: 7, users: 65, recipes: 40 },
    { month: 8, users: 70, recipes: 50 },
    { month: 9, users: 80, recipes: 60 },
    { month: 10, users: 90, recipes: 70 },
    { month: 11, users: 95, recipes: 75 },
    { month: 12, users: 100, recipes: 80 },
  ];

  const renderLineChart = () => {
    const maxValue = Math.max(...monthlyData.map((d) => Math.max(d.users, d.recipes)));
    const chartHeight = 200;

    // Calculate points for lines
    const userPoints = monthlyData.map((item, index) => {
      const x = (index / (monthlyData.length - 1)) * 100; // percentage
      const y = ((maxValue - item.users) / maxValue) * 100; // percentage from top
      return { x, y, value: item.users };
    });

    const recipePoints = monthlyData.map((item, index) => {
      const x = (index / (monthlyData.length - 1)) * 100;
      const y = ((maxValue - item.recipes) / maxValue) * 100;
      return { x, y, value: item.recipes };
    });

    return (
      <View style={styles.chartContainer}>
        {/* Y-axis labels */}
        <View style={styles.yAxisContainer}>
          <Text style={styles.yAxisLabel}>100</Text>
          <Text style={styles.yAxisLabel}>80</Text>
          <Text style={styles.yAxisLabel}>60</Text>
          <Text style={styles.yAxisLabel}>40</Text>
          <Text style={styles.yAxisLabel}>20</Text>
          <Text style={styles.yAxisLabel}>0</Text>
        </View>

        {/* Chart area */}
        <View style={styles.chartArea}>
          {/* Grid lines */}
          <View style={styles.gridContainer}>
            {[0, 1, 2, 3, 4, 5].map((i) => (
              <View key={i} style={styles.gridLine} />
            ))}
          </View>

          {/* Data points */}
          <View style={styles.dataPointsContainer}>
            {userPoints.map((point, index) => (
              <View
                key={`user-${index}`}
                style={[
                  styles.dataPoint,
                  styles.userDataPoint,
                  {
                    left: `${point.x}%`,
                    top: `${point.y}%`,
                  },
                ]}
              />
            ))}
            {recipePoints.map((point, index) => (
              <View
                key={`recipe-${index}`}
                style={[
                  styles.dataPoint,
                  styles.recipeDataPoint,
                  {
                    left: `${point.x}%`,
                    top: `${point.y}%`,
                  },
                ]}
              />
            ))}
          </View>

          {/* X-axis labels */}
          <View style={styles.xAxisContainer}>
            {monthlyData.map((item, index) => (
              <Text key={index} style={styles.xAxisLabel}>
                {item.month}
              </Text>
            ))}
          </View>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Thống Kế</Text>
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
            <Text style={styles.chartTitle}>2025</Text>
            <View style={styles.chartActions}>
              <TouchableOpacity style={styles.chartIconButton}>
                <Ionicons name="search" size={20} color="#10b981" />
              </TouchableOpacity>
              <TouchableOpacity style={styles.chartIconButton}>
                <Ionicons name="calendar" size={20} color="#10b981" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Chart Title */}
          <Text style={styles.chartSubtitle}>Người Dùng & Công Thức Mới</Text>

          {/* Line Chart */}
          {renderLineChart()}

          {/* Legend */}
          <View style={styles.legendContainer}>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: "#6366f1" }]} />
              <Text style={styles.legendText}>Người dùng</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: "#ef4444" }]} />
              <Text style={styles.legendText}>Công thức</Text>
            </View>
          </View>

          {/* Time Filter Tabs */}
          <View style={styles.tabContainer}>
            {(["Ngày", "Tuần", "Tháng", "Năm"] as TimeFilter[]).map((filter) => (
              <TouchableOpacity
                key={filter}
                style={[
                  styles.tabButton,
                  selectedFilter === filter && styles.tabButtonActive,
                ]}
                onPress={() => setSelectedFilter(filter)}
              >
                <Text
                  style={[
                    styles.tabButtonText,
                    selectedFilter === filter && styles.tabButtonTextActive,
                  ]}
                >
                  {filter}
                </Text>
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
    paddingBottom: 100,
  },
  chartHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
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
  chartSubtitle: {
    fontSize: 14,
    color: Colors.text.secondary,
    marginBottom: 16,
  },
  chartContainer: {
    flexDirection: "row",
    height: 250,
    marginBottom: 16,
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
  chartArea: {
    flex: 1,
    position: "relative",
  },
  gridContainer: {
    position: "absolute",
    top: 10,
    left: 0,
    right: 0,
    bottom: 30,
    justifyContent: "space-between",
  },
  gridLine: {
    height: 1,
    backgroundColor: "#c8eed9",
  },
  dataPointsContainer: {
    position: "absolute",
    top: 10,
    left: 0,
    right: 0,
    bottom: 30,
  },
  dataPoint: {
    position: "absolute",
    width: 8,
    height: 8,
    borderRadius: 4,
    marginLeft: -4,
    marginTop: -4,
  },
  userDataPoint: {
    backgroundColor: "#6366f1",
  },
  recipeDataPoint: {
    backgroundColor: "#ef4444",
  },
  xAxisContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 4,
  },
  xAxisLabel: {
    fontSize: 10,
    color: Colors.text.secondary,
  },
  legendContainer: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 24,
    marginBottom: 20,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  legendText: {
    fontSize: 12,
    color: Colors.text.secondary,
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
});

