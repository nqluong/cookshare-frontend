import { router, useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import { StatusBar, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

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
  ReportActionType,
  ReportStatus,
  ReportType,
  ReviewReportRequest,
} from "../../types/admin/groupedReport.types";

interface Filters {
  reportType?: ReportType;
  status?: ReportStatus;
  actionType?: ReportActionType;
}

interface StatCount {
  total: number;
  pending: number;
  resolved: number;
  rejected: number;
}

export default function AdminReportsScreen() {
  // State
  const [reports, setReports] = useState<GroupedReport[]>([]);
  const [statCount, setStatCount] = useState<StatCount | null>(null);
  const [loading, setLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [totalElements, setTotalElements] = useState(0);

  // Filter state
  const [activeStatusFilter, setActiveStatusFilter] = useState<ReportStatus | 'ALL'>('ALL');
  const [filters, setFilters] = useState<Filters>({});
  const [showFilterModal, setShowFilterModal] = useState(false);

  // Action modal state
  const [showActionModal, setShowActionModal] = useState(false);
  const [selectedReport, setSelectedReport] = useState<GroupedReport | null>(null);

  // Custom alert
  const { alert, showSuccess, showError, hideAlert } = useCustomAlert();

  // Load statistics (only counts)
  const loadStatistics = useCallback(async () => {
    try {
      setStatsLoading(true);
      const stats = await adminGroupedReportService.getReportStatistics();
      setStatCount({
        total: stats.totalReports,
        pending: stats.pendingReports,
        resolved: stats.resolvedReports,
        rejected: stats.rejectedReports,
      });
    } catch (err: any) {
      console.error("Error loading statistics:", err);
    } finally {
      setStatsLoading(false);
    }
  }, []);

  // Load reports
  const loadReports = useCallback(
    async (page: number = 0, reset: boolean = true, statusFilter?: ReportStatus | 'ALL') => {
      try {
        if (reset) {
          setLoading(true);
          setError(null);
        } else {
          setLoading(true);
        }

        // Determine status filter
        const currentStatus = statusFilter !== undefined ? statusFilter : activeStatusFilter;
        const statusParam = currentStatus === 'ALL' ? undefined : currentStatus;

        const response = await adminGroupedReportService.getGroupedReports(
          page,
          20,
          filters.reportType,
          statusParam,
          filters.actionType
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
    [filters, activeStatusFilter]
  );

  // Focus effect - reload when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      loadStatistics();
      loadReports(0, true, 'ALL');
      setActiveStatusFilter('ALL');
    }, [loadStatistics])
  );

  // Handlers
  const handleExitAdmin = () => {
    router.replace("/(tabs)/home" as any);
  };

  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    loadStatistics();
    loadReports(0, true);
  }, [loadStatistics, loadReports]);

  const handleLoadMore = useCallback(() => {
    if (!loading && hasMore && !refreshing) {
      loadReports(currentPage + 1, false);
    }
  }, [loadReports, currentPage, loading, hasMore, refreshing]);

  const handleViewDetails = (report: GroupedReport) => {
    router.push(`/admin/reports/${report.recipeId}` as any);
  };

  const handleTakeAction = (report: GroupedReport) => {
    setSelectedReport(report);
    setShowActionModal(true);
  };

  const handleAction = async (
    recipeId: string,
    request: ReviewReportRequest
  ) => {
    try {
      const result = await adminGroupedReportService.reviewReport(recipeId, request);
      loadStatistics();
      showSuccess("Thành công", `Đã xử lý ${result.processedCount} báo cáo thành công`);
      loadReports(0, true);
    } catch (err: any) {
      showError("Lỗi", err.message || "Không thể xử lý báo cáo");
      throw err;
    }
  };

  const handleApplyFilters = (newFilters: Filters) => {
    setFilters(newFilters);
    setCurrentPage(0);
    // If status filter from modal is set, update activeStatusFilter
    if (newFilters.status) {
      setActiveStatusFilter(newFilters.status);
    }
    loadReports(0, true);
  };

  const handleFilterPress = () => {
    setShowFilterModal(true);
  };

  // Handler for stats bar filter change
  const handleStatusFilterChange = (status: ReportStatus | 'ALL') => {
    setActiveStatusFilter(status);
    setFilters((prev) => ({
      ...prev,
      status: status === 'ALL' ? undefined : status,
    }));
    setCurrentPage(0);
    loadReports(0, true, status);
  };

  const insets = useSafeAreaInsets();

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#10b981" />
      <View style={[styles.headerWrapper, { paddingTop: insets.top }]}>
        <AdminHeader
          title="🛡️ Quản lý báo cáo"
          onBack={() => router.back()}
          onExitAdmin={handleExitAdmin}
          onFilterPress={handleFilterPress}
        />
      </View>

      <View style={styles.content}>
        {/* Stats Bar - Always visible at top */}
        <ReportStatsBar
          stats={statCount}
          loading={statsLoading}
          activeFilter={activeStatusFilter}
          onFilterChange={handleStatusFilterChange}
        />

        {/* Reports List */}
        <View style={styles.listSection}>
          <GroupedReportList
            reports={reports}
            loading={loading && !refreshing}
            refreshing={refreshing}
            error={error}
            totalElements={totalElements}
            hasMore={hasMore}
            bottomInset={insets.bottom}
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#10b981",
  },
  headerWrapper: {
    backgroundColor: "#ffffffff",
  },
  content: {
    flex: 1,
    backgroundColor: "#f0fdf4",
  },
  listSection: {
    flex: 1,
  },
});
