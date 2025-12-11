// components/admin/reports/ReportStatsBar.tsx
import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, Text, View } from "react-native";
import { Colors } from "../../../styles/colors";

interface ReportStatsBarProps {
  totalPending: number;
  totalElements: number;
}

export default function ReportStatsBar({ 
  totalPending, 
  totalElements 
}: ReportStatsBarProps) {
  return (
    <View style={styles.container}>
      <View style={styles.statItem}>
        <Ionicons name="notifications" size={18} color="#DC2626" />
        <Text style={styles.statValue}>{totalPending}</Text>
        <Text style={styles.statLabel}>đang chờ</Text>
      </View>
      
      <View style={styles.divider} />
      
      <View style={styles.statItem}>
        <Ionicons name="stats-chart" size={18} color="#3B82F6" />
        <Text style={styles.statValue}>{totalElements}</Text>
        <Text style={styles.statLabel}>tổng cộng</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    paddingVertical: 12,
    paddingHorizontal: 20,
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 8,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text.primary,
  },
  statLabel: {
    fontSize: 14,
    color: Colors.text.secondary,
  },
  divider: {
    width: 1,
    height: 24,
    backgroundColor: Colors.border,
    marginHorizontal: 20,
  },
});
