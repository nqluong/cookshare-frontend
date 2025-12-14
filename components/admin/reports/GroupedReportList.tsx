// components/admin/reports/GroupedReportList.tsx
import { Ionicons } from "@expo/vector-icons";
import { ActivityIndicator, RefreshControl, ScrollView, StyleSheet, Text, View } from "react-native";
import { Colors } from "../../../styles/colors";
import { GroupedReport } from "../../../types/admin/groupedReport.types";
import GroupedReportCard from "./GroupedReportCard";

interface GroupedReportListProps {
  reports: GroupedReport[];
  loading: boolean;
  refreshing: boolean;
  error: string | null;
  totalElements: number;
  hasMore: boolean;
  bottomInset?: number;
  onRefresh: () => void;
  onLoadMore: () => void;
  onViewDetails: (report: GroupedReport) => void;
  onTakeAction: (report: GroupedReport) => void;
  onRetry: () => void;
}

export default function GroupedReportList({
  reports,
  loading,
  refreshing,
  error,
  totalElements,
  hasMore,
  bottomInset = 0,
  onRefresh,
  onLoadMore,
  onViewDetails,
  onTakeAction,
  onRetry,
}: GroupedReportListProps) {
  if (loading && reports.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#10B981" />
        <Text style={styles.loadingText}>Đang tải danh sách báo cáo...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="alert-circle-outline" size={48} color="#ef4444" />
        <Text style={styles.errorText}>{error}</Text>
        <Text style={styles.retryButton} onPress={onRetry}>
          Thử lại
        </Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.scrollView}
      contentContainerStyle={{ paddingBottom: bottomInset + 16 }}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl 
          refreshing={refreshing} 
          onRefresh={onRefresh}
          colors={['#10B981']}
          tintColor="#10B981"
        />
      }
      onScroll={({ nativeEvent }) => {
        const { layoutMeasurement, contentOffset, contentSize } = nativeEvent;
        const isCloseToBottom = layoutMeasurement.height + contentOffset.y >= contentSize.height - 20;
        if (isCloseToBottom && hasMore && !loading) {
          onLoadMore();
        }
      }}
      scrollEventThrottle={400}
    >
      {reports.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="checkmark-circle-outline" size={64} color="#10B981" />
          <Text style={styles.emptyTitle}>Không có báo cáo</Text>
          <Text style={styles.emptyText}>
            Hiện tại không có báo cáo nào cần xử lý
          </Text>
        </View>
      ) : (
        <>
          <View style={styles.summaryContainer}>
            <Text style={styles.summaryText}>
              Hiển thị {reports.length} / {totalElements} báo cáo
            </Text>
          </View>
          
          {reports.map((report) => (
            <GroupedReportCard
              key={report.recipeId}
              report={report}
              onViewDetails={onViewDetails}
              onTakeAction={onTakeAction}
            />
          ))}
          
          {loading && reports.length > 0 && (
            <View style={styles.loadingMoreContainer}>
              <ActivityIndicator size="small" color="#10B981" />
              <Text style={styles.loadingMoreText}>Đang tải thêm...</Text>
            </View>
          )}
          
          {!hasMore && reports.length > 0 && (
            <View style={styles.endContainer}>
              <Text style={styles.endText}>Đã hiển thị tất cả báo cáo</Text>
            </View>
          )}
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 40,
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
    paddingVertical: 40,
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
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
    overflow: "hidden",
  },
  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
    paddingHorizontal: 40,
  },
  emptyTitle: {
    marginTop: 16,
    fontSize: 20,
    fontWeight: '600',
    color: Colors.text.primary,
  },
  emptyText: {
    marginTop: 8,
    fontSize: 14,
    color: Colors.text.secondary,
    textAlign: 'center',
  },
  summaryContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  summaryText: {
    fontSize: 13,
    color: Colors.text.secondary,
  },
  loadingMoreContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 20,
  },
  loadingMoreText: {
    marginLeft: 8,
    fontSize: 14,
    color: Colors.text.secondary,
  },
  endContainer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  endText: {
    fontSize: 13,
    color: Colors.text.light,
  },
});
