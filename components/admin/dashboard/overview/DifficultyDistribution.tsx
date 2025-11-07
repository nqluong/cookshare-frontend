// components/admin/dashboard/overview/DifficultyDistribution.tsx
import { RecipeOverviewDTO } from "@/types/admin/report.types";
import { StyleSheet, Text, View } from "react-native";

interface DifficultyDistributionProps {
  overview: RecipeOverviewDTO | null;
}

export default function DifficultyDistribution({ overview }: DifficultyDistributionProps) {
  if (!overview) return null;

  const total = Object.values(overview.recipesByDifficulty).reduce((a, b) => a + b, 0);

  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Phân Bố Độ Khó</Text>
      <View style={styles.difficultyContainer}>
        {Object.entries(overview.recipesByDifficulty).map(([level, count]) => {
          const percentage = total > 0 ? (count / total) * 100 : 0;

          return (
            <View key={level} style={styles.difficultyItem}>
              <View style={styles.difficultyHeader}>
                <Text style={styles.difficultyLabel}>{level}</Text>
                <Text style={styles.difficultyValue}>{count}</Text>
              </View>
              <View style={styles.progressBar}>
                <View style={[styles.progressFill, { width: `${percentage}%` }]} />
              </View>
            </View>
          );
        })}
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
  difficultyContainer: {
    gap: 12,
  },
  difficultyItem: {
    gap: 6,
  },
  difficultyHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  difficultyLabel: {
    fontSize: 14,
    color: "#374151",
    fontWeight: "500",
  },
  difficultyValue: {
    fontSize: 14,
    color: "#10b981",
    fontWeight: "700",
  },
  progressBar: {
    height: 8,
    backgroundColor: "#e5e7eb",
    borderRadius: 4,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#10b981",
    borderRadius: 4,
  },
});