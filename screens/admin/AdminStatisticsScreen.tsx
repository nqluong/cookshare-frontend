import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../../styles/colors';
import CustomAlert from '../../components/ui/CustomAlert';
import { useCustomAlert } from '../../hooks/useCustomAlert';

import DateRangePicker from '../../components/admin/statistics/DateRangePicker';
import StatisticsTabs, { StatisticsTabType } from '../../components/admin/statistics/StatisticsTabs';
import DetailedStatsCard from '../../components/admin/statistics/interaction/DetailedStatsCard';
import FollowTrendsChart from '../../components/admin/statistics/interaction/FollowTrendsChart';
import OverviewCards from '../../components/admin/statistics/interaction/OverviewCards';
import PeakHoursChart from '../../components/admin/statistics/interaction/PeakHoursChart';
import TopCommentsCard from '../../components/admin/statistics/interaction/TopCommentsCard';
import PopularKeywordsList from '../../components/admin/statistics/search/PopularKeywordsList';
import SearchOverviewCards from '../../components/admin/statistics/search/SearchOverviewCards';
import SearchSuccessRateCard from '../../components/admin/statistics/search/SearchSuccessRateCard';
import SearchTrendsChart from '../../components/admin/statistics/search/SearchTrendsChart';
import ZeroResultKeywordsCard from '../../components/admin/statistics/search/ZeroResultKeywordsCard';
import adminStatisticApi, { getDefaultDateRange } from '../../services/adminStatisticsService';
import { DateRangeParams } from '../../types/admin/interaction.types';

import type {
  DetailedInteractionStats,
  EngagementByCategory,
  FollowTrends,
  InteractionOverview,
  PeakHoursStats,
  TopComments,
} from '../../types/admin/interaction.types';
import type {
  PopularCategories,
  PopularIngredients,
  PopularKeywords,
  SearchOverview,
  SearchSuccessRate,
  SearchTrends,
  ZeroResultKeywords,
} from '../../types/admin/search.types';

const formatDateForDisplay = (dateStr: string | undefined): string => {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  return date.toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
};

export default function AdminStatisticsScreen() {
  
  const router = useRouter();
  const { alert, showError, hideAlert } = useCustomAlert();
  const [activeTab, setActiveTab] = useState<StatisticsTabType>('interaction');
  const [refreshing, setRefreshing] = useState(false);
  const [dateRange, setDateRange] = useState<DateRangeParams>(getDefaultDateRange());
  const [showDatePicker, setShowDatePicker] = useState(false);

  // Interaction data states
  const [interactionOverview, setInteractionOverview] = useState<InteractionOverview | null>(null);
  const [detailedStats, setDetailedStats] = useState<DetailedInteractionStats | null>(null);
  const [peakHours, setPeakHours] = useState<PeakHoursStats | null>(null);
  const [topComments, setTopComments] = useState<TopComments | null>(null);
  const [followTrends, setFollowTrends] = useState<FollowTrends | null>(null);
  const [categoryEngagement, setCategoryEngagement] = useState<EngagementByCategory | null>(null);

  // Search data states
  const [searchOverview, setSearchOverview] = useState<SearchOverview | null>(null);
  const [popularKeywords, setPopularKeywords] = useState<PopularKeywords | null>(null);
  const [popularIngredients, setPopularIngredients] = useState<PopularIngredients | null>(null);
  const [popularCategories, setPopularCategories] = useState<PopularCategories | null>(null);
  const [searchSuccessRate, setSearchSuccessRate] = useState<SearchSuccessRate | null>(null);
  const [zeroResultKeywords, setZeroResultKeywords] = useState<ZeroResultKeywords | null>(null);
  const [searchTrends, setSearchTrends] = useState<SearchTrends | null>(null);

  // Loading states
  const [loadingInteraction, setLoadingInteraction] = useState(false);
  const [loadingSearch, setLoadingSearch] = useState(false);

  // Fetch data on tab change or date range change
  useEffect(() => {
    if (activeTab === 'interaction') {
      fetchInteractionData();
    } else if (activeTab === 'search') {
      fetchSearchData();
    }
  }, [activeTab, dateRange]);

  const fetchInteractionData = async () => {
    setLoadingInteraction(true);
    try {
      const [overview, detailed, peak, comments, trends, engagement] = await Promise.all([
        adminStatisticApi.getInteractionOverview(dateRange),
        adminStatisticApi.getDetailedInteractionStats(dateRange),
        adminStatisticApi.getPeakHours(dateRange),
        adminStatisticApi.getTopComments(10, dateRange),
        adminStatisticApi.getFollowTrends({ ...dateRange, groupBy: 'WEEK' }),
        adminStatisticApi.getEngagementByCategory(dateRange),
      ]);

      setInteractionOverview(overview);
      setDetailedStats(detailed);
      setPeakHours(peak);
      setTopComments(comments);
      setFollowTrends(trends);
      setCategoryEngagement(engagement);
    } catch (error: any) {
      console.error('Error fetching interaction data:', error);
      showError(
        'Lỗi tải dữ liệu',
        error?.message || 'Không thể tải dữ liệu thống kê tương tác. Vui lòng thử lại.'
      );
    } finally {
      setLoadingInteraction(false);
    }
  };

  const fetchSearchData = async () => {
    setLoadingSearch(true);
    try {
      // Fetch all search statistics
      const [overview, keywords, /* categories, */ successRate, zeroResults, trends] =
        await Promise.all([
          adminStatisticApi.getSearchOverview(dateRange),
          adminStatisticApi.getPopularKeywords(20, dateRange),
          // adminStatisticApi.getPopularCategories(dateRange), 
          adminStatisticApi.getSearchSuccessRate(dateRange),
          adminStatisticApi.getZeroResultKeywords(30, dateRange),
          adminStatisticApi.getSearchTrends({ ...dateRange, groupBy: 'DAY' }),
        ]);

      setSearchOverview(overview);
      setPopularKeywords(keywords);
      // setPopularCategories(categories); 
      setSearchSuccessRate(successRate);
      setZeroResultKeywords(zeroResults);
      setSearchTrends(trends);
    } catch (error: any) {
      console.error('Error fetching search data:', error);
      showError(
        'Lỗi tải dữ liệu',
        error?.message || 'Không thể tải dữ liệu thống kê tìm kiếm. Vui lòng thử lại.'
      );
    } finally {
      setLoadingSearch(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    if (activeTab === 'interaction') {
      await fetchInteractionData();
    } else if (activeTab === 'search') {
      await fetchSearchData();
    }
    setRefreshing(false);
  };

  const handleTabChange = (tab: StatisticsTabType) => {
    setActiveTab(tab);
  };

  const handleDateRangeChange = (newDateRange: DateRangeParams) => {
    setDateRange(newDateRange);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={Colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Thống Kê Chi Tiết</Text>
        <TouchableOpacity
          style={styles.filterButton}
          onPress={() => setShowDatePicker(true)}
        >
          <Ionicons name="calendar-outline" size={24} color={Colors.text.primary} />
        </TouchableOpacity>
      </View>

      {/* Date Range Display */}
      <View style={styles.dateRangeContainer}>
        <Text style={styles.dateRangeText}>
          Thống kê từ {formatDateForDisplay(dateRange.startDate)} đến{' '}
          {formatDateForDisplay(dateRange.endDate)}
        </Text>
      </View>

      {/* Tabs */}
      <StatisticsTabs activeTab={activeTab} onTabChange={handleTabChange} />

      {/* Content */}
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#10b981']}
            tintColor="#10b981"
          />
        }
      >
        {activeTab === 'interaction' && (
          <>
            
            <OverviewCards data={interactionOverview} loading={loadingInteraction} />
            
            <PeakHoursChart data={peakHours} loading={loadingInteraction} />
            
            {/* <CategoryEngagementList 
              data={categoryEngagement?.categoryEngagements || null} 
              loading={loadingInteraction} 
            /> */}
            
            <DetailedStatsCard data={detailedStats} loading={loadingInteraction} />

            <TopCommentsCard data={topComments} loading={loadingInteraction} />
            

            <FollowTrendsChart data={followTrends} loading={loadingInteraction} />
          </>
        )}

        {activeTab === 'search' && (
          <>
            <SearchOverviewCards data={searchOverview} loading={loadingSearch} />
            <PopularKeywordsList data={popularKeywords} loading={loadingSearch} />
            {/* <PopularCategoriesCard data={popularCategories} loading={loadingSearch} /> */}
            <SearchSuccessRateCard data={searchSuccessRate} loading={loadingSearch} />
            <ZeroResultKeywordsCard data={zeroResultKeywords} loading={loadingSearch} />
            <SearchTrendsChart data={searchTrends} loading={loadingSearch} />
          </>
        )}

        {/* Bottom spacing for tab bar */}
        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Date Range Picker Modal */}
      <DateRangePicker
        visible={showDatePicker}
        onClose={() => setShowDatePicker(false)}
        onConfirm={handleDateRangeChange}
        currentDateRange={dateRange}
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
    backgroundColor: '#f9fafb',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray[200],
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text.primary,
    flex: 1,
    textAlign: 'center',
    marginHorizontal: 16,
  },
  filterButton: {
    padding: 4,
  },
  dateRangeContainer: {
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray[200],
  },
  dateRangeText: {
    fontSize: 13,
    color: Colors.text.secondary,
    textAlign: 'center',
  },
  scrollView: {
    flex: 1,
  },
  comingSoonContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 60,
  },
  comingSoonText: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text.secondary,
    marginTop: 16,
  },
  comingSoonSubtext: {
    fontSize: 14,
    color: Colors.text.primary,
    marginTop: 8,
    textAlign: 'center',
  },
});