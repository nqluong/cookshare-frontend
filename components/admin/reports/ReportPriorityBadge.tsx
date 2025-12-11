// components/admin/reports/ReportPriorityBadge.tsx
import { StyleSheet, Text, View } from "react-native";
import {
    REPORT_PRIORITY_CONFIG,
    ReportPriority
} from "../../../types/admin/groupedReport.types";

interface ReportPriorityBadgeProps {
  priority: ReportPriority;
  showIcon?: boolean;
  size?: 'small' | 'medium' | 'large';
}

export default function ReportPriorityBadge({ 
  priority, 
  showIcon = true,
  size = 'medium' 
}: ReportPriorityBadgeProps) {
  const config = REPORT_PRIORITY_CONFIG[priority];
  
  const sizeStyles = {
    small: { paddingHorizontal: 6, paddingVertical: 2, fontSize: 10 },
    medium: { paddingHorizontal: 8, paddingVertical: 4, fontSize: 12 },
    large: { paddingHorizontal: 12, paddingVertical: 6, fontSize: 14 },
  };

  return (
    <View 
      style={[
        styles.container, 
        { 
          backgroundColor: config.backgroundColor,
          paddingHorizontal: sizeStyles[size].paddingHorizontal,
          paddingVertical: sizeStyles[size].paddingVertical,
        }
      ]}
    >
      {showIcon && <Text style={styles.icon}>{config.icon}</Text>}
      <Text 
        style={[
          styles.label, 
          { color: config.color, fontSize: sizeStyles[size].fontSize }
        ]}
      >
        {config.label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 20,
    gap: 4,
  },
  icon: {
    fontSize: 10,
  },
  label: {
    fontWeight: '600',
  },
});
