// components/admin/reports/IndividualReportList.tsx
import { Ionicons } from "@expo/vector-icons";
import { useEffect, useRef } from "react";
import {
  ActivityIndicator,
  Animated,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Colors } from "../../../styles/colors";
import { ProcessedReport } from "../../../types/admin/groupedReport.types";
import IndividualReportCard from "./IndividualReportCard";

interface IndividualReportListProps {
  reports: ProcessedReport[];
  loading: boolean;
  refreshing: boolean;
  error: string | null;
  totalElements: number;
  hasMore: boolean;
  bottomInset?: number;
  onRefresh: () => void;
  onLoadMore: () => void;
  onViewDetail?: (reportId: string) => void;
  onRetry: () => void;
}

export default function IndividualReportList({
  reports,
  loading,
  refreshing,
  error,
  totalElements,
  hasMore,
  bottomInset = 0,
  onRefresh,
  onLoadMore,
  onViewDetail,
  onRetry,
}: IndividualReportListProps) {
  // Animation cho fade in - chỉ animate lần đầu
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const hasAnimated = useRef(false);

  useEffect(() => {
    // Chỉ animate lần đầu tiên khi có data
    if (!loading && reports.length > 0 && !hasAnimated.current) {
      hasAnimated.current = true;
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
    
    // Reset khi refresh
    if (refreshing) {
      hasAnimated.current = false;
      fadeAnim.setValue(0);
    }
  }, [loading, reports.length, refreshing]);

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
          colors={["#10B981"]}
          tintColor="#10B981"
        />
      }
      onScroll={({ nativeEvent }) => {
        const { layoutMeasurement, contentOffset, contentSize } = nativeEvent;
        const isCloseToBottom =
          layoutMeasurement.height + contentOffset.y >= contentSize.height - 20;
        if (isCloseToBottom && hasMore && !loading) {
          onLoadMore();
        }
      }}
      scrollEventThrottle={400}
    >
      {reports.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="document-outline" size={64} color="#9CA3AF" />
          <Text style={styles.emptyTitle}>Không có báo cáo</Text>
          <Text style={styles.emptyText}>
            Chưa có báo cáo nào với trạng thái này
          </Text>
        </View>
      ) : (
        <Animated.View style={{ opacity: fadeAnim }}>

          {reports.map((report, index) => (
            <IndividualReportCard
              key={`${report.reportId}-${index}-${report.createdAt || Date.now()}`}
              report={report}
              onViewDetail={onViewDetail}
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
        </Animated.View>
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
    justifyContent: "center",
    alignItems: "center",
    padding: 40,
    gap: 12,
  },
  loadingText: {
    fontSize: 14,
    color: Colors.text.secondary,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 40,
    gap: 12,
  },
  errorText: {
    fontSize: 14,
    color: "#EF4444",
    textAlign: "center",
  },
  retryButton: {
    fontSize: 14,
    color: "#3B82F6",
    fontWeight: "600",
    marginTop: 8,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 60,
    gap: 12,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: Colors.text.primary,
  },
  emptyText: {
    fontSize: 14,
    color: Colors.text.secondary,
    textAlign: "center",
  },
  summaryContainer: {
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  summaryText: {
    fontSize: 13,
    color: Colors.text.secondary,
  },
  loadingMoreContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
    gap: 8,
  },
  loadingMoreText: {
    fontSize: 13,
    color: Colors.text.secondary,
  },
  endContainer: {
    alignItems: "center",
    padding: 16,
  },
  endText: {
    fontSize: 13,
    color: Colors.text.light,
    fontStyle: "italic",
  },
});
