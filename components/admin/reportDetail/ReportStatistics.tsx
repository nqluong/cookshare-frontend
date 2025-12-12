import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, Text, View } from "react-native";
import { Colors } from "../../../styles/colors";

interface ReportStatisticsProps {
  reportCount: number;
  weightedScore: number;
  threshold: number;
}

export default function ReportStatistics({
  reportCount,
  weightedScore,
  threshold,
}: ReportStatisticsProps) {
  return (
    <View style={styles.card}>
      <Text style={styles.sectionTitle}>Thống kê báo cáo</Text>
      <View style={styles.statsGrid}>
        <View style={styles.statBox}>
          <Ionicons name="flag" size={24} color="#EF4444" />
          <Text style={styles.statValue}>{reportCount}</Text>
          <Text style={styles.statLabel}>Báo cáo</Text>
        </View>
        <View style={styles.statBox}>
          <Ionicons name="analytics" size={24} color="#3B82F6" />
          <Text style={styles.statValue}>{weightedScore.toFixed(1)}</Text>
          <Text style={styles.statLabel}>Điểm</Text>
        </View>
        <View style={styles.statBox}>
          <Ionicons name="speedometer" size={24} color="#F59E0B" />
          <Text style={styles.statValue}>{threshold}</Text>
          <Text style={styles.statLabel}>Ngưỡng</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#FFFFFF",
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 16,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.text.secondary,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 12,
  },
  statsGrid: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
  statBox: {
    alignItems: "center",
    paddingVertical: 8,
  },
  statValue: {
    fontSize: 24,
    fontWeight: "700",
    color: Colors.text.primary,
    marginTop: 6,
  },
  statLabel: {
    fontSize: 12,
    color: Colors.text.secondary,
    marginTop: 2,
  },
});
