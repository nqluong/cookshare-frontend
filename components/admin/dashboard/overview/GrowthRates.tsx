// app/admin/components/overview/GrowthRates.tsx
import { RecipeOverviewDTO } from "@/types/admin/report.types";
import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, Text, View } from "react-native";

interface GrowthRatesProps {
  overview: RecipeOverviewDTO | null;
}

const growthPeriods = [
  { key: "growthRateDaily" as keyof RecipeOverviewDTO, label: "Hàng Ngày" },
  { key: "growthRateWeekly" as keyof RecipeOverviewDTO, label: "Hàng Tuần" },
  { key: "growthRateMonthly" as keyof RecipeOverviewDTO, label: "Hàng Tháng" },
];

export default function GrowthRates({ overview }: GrowthRatesProps) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Tốc Độ Tăng Trưởng</Text>
      <View style={styles.growthContainer}>
        {growthPeriods.map((period) => {
          const rate = overview?.[period.key] as number || 0;
          const isPositive = rate >= 0;
          
          return (
            <View key={period.key} style={styles.growthCard}>
              <Ionicons
                name={isPositive ? "trending-up" : "trending-down"}
                size={20}
                color={isPositive ? "#10b981" : "#ef4444"}
              />
              <Text style={styles.growthLabel}>{period.label}</Text>
              <Text style={[styles.growthValue, { color: isPositive ? "#10b981" : "#ef4444" }]}>
                {rate.toFixed(1)}%
              </Text>
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
  growthContainer: {
    flexDirection: "row",
    gap: 12,
  },
  growthCard: {
    flex: 1,
    backgroundColor: "#f9fafb",
    borderRadius: 12,
    padding: 12,
    alignItems: "center",
    gap: 6,
  },
  growthLabel: {
    fontSize: 12,
    color: "#6b7280",
  },
  growthValue: {
    fontSize: 18,
    fontWeight: "700",
  },
});