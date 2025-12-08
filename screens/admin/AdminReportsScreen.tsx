import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
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
import { adminReportService } from "../../services/adminReportService";
import { ReportStatus, ReportType } from "../../services/reportService";

interface Report {
  reportId: string;
  reportType: ReportType;
  reason: string;
  description?: string;
  status: ReportStatus;
  createdAt: string;
  reporter: {
    userId: string;
    username: string;
    fullName: string;
  };
  reportedRecipe?: {
    recipeId: string;
    title: string;
  };
  reportedUser?: {
    userId: string;
    username: string;
  };
}

interface PageResponse {
  content: Report[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}

export default function AdminReportsScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [reports, setReports] = useState<Report[]>([]);
  const [filter, setFilter] = useState<ReportStatus | "ALL">("ALL");
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    reviewed: 0,
    resolved: 0,
    rejected: 0,
  });

  useEffect(() => {
    fetchReports();
    fetchStatistics();
  }, [filter, page]);

  const fetchStatistics = async () => {
    try {
      const data = await adminReportService.getReportStatistics();
      setStats({
        total: data.totalReports,
        pending: data.pendingReports,
        reviewed: data.reviewedReports,
        resolved: data.resolvedReports,
        rejected: data.rejectedReports,
      });
    } catch (error) {
      console.log("Lỗi tải thống kê:", error);
    }
  };

  const fetchReports = async () => {
    try {
      setLoading(true);
      const response = await adminReportService.getReports({
        status: filter === "ALL" ? undefined : filter,
        page,
        size: 20,
        sortBy: "createdAt",
        sortDirection: "DESC",
      });
      setReports(response.content);
      setTotalPages(response.totalPages);
      setTotalElements(response.totalElements);
    } catch (error) {
      console.log("Lỗi tải báo cáo:", error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    setPage(0);
    await Promise.all([fetchReports(), fetchStatistics()]);
    setRefreshing(false);
  };

  const getStatusColor = (status: ReportStatus) => {
    switch (status) {
      case ReportStatus.PENDING:
        return "#ef4444";
      case ReportStatus.REVIEWED:
        return "#f59e0b";
      case ReportStatus.RESOLVED:
        return "#10b981";
      case ReportStatus.REJECTED:
        return "#6b7280";
      default:
        return "#6b7280";
    }
  };

  const getStatusLabel = (status: ReportStatus) => {
    switch (status) {
      case ReportStatus.PENDING:
        return "Chờ xử lý";
      case ReportStatus.REVIEWED:
        return "Đã xem";
      case ReportStatus.RESOLVED:
        return "Đã giải quyết";
      case ReportStatus.REJECTED:
        return "Từ chối";
      default:
        return status;
    }
  };

  const getReportTypeLabel = (type: ReportType) => {
    switch (type) {
      case ReportType.SPAM:
        return "Spam";
      case ReportType.INAPPROPRIATE:
        return "Không phù hợp";
      case ReportType.COPYRIGHT:
        return "Bản quyền";
      case ReportType.HARASSMENT:
        return "Quấy rối";
      case ReportType.FAKE:
        return "Giả mạo";
      case ReportType.MISLEADING:
        return "Sai lệch";
      case ReportType.OTHER:
        return "Khác";
      default:
        return type;
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

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <Text style={styles.headerTitle}>Quản lý Báo cáo</Text>
          <TouchableOpacity
            style={styles.exitButton}
            onPress={() => router.push("/(tabs)/home")}
          >
            <Ionicons name="exit-outline" size={24} color="#10b981" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Stats Cards */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.statsContainer}
        contentContainerStyle={styles.statsContent}
      >
        <TouchableOpacity
          style={[
            styles.statCard,
            filter === "ALL" && styles.statCardActive,
          ]}
          onPress={() => setFilter("ALL")}
        >
          <Ionicons name="flag" size={24} color="#10b981" />
          <Text style={styles.statValue}>{stats.total}</Text>
          <Text style={styles.statLabel}>Tất cả</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.statCard,
            filter === ReportStatus.PENDING && styles.statCardActive,
          ]}
          onPress={() => setFilter(ReportStatus.PENDING)}
        >
          <Ionicons name="time" size={24} color="#ef4444" />
          <Text style={styles.statValue}>{stats.pending}</Text>
          <Text style={styles.statLabel}>Chờ xử lý</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.statCard,
            filter === ReportStatus.REVIEWED && styles.statCardActive,
          ]}
          onPress={() => setFilter(ReportStatus.REVIEWED)}
        >
          <Ionicons name="eye" size={24} color="#f59e0b" />
          <Text style={styles.statValue}>{stats.reviewed}</Text>
          <Text style={styles.statLabel}>Đã xem</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.statCard,
            filter === ReportStatus.RESOLVED && styles.statCardActive,
          ]}
          onPress={() => setFilter(ReportStatus.RESOLVED)}
        >
          <Ionicons name="checkmark-circle" size={24} color="#10b981" />
          <Text style={styles.statValue}>{stats.resolved}</Text>
          <Text style={styles.statLabel}>Đã giải quyết</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Reports List */}
      <ScrollView
        style={styles.listContainer}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={["#10b981"]}
            tintColor="#10b981"
          />
        }
      >
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#10b981" />
            <Text style={styles.loadingText}>Đang tải báo cáo...</Text>
          </View>
        ) : reports.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="document-text-outline" size={64} color="#d1d5db" />
            <Text style={styles.emptyText}>Không có báo cáo</Text>
          </View>
        ) : (
          <>
            <Text style={styles.totalText}>
              Tổng số: {totalElements} báo cáo (Trang {page + 1}/{totalPages})
            </Text>
            {reports.map((report) => (
            <TouchableOpacity
              key={report.reportId}
              style={styles.reportCard}
              onPress={() =>
                router.push(`/admin/reports/${report.reportId}` as any)
              }
            >
              <View style={styles.reportHeader}>
                <View style={styles.reportHeaderLeft}>
                  <View
                    style={[
                      styles.statusBadge,
                      { backgroundColor: getStatusColor(report.status) + "20" },
                    ]}
                  >
                    <Text
                      style={[
                        styles.statusText,
                        { color: getStatusColor(report.status) },
                      ]}
                    >
                      {getStatusLabel(report.status)}
                    </Text>
                  </View>
                  <View style={styles.typeBadge}>
                    <Text style={styles.typeText}>
                      {getReportTypeLabel(report.reportType)}
                    </Text>
                  </View>
                </View>
                <Text style={styles.reportDate}>{formatDate(report.createdAt)}</Text>
              </View>

              <Text style={styles.reportReason}>{report.reason}</Text>

              {report.description && (
                <Text style={styles.reportDescription} numberOfLines={2}>
                  {report.description}
                </Text>
              )}

              <View style={styles.reportFooter}>
                <View style={styles.reporterInfo}>
                  <Ionicons name="person-outline" size={16} color="#6b7280" />
                  <Text style={styles.reporterText}>
                    {report.reporter.username}
                  </Text>
                </View>

                {report.reportedRecipe && (
                  <View style={styles.targetInfo}>
                    <Ionicons name="document-text-outline" size={16} color="#6b7280" />
                    <Text style={styles.targetText} numberOfLines={1}>
                      {report.reportedRecipe.title}
                    </Text>
                  </View>
                )}

                {report.reportedUser && (
                  <View style={styles.targetInfo}>
                    <Ionicons name="person-circle-outline" size={16} color="#6b7280" />
                    <Text style={styles.targetText}>
                      {report.reportedUser.username}
                    </Text>
                  </View>
                )}
              </View>

              <Ionicons
                name="chevron-forward"
                size={20}
                color="#d1d5db"
                style={styles.chevron}
              />
              </TouchableOpacity>
            ))}

            {/* Pagination */}
            <View style={styles.pagination}>
              <TouchableOpacity
                style={[
                  styles.pageButton,
                  page === 0 && styles.pageButtonDisabled,
                ]}
                onPress={() => setPage(page - 1)}
                disabled={page === 0}
              >
                <Ionicons
                  name="chevron-back"
                  size={20}
                  color={page === 0 ? "#d1d5db" : "#10b981"}
                />
                <Text
                  style={[
                    styles.pageButtonText,
                    page === 0 && styles.pageButtonTextDisabled,
                  ]}
                >
                  Trang trước
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.pageButton,
                  page >= totalPages - 1 && styles.pageButtonDisabled,
                ]}
                onPress={() => setPage(page + 1)}
                disabled={page >= totalPages - 1}
              >
                <Text
                  style={[
                    styles.pageButtonText,
                    page >= totalPages - 1 && styles.pageButtonTextDisabled,
                  ]}
                >
                  Trang sau
                </Text>
                <Ionicons
                  name="chevron-forward"
                  size={20}
                  color={page >= totalPages - 1 ? "#d1d5db" : "#10b981"}
                />
              </TouchableOpacity>
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f9fafb",
  },
  header: {
    backgroundColor: "#fff",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  headerTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#111827",
  },
  exitButton: {
    padding: 8,
  },
  statsContainer: {
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  statsContent: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    gap: 12,
  },
  statCard: {
    backgroundColor: "#f9fafb",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    minWidth: 100,
    borderWidth: 2,
    borderColor: "transparent",
  },
  statCardActive: {
    borderColor: "#10b981",
    backgroundColor: "#d1f4e0",
  },
  statValue: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#111827",
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    color: "#6b7280",
    marginTop: 4,
  },
  listContainer: {
    flex: 1,
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 60,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: "#6b7280",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 60,
  },
  emptyText: {
    marginTop: 12,
    fontSize: 16,
    color: "#6b7280",
  },
  reportCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    position: "relative",
  },
  reportHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  reportHeaderLeft: {
    flexDirection: "row",
    gap: 8,
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "600",
  },
  typeBadge: {
    backgroundColor: "#f3f4f6",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  typeText: {
    fontSize: 12,
    color: "#6b7280",
    fontWeight: "500",
  },
  reportDate: {
    fontSize: 12,
    color: "#9ca3af",
  },
  reportReason: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 8,
  },
  reportDescription: {
    fontSize: 14,
    color: "#6b7280",
    lineHeight: 20,
    marginBottom: 12,
  },
  reportFooter: {
    flexDirection: "row",
    gap: 16,
    flexWrap: "wrap",
  },
  reporterInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  reporterText: {
    fontSize: 13,
    color: "#6b7280",
  },
  targetInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    flex: 1,
  },
  targetText: {
    fontSize: 13,
    color: "#6b7280",
    flex: 1,
  },
  chevron: {
    position: "absolute",
    right: 16,
    top: "50%",
    marginTop: -10,
  },
  totalText: {
    fontSize: 14,
    color: "#6b7280",
    marginBottom: 12,
    textAlign: "center",
  },
  pagination: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 20,
    gap: 12,
  },
  pageButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#10b981",
    gap: 8,
    flex: 1,
    justifyContent: "center",
  },
  pageButtonDisabled: {
    backgroundColor: "#f9fafb",
    borderColor: "#e5e7eb",
  },
  pageButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#10b981",
  },
  pageButtonTextDisabled: {
    color: "#d1d5db",
  },
});
