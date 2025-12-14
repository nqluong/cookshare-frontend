// components/admin/reports/ReportDetailModal.tsx
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { moderateScale, scale, verticalScale } from "react-native-size-matters";
import { adminGroupedReportService } from "../../../services/adminGroupedReportService";
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

interface ReportDetailModalProps {
  visible: boolean;
  reportId: string | null;
  onClose: () => void;
}

export default function ReportDetailModal({
  visible,
  reportId,
  onClose,
}: ReportDetailModalProps) {
  const [report, setReport] = useState<ProcessedReport | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const insets = useSafeAreaInsets();

  useEffect(() => {
    if (visible && reportId) {
      loadReportDetail();
    }
  }, [visible, reportId]);

  const loadReportDetail = async () => {
    if (!reportId) return;
    
    setLoading(true);
    setError(null);
    try {
      const data = await adminGroupedReportService.getIndividualReportDetail(reportId);
      setReport(data);
    } catch (err: any) {
      setError(err.message || "Không thể tải chi tiết báo cáo");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setReport(null);
    setError(null);
    onClose();
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const renderContent = () => {
    if (loading) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#10B981" />
          <Text style={styles.loadingText}>Đang tải chi tiết báo cáo...</Text>
        </View>
      );
    }

    if (error) {
      return (
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={scale(48)} color="#EF4444" />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={loadReportDetail}>
            <Text style={styles.retryButtonText}>Thử lại</Text>
          </TouchableOpacity>
        </View>
      );
    }

    if (!report) return null;

    const statusColor = REPORT_STATUS_COLORS[report.status];
    const statusLabel = REPORT_STATUS_LABELS[report.status];
    const typeColor = REPORT_TYPE_COLORS[report.reportType];
    const typeLabel = REPORT_TYPE_LABELS[report.reportType];
    const reporter = report.reporter;
    const recipe = report.reportedRecipe;
    const reportedUser = report.reportedUser;
    const reviewer = report.reviewer;

    return (
      <ScrollView 
        style={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: verticalScale(24) }}
      >
        {/* Status & Type */}
        <View style={styles.statusRow}>
          <View style={[styles.statusBadge, { backgroundColor: statusColor }]}>
            <Ionicons
              name={report.status === "RESOLVED" ? "checkmark-circle" : 
                    report.status === "REJECTED" ? "close-circle" : "time"}
              size={scale(16)}
              color="#FFFFFF"
            />
            <Text style={styles.statusText}>{statusLabel}</Text>
          </View>
          <View style={[styles.typeBadge, { backgroundColor: `${typeColor}20` }]}>
            <Text style={[styles.typeText, { color: typeColor }]}>{typeLabel}</Text>
          </View>
        </View>

        {/* Recipe Info */}
        {recipe && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Công thức bị báo cáo</Text>
            <View style={styles.recipeCard}>
              <View style={styles.recipeImageContainer}>
                {recipe.featuredImage ? (
                  <Image
                    source={{ uri: recipe.featuredImage }}
                    style={styles.recipeImage}
                    contentFit="cover"
                  />
                ) : (
                  <View style={styles.recipeImagePlaceholder}>
                    <Ionicons name="image-outline" size={scale(32)} color={Colors.text.light} />
                  </View>
                )}
              </View>
              <View style={styles.recipeInfo}>
                <Text style={styles.recipeTitle}>{recipe.title}</Text>
                <Text style={styles.recipeAuthor}>
                  Tác giả: @{recipe.authorUsername}
                </Text>
                <View style={styles.recipeStats}>
                  <View style={styles.statItem}>
                    <Ionicons name="eye-outline" size={scale(14)} color={Colors.text.light} />
                    <Text style={styles.statText}>{recipe.viewCount} lượt xem</Text>
                  </View>
                  <View style={[
                    styles.recipeStatusBadge,
                    { backgroundColor: recipe.isPublished ? "#10B98120" : "#F59E0B20" }
                  ]}>
                    <Text style={[
                      styles.recipeStatusText,
                      { color: recipe.isPublished ? "#10B981" : "#F59E0B" }
                    ]}>
                      {recipe.isPublished ? "Đã xuất bản" : "Chưa xuất bản"}
                    </Text>
                  </View>
                </View>
              </View>
            </View>
          </View>
        )}

        {/* Reporter Info */}
        {reporter && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Người báo cáo</Text>
            <View style={styles.userCard}>
              <View style={styles.userAvatar}>
                {reporter.avatarUrl ? (
                  <Image
                    source={{ uri: reporter.avatarUrl }}
                    style={styles.avatarImage}
                    contentFit="cover"
                  />
                ) : (
                  <Ionicons name="person" size={scale(24)} color={Colors.text.light} />
                )}
              </View>
              <View style={styles.userInfo}>
                <Text style={styles.userName}>
                  {reporter.fullName || reporter.username}
                </Text>
                <Text style={styles.userUsername}>@{reporter.username}</Text>
              </View>
            </View>
          </View>
        )}

        {/* Reported User Info */}
        {reportedUser && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Người bị báo cáo</Text>
            <View style={styles.userCard}>
              <View style={styles.userAvatar}>
                {reportedUser.avatarUrl ? (
                  <Image
                    source={{ uri: reportedUser.avatarUrl }}
                    style={styles.avatarImage}
                    contentFit="cover"
                  />
                ) : (
                  <Ionicons name="person" size={scale(24)} color={Colors.text.light} />
                )}
              </View>
              <View style={styles.userInfo}>
                <Text style={styles.userName}>
                  {reportedUser.username}
                </Text>
                <Text style={styles.userEmail}>{reportedUser.email}</Text>
                <View style={styles.userBadges}>
                  <View style={[
                    styles.roleBadge,
                    { backgroundColor: reportedUser.role === "ADMIN" ? "#8B5CF620" : "#3B82F620" }
                  ]}>
                    <Text style={[
                      styles.roleText,
                      { color: reportedUser.role === "ADMIN" ? "#8B5CF6" : "#3B82F6" }
                    ]}>
                      {reportedUser.role}
                    </Text>
                  </View>
                  <View style={[
                    styles.activeBadge,
                    { backgroundColor: reportedUser.isActive ? "#10B98120" : "#EF444420" }
                  ]}>
                    <Text style={[
                      styles.activeText,
                      { color: reportedUser.isActive ? "#10B981" : "#EF4444" }
                    ]}>
                      {reportedUser.isActive ? "Hoạt động" : "Bị khóa"}
                    </Text>
                  </View>
                </View>
              </View>
            </View>
          </View>
        )}

        {/* Report Details */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Chi tiết báo cáo</Text>
          <View style={styles.detailCard}>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Lý do:</Text>
              <Text style={styles.detailValue}>{report.reason}</Text>
            </View>
            {report.description && (
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Mô tả:</Text>
                <Text style={styles.detailValueMultiline}>{report.description}</Text>
              </View>
            )}
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Thời gian tạo:</Text>
              <Text style={styles.detailValue}>{formatDateTime(report.createdAt)}</Text>
            </View>
          </View>
        </View>

        {/* Action Taken */}
        {report.actionTaken && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Hành động đã thực hiện</Text>
            <View style={[
              styles.actionCard,
              { borderLeftColor: REPORT_ACTION_TYPE_COLORS[report.actionTaken] }
            ]}>
              <View style={styles.actionHeader}>
                <Ionicons 
                  name="hammer" 
                  size={scale(18)} 
                  color={REPORT_ACTION_TYPE_COLORS[report.actionTaken]} 
                />
                <Text style={[
                  styles.actionType,
                  { color: REPORT_ACTION_TYPE_COLORS[report.actionTaken] }
                ]}>
                  {REPORT_ACTION_TYPE_LABELS[report.actionTaken]}
                </Text>
              </View>
              {report.actionDescription && (
                <Text style={styles.actionDescription}>{report.actionDescription}</Text>
              )}
            </View>
          </View>
        )}

        {/* Admin Note */}
        {report.adminNote && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Ghi chú Admin</Text>
            <View style={styles.noteCard}>
              <Ionicons name="document-text-outline" size={scale(18)} color="#6B7280" />
              <Text style={styles.noteText}>{report.adminNote}</Text>
            </View>
          </View>
        )}

        {/* Reviewer Info */}
        {reviewer && report.reviewedAt && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Thông tin xử lý</Text>
            <View style={styles.reviewerCard}>
              <View style={styles.reviewerRow}>
                <Ionicons name="shield-checkmark" size={scale(18)} color="#10B981" />
                <Text style={styles.reviewerLabel}>Xử lý bởi:</Text>
                <Text style={styles.reviewerName}>
                  {reviewer.fullName || reviewer.username}
                </Text>
              </View>
              <View style={styles.reviewerRow}>
                <Ionicons name="time-outline" size={scale(18)} color="#6B7280" />
                <Text style={styles.reviewerLabel}>Thời gian:</Text>
                <Text style={styles.reviewerTime}>
                  {formatDateTime(report.reviewedAt)}
                </Text>
              </View>
            </View>
          </View>
        )}
      </ScrollView>
    );
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={handleClose}
    >
      <View style={styles.overlay}>
        <View style={[styles.container, { paddingBottom: Math.max(scale(20), insets.bottom) }]}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerContent}>
              <Ionicons name="document-text" size={scale(24)} color="#10B981" />
              <Text style={styles.title}>Chi tiết báo cáo</Text>
            </View>
            <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
              <Ionicons name="close" size={scale(24)} color={Colors.text.primary} />
            </TouchableOpacity>
          </View>

          {renderContent()}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  container: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: scale(24),
    borderTopRightRadius: scale(24),
    maxHeight: "95%",
    minHeight: verticalScale(450),
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: scale(20),
    paddingVertical: verticalScale(14),
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: scale(10),
  },
  title: {
    fontSize: moderateScale(18),
    fontWeight: "600",
    color: Colors.text.primary,
  },
  closeButton: {
    padding: scale(6),
  },
  loadingContainer: {
    padding: scale(60),
    alignItems: "center",
    gap: verticalScale(12),
  },
  loadingText: {
    fontSize: moderateScale(14),
    color: Colors.text.secondary,
  },
  errorContainer: {
    padding: scale(60),
    alignItems: "center",
    gap: verticalScale(12),
  },
  errorText: {
    fontSize: moderateScale(14),
    color: "#EF4444",
    textAlign: "center",
  },
  retryButton: {
    paddingHorizontal: scale(20),
    paddingVertical: verticalScale(10),
    backgroundColor: "#10B981",
    borderRadius: scale(8),
  },
  retryButtonText: {
    fontSize: moderateScale(14),
    fontWeight: "600",
    color: "#FFFFFF",
  },
  scrollContent: {
    flex: 1,
  },
  statusRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: scale(10),
    paddingHorizontal: scale(20),
    paddingVertical: verticalScale(14),
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: scale(12),
    paddingVertical: verticalScale(6),
    borderRadius: scale(16),
    gap: scale(6),
  },
  statusText: {
    fontSize: moderateScale(14),
    fontWeight: "600",
    color: "#FFFFFF",
  },
  typeBadge: {
    paddingHorizontal: scale(10),
    paddingVertical: verticalScale(6),
    borderRadius: scale(8),
  },
  typeText: {
    fontSize: moderateScale(13),
    fontWeight: "500",
  },
  section: {
    paddingHorizontal: scale(20),
    paddingBottom: verticalScale(16),
  },
  sectionTitle: {
    fontSize: moderateScale(13),
    fontWeight: "600",
    color: Colors.text.secondary,
    marginBottom: verticalScale(10),
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  recipeCard: {
    flexDirection: "row",
    backgroundColor: Colors.gray[50],
    borderRadius: scale(12),
    padding: scale(12),
    gap: scale(12),
  },
  recipeImageContainer: {
    width: scale(85),
    height: scale(85),
    borderRadius: scale(8),
    overflow: "hidden",
  },
  recipeImage: {
    width: "100%",
    height: "100%",
  },
  recipeImagePlaceholder: {
    width: "100%",
    height: "100%",
    backgroundColor: "#E5E7EB",
    alignItems: "center",
    justifyContent: "center",
  },
  recipeInfo: {
    flex: 1,
    gap: verticalScale(4),
  },
  recipeTitle: {
    fontSize: moderateScale(15),
    fontWeight: "600",
    color: Colors.text.primary,
  },
  recipeAuthor: {
    fontSize: moderateScale(13),
    color: Colors.text.secondary,
  },
  recipeStats: {
    flexDirection: "row",
    alignItems: "center",
    gap: scale(10),
    marginTop: verticalScale(4),
  },
  statItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: scale(4),
  },
  statText: {
    fontSize: moderateScale(12),
    color: Colors.text.light,
  },
  recipeStatusBadge: {
    paddingHorizontal: scale(8),
    paddingVertical: verticalScale(2),
    borderRadius: scale(4),
  },
  recipeStatusText: {
    fontSize: moderateScale(11),
    fontWeight: "500",
  },
  userCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.gray[50],
    borderRadius: scale(12),
    padding: scale(12),
    gap: scale(12),
  },
  userAvatar: {
    width: scale(50),
    height: scale(50),
    borderRadius: scale(25),
    backgroundColor: "#E5E7EB",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  avatarImage: {
    width: "100%",
    height: "100%",
  },
  userInfo: {
    flex: 1,
    gap: verticalScale(2),
  },
  userName: {
    fontSize: moderateScale(15),
    fontWeight: "600",
    color: Colors.text.primary,
  },
  userUsername: {
    fontSize: moderateScale(13),
    color: Colors.text.secondary,
  },
  userEmail: {
    fontSize: moderateScale(12),
    color: Colors.text.light,
  },
  userBadges: {
    flexDirection: "row",
    gap: scale(8),
    marginTop: verticalScale(4),
  },
  roleBadge: {
    paddingHorizontal: scale(8),
    paddingVertical: verticalScale(2),
    borderRadius: scale(4),
  },
  roleText: {
    fontSize: moderateScale(11),
    fontWeight: "500",
  },
  activeBadge: {
    paddingHorizontal: scale(8),
    paddingVertical: verticalScale(2),
    borderRadius: scale(4),
  },
  activeText: {
    fontSize: moderateScale(11),
    fontWeight: "500",
  },
  detailCard: {
    backgroundColor: Colors.gray[50],
    borderRadius: scale(12),
    padding: scale(14),
    gap: verticalScale(12),
  },
  detailRow: {
    gap: verticalScale(4),
  },
  detailLabel: {
    fontSize: moderateScale(12),
    fontWeight: "500",
    color: Colors.text.secondary,
  },
  detailValue: {
    fontSize: moderateScale(14),
    color: Colors.text.primary,
  },
  detailValueMultiline: {
    fontSize: moderateScale(14),
    color: Colors.text.primary,
    lineHeight: verticalScale(22),
  },
  actionCard: {
    backgroundColor: Colors.gray[50],
    borderRadius: scale(12),
    padding: scale(14),
    borderLeftWidth: scale(4),
    gap: verticalScale(8),
  },
  actionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: scale(8),
  },
  actionType: {
    fontSize: moderateScale(15),
    fontWeight: "600",
  },
  actionDescription: {
    fontSize: moderateScale(14),
    color: Colors.text.secondary,
    lineHeight: verticalScale(22),
  },
  noteCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: Colors.gray[50],
    borderRadius: scale(12),
    padding: scale(14),
    gap: scale(10),
  },
  noteText: {
    flex: 1,
    fontSize: moderateScale(14),
    color: Colors.text.primary,
    lineHeight: verticalScale(22),
  },
  reviewerCard: {
    backgroundColor: Colors.gray[50],
    borderRadius: scale(12),
    padding: scale(14),
    gap: verticalScale(10),
  },
  reviewerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: scale(8),
  },
  reviewerLabel: {
    fontSize: moderateScale(13),
    color: Colors.text.secondary,
  },
  reviewerName: {
    fontSize: moderateScale(14),
    fontWeight: "600",
    color: "#10B981",
  },
  reviewerTime: {
    fontSize: moderateScale(14),
    color: Colors.text.primary,
  },
});
