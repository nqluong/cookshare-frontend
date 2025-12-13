import { Ionicons } from "@expo/vector-icons";
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Layout, moderateScale, scale } from "../../../constants/layout";
import { Colors } from "../../../styles/colors";
import { ReportStatus } from "../../../types/admin/groupedReport.types";

interface StatCount {
  total: number;
  pending: number;
  resolved: number;
  rejected: number;
}

interface ReportStatsBarProps {
  stats: StatCount | null;
  loading?: boolean;
  activeFilter: ReportStatus | 'ALL';
  onFilterChange: (filter: ReportStatus | 'ALL') => void;
}

const STAT_CONFIGS = [
  { key: 'ALL' as const, label: 'Tất cả', icon: 'document-text-outline', color: '#3B82F6', bgColor: '#EFF6FF' },
  { key: 'PENDING' as const, label: 'Đang chờ', icon: 'time-outline', color: '#F59E0B', bgColor: '#FEF3C7' },
  { key: 'RESOLVED' as const, label: 'Đã xử lý', icon: 'checkmark-circle-outline', color: '#10B981', bgColor: '#D1FAE5' },
  { key: 'REJECTED' as const, label: 'Từ chối', icon: 'close-circle-outline', color: '#EF4444', bgColor: '#FEE2E2' },
];

export default function ReportStatsBar({ 
  stats, 
  loading,
  activeFilter,
  onFilterChange
}: ReportStatsBarProps) {
  const getCount = (key: ReportStatus | 'ALL'): number => {
    if (!stats) return 0;
    switch (key) {
      case 'ALL': return stats.total;
      case 'PENDING': return stats.pending;
      case 'RESOLVED': return stats.resolved;
      case 'REJECTED': return stats.rejected;
      default: return 0;
    }
  };

  return (
    <View style={styles.container}>
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color={Colors.primary} />
        </View>
      ) : (
        <View style={styles.statsRow}>
          {STAT_CONFIGS.map((config) => {
            const isActive = activeFilter === config.key;
            return (
              <TouchableOpacity
                key={config.key}
                style={[
                  styles.statCard,
                  { backgroundColor: isActive ? config.color : config.bgColor },
                ]}
                onPress={() => onFilterChange(config.key)}
                activeOpacity={0.7}
              >
                <Ionicons 
                  name={config.icon as any} 
                  size={scale(16)} 
                  color={isActive ? '#FFFFFF' : config.color} 
                />
                <Text style={[
                  styles.statValue,
                  { color: isActive ? '#FFFFFF' : config.color }
                ]}>
                  {getCount(config.key)}
                </Text>
                <Text style={[
                  styles.statLabel,
                  { color: isActive ? '#FFFFFF' : Colors.text.secondary }
                ]} numberOfLines={1}>
                  {config.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: Layout.spacing.md,
    paddingVertical: Layout.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  loadingContainer: {
    paddingVertical: Layout.spacing.md,
    alignItems: 'center',
  },
  statsRow: {
    flexDirection: 'row',
    gap: scale(8),
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: Layout.spacing.sm,
    paddingHorizontal: Layout.spacing.xs,
    borderRadius: Layout.borderRadius.md,
    gap: scale(2),
  },
  statValue: {
    fontSize: moderateScale(16),
    fontWeight: '700',
  },
  statLabel: {
    fontSize: moderateScale(9),
    fontWeight: '500',
    textAlign: 'center',
  },
});

