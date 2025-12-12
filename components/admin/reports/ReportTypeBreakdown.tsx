import { StyleSheet, Text, View } from "react-native";
import {
    REPORT_TYPE_COLORS,
    REPORT_TYPE_LABELS,
    ReportType
} from "../../../types/admin/groupedReport.types";

interface ReportTypeBreakdownProps {
  breakdown: { [key in ReportType]?: number };
  mostSevereType: ReportType;
  compact?: boolean;
}

export default function ReportTypeBreakdown({ 
  breakdown, 
  mostSevereType,
  compact = false 
}: ReportTypeBreakdownProps) {
  // Handle undefined or empty breakdown
  if (!breakdown || Object.keys(breakdown).length === 0) {
    return null;
  }

  const sortedTypes = Object.entries(breakdown)
    .sort(([, a], [, b]) => (b || 0) - (a || 0));
  
  if (compact) {
    const mainType = sortedTypes[0];
    const otherCount = sortedTypes.slice(1).reduce((sum, [, count]) => sum + (count || 0), 0);
    
    return (
      <View style={styles.compactContainer}>
        <View 
          style={[
            styles.compactBadge, 
            { backgroundColor: REPORT_TYPE_COLORS[mainType[0] as ReportType] }
          ]}
        >
          <Text style={styles.compactBadgeText}>
            {REPORT_TYPE_LABELS[mainType[0] as ReportType]}({mainType[1]})
          </Text>
        </View>
        {otherCount > 0 && (
          <Text style={styles.otherCount}>+{otherCount}</Text>
        )}
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {sortedTypes.map(([type, count]) => (
        <View 
          key={type} 
          style={[
            styles.typeBadge,
            { 
              backgroundColor: REPORT_TYPE_COLORS[type as ReportType] + '20',
              borderColor: REPORT_TYPE_COLORS[type as ReportType],
            }
          ]}
        >
          <View 
            style={[
              styles.typeIndicator, 
              { backgroundColor: REPORT_TYPE_COLORS[type as ReportType] }
            ]} 
          />
          <Text 
            style={[
              styles.typeText, 
              { color: REPORT_TYPE_COLORS[type as ReportType] }
            ]}
          >
            {REPORT_TYPE_LABELS[type as ReportType]}: {count}
          </Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  typeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    gap: 4,
  },
  typeIndicator: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  typeText: {
    fontSize: 11,
    fontWeight: '500',
  },
  compactContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  compactBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  compactBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  otherCount: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280',
  },
});
