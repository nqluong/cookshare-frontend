import { router, useFocusEffect } from "expo-router";
import { useCallback, useRef, useState } from "react";
import { Animated, StatusBar, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import AdminHeader from "../../components/admin/management/AdminHeader";
import {
  GroupedReportList,
  IndividualReportList,
  ReportActionModal,
  ReportDetailModal,
  ReportFilterModal,
  ReportStatsBar
} from "../../components/admin/reports";
import CustomAlert from "../../components/ui/CustomAlert";
import { useCustomAlert } from "../../hooks/useCustomAlert";
import { adminGroupedReportService } from "../../services/adminGroupedReportService";
import {
  GroupedReport,
  ProcessedReport,
  ReportActionType,
  ReportStatus,
  ReportType,
  ReviewReportRequest
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
  totalReportedRecipes: number;
  recipesWithPendingReports: number;
}

export default function AdminReportsScreen() {
  // State for grouped reports (ALL, PENDING)
  const [reports, setReports] = useState<GroupedReport[]>([]);
  // State for individual reports (RESOLVED, REJECTED)
  const [individualReports, setIndividualReports] = useState<ProcessedReport[]>([]);
  
  const [statCount, setStatCount] = useState<StatCount | null>(null);
  const [loading, setLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [totalElements, setTotalElements] = useState(0);

  // Animation for transition
  const fadeAnim = useRef(new Animated.Value(1)).current;

  // Filter state
  const [activeStatusFilter, setActiveStatusFilter] = useState<ReportStatus | 'ALL'>('ALL');
  const [filters, setFilters] = useState<Filters>({});
  const [showFilterModal, setShowFilterModal] = useState(false);

  // Action modal state
  const [showActionModal, setShowActionModal] = useState(false);
  const [selectedReport, setSelectedReport] = useState<GroupedReport | null>(null);

  // Detail modal state
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedReportId, setSelectedReportId] = useState<string | null>(null);

  // Custom alert
  const { alert, showSuccess, showError, hideAlert } = useCustomAlert();

  // Check if current filter shows individual reports
  const isIndividualView = activeStatusFilter === 'RESOLVED' || activeStatusFilter === 'REJECTED';

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
        totalReportedRecipes: stats.totalReportedRecipes,
        recipesWithPendingReports: stats.recipesWithPendingReports,
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
        
        // Check if we need individual reports (RESOLVED or REJECTED)
        if (currentStatus === 'RESOLVED' || currentStatus === 'REJECTED') {
          const response = await adminGroupedReportService.getProcessedReports(
            page,
            20,
            currentStatus
          );

          if (reset) {
            setIndividualReports(response.content);
            setReports([]); // Clear grouped reports
          } else {
            setIndividualReports((prev) => [...prev, ...response.content]);
          }

          setCurrentPage(page);
          setHasMore(page < response.totalPages - 1);
          setTotalElements(response.totalElements);
        } else {
          // Grouped reports for ALL or PENDING
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
            setIndividualReports([]); // Clear individual reports
          } else {
            setReports((prev) => [...prev, ...response.content]);
          }

          setCurrentPage(page);
          setHasMore(page < response.totalPages - 1);
          setTotalElements(response.totalElements);
        }
      } catch (err: any) {
        setError(err.message || "Không thể tải danh sách báo cáo");
      } finally {
        setLoading(false);
        setRefreshing(false);
        // Fade in animation after loading
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 250,
          useNativeDriver: true,
        }).start();
      }
    },
    [filters, activeStatusFilter, fadeAnim]
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

  const handleNotificationPress = () => {
    router.push('/admin/notifications' as any);
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
      
      // Reload statistics and reports after successful action
      await loadStatistics();
      
      // Force reload reports with current filter
      await loadReports(0, true, activeStatusFilter);
      
      showSuccess("Thành công", `Đã xử lý báo cáo thành công`);
    } catch (err: any) {
      showError("Lỗi", err.message || "Không thể xử lý báo cáo");
      throw err;
    }
  };

  const handleApplyFilters = (newFilters: Filters) => {
    // Fade out animation first
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 150,
      useNativeDriver: true,
    }).start(() => {
      // Clear data during transition
      setReports([]);
      setIndividualReports([]);
      setFilters(newFilters);
      setCurrentPage(0);
      // If status filter from modal is set, update activeStatusFilter
      if (newFilters.status) {
        setActiveStatusFilter(newFilters.status);
        loadReports(0, true, newFilters.status);
      } else {
        loadReports(0, true, activeStatusFilter);
      }
    });
  };

  const handleFilterPress = () => {
    setShowFilterModal(true);
  };

  // Handler for stats bar filter change
  const handleStatusFilterChange = (status: ReportStatus | 'ALL') => {
    // Fade out animation first
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 150,
      useNativeDriver: true,
    }).start(() => {
      // Clear data during transition
      setReports([]);
      setIndividualReports([]);
      setActiveStatusFilter(status);
      setFilters((prev) => ({
        ...prev,
        status: status === 'ALL' ? undefined : status,
      }));
      setCurrentPage(0);
      loadReports(0, true, status);
    });
  };

  // Handler for viewing report detail
  const handleViewReportDetail = (reportId: string) => {
    console.log('[AdminReportsScreen] View report detail:', reportId);
    setSelectedReportId(reportId);
    setShowDetailModal(true);
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
          onNotificationPress={handleNotificationPress}
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

        {/* Reports List with transition animation */}
        <View style={styles.listSection}>
          <Animated.View style={{ flex: 1, opacity: fadeAnim }}>
            {isIndividualView ? (
              <IndividualReportList
                reports={individualReports}
                loading={loading && !refreshing}
                refreshing={refreshing}
                error={error}
                totalElements={totalElements}
                hasMore={hasMore}
                bottomInset={insets.bottom}
                onRefresh={handleRefresh}
                onLoadMore={handleLoadMore}
                onViewDetail={handleViewReportDetail}
                onRetry={() => loadReports(0, true)}
              />
            ) : (
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
            )}
          </Animated.View>
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

      {/* Detail Modal */}
      <ReportDetailModal
        visible={showDetailModal}
        reportId={selectedReportId}
        onClose={() => {
          setShowDetailModal(false);
          setSelectedReportId(null);
        }}
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
