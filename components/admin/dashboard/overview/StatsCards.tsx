// app/admin/components/overview/StatsCards.tsx
import { RecipeOverviewDTO } from "@/types/admin/report.types";
import { Ionicons } from "@expo/vector-icons";
import { Dimensions, StyleSheet, Text, View } from "react-native";

const { width } = Dimensions.get("window");

interface StatsCardsProps {
  overview: RecipeOverviewDTO | null;
}

const statsConfig = [
  {
    icon: "document-text",
    label: "Tổng Công Thức",
    key: "totalRecipes" as keyof RecipeOverviewDTO,
    iconBg: "#e8f5e9",
    iconColor: "#10b981",
    valueColor: "#10b981",
  },
  {
    icon: "today",
    label: "Mới Hôm Nay",
    key: "newRecipesToday" as keyof RecipeOverviewDTO,
    iconBg: "#fef3c7",
    iconColor: "#f59e0b",
    valueColor: "#f59e0b",
  },
  {
    icon: "calendar",
    label: "Tuần Này",
    key: "newRecipesThisWeek" as keyof RecipeOverviewDTO,
    iconBg: "#dbeafe",
    iconColor: "#3b82f6",
    valueColor: "#3b82f6",
  },
  {
    icon: "calendar-outline",
    label: "Tháng Này",
    key: "newRecipesThisMonth" as keyof RecipeOverviewDTO,
    iconBg: "#fce7f3",
    iconColor: "#ec4899",
    valueColor: "#ec4899",
  },
];

export default function StatsCards({ overview }: StatsCardsProps) {
  return (
    <View style={styles.statsGrid}>
      {statsConfig.map((stat) => (
        <View key={stat.key} style={[styles.statCard, { backgroundColor: "#fff" }]}>
          <View style={[styles.statIconContainer, { backgroundColor: stat.iconBg }]}>
            <Ionicons name={stat.icon as any} size={24} color={stat.iconColor} />
          </View>
          <Text style={styles.statLabel}>{stat.label}</Text>
          <Text style={[styles.statValue, { color: stat.valueColor }]}>
            {(overview?.[stat.key] as number) || 0}
          </Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  statCard: {
    width: (width - 44) / 2,
    borderRadius: 12,
    padding: 16,
    gap: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  statIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  statLabel: {
    fontSize: 13,
    color: "#6b7280",
    fontWeight: "500",
  },
  statValue: {
    fontSize: 28,
    fontWeight: "700",
  },
});