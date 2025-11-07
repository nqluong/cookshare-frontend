// components/admin/dashboard/content/TimeStats.tsx
import { RecipeContentAnalysisDTO } from "@/types/admin/report.types";
import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, Text, View } from "react-native";

interface TimeStatsProps {
  contentAnalysis: RecipeContentAnalysisDTO;
}

const timeStatsConfig = [
  { icon: "time", label: "Chuẩn bị", key: "avgPrepTime" as keyof RecipeContentAnalysisDTO, color: "#10b981" },
  { icon: "flame", label: "Nấu", key: "avgCookTime" as keyof RecipeContentAnalysisDTO, color: "#ef4444" },
  { icon: "timer", label: "Tổng", key: "avgTotalTime" as keyof RecipeContentAnalysisDTO, color: "#3b82f6" },
];

export default function TimeStats({ contentAnalysis }: TimeStatsProps) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>⏱️ Thời Gian Trung Bình</Text>
      <View style={styles.contentStatsGrid}>
        {timeStatsConfig.map((stat) => (
          <View key={stat.key} style={styles.contentStatCard}>
            <Ionicons name={stat.icon as any} size={24} color={stat.color} />
            <Text style={styles.contentStatLabel}>{stat.label}</Text>
            <Text style={styles.contentStatValue}>
              {Number(contentAnalysis[stat.key]).toFixed(2)} phút
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    backgroundColor: "#fff",
    marginTop: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 16,
  },
  contentStatsGrid: {
    flexDirection: "row",
    gap: 12,
  },
  contentStatCard: {
    flex: 1,
    backgroundColor: "#f9fafb",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    gap: 8,
  },
  contentStatLabel: {
    fontSize: 12,
    color: "#6b7280",
  },
  contentStatValue: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111827",
  },
});