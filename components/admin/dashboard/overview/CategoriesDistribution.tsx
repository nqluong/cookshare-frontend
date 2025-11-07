// components/admin/dashboard/overview/CategoriesDistribution.tsx
import { RecipeOverviewDTO } from "@/types/admin/report.types";
import { StyleSheet, Text, View } from "react-native";

interface CategoriesDistributionProps {
  overview: RecipeOverviewDTO | null;
}

export default function CategoriesDistribution({ overview }: CategoriesDistributionProps) {
  if (!overview) return null;

  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Phân Bố Theo Danh Mục</Text>
      <View style={styles.categoryGrid}>
        {Object.entries(overview.recipesByCategory).map(([category, count]) => (
          <View key={category} style={styles.categoryCard}>
            <Text style={styles.categoryName}>{category}</Text>
            <Text style={styles.categoryCount}>{count}</Text>
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
  categoryGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  categoryCard: {
    backgroundColor: "#f3f4f6",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  categoryName: {
    fontSize: 14,
    color: "#374151",
    fontWeight: "500",
  },
  categoryCount: {
    fontSize: 14,
    color: "#10b981",
    fontWeight: "700",
  },
});