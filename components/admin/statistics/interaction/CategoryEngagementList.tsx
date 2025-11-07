import { CategoryEngagement } from '@/types/admin/interaction.types';
import { Ionicons } from '@expo/vector-icons';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { Colors } from '../../../../styles/colors';

interface CategoryEngagementListProps {
  data: CategoryEngagement[] | null;
  loading: boolean;
}

export default function CategoryEngagementList({ data, loading }: CategoryEngagementListProps) {
  if (loading) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Engagement Theo Danh Mục</Text>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#10b981" />
        </View>
      </View>
    );
  }

  if (!data || data.length === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Engagement Theo Danh Mục</Text>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Không có dữ liệu</Text>
        </View>
      </View>
    );
  }

  // Sort by engagement rate
  const sortedData = [...data].sort((a, b) => b.engagementRate - a.engagementRate);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Engagement Theo Danh Mục</Text>
      
      {sortedData.slice(0, 5).map((category, index) => (
        <View key={category.categoryId} style={styles.categoryCard}>
          <View style={styles.rankBadge}>
            <Text style={styles.rankText}>#{index + 1}</Text>
          </View>

          <View style={styles.categoryInfo}>
            <Text style={styles.categoryName}>{category.categoryName}</Text>
            <Text style={styles.categoryStats}>
              {category.recipeCount} công thức • {formatNumber(category.totalViews)} lượt xem
            </Text>
          </View>

          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Ionicons name="heart" size={14} color="#ef4444" />
              <Text style={styles.statText}>{formatNumber(category.totalLikes)}</Text>
            </View>
            <View style={styles.statItem}>
              <Ionicons name="chatbubble" size={14} color="#3b82f6" />
              <Text style={styles.statText}>{formatNumber(category.totalComments)}</Text>
            </View>
            <View style={styles.statItem}>
              <Ionicons name="bookmark" size={14} color="#f59e0b" />
              <Text style={styles.statText}>{formatNumber(category.totalSaves)}</Text>
            </View>
          </View>

          <View style={styles.engagementBadge}>
            <Text style={styles.engagementRate}>
              {category.engagementRate.toFixed(1)}%
            </Text>
            <Text style={styles.engagementLabel}>Engagement</Text>
          </View>
        </View>
      ))}
    </View>
  );
}

const formatNumber = (num: number): string => {
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
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text.primary,
    marginBottom: 16,
  },
  categoryCard: {
    backgroundColor: Colors.gray[50],
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  rankBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#10b981',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  rankText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#fff',
  },
  categoryInfo: {
    flex: 1,
  },
  categoryName: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: 4,
  },
  categoryStats: {
    fontSize: 12,
    color: Colors.text.secondary,
  },
  statsContainer: {
    flexDirection: 'row',
    gap: 8,
    marginRight: 12,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  statText: {
    fontSize: 11,
    color: Colors.text.secondary,
    fontWeight: '500',
  },
  engagementBadge: {
    alignItems: 'center',
  },
  engagementRate: {
    fontSize: 16,
    fontWeight: '700',
    color: '#10b981',
  },
  engagementLabel: {
    fontSize: 9,
    color: Colors.text.primary,
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