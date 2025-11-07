import { formatNumber } from '@/services/adminStatisticsService';
import { Colors } from '@/styles/colors';
import { PopularCategories } from '@/types/admin/search.types';
import { Ionicons } from '@expo/vector-icons';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

interface PopularCategoriesCardProps {
  data: PopularCategories | null;
  loading: boolean;
}

export default function PopularCategoriesCard({ data, loading }: PopularCategoriesCardProps) {
  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#10b981" />
      </View>
    );
  }

  if (!data || data.categories.length === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Danh Mục Phổ Biến</Text>
        <Text style={styles.emptyText}>Chưa có dữ liệu</Text>
      </View>
    );
  }

  const maxViewCount = Math.max(...data.categories.map((item) => item.viewCount));

  const getCategoryColor = (index: number) => {
    const colors = ['#10b981', '#3b82f6', '#8b5cf6', '#f59e0b', '#ef4444'];
    return colors[index % colors.length];
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Danh Mục Phổ Biến</Text>
          <Text style={styles.subtitle}>
            {formatNumber(data.totalCategoryViews)} lượt xem tổng
          </Text>
        </View>
      </View>

      {data.categories.map((category, index) => {
        const percentage = (category.viewCount / maxViewCount) * 100;
        const categoryColor = getCategoryColor(index);

        return (
          <View key={category.categoryId} style={styles.categoryCard}>
            <View style={styles.categoryHeader}>
              <View
                style={[styles.categoryDot, { backgroundColor: categoryColor }]}
              />
              <Text style={styles.categoryName} numberOfLines={1}>
                {category.categoryName}
              </Text>
              <View style={styles.shareBadge}>
                <Text style={styles.shareText}>{category.viewShare.toFixed(1)}%</Text>
              </View>
            </View>

            <View style={styles.progressBarContainer}>
              <View style={styles.progressBar}>
                <View
                  style={[
                    styles.progressFill,
                    { width: `${percentage}%`, backgroundColor: categoryColor },
                  ]}
                />
              </View>
            </View>

            <View style={styles.statsGrid}>
              <View style={styles.statBox}>
                <Ionicons name="eye-outline" size={16} color={Colors.text.secondary} />
                <Text style={styles.statLabel}>Lượt xem</Text>
                <Text style={styles.statValue}>{formatNumber(category.viewCount)}</Text>
              </View>

              <View style={styles.statBox}>
                <Ionicons name="people-outline" size={16} color={Colors.text.secondary} />
                <Text style={styles.statLabel}>Người dùng</Text>
                <Text style={styles.statValue}>{formatNumber(category.uniqueUsers)}</Text>
              </View>

              <View style={styles.statBox}>
                <Ionicons name="document-text-outline" size={16} color={Colors.text.secondary} />
                <Text style={styles.statLabel}>Công thức</Text>
                <Text style={styles.statValue}>{formatNumber(category.recipeCount)}</Text>
              </View>
            </View>

            <View style={styles.metricsRow}>
              <View style={styles.metricItem}>
                <Text style={styles.metricLabel}>Thời gian TB:</Text>
                <Text style={styles.metricValue}>
                  {(category.averageTimeSpent / 60).toFixed(1)} phút
                </Text>
              </View>
              <View style={styles.metricItem}>
                <Text style={styles.metricLabel}>CTR:</Text>
                <Text style={styles.metricValue}>
                  {category.clickThroughRate.toFixed(1)}%
                </Text>
              </View>
            </View>
          </View>
        );
      })}
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text.primary,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 13,
    color: Colors.text.secondary,
  },
  emptyText: {
    fontSize: 14,
    color: Colors.text.secondary,
    textAlign: 'center',
    paddingVertical: 20,
  },
  categoryCard: {
    backgroundColor: Colors.gray[50],
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  categoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  categoryDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 8,
  },
  categoryName: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text.primary,
    flex: 1,
  },
  shareBadge: {
    backgroundColor: '#10b981',
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  shareText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#fff',
  },
  progressBarContainer: {
    marginBottom: 12,
  },
  progressBar: {
    height: 6,
    backgroundColor: Colors.gray[200],
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
  },
  statBox: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 6,
    padding: 8,
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 10,
    color: Colors.text.secondary,
    marginTop: 4,
  },
  statValue: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.text.primary,
    marginTop: 2,
  },
  metricsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: Colors.gray[200],
  },
  metricItem: {
    alignItems: 'center',
  },
  metricLabel: {
    fontSize: 11,
    color: Colors.text.secondary,
    marginBottom: 2,
  },
  metricValue: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.text.primary,
  },
});