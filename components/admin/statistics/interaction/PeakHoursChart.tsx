import { formatNumber } from '@/services/adminStatisticsService';
import { Colors } from '@/styles/colors';
import { PeakHoursStats } from '@/types/admin/interaction.types';
import { ActivityIndicator, Dimensions, StyleSheet, Text, View } from 'react-native';
import { BarChart } from 'react-native-chart-kit';

interface PeakHoursChartProps {
  data: PeakHoursStats | null;
  loading: boolean;
}

export default function PeakHoursChart({ data, loading }: PeakHoursChartProps) {
  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#10b981" />
      </View>
    );
  }

  if (!data || data.hourlyStats.length === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Giờ Cao Điểm</Text>
        <Text style={styles.emptyText}>Chưa có dữ liệu</Text>
      </View>
    );
  }

  const screenWidth = Dimensions.get('window').width;
  const chartWidth = screenWidth - 32;

  // Sắp xếp theo giờ
  const sortedHourlyStats = [...data.hourlyStats].sort((a, b) => a.hour - b.hour);

  const labels = sortedHourlyStats.map((item) => `${item.hour}h`);
  const chartData = sortedHourlyStats.map((item) => item.totalInteractions);

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
    propsForBackgroundLines: {
      strokeDasharray: '',
      stroke: Colors.gray[200],
    },
    barPercentage: 0.7,
    fillShadowGradient: '#10b981',
    fillShadowGradientOpacity: 1,
  };

  const dayOfWeekMap: { [key: string]: string } = {
    'Monday': 'T2',
    'Tuesday': 'T3',
    'Wednesday': 'T4',
    'Thursday': 'T5',
    'Friday': 'T6',
    'Saturday': 'T7',
    'Sunday': 'CN',
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Giờ Cao Điểm</Text>

      <View style={styles.peakInfo}>
        <View style={styles.peakBox}>
          <Text style={styles.peakLabel}>Giờ cao điểm</Text>
          <Text style={styles.peakValue}>{data.peakHour}:00</Text>
        </View>
        <View style={styles.peakBox}>
          <Text style={styles.peakLabel}>Ngày cao điểm</Text>
          <Text style={styles.peakValue}>{dayOfWeekMap[data.peakDayOfWeek] || data.peakDayOfWeek}</Text>
        </View>
      </View>

      <View style={styles.chartContainer}>
        <Text style={styles.chartTitle}>Tương Tác Theo Giờ</Text>
        <BarChart
          data={{
            labels: labels.filter((_, i) => i % 2 === 0),
            datasets: [
              {
                data: chartData,
              },
            ],
          }}
          width={chartWidth}
          height={220}
          yAxisLabel=""
          yAxisSuffix=""
          chartConfig={chartConfig}
          style={styles.chart}
          showBarTops={false}
          fromZero={true}
          segments={4}
        />
      </View>

      {data.dailyStats && data.dailyStats.length > 0 && (
        <View style={styles.dailyStats}>
          <Text style={styles.chartTitle}>Tương Tác Theo Ngày</Text>
          {data.dailyStats
            .sort((a, b) => a.dayNumber - b.dayNumber)
            .map((day, index) => {
              const maxInteractions = Math.max(...data.dailyStats.map((d) => d.totalInteractions));
              const percentage = (day.totalInteractions / maxInteractions) * 100;

              return (
                <View key={index} style={styles.dayRow}>
                  <Text style={styles.dayLabel}>{dayOfWeekMap[day.dayOfWeek] || day.dayOfWeek}</Text>
                  <View style={styles.dayBar}>
                    <View
                      style={[
                        styles.dayBarFill,
                        {
                          width: `${percentage}%`,
                          backgroundColor: percentage > 70 ? '#10b981' : '#6b7280',
                        },
                      ]}
                    />
                  </View>
                  <Text style={styles.dayValue}>{formatNumber(day.totalInteractions)}</Text>
                </View>
              );
            })}
        </View>
      )}
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
    marginBottom: 12,
  },
  emptyText: {
    fontSize: 14,
    color: Colors.text.secondary,
    textAlign: 'center',
    paddingVertical: 20,
  },
  peakInfo: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  peakBox: {
    flex: 1,
    backgroundColor: Colors.gray[50],
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
  },
  peakLabel: {
    fontSize: 12,
    color: Colors.text.secondary,
    marginBottom: 4,
  },
  peakValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#10b981',
  },
  chartContainer: {
    marginBottom: 16,
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
  dailyStats: {
    marginTop: 8,
  },
  dayRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  dayLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.text.primary,
    width: 30,
  },
  dayBar: {
    flex: 1,
    height: 24,
    backgroundColor: Colors.gray[200],
    borderRadius: 4,
    marginHorizontal: 8,
    overflow: 'hidden',
  },
  dayBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  dayValue: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.text.primary,
    width: 60,
    textAlign: 'right',
  },
});