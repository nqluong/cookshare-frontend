// components/admin/reports/GroupedReportCard.tsx
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Colors } from "../../../styles/colors";
import {
  GroupedReport,
  REPORT_PRIORITY_CONFIG
} from "../../../types/admin/groupedReport.types";
import ReportPriorityBadge from "./ReportPriorityBadge";
import ReportTypeBreakdown from "./ReportTypeBreakdown";

interface GroupedReportCardProps {
  report: GroupedReport;
  onViewDetails: (report: GroupedReport) => void;
  onTakeAction: (report: GroupedReport) => void;
}

export default function GroupedReportCard({ 
  report, 
  onViewDetails, 
  onTakeAction 
}: GroupedReportCardProps) {
  const priorityConfig = REPORT_PRIORITY_CONFIG[report.priority];
  
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

  return (
    <View 
      style={[
        styles.container,
        { borderLeftColor: priorityConfig.backgroundColor }
      ]}
    >
      {/* Header với Priority Badge */}
      <View style={styles.header}>
        <ReportPriorityBadge priority={report.priority} size="medium" />
        {report.exceedsThreshold && (
          <View style={styles.thresholdBadge}>
            <Ionicons name="warning" size={12} color="#DC2626" />
            <Text style={styles.thresholdText}>Vượt ngưỡng</Text>
          </View>
        )}
        {report.autoActioned && (
          <View style={styles.autoActionBadge}>
            <Ionicons name="flash" size={12} color="#F59E0B" />
            <Text style={styles.autoActionText}>Tự động</Text>
          </View>
        )}
      </View>

      {/* Content - Recipe Info */}
      <View style={styles.content}>
        {/* Thumbnail */}
        <View style={styles.thumbnailContainer}>
          {report.recipeFeaturedImage ? (
            <Image
              source={{ uri: report.recipeFeaturedImage }}
              style={styles.thumbnail}
              contentFit="cover"
            />
          ) : (
            <View style={styles.thumbnailPlaceholder}>
              <Ionicons name="image-outline" size={24} color={Colors.text.light} />
            </View>
          )}
        </View>

        {/* Recipe Details */}
        <View style={styles.details}>
          <Text style={styles.recipeTitle} numberOfLines={2}>
            {report.recipeTitle}
          </Text>
          
          {/* Author Info */}
          <View style={styles.authorRow}>
            <View style={styles.authorAvatar}>
              {report.authorAvatarUrl ? (
                <Image
                  source={{ uri: report.authorAvatarUrl }}
                  style={styles.avatarImage}
                  contentFit="cover"
                />
              ) : (
                <Ionicons name="person" size={12} color={Colors.text.light} />
              )}
            </View>
            <Text style={styles.authorName}>{report.authorFullName}</Text>
          </View>

          {/* Report Stats */}
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Ionicons name="flag" size={14} color="#DC2626" />
              <Text style={styles.statText}>{report.reportCount} báo cáo</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Ionicons name="analytics" size={14} color="#3B82F6" />
              <Text style={styles.statText}>{report.weightedScore.toFixed(1)} pts</Text>
            </View>
          </View>

          {/* Report Type Breakdown */}
          <ReportTypeBreakdown 
            breakdown={report.reportTypeBreakdown}
            mostSevereType={report.mostSevereType}
            compact={true}
          />

          {/* Time Info */}
          <Text style={styles.timeInfo}>
            Báo cáo gần nhất: {formatTimeAgo(report.latestReportTime)}
          </Text>
        </View>
      </View>

      {/* Top Reporters */}
      {report.topReporters && report.topReporters.length > 0 && (
        <View style={styles.reportersRow}>
          <Text style={styles.reportersLabel}>Người báo cáo: </Text>
          <Text style={styles.reportersList} numberOfLines={1}>
            {report.topReporters.slice(0, 3).join(', ')}
            {report.topReporters.length > 3 && ` +${report.topReporters.length - 3}`}
          </Text>
        </View>
      )}

      {/* Action Buttons */}
      <View style={styles.actions}>
        <TouchableOpacity 
          style={styles.detailButton}
          onPress={() => onViewDetails(report)}
        >
          <Ionicons name="eye-outline" size={16} color="#3B82F6" />
          <Text style={styles.detailButtonText}>Chi tiết</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[
            styles.actionButton,
            report.priority === 'CRITICAL' && styles.actionButtonUrgent
          ]}
          onPress={() => onTakeAction(report)}
        >
          <Ionicons 
            name="hammer-outline" 
            size={16} 
            color={report.priority === 'CRITICAL' ? '#FFFFFF' : '#10B981'} 
          />
          <Text 
            style={[
              styles.actionButtonText,
              report.priority === 'CRITICAL' && styles.actionButtonTextUrgent
            ]}
          >
            Xử lý
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginHorizontal: 16,
    marginVertical: 6,
    padding: 12,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  thresholdBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEE2E2',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    gap: 2,
  },
  thresholdText: {
    fontSize: 10,
    fontWeight: '500',
    color: '#DC2626',
  },
  autoActionBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    gap: 2,
  },
  autoActionText: {
    fontSize: 10,
    fontWeight: '500',
    color: '#D97706',
  },
  content: {
    flexDirection: 'row',
    gap: 12,
  },
  thumbnailContainer: {
    width: 80,
    height: 80,
    borderRadius: 8,
    overflow: 'hidden',
  },
  thumbnail: {
    width: '100%',
    height: '100%',
  },
  thumbnailPlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: Colors.gray[100],
    alignItems: 'center',
    justifyContent: 'center',
  },
  details: {
    flex: 1,
    gap: 6,
  },
  recipeTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.text.primary,
    lineHeight: 20,
  },
  authorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  authorAvatar: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: Colors.gray[100],
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
  authorName: {
    fontSize: 12,
    color: Colors.text.secondary,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statText: {
    fontSize: 12,
    fontWeight: '500',
    color: Colors.text.secondary,
  },
  statDivider: {
    width: 1,
    height: 12,
    backgroundColor: Colors.border,
  },
  timeInfo: {
    fontSize: 11,
    color: Colors.text.light,
    marginTop: 2,
  },
  reportersRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: Colors.gray[100],
  },
  reportersLabel: {
    fontSize: 11,
    color: Colors.text.light,
  },
  reportersList: {
    flex: 1,
    fontSize: 11,
    color: Colors.text.secondary,
  },
  actions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.gray[100],
  },
  detailButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#3B82F6',
    gap: 6,
  },
  detailButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#3B82F6',
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: '#D1FAE5',
    gap: 6,
  },
  actionButtonUrgent: {
    backgroundColor: '#DC2626',
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#10B981',
  },
  actionButtonTextUrgent: {
    color: '#FFFFFF',
  },
});
