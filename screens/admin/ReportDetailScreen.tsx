// screens/admin/ReportDetailScreen.tsx
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { router } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
    ActivityIndicator,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import AdminHeader from "../../components/admin/management/AdminHeader";
import {
    ReportActionModal,
    ReportPriorityBadge,
    ReportTypeBreakdown,
} from "../../components/admin/reports";
import CustomAlert from "../../components/ui/CustomAlert";
import { useCustomAlert } from "../../hooks/useCustomAlert";
import { adminGroupedReportService } from "../../services/adminGroupedReportService";
import { Colors } from "../../styles/colors";
import {
    GroupedReport,
    REPORT_PRIORITY_CONFIG,
} from "../../types/admin/groupedReport.types";

interface ReportDetailScreenProps {
  recipeId: string;
}

export default function ReportDetailScreen({ recipeId }: ReportDetailScreenProps) {
  const [report, setReport] = useState<GroupedReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showActionModal, setShowActionModal] = useState(false);

  const { alert, showSuccess, showError, hideAlert } = useCustomAlert();

  const loadReportDetails = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await adminGroupedReportService.getReportDetails(recipeId);
      setReport(data);
    } catch (err: any) {
      setError(err.message || "Không thể tải chi tiết báo cáo");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [recipeId]);

  useEffect(() => {
    if (recipeId) {
      loadReportDetails();
    }
  }, [recipeId, loadReportDetails]);

  const handleRefresh = () => {
    setRefreshing(true);
    loadReportDetails();
  };

  const handleAction = async (
    recipeId: string,
    action: "DISMISS" | "WARN_USER" | "HIDE_RECIPE" | "DELETE_RECIPE" | "BAN_USER",
    reason?: string
  ) => {
    try {
      await adminGroupedReportService.handleReport(recipeId, action, reason);
      showSuccess("Thành công", "Đã xử lý báo cáo thành công");
      router.back();
    } catch (err: any) {
      showError("Lỗi", err.message || "Không thể xử lý báo cáo");
      throw err;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading && !report) {
    return (
      <SafeAreaView style={styles.container} edges={["top"]}>
        <AdminHeader title="Chi tiết báo cáo" onBack={() => router.back()} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#10B981" />
          <Text style={styles.loadingText}>Đang tải...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container} edges={["top"]}>
        <AdminHeader title="Chi tiết báo cáo" onBack={() => router.back()} />
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={48} color="#EF4444" />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={loadReportDetails}>
            <Text style={styles.retryButtonText}>Thử lại</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  if (!report) return null;

  const priorityConfig = REPORT_PRIORITY_CONFIG[report.priority];

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <AdminHeader title="Chi tiết báo cáo" onBack={() => router.back()} />

      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={["#10B981"]}
            tintColor="#10B981"
          />
        }
      >
        {/* Priority Banner */}
        <View
          style={[styles.priorityBanner, { backgroundColor: priorityConfig.backgroundColor }]}
        >
          <Text style={styles.priorityIcon}>{priorityConfig.icon}</Text>
          <Text style={[styles.priorityText, { color: priorityConfig.color }]}>
            Mức độ: {priorityConfig.label}
          </Text>
        </View>

        {/* Recipe Card */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Công thức bị báo cáo</Text>
          <View style={styles.recipeRow}>
            {report.recipeThumbnail ? (
              <Image
                source={{ uri: report.recipeThumbnail }}
                style={styles.recipeThumbnail}
                contentFit="cover"
              />
            ) : (
              <View style={styles.thumbnailPlaceholder}>
                <Ionicons name="image-outline" size={32} color={Colors.text.light} />
              </View>
            )}
            <View style={styles.recipeInfo}>
              <Text style={styles.recipeTitle}>{report.recipeTitle}</Text>
              <View style={styles.authorRow}>
                {report.authorAvatarUrl ? (
                  <Image
                    source={{ uri: report.authorAvatarUrl }}
                    style={styles.authorAvatar}
                    contentFit="cover"
                  />
                ) : (
                  <View style={styles.avatarPlaceholder}>
                    <Ionicons name="person" size={14} color={Colors.text.light} />
                  </View>
                )}
                <View>
                  <Text style={styles.authorName}>{report.authorFullName}</Text>
                  <Text style={styles.authorUsername}>@{report.authorUsername}</Text>
                </View>
              </View>
            </View>
          </View>
        </View>

        {/* Report Statistics */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Thống kê báo cáo</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statBox}>
              <Ionicons name="flag" size={24} color="#EF4444" />
              <Text style={styles.statValue}>{report.reportCount}</Text>
              <Text style={styles.statLabel}>Báo cáo</Text>
            </View>
            <View style={styles.statBox}>
              <Ionicons name="analytics" size={24} color="#3B82F6" />
              <Text style={styles.statValue}>{report.weightedScore.toFixed(1)}</Text>
              <Text style={styles.statLabel}>Điểm</Text>
            </View>
            <View style={styles.statBox}>
              <ReportPriorityBadge priority={report.priority} size="small" />
              <Text style={[styles.statValue, { marginTop: 4 }]}>
                {report.exceedsThreshold ? "Có" : "Không"}
              </Text>
              <Text style={styles.statLabel}>Vượt ngưỡng</Text>
            </View>
          </View>
        </View>

        {/* Report Types Breakdown */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Phân loại báo cáo</Text>
          <ReportTypeBreakdown
            breakdown={report.reportTypeBreakdown}
            mostSevereType={report.mostSevereType}
            compact={false}
          />
        </View>

        {/* Timeline */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Thời gian</Text>
          <View style={styles.timelineRow}>
            <Ionicons name="time-outline" size={18} color={Colors.text.secondary} />
            <View style={styles.timelineInfo}>
              <Text style={styles.timelineLabel}>Báo cáo đầu tiên</Text>
              <Text style={styles.timelineValue}>
                {formatDate(report.oldestReportTime)}
              </Text>
            </View>
          </View>
          <View style={styles.timelineRow}>
            <Ionicons name="alarm-outline" size={18} color="#EF4444" />
            <View style={styles.timelineInfo}>
              <Text style={styles.timelineLabel}>Báo cáo gần nhất</Text>
              <Text style={styles.timelineValue}>
                {formatDate(report.latestReportTime)}
              </Text>
            </View>
          </View>
        </View>

        {/* Top Reporters */}
        {report.topReporters && report.topReporters.length > 0 && (
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Người báo cáo hàng đầu</Text>
            <View style={styles.reportersList}>
              {report.topReporters.map((reporter, index) => (
                <View key={index} style={styles.reporterChip}>
                  <Ionicons name="person-circle-outline" size={16} color={Colors.text.secondary} />
                  <Text style={styles.reporterName}>{reporter}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Action Button */}
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => setShowActionModal(true)}
        >
          <Ionicons name="hammer" size={20} color="#FFFFFF" />
          <Text style={styles.actionButtonText}>Xử lý báo cáo này</Text>
        </TouchableOpacity>

        <View style={styles.bottomPadding} />
      </ScrollView>

      {/* Action Modal */}
      <ReportActionModal
        visible={showActionModal}
        report={report}
        onClose={() => setShowActionModal(false)}
        onAction={handleAction}
      />

      {/* Custom Alert */}
      <CustomAlert
        visible={alert.visible}
        title={alert.title}
        message={alert.message}
        type={alert.type}
        buttons={alert.buttons}
        onClose={hideAlert}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#10b981",
  },
  scrollView: {
    flex: 1,
    backgroundColor: "#f0fdf4",
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
  },
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f0fdf4",
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: Colors.text.secondary,
  },
  errorContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f0fdf4",
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    paddingHorizontal: 20,
  },
  errorText: {
    marginTop: 12,
    fontSize: 16,
    color: Colors.text.secondary,
    textAlign: "center",
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: "#10B981",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  priorityBanner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 12,
    gap: 8,
  },
  priorityIcon: {
    fontSize: 20,
  },
  priorityText: {
    fontSize: 16,
    fontWeight: "600",
  },
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
  recipeRow: {
    flexDirection: "row",
    gap: 14,
  },
  recipeThumbnail: {
    width: 100,
    height: 100,
    borderRadius: 12,
  },
  thumbnailPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 12,
    backgroundColor: Colors.gray[100],
    alignItems: "center",
    justifyContent: "center",
  },
  recipeInfo: {
    flex: 1,
    justifyContent: "center",
  },
  recipeTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: Colors.text.primary,
    marginBottom: 10,
  },
  authorRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  authorAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
  },
  avatarPlaceholder: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.gray[100],
    alignItems: "center",
    justifyContent: "center",
  },
  authorName: {
    fontSize: 14,
    fontWeight: "500",
    color: Colors.text.primary,
  },
  authorUsername: {
    fontSize: 12,
    color: Colors.text.secondary,
  },
  statsGrid: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
  statBox: {
    alignItems: "center",
    paddingVertical: 8,
  },
  statValue: {
    fontSize: 24,
    fontWeight: "700",
    color: Colors.text.primary,
    marginTop: 6,
  },
  statLabel: {
    fontSize: 12,
    color: Colors.text.secondary,
    marginTop: 2,
  },
  timelineRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray[100],
  },
  timelineInfo: {
    flex: 1,
  },
  timelineLabel: {
    fontSize: 12,
    color: Colors.text.secondary,
  },
  timelineValue: {
    fontSize: 14,
    fontWeight: "500",
    color: Colors.text.primary,
    marginTop: 2,
  },
  reportersList: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  reporterChip: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.gray[50],
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 6,
  },
  reporterName: {
    fontSize: 13,
    color: Colors.text.secondary,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#10B981",
    marginHorizontal: 16,
    marginTop: 24,
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  bottomPadding: {
    height: 40,
  },
});
