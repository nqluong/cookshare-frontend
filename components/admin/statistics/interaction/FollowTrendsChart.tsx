import { formatNumber } from '@/services/adminStatisticsService';
import { Colors } from '@/styles/colors';
import { FollowTrends } from '@/types/admin/interaction.types';
import { ActivityIndicator, Dimensions, StyleSheet, Text, View } from 'react-native';
import { LineChart } from 'react-native-chart-kit';

interface FollowTrendsChartProps {
  data: FollowTrends | null;
  loading: boolean;
}

export default function FollowTrendsChart({ data, loading }: FollowTrendsChartProps) {
  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#10b981" />
      </View>
    );
  }

  if (!data || data.trendData.length === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Xu Hướng Follow</Text>
        <Text style={styles.emptyText}>Chưa có dữ liệu</Text>
      </View>
    );
  }

  const screenWidth = Dimensions.get('window').width;
  const chartWidth = screenWidth - 32;

  const labels = data.trendData.map((item) => {
    const date = new Date(item.date);
    return `${date.getDate()}/${date.getMonth() + 1}`;
  });

  const newFollowsData = data.trendData.map((item) => item.newFollows);
  const cumulativeData = data.trendData.map((item) => item.cumulativeFollows);

  const chartConfig = {
    backgroundColor: '#fff',
    backgroundGradientFrom: '#fff',
    backgroundGradientTo: '#fff',
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(16, 185, 129, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(107, 114, 128, ${opacity})`,
    style: {
      borderRadius: 12,
    },
    propsForDots: {
      r: '4',
      strokeWidth: '2',
      stroke: '#10b981',
    },
    propsForBackgroundLines: {
      strokeDasharray: '',
      stroke: Colors.gray[200],
    },
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Xu Hướng Follow</Text>

      <View style={styles.statsRow}>
        <View style={styles.statBox}>
          <Text style={styles.statLabel}>Follow Mới</Text>
          <Text style={styles.statValue}>{formatNumber(data.totalNewFollows)}</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statLabel}>Unfollow</Text>
          <Text style={[styles.statValue, { color: '#ef4444' }]}>
            {formatNumber(data.totalUnfollows)}
          </Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statLabel}>Tăng Trưởng</Text>
          <Text
            style={[
              styles.statValue,
              { color: data.netFollowGrowth >= 0 ? '#10b981' : '#ef4444' },
            ]}
          >
            {data.netFollowGrowth >= 0 ? '+' : ''}
            {formatNumber(data.netFollowGrowth)}
          </Text>
        </View>
      </View>

      <View style={styles.chartContainer}>
        <Text style={styles.chartTitle}>Follow Mới Theo Ngày</Text>
        <LineChart
          data={{
            labels: labels.length > 10 ? labels.filter((_, i) => i % 2 === 0) : labels,
            datasets: [
              {
                data: newFollowsData,
                color: (opacity = 1) => `rgba(16, 185, 129, ${opacity})`,
                strokeWidth: 2,
              },
            ],
          }}
          width={chartWidth}
          height={220}
          chartConfig={chartConfig}
          bezier
          style={styles.chart}
          withInnerLines={true}
          withOuterLines={true}
          withVerticalLines={false}
          withHorizontalLines={true}
          fromZero={true}
        />
      </View>

      <View style={styles.chartContainer}>
        <Text style={styles.chartTitle}>Tổng Follow Tích Lũy</Text>
        <LineChart
          data={{
            labels: labels.length > 10 ? labels.filter((_, i) => i % 2 === 0) : labels,
            datasets: [
              {
                data: cumulativeData,
                color: (opacity = 1) => `rgba(59, 130, 246, ${opacity})`,
                strokeWidth: 2,
              },
            ],
          }}
          width={chartWidth}
          height={220}
          chartConfig={{
            ...chartConfig,
            color: (opacity = 1) => `rgba(59, 130, 246, ${opacity})`,
            propsForDots: {
              r: '4',
              strokeWidth: '2',
              stroke: '#3b82f6',
            },
          }}
          bezier
          style={styles.chart}
          withInnerLines={true}
          withOuterLines={true}
          withVerticalLines={false}
          withHorizontalLines={true}
          fromZero={false}
        />
      </View>

      <View style={styles.growthRate}>
        <Text style={styles.growthLabel}>Tỷ Lệ Tăng Trưởng:</Text>
        <Text
          style={[
            styles.growthValue,
            { color: data.followGrowthRate >= 0 ? '#10b981' : '#ef4444' },
          ]}
        >
          {data.followGrowthRate >= 0 ? '+' : ''}
          {data.followGrowthRate.toFixed(2)}%
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    margin: 16,
    marginTop: 0,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text.primary,
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 14,
    color: Colors.text.secondary,
    textAlign: 'center',
    paddingVertical: 20,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 20,
  },
  statBox: {
    flex: 1,
    backgroundColor: Colors.gray[50],
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 12,
    color: Colors.text.secondary,
    marginBottom: 4,
  },
  statValue: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text.primary,
  },
  chartContainer: {
    marginBottom: 20,
  },
  chartTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: 12,
  },
  chart: {
    borderRadius: 12,
    marginLeft: -16,
  },
  growthRate: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.gray[200],
  },
  growthLabel: {
    fontSize: 14,
    color: Colors.text.secondary,
    marginRight: 8,
  },
  growthValue: {
    fontSize: 16,
    fontWeight: '700',
  },
});