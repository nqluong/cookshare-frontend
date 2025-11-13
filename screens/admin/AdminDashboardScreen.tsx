// app/admin/dashboard.tsx
import { router } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import CustomAlert from "../../components/ui/CustomAlert";
import { useCustomAlert } from "../../hooks/useCustomAlert";
import AuthorsTab from "../../components/admin/dashboard/AuthorsTab";
import ContentTab from "../../components/admin/dashboard/ContentTab";
import DashboardHeader from "../../components/admin/dashboard/DashboardHeader";
import OverviewTab from "../../components/admin/dashboard/OverviewTab";
import PerformanceTab from "../../components/admin/dashboard/PerformanceTab";
import TabNavigation from "../../components/admin/dashboard/TabNavigation";
import { useAuth } from "../../context/AuthContext";
import adminApi from "../../services/adminReportService";

import {
  CategoryPerformanceDTO,
  RecipeCompletionStatsDTO,
  RecipeContentAnalysisDTO,
  RecipeOverviewDTO,
  RecipePerformanceDTO,
  TimeSeriesStatDTO,
  TopAuthorDTO,
  TrendingRecipeDTO
} from '@/types/admin/report.types';

type TabType = "overview" | "performance" | "content" | "authors";

export default function AdminDashboardScreen() {
  const { user } = useAuth();
  const { alert, showError, hideAlert } = useCustomAlert();
  const [selectedTab, setSelectedTab] = useState<TabType>("overview");
  const [overview, setOverview] = useState<RecipeOverviewDTO | null>(null);
  const [topViewed, setTopViewed] = useState<RecipePerformanceDTO[]>([]);
  const [topLiked, setTopLiked] = useState<RecipePerformanceDTO[]>([]);
  const [topSaved, setTopSaved] = useState<RecipePerformanceDTO[]>([]);
  const [trending, setTrending] = useState<TrendingRecipeDTO[]>([]);
  const [lowPerformance, setLowPerformance] = useState<RecipePerformanceDTO[]>([]);
  const [timeSeries, setTimeSeries] = useState<TimeSeriesStatDTO[]>([]);
  const [contentAnalysis, setContentAnalysis] = useState<RecipeContentAnalysisDTO | null>(null);
  const [topAuthors, setTopAuthors] = useState<TopAuthorDTO[]>([]);
  const [categoryPerformance, setCategoryPerformance] = useState<CategoryPerformanceDTO[]>([]);
  const [completionStats, setCompletionStats] = useState<RecipeCompletionStatsDTO | null>(null);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [timeRangeDays, setTimeRangeDays] = useState<number>(30);

  const handleExitAdmin = () => {
    router.replace("/(tabs)/home" as any);
  };

  const fetchAll = useCallback(async (days = 30) => {
    try {
      setLoading(true);
      const end = new Date();
      const start = new Date();
      start.setDate(end.getDate() - (days - 1));

      const startDate = start.toISOString();
      const endDate = end.toISOString();

      const [ov, tv, tl, ts, tr, lp, tsd, ca, ta, cp, cs] = await Promise.all([
        adminApi.getRecipeOverview(),
        adminApi.getTopViewedRecipes(10),
        adminApi.getTopLikedRecipes(10),
        adminApi.getTopSavedRecipes(10),
        adminApi.getTrendingRecipes(10),
        adminApi.getLowPerformanceRecipes(10),
        adminApi.getTimeSeriesData(startDate, endDate),
        adminApi.getContentAnalysis(),
        adminApi.getTopAuthors(10),
        adminApi.getCategoryPerformance(),
        adminApi.getRecipeCompletionStats(),
      ]);

      setOverview(ov);
      setTopViewed(tv);
      setTopLiked(tl);
      setTopSaved(ts);
      setTrending(tr);
      setLowPerformance(lp);
      setTimeSeries(tsd);
      setContentAnalysis(ca);
      setTopAuthors(ta);
      setCategoryPerformance(cp);
      setCompletionStats(cs);
    } catch (err: any) {
      console.error("Failed to fetch admin data", err);
      showError(
        'Lỗi tải dữ liệu',
        err?.message || 'Không thể tải dữ liệu dashboard. Vui lòng thử lại.'
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAll(timeRangeDays);
  }, [fetchAll, timeRangeDays]);

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await fetchAll(timeRangeDays);
    } finally {
      setRefreshing(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <DashboardHeader onExitAdmin={handleExitAdmin} />

      <TabNavigation selectedTab={selectedTab} onTabChange={setSelectedTab} />

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {loading && !refreshing ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#10b981" />
            <Text style={styles.loadingText}>Đang tải dữ liệu...</Text>
          </View>
        ) : (
          <>
            {selectedTab === "overview" && (
              <OverviewTab
                overview={overview}
                completionStats={completionStats}
              />
            )}
            {selectedTab === "performance" && (
              <PerformanceTab
                timeSeries={timeSeries}
                trending={trending}
                topViewed={topViewed}
                topLiked={topLiked}
                categoryPerformance={categoryPerformance}
                timeRangeDays={timeRangeDays}
                onTimeRangeChange={setTimeRangeDays}
              />
            )}
            {selectedTab === "content" && (
              <ContentTab
                contentAnalysis={contentAnalysis}
                lowPerformance={lowPerformance}
              />
            )}
            {selectedTab === "authors" && <AuthorsTab topAuthors={topAuthors} />}
          </>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>

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
    backgroundColor: "#f9fafb",
  },
  scrollView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: "#6b7280",
  },
});