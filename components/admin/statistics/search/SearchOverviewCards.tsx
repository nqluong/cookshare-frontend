import { SearchOverview } from '@/types/admin/search.types';
import { Ionicons } from '@expo/vector-icons';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { Colors } from '../../../../styles/colors';

interface SearchOverviewCardsProps {
  data: SearchOverview | null;
  loading: boolean;
}

export default function SearchOverviewCards({ data, loading }: SearchOverviewCardsProps) {
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#10b981" />
      </View>
    );
  }

  if (!data) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Không có dữ liệu</Text>
      </View>
    );
  }

  const cards = [
    {
      icon: 'search' as const,
      label: 'Tổng Tìm Kiếm',
      value: formatNumber(data.totalSearches),
      color: '#6366f1',
      bgColor: '#eef2ff',
    },
    {
      icon: 'checkmark-circle' as const,
      label: 'Tỷ Lệ Thành Công',
      value: data.successRate !== null && data.successRate !== undefined 
        ? `${data.successRate.toFixed(1)}%` 
        : 'N/A',
      color: '#10b981',
      bgColor: '#d1fae5',
    },
    {
      icon: 'key' as const,
      label: 'Từ Khóa Unique',
      value: formatNumber(data.uniqueSearchQueries),
      color: '#f59e0b',
      bgColor: '#fef3c7',
    },
    {
      icon: 'people' as const,
      label: 'Người Dùng',
      value: formatNumber(data.totalUsers),
      color: '#8b5cf6',
      bgColor: '#f3e8ff',
    },
  ];

  return (
    <View style={styles.container}>
      {cards.map((card, index) => (
        <View key={index} style={styles.card}>
          <View style={[styles.iconContainer, { backgroundColor: card.bgColor }]}>
            <Ionicons name={card.icon} size={24} color={card.color} />
          </View>
          <Text style={styles.label}>{card.label}</Text>
          <Text style={[styles.value, { color: card.color }]}>{card.value}</Text>
        </View>
      ))}

      {/* Additional Stats */}
      <View style={[styles.card, styles.wideCard]}>
        <Text style={styles.wideCardLabel}>Trung Bình / Tìm Kiếm</Text>
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Kết quả</Text>
            <Text style={styles.statValue}>
              {data.averageResultsPerSearch !== null && data.averageResultsPerSearch !== undefined
                ? data.averageResultsPerSearch.toFixed(1)
                : '0.0'}
            </Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Tìm kiếm/người</Text>
            <Text style={styles.statValue}>
              {data.averageSearchesPerUser !== null && data.averageSearchesPerUser !== undefined
                ? data.averageSearchesPerUser.toFixed(1)
                : 'N/A'}
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
}

const formatNumber = (num: number | null | undefined): string => {
  if (num === null || num === undefined) return 'N/A';
  if (num >= 1000000) {
    return `${(num / 1000000).toFixed(1)}M`;
  }
  if (num >= 1000) {
    return `${(num / 1000).toFixed(1)}K`;
  }
  return num.toString();
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 12,
    gap: 12,
  },
  card: {
    width: '48%',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  wideCard: {
    width: '100%',
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  label: {
    fontSize: 13,
    color: Colors.text.secondary,
    marginBottom: 4,
  },
  value: {
    fontSize: 24,
    fontWeight: '700',
  },
  wideCardLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: 12,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 12,
    color: Colors.text.secondary,
    marginBottom: 4,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#10b981',
  },
  divider: {
    width: 1,
    height: 40,
    backgroundColor: Colors.gray[200],
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