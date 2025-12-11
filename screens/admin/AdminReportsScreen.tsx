// screens/admin/AdminReportsScreen.tsx
import { router, useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import { StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import AdminHeader from "../../components/admin/management/AdminHeader";
import {
    GroupedReportList,
    ReportActionModal,
    ReportFilterModal,
    ReportStatsBar,
} from "../../components/admin/reports";
import CustomAlert from "../../components/ui/CustomAlert";
import { useCustomAlert } from "../../hooks/useCustomAlert";
import { adminGroupedReportService } from "../../services/adminGroupedReportService";
import {
    GroupedReport,
    ReportPriority,
    ReportType,
} from "../../types/admin/groupedReport.types";

interface Filters {
  priority?: ReportPriority;
  reportType?: ReportType;
}

export default function AdminReportsScreen() {
  // State
  const [reports, setReports] = useState<GroupedReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [totalElements, setTotalElements] = useState(0);

  // Filter state
  const [filters, setFilters] = useState<Filters>({});
  const [showFilterModal, setShowFilterModal] = useState(false);

  // Action modal state
  const [showActionModal, setShowActionModal] = useState(false);
  const [selectedReport, setSelectedReport] = useState<GroupedReport | null>(null);

  // Custom alert
  const { alert, showSuccess, showError, hideAlert } = useCustomAlert();

  // Load reports
  const loadReports = useCallback(
    async (page: number = 0, reset: boolean = true) => {
      try {
        if (reset) {
          setLoading(true);
          setError(null);
        } else {
          setLoading(true);
        }

        const response = await adminGroupedReportService.getGroupedReports(
          page,
          20,
          filters.priority,
          filters.reportType
        );

        if (reset) {
          setReports(response.content);
        } else {
          setReports((prev) => [...prev, ...response.content]);
        }

        setCurrentPage(page);
        setHasMore(page < response.totalPages - 1);
        setTotalElements(response.totalElements);
      } catch (err: any) {
        setError(err.message || "Không thể tải danh sách báo cáo");
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [filters]
  );

  // Focus effect - reload when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      loadReports(0, true);
    }, [loadReports])
  );

  // Handlers
  const handleExitAdmin = () => {
    router.replace("/(tabs)/home" as any);
  };

  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    loadReports(0, true);
  }, [loadReports]);

  const handleLoadMore = useCallback(() => {
    if (!loading && hasMore && !refreshing) {
      loadReports(currentPage + 1, false);
    }
  }, [loadReports, currentPage, loading, hasMore, refreshing]);

  const handleViewDetails = (report: GroupedReport) => {
    // Navigate to report details screen
    router.push(`/admin/reports/${report.recipeId}` as any);
  };

  const handleTakeAction = (report: GroupedReport) => {
    setSelectedReport(report);
    setShowActionModal(true);
  };

  const handleAction = async (
    recipeId: string,
    action: "DISMISS" | "WARN_USER" | "HIDE_RECIPE" | "DELETE_RECIPE" | "BAN_USER",
    reason?: string
  ) => {
    try {
      await adminGroupedReportService.handleReport(recipeId, action, reason);
      showSuccess("Thành công", "Đã xử lý báo cáo thành công");
      loadReports(0, true);
    } catch (err: any) {
      showError("Lỗi", err.message || "Không thể xử lý báo cáo");
      throw err;
    }
  };

  const handleApplyFilters = (newFilters: Filters) => {
    setFilters(newFilters);
    setCurrentPage(0);
  };

  const handleFilterPress = () => {
    setShowFilterModal(true);
  };

  // Calculate pending count (reports with CRITICAL or HIGH priority)
  const pendingCount = reports.filter(
    (r) => r.priority === "CRITICAL" || r.priority === "HIGH"
  ).length;

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <AdminHeader
        title="🛡️ Quản lý báo cáo"
        onBack={() => router.back()}
        onExitAdmin={handleExitAdmin}
        onFilterPress={handleFilterPress}
      />

      <View style={styles.content}>
        {/* Stats Bar */}
        <ReportStatsBar
          totalPending={pendingCount}
          totalElements={totalElements}
        />

        {/* Report List */}
        <View style={styles.listSection}>
          <GroupedReportList
            reports={reports}
            loading={loading}
            refreshing={refreshing}
            error={error}
            totalElements={totalElements}
            hasMore={hasMore}
            onRefresh={handleRefresh}
            onLoadMore={handleLoadMore}
            onViewDetails={handleViewDetails}
            onTakeAction={handleTakeAction}
            onRetry={() => loadReports(0, true)}
          />
        </View>
      </View>

      {/* Filter Modal */}
      <ReportFilterModal
        visible={showFilterModal}
        onClose={() => setShowFilterModal(false)}
        onApply={handleApplyFilters}
        currentFilters={filters}
      />

      {/* Action Modal */}
      <ReportActionModal
        visible={showActionModal}
        report={selectedReport}
        onClose={() => {
          setShowActionModal(false);
          setSelectedReport(null);
        }}
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
  content: {
    flex: 1,
  },
  listSection: {
    flex: 1,
    backgroundColor: "#f0fdf4",
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    paddingTop: 8,
  },
});
