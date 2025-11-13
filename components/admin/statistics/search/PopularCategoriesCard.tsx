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

  // Check if we have any meaningful view data
  const hasViewData = data.totalCategoryViews > 0;
  const maxRecipeCount = Math.max(...data.categories.map((item) => item.recipeCount));

  const getCategoryColor = (index: number) => {
    const colors = ['#10b981', '#3b82f6', '#8b5cf6', '#f59e0b', '#ef4444'];
    return colors[index % colors.length];
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Danh Mục Công Thức</Text>
          <Text style={styles.subtitle}>
            {data.categories.length} danh mục
            {hasViewData && ` • ${formatNumber(data.totalCategoryViews)} lượt xem`}
          </Text>
        </View>
      </View>

      {data.categories.map((category, index) => {
        const percentage = (category.recipeCount / maxRecipeCount) * 100;
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
              <View style={styles.countBadge}>
                <Ionicons name="document-text" size={12} color="#fff" />
                <Text style={styles.countText}>{category.recipeCount}</Text>
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
              <Text style={styles.progressLabel}>
                {((category.recipeCount / maxRecipeCount) * 100).toFixed(1)}% tổng công thức
              </Text>
            </View>

            {/* Only show view stats if there's data */}
            {hasViewData && category.viewCount > 0 && (
              <View style={styles.statsRow}>
                <View style={styles.statItem}>
                  <Ionicons name="eye-outline" size={14} color={Colors.text.secondary} />
                  <Text style={styles.statText}>{formatNumber(category.viewCount)} lượt xem</Text>
                </View>
                {category.uniqueUsers > 0 && (
                  <View style={styles.statItem}>
                    <Ionicons name="people-outline" size={14} color={Colors.text.secondary} />
                    <Text style={styles.statText}>{formatNumber(category.uniqueUsers)} người</Text>
                  </View>
                )}
              </View>
            )}
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
  countBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#10b981',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  countText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#fff',
  },
  progressBarContainer: {
    marginBottom: 8,
  },
  progressBar: {
    height: 6,
    backgroundColor: Colors.gray[200],
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 4,
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  progressLabel: {
    fontSize: 11,
    color: Colors.text.secondary,
    textAlign: 'right',
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: Colors.gray[200],
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statText: {
    fontSize: 12,
    color: Colors.text.secondary,
  },
});