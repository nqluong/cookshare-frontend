// components/admin/dashboard/content/RecipeComposition.tsx
import { RecipeContentAnalysisDTO } from "@/types/admin/report.types";
import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, Text, View } from "react-native";

interface RecipeCompositionProps {
  contentAnalysis: RecipeContentAnalysisDTO;
}

export default function RecipeComposition({ contentAnalysis }: RecipeCompositionProps) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>📝 Cấu Trúc Công Thức</Text>
      <View style={styles.contentStatsGrid}>
        <View style={styles.contentStatCard}>
          <Ionicons name="list" size={24} color="#f59e0b" />
          <Text style={styles.contentStatLabel}>Nguyên liệu</Text>
          <Text style={styles.contentStatValue}>
            {contentAnalysis.avgIngredientCount.toFixed(1)}
          </Text>
        </View>
        <View style={styles.contentStatCard}>
          <Ionicons name="footsteps" size={24} color="#ec4899" />
          <Text style={styles.contentStatLabel}>Bước</Text>
          <Text style={styles.contentStatValue}>
            {contentAnalysis.avgStepCount.toFixed(1)}
          </Text>
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