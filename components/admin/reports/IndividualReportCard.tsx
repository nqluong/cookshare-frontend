// components/admin/reports/IndividualReportCard.tsx
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Colors } from "../../../styles/colors";
import {
    ProcessedReport,
    REPORT_ACTION_TYPE_COLORS,
    REPORT_ACTION_TYPE_LABELS,
    REPORT_STATUS_COLORS,
    REPORT_STATUS_LABELS,
    REPORT_TYPE_COLORS,
    REPORT_TYPE_LABELS,
} from "../../../types/admin/groupedReport.types";

interface IndividualReportCardProps {
  report: ProcessedReport;
  onViewDetail?: (reportId: string) => void;
}

export default function IndividualReportCard({
  report,
  onViewDetail,
}: IndividualReportCardProps) {
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
    return "Vừa xong";
  };

  const statusColor = REPORT_STATUS_COLORS[report.status];
  const statusLabel = REPORT_STATUS_LABELS[report.status];
  const typeColor = REPORT_TYPE_COLORS[report.reportType];
  const typeLabel = REPORT_TYPE_LABELS[report.reportType];

  // Extract data from nested objects
  const reporter = report.reporter;
  const recipe = report.reportedRecipe;
  const reviewer = report.reviewer;

  return (
    <View style={[styles.container, { borderLeftColor: statusColor }]}>
      {/* Header với Status Badge */}
      <View style={styles.header}>
        <View style={[styles.statusBadge, { backgroundColor: statusColor }]}>
          <Ionicons
            name={report.status === "RESOLVED" ? "checkmark-circle" : "close-circle"}
            size={14}
            color="#FFFFFF"
          />
          <Text style={styles.statusText}>{statusLabel}</Text>
        </View>

        <View style={[styles.typeBadge, { backgroundColor: `${typeColor}20` }]}>
          <Text style={[styles.typeText, { color: typeColor }]}>{typeLabel}</Text>
        </View>
      </View>

      {/* Content - Recipe Info */}
      <View style={styles.content}>
        {/* Thumbnail */}
        <View style={styles.thumbnailContainer}>
          {recipe?.featuredImage ? (
            <Image
              source={{ uri: recipe.featuredImage }}
              style={styles.thumbnail}
              contentFit="cover"
            />
          ) : (
            <View style={styles.thumbnailPlaceholder}>
              <Ionicons name="image-outline" size={24} color={Colors.text.light} />
            </View>
          )}
        </View>

        {/* Report Details */}
        <View style={styles.details}>
          <Text style={styles.recipeTitle} numberOfLines={2}>
            {recipe?.title || "Công thức không xác định"}
          </Text>

          {/* Reporter Info */}
          <View style={styles.reporterRow}>
            <View style={styles.reporterAvatar}>
              {reporter?.avatarUrl ? (
                <Image
                  source={{ uri: reporter.avatarUrl }}
                  style={styles.avatarImage}
                  contentFit="cover"
                />
              ) : (
                <Ionicons name="person" size={12} color={Colors.text.light} />
              )}
            </View>
            <Text style={styles.reporterName}>
              Báo cáo bởi: {reporter?.fullName || reporter?.username || "Ẩn danh"}
            </Text>
          </View>

          {/* Reason */}
          {report.reason && (
            <Text style={styles.reason} numberOfLines={2}>
              {report.reason}
            </Text>
          )}

          {/* Action taken */}
          {report.actionTaken && (
            <View style={styles.actionRow}>
              <Ionicons name="hammer-outline" size={14} color="#6B7280" />
              <Text
                style={[
                  styles.actionText,
                  { color: REPORT_ACTION_TYPE_COLORS[report.actionTaken] },
                ]}
              >
                {REPORT_ACTION_TYPE_LABELS[report.actionTaken]}
              </Text>
            </View>
          )}

          {/* Reviewer Info */}
          {reviewer && (
            <View style={styles.reviewerRow}>
              <Ionicons name="shield-checkmark-outline" size={14} color="#10B981" />
              <Text style={styles.reviewerText}>
                Xử lý bởi: {reviewer.fullName || reviewer.username}
              </Text>
            </View>
          )}

          {/* Time Info */}
          <View style={styles.timeRow}>
            <Text style={styles.timeInfo}>
              Tạo: {formatTimeAgo(report.createdAt)}
            </Text>
            {report.reviewedAt && (
              <Text style={styles.timeInfo}>
                • Xử lý: {formatTimeAgo(report.reviewedAt)}
              </Text>
            )}
          </View>
        </View>
      </View>

      {/* Admin Note */}
      {report.adminNote && (
        <View style={styles.adminNoteContainer}>
          <Ionicons name="document-text-outline" size={14} color="#6B7280" />
          <Text style={styles.adminNoteText} numberOfLines={2}>
            {report.adminNote}
          </Text>
        </View>
      )}

      {/* Action Buttons */}
      {onViewDetail && (
        <View style={styles.actions}>
          <TouchableOpacity
            style={styles.viewButton}
            onPress={() => onViewDetail(report.reportId)}
          >
            <Ionicons name="document-text-outline" size={16} color="#3B82F6" />
            <Text style={styles.viewButtonText}>Xem chi tiết</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    marginHorizontal: 16,
    marginVertical: 6,
    padding: 12,
    borderLeftWidth: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    gap: 8,
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  typeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  typeText: {
    fontSize: 11,
    fontWeight: "500",
  },
  content: {
    flexDirection: "row",
    gap: 12,
  },
  thumbnailContainer: {
    width: 70,
    height: 70,
    borderRadius: 8,
    overflow: "hidden",
    backgroundColor: "#F3F4F6",
  },
  thumbnail: {
    width: "100%",
    height: "100%",
  },
  thumbnailPlaceholder: {
    width: "100%",
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#E5E7EB",
  },
  details: {
    flex: 1,
    gap: 4,
  },
  recipeTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.text.primary,
    lineHeight: 20,
  },
  reporterRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 2,
  },
  reporterAvatar: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "#E5E7EB",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  avatarImage: {
    width: "100%",
    height: "100%",
  },
  reporterName: {
    fontSize: 12,
    color: Colors.text.secondary,
    flex: 1,
  },
  reason: {
    fontSize: 12,
    color: Colors.text.secondary,
    fontStyle: "italic",
    marginTop: 4,
  },
  actionRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 4,
  },
  actionText: {
    fontSize: 12,
    fontWeight: "500",
  },
  timeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 4,
  },
  timeInfo: {
    fontSize: 11,
    color: Colors.text.light,
  },
  reviewerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 4,
  },
  reviewerText: {
    fontSize: 12,
    color: "#10B981",
    fontWeight: "500",
  },
  adminNoteContainer: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 6,
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
  },
  adminNoteText: {
    flex: 1,
    fontSize: 12,
    color: Colors.text.secondary,
    lineHeight: 18,
  },
  actions: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
    flexDirection: "row",
    justifyContent: "flex-end",
  },
  viewButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: "#EFF6FF",
  },
  viewButtonText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#3B82F6",
  },
});
