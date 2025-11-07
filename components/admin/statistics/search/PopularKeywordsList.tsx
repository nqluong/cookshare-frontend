import { PopularKeywords } from '@/types/admin/search.types';
import { Ionicons } from '@expo/vector-icons';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { Colors } from '../../../../styles/colors';

interface PopularKeywordsListProps {
  data: PopularKeywords | null;
  loading: boolean;
}

export default function PopularKeywordsList({ data, loading }: PopularKeywordsListProps) {
  if (loading) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Từ Khóa Phổ Biến</Text>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#10b981" />
        </View>
      </View>
    );
  }

  if (!data || data.keywords.length === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Từ Khóa Phổ Biến</Text>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Không có dữ liệu</Text>
        </View>
      </View>
    );
  }

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'UP':
        return { name: 'trending-up' as const, color: '#10b981' };
      case 'DOWN':
        return { name: 'trending-down' as const, color: '#ef4444' };
      default:
        return { name: 'remove' as const, color: Colors.text.secondary };
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Từ Khóa Phổ Biến</Text>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{data.totalUniqueKeywords} từ khóa</Text>
        </View>
      </View>

      {data.keywords.slice(0, 10).map((keyword, index) => {
        const trendIcon = getTrendIcon(keyword.trend);
        return (
          <View key={index} style={styles.keywordCard}>
            <View style={styles.rankBadge}>
              <Text style={styles.rankText}>#{index + 1}</Text>
            </View>

            <View style={styles.keywordInfo}>
              <Text style={styles.keywordText} numberOfLines={1}>
                {keyword.keyword}
              </Text>
              <View style={styles.statsRow}>
                <View style={styles.statBadge}>
                  <Ionicons name="search" size={12} color={Colors.text.secondary} />
                  <Text style={styles.statText}>{formatNumber(keyword.searchCount)}</Text>
                </View>
                <View style={styles.statBadge}>
                  <Ionicons name="people" size={12} color={Colors.text.secondary} />
                  <Text style={styles.statText}>{formatNumber(keyword.uniqueUsers)}</Text>
                </View>
              </View>
            </View>

            <View style={styles.rightSection}>
              <View style={[styles.successBadge, { 
                backgroundColor: keyword.successRate > 80 ? '#d1fae5' : '#fef3c7' 
              }]}>
                <Text style={[styles.successRate, {
                  color: keyword.successRate > 80 ? '#10b981' : '#f59e0b'
                }]}>
                  {keyword.successRate.toFixed(0)}%
                </Text>
              </View>
              <Ionicons name={trendIcon.name} size={16} color={trendIcon.color} />
            </View>
          </View>
        );
      })}
    </View>
  );
}

const formatNumber = (num: number): string => {
  if (num >= 1000) {
    return `${(num / 1000).toFixed(1)}K`;
  }
  return num.toString();
};

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
  badge: {
    backgroundColor: Colors.gray[100],
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    fontSize: 12,
    color: Colors.text.secondary,
    fontWeight: '500',
  },
  keywordCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.gray[50],
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
  },
  rankBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#6366f1',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  rankText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#fff',
  },
  keywordInfo: {
    flex: 1,
  },
  keywordText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: 4,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  statBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statText: {
    fontSize: 11,
    color: Colors.text.secondary,
    fontWeight: '500',
  },
  rightSection: {
    alignItems: 'flex-end',
    gap: 4,
  },
  successBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  successRate: {
    fontSize: 12,
    fontWeight: '700',
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