import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { router } from "expo-router";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Colors } from "../../../styles/colors";
import {
    IndividualReport,
    REPORT_TYPE_COLORS,
    REPORT_TYPE_LABELS,
} from "../../../types/admin/groupedReport.types";

interface ReportItemCardProps {
  report: IndividualReport;
}

export default function ReportItemCard({ report }: ReportItemCardProps) {
  const typeColor = REPORT_TYPE_COLORS[report.reportType];
  const typeLabel = REPORT_TYPE_LABELS[report.reportType];
  
  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);
    
    if (diffDays > 0) {
      return `${diffDays} ngày trước`;
    }
    if (diffHours > 0) {
      return `${diffHours} giờ trước`;
    }
    return 'Vừa xong';
  };
  
  const navigateToUserDetail = () => {
    if (report.reporterId) {
      router.push(`/admin/users/edit/${report.reporterId}` as any);
    }
  };
  
  return (
    <View style={styles.reportItem}>
      <View style={styles.reportItemHeader}>
        <TouchableOpacity 
          style={styles.reporterInfo}
          onPress={navigateToUserDetail}
          activeOpacity={0.7}
          disabled={!report.reportId}
        >
          {report.reporterAvatar ? (
            <Image
              source={{ uri: report.reporterAvatar }}
              style={styles.reporterAvatar}
              contentFit="cover"
            />
          ) : (
            <View style={styles.reporterAvatarPlaceholder}>
              <Ionicons name="person" size={16} color={Colors.text.light} />
            </View>
          )}
          <View style={styles.reporterDetails}>
            <Text style={styles.reporterName}>{report.reporterFullName}</Text>
            <Text style={styles.reporterUsername}>@{report.reporterUsername}</Text>
          </View>
          {report.reporterId && (
            <Ionicons name="chevron-forward" size={16} color={Colors.text.light} />
          )}
        </TouchableOpacity>
        <View style={[styles.reportTypeBadge, { backgroundColor: typeColor + '20' }]}>
          <View style={[styles.reportTypeDot, { backgroundColor: typeColor }]} />
          <Text style={[styles.reportTypeText, { color: typeColor }]}>{typeLabel}</Text>
        </View>
      </View>
      
      <View style={styles.reportContent}>
        <Text style={styles.reportReason}>{report.reason}</Text>
        {report.description && (
          <Text style={styles.reportDescription} numberOfLines={3}>
            {report.description}
          </Text>
        )}
      </View>
      
      <Text style={styles.reportTime}>
        <Ionicons name="time-outline" size={12} color={Colors.text.light} />
        {' '}{formatTimeAgo(report.createdAt)}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  reportItem: {
    backgroundColor: Colors.gray[50],
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
    borderLeftWidth: 3,
    borderLeftColor: Colors.gray[300],
  },
  reportItemHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 10,
  },
  reporterInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    gap: 10,
  },
  reporterAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  reporterAvatarPlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.gray[200],
    alignItems: "center",
    justifyContent: "center",
  },
  reporterDetails: {
    flex: 1,
  },
  reporterName: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.text.primary,
  },
  reporterUsername: {
    fontSize: 12,
    color: Colors.text.secondary,
  },
  reportTypeBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  reportTypeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  reportTypeText: {
    fontSize: 11,
    fontWeight: "600",
  },
  reportContent: {
    marginBottom: 8,
  },
  reportReason: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.text.primary,
    marginBottom: 4,
  },
  reportDescription: {
    fontSize: 13,
    color: Colors.text.secondary,
    lineHeight: 18,
  },
  reportTime: {
    fontSize: 11,
    color: Colors.text.light,
  },
});
