import { PeakHoursStats } from '@/types/admin/interaction.types';
import { useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Colors } from '../../../../styles/colors';

interface PeakHoursChartProps {
  data: PeakHoursStats | null;
  loading: boolean;
}

type ChartMode = 'hourly' | 'daily';

export default function PeakHoursChart({ data, loading }: PeakHoursChartProps) {
  const [mode, setMode] = useState<ChartMode>('hourly');

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Giờ Cao Điểm Tương Tác</Text>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#10b981" />
        </View>
      </View>
    );
  }

  if (!data) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Giờ Cao Điểm Tương Tác</Text>
        </View>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Không có dữ liệu</Text>
        </View>
      </View>
    );
  }

  const chartData = mode === 'hourly' ? data.hourlyStats : data.dailyStats;
  const maxValue = Math.max(...chartData.map((item) => item.totalInteractions));

  return (
    <View style={styles.container}>
      {/* Header với mode toggle */}
      <View style={styles.header}>
        <Text style={styles.title}>Giờ Cao Điểm Tương Tác</Text>
        <View style={styles.toggleContainer}>
          <TouchableOpacity
            style={[styles.toggleButton, mode === 'hourly' && styles.toggleButtonActive]}
            onPress={() => setMode('hourly')}
          >
            <Text style={[styles.toggleText, mode === 'hourly' && styles.toggleTextActive]}>
              Theo Giờ
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.toggleButton, mode === 'daily' && styles.toggleButtonActive]}
            onPress={() => setMode('daily')}
          >
            <Text style={[styles.toggleText, mode === 'daily' && styles.toggleTextActive]}>
              Theo Ngày
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Peak Info */}
      <View style={styles.peakInfo}>
        <View style={styles.peakBadge}>
          <Text style={styles.peakLabel}>
            {mode === 'hourly' ? 'Giờ cao điểm:' : 'Ngày cao điểm:'}
          </Text>
          <Text style={styles.peakValue}>
            {mode === 'hourly' 
              ? (data.peakHour !== null && data.peakHour !== undefined ? `${data.peakHour}h` : 'Không có')
              : (data.peakDayOfWeek || 'Không có')}
          </Text>
        </View>
      </View>

      {/* Bar Chart - Fixed: Bars grow from bottom to top */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.chartScrollContainer}
      >
        <View style={styles.chartContainer}>
          {mode === 'hourly' 
            ? data.hourlyStats.map((item, index) => {
                const height = (item.totalInteractions / maxValue) * 120;
                return (
                  <View key={index} style={styles.barColumn}>
                    <View style={styles.barWrapper}>
                      <View
                        style={[
                          styles.bar,
                          { height: Math.max(height, 4) },
                          item.hour === data.peakHour && styles.barPeak,
                        ]}
                      />
                    </View>
                    <Text style={styles.barLabel}>{item.hour}h</Text>
                    <Text style={styles.barValue}>{item.totalInteractions}</Text>
                  </View>
                );
              })
            : data.dailyStats.map((item, index) => {
                const height = (item.totalInteractions / maxValue) * 120;
                const shortDay = item.dayOfWeek
                  .replace('Thứ ', 'T')
                  .replace('Chủ nhật', 'CN');
                return (
                  <View key={index} style={styles.barColumn}>
                    <View style={styles.barWrapper}>
                      <View
                        style={[
                          styles.bar,
                          { height: Math.max(height, 4) },
                          item.dayOfWeek === data.peakDayOfWeek && styles.barPeak,
                        ]}
                      />
                    </View>
                    <Text style={styles.barLabel}>{shortDay}</Text>
                    <Text style={styles.barValue}>{item.totalInteractions}</Text>
                  </View>
                );
              })
          }
        </View>
      </ScrollView>

      {/* Legend */}
      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: '#10b981' }]} />
          <Text style={styles.legendText}>Tương tác thường</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: '#ef4444' }]} />
          <Text style={styles.legendText}>Cao điểm</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text.primary,
  },
  toggleContainer: {
    flexDirection: 'row',
    backgroundColor: Colors.gray[100],
    borderRadius: 8,
    padding: 2,
  },
  toggleButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  toggleButtonActive: {
    backgroundColor: '#fff',
  },
  toggleText: {
    fontSize: 12,
    color: Colors.text.secondary,
    fontWeight: '500',
  },
  toggleTextActive: {
    color: '#10b981',
    fontWeight: '600',
  },
  peakInfo: {
    marginBottom: 16,
  },
  peakBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fef3c7',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  peakLabel: {
    fontSize: 13,
    color: Colors.text.secondary,
    marginRight: 8,
  },
  peakValue: {
    fontSize: 14,
    fontWeight: '700',
    color: '#f59e0b',
  },
  chartScrollContainer: {
    paddingVertical: 16,
  },
  chartContainer: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'flex-end', // This makes bars align to bottom
  },
  barColumn: {
    alignItems: 'center',
    width: 40,
  },
  barWrapper: {
    height: 120,
    justifyContent: 'flex-end', // Bars grow from bottom
  },
  bar: {
    width: 28,
    backgroundColor: '#10b981',
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
  },
  barPeak: {
    backgroundColor: '#ef4444',
  },
  barLabel: {
    fontSize: 10,
    color: Colors.text.secondary,
    marginTop: 4,
    marginBottom: 2,
  },
  barValue: {
    fontSize: 9,
    color: Colors.text.primary,
    fontWeight: '500',
  },
  legend: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.gray[200],
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  legendText: {
    fontSize: 12,
    color: Colors.text.secondary,
  },
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
  },
  errorContainer: {
    padding: 40,
    alignItems: 'center',
  },
  errorText: {
    fontSize: 14,
    color: Colors.text.secondary,
  },
});