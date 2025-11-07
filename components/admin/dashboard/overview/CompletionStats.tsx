// components/admin/dashboard/overview/CompletionStats.tsx
import { RecipeCompletionStatsDTO } from "@/types/admin/report.types";
import { Ionicons } from "@expo/vector-icons";
import { Dimensions, StyleSheet, Text, View } from "react-native";

const { width } = Dimensions.get("window");

interface CompletionStatsProps {
  completionStats: RecipeCompletionStatsDTO;
}

const statsConfig = [
  { icon: "text", label: "Mô tả", key: "withDescription" as keyof RecipeCompletionStatsDTO, color: "#10b981" },
  { icon: "image", label: "Hình ảnh", key: "withImage" as keyof RecipeCompletionStatsDTO, color: "#3b82f6" },
  { icon: "videocam", label: "Video", key: "withVideo" as keyof RecipeCompletionStatsDTO, color: "#f59e0b" },
  { icon: "list", label: "Nguyên liệu", key: "withIngredients" as keyof RecipeCompletionStatsDTO, color: "#ec4899" },
];

export default function CompletionStats({ completionStats }: CompletionStatsProps) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Thống Kê Hoàn Thiện</Text>
      <View style={styles.completionCard}>
        <View style={styles.completionHeader}>
          <Text style={styles.completionTitle}>Tỷ Lệ Hoàn Thiện</Text>
          <Text style={styles.completionPercentage}>
            {completionStats.completionRate.toFixed(1)}%
          </Text>
        </View>
        <View style={styles.completionGrid}>
          {statsConfig.map((stat) => (
            <View key={stat.key} style={styles.completionItem}>
              <Ionicons name={stat.icon as any} size={20} color={stat.color} />
              <Text style={styles.completionLabel}>{stat.label}</Text>
              <Text style={styles.completionValue}>{completionStats[stat.key]}</Text>
            </View>
          ))}
        </View>
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
  completionCard: {
    backgroundColor: "#f9fafb",
    borderRadius: 12,
    padding: 16,
    gap: 16,
  },
  completionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  completionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
  },
  completionPercentage: {
    fontSize: 24,
    fontWeight: "700",
    color: "#10b981",
  },
  completionGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  completionItem: {
    width: (width - 76) / 2,
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 12,
    alignItems: "center",
    gap: 8,
  },
  completionLabel: {
    fontSize: 12,
    color: "#6b7280",
  },
  completionValue: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111827",
  },
});