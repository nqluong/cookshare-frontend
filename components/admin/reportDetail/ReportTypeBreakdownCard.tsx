import { StyleSheet, Text, View } from "react-native";
import { Colors } from "../../../styles/colors";
import { ReportType } from "../../../types/admin/groupedReport.types";
import { ReportTypeBreakdown } from "../../admin/reports";

interface ReportTypeBreakdownCardProps {
  breakdown?: Record<string, number>;
  mostSevereType: ReportType;
}

export default function ReportTypeBreakdownCard({
  breakdown,
  mostSevereType,
}: ReportTypeBreakdownCardProps) {
  // Don't render if no breakdown data
  if (!breakdown) {
    return null;
  }

  return (
    <View style={styles.card}>
      <Text style={styles.sectionTitle}>Phân loại báo cáo</Text>
      <ReportTypeBreakdown
        breakdown={breakdown}
        mostSevereType={mostSevereType}
        compact={false}
      />
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
});
