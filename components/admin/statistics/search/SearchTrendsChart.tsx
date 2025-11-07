import { Colors } from '@/styles/colors';
import { SearchTrends } from '@/types/admin/search.types';
import { Ionicons } from '@expo/vector-icons';
import { ActivityIndicator, Dimensions, StyleSheet, Text, View } from 'react-native';
import { LineChart } from 'react-native-chart-kit';

interface SearchTrendsChartProps {
  data: SearchTrends | null;
  loading: boolean;
}

export default function SearchTrendsChart({ data, loading }: SearchTrendsChartProps) {
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
        <Text style={styles.title}>Xu Hướng Tìm Kiếm</Text>
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

  const searchesData = data.trendData.map((item) => item.totalSearches);
  const usersData = data.trendData.map((item) => item.uniqueUsers);
  const successRateData = data.trendData.map((item) => item.successRate);

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
      <Text style={styles.title}>Xu Hướng Tìm Kiếm</Text>

      <View style={styles.statsRow}>
        <View style={styles.statBox}>
          <Ionicons name="trending-up" size={20} color="#10b981" />
          <Text style={styles.statLabel}>Tăng trưởng</Text>
          <Text
            style={[
              styles.statValue,
              { color: data.growthRate >= 0 ? '#10b981' : '#ef4444' },
            ]}
          >
            {data.growthRate >= 0 ? '+' : ''}
            {data.growthRate.toFixed(1)}%
          </Text>
        </View>
        <View style={styles.statBox}>
          <Ionicons name="time-outline" size={20} color="#3b82f6" />
          <Text style={styles.statLabel}>Cao điểm</Text>
          <Text style={styles.statValue}>
            {new Date(data.peakPeriod).toLocaleDateString('vi-VN', {
              day: '2-digit',
              month: '2-digit',
            })}
          </Text>
        </View>
      </View>

      <View style={styles.chartContainer}>
        <Text style={styles.chartTitle}>Tổng Lượt Tìm Kiếm</Text>
        <LineChart
          data={{
            labels: labels.length > 10 ? labels.filter((_, i) => i % 2 === 0) : labels,
            datasets: [
              {
                data: searchesData,
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
        <Text style={styles.chartTitle}>Người Dùng Tìm Kiếm</Text>
        <LineChart
          data={{
            labels: labels.length > 10 ? labels.filter((_, i) => i % 2 === 0) : labels,
            datasets: [
              {
                data: usersData,
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
          fromZero={true}
        />
      </View>

      <View style={styles.chartContainer}>
        <Text style={styles.chartTitle}>Tỷ Lệ Thành Công (%)</Text>
        <LineChart
          data={{
            labels: labels.length > 10 ? labels.filter((_, i) => i % 2 === 0) : labels,
            datasets: [
              {
                data: successRateData,
                color: (opacity = 1) => `rgba(139, 92, 246, ${opacity})`,
                strokeWidth: 2,
              },
            ],
          }}
          width={chartWidth}
          height={220}
          chartConfig={{
            ...chartConfig,
            color: (opacity = 1) => `rgba(139, 92, 246, ${opacity})`,
            propsForDots: {
              r: '4',
              strokeWidth: '2',
              stroke: '#8b5cf6',
            },
          }}
          bezier
          style={styles.chart}
          withInnerLines={true}
          withOuterLines={true}
          withVerticalLines={false}
          withHorizontalLines={true}
          yAxisSuffix="%"
          fromZero={false}
        />
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
    marginTop: 4,
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
});