// screens/admin/ReportDetailScreen.tsx
import { Ionicons } from "@expo/vector-icons";
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
  IndividualReportsList,
  RecipeCard,
  ReportStatistics,
  ReportTypeBreakdownCard,
  ThresholdBanner,
} from "../../components/admin/reportDetail";
import { ReportActionModal } from "../../components/admin/reports";
import CustomAlert from "../../components/ui/CustomAlert";
import { useCustomAlert } from "../../hooks/useCustomAlert";
import { adminGroupedReportService } from "../../services/adminGroupedReportService";
import { Colors } from "../../styles/colors";
import { GroupedReportDetail, ReviewReportRequest } from "../../types/admin/groupedReport.types";

interface ReportDetailScreenProps {
  recipeId: string;
}

export default function ReportDetailScreen({ recipeId }: ReportDetailScreenProps) {
  const [report, setReport] = useState<GroupedReportDetail | null>(null);
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
      console.log(data);
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

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace("/admin/reports" as any);
    }
  };

  const handleAction = async (
    recipeId: string,
    request: ReviewReportRequest
  ) => {
    try {
      const result = await adminGroupedReportService.reviewReport(recipeId, request);
      showSuccess(
        "Thành công", 
        `Đã xử lý ${result.processedCount} báo cáo thành công`
      );
      router.back();
    } catch (err: any) {
      showError("Lỗi", err.message || "Không thể xử lý báo cáo");
      throw err;
    }
  };

  if (loading && !report) {
    return (
      <SafeAreaView style={styles.container} edges={["top"]}>
        <AdminHeader title="Chi tiết báo cáo" onBack={handleBack} />
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
        <AdminHeader title="Chi tiết báo cáo" onBack={handleBack} />
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

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <AdminHeader title="Chi tiết báo cáo" onBack={handleBack} />

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
        {/* Threshold Banner */}
        {report.exceedsThreshold && (
          <ThresholdBanner
            weightedScore={report.weightedScore}
            threshold={report.threshold}
          />
        )}

        {/* Recipe Card */}
        <RecipeCard
          recipeId={report.recipeId}
          recipeTitle={report.recipeTitle}
          recipeThumbnail={report.recipeThumbnail}
          authorFullName={report.authorFullName}
          authorUsername={report.authorUsername}
        />

        {/* Report Statistics */}
        <ReportStatistics
          reportCount={report.reportCount}
          weightedScore={report.weightedScore}
          threshold={report.threshold}
        />

        {/* Report Types Breakdown */}
        <ReportTypeBreakdownCard
          breakdown={report.reportTypeBreakdown}
          mostSevereType={report.mostSevereType}
        />

        {/* Individual Reports List */}
        <IndividualReportsList reports={report.reports || []} />

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
        report={report as any}
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
