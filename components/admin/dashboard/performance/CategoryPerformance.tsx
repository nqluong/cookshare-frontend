// components/admin/dashboard/performance/CategoryPerformance.tsx
import { CategoryPerformanceDTO } from "@/types/admin/report.types";
import { StyleSheet, Text, View } from "react-native";

interface CategoryPerformanceProps {
  categoryPerformance: CategoryPerformanceDTO[];
}

const statsConfig = [
  { label: "Công thức", key: "recipeCount" as keyof CategoryPerformanceDTO },
  { label: "Views", key: "totalViews" as keyof CategoryPerformanceDTO },
  { label: "Likes", key: "totalLikes" as keyof CategoryPerformanceDTO },
  { label: "Rating", key: "avgRating" as keyof CategoryPerformanceDTO, isDecimal: true },
];

export default function CategoryPerformance({ categoryPerformance }: CategoryPerformanceProps) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>📊 Hiệu Suất Danh Mục</Text>
      {categoryPerformance.map((category) => (
        <View key={category.categoryName} style={styles.categoryCard}>
          <Text style={styles.categoryName}>{category.categoryName}</Text>
          <View style={styles.categoryStats}>
            {statsConfig.map((stat) => {
              const value = category[stat.key];
              const displayValue = stat.isDecimal && typeof value === 'number' 
                ? value.toFixed(1) 
                : value;

              return (
                <View key={stat.key} style={styles.categoryStat}>
                  <Text style={styles.categoryLabel}>{stat.label}</Text>
                  <Text style={styles.categoryValue}>{displayValue}</Text>
                </View>
              );
            })}
          </View>
        </View>
      ))}
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
  categoryCard: {
    backgroundColor: "#f9fafb",
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
  },
  categoryName: {
    fontSize: 15,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 12,
  },
  categoryStats: {
    flexDirection: "row",
    gap: 12,
  },
  categoryStat: {
    flex: 1,
    alignItems: "center",
  },
  categoryLabel: {
    fontSize: 11,
    color: "#6b7280",
    marginBottom: 4,
  },
  categoryValue: {
    fontSize: 14,
    fontWeight: "700",
    color: "#10b981",
  },
});