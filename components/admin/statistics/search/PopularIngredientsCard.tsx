import { formatNumber } from '@/services/adminStatisticsService';
import { Colors } from '@/styles/colors';
import { PopularIngredients } from '@/types/admin/search.types';
import { Ionicons } from '@expo/vector-icons';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

interface PopularIngredientsCardProps {
  data: PopularIngredients | null;
  loading: boolean;
}

export default function PopularIngredientsCard({ data, loading }: PopularIngredientsCardProps) {
  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#10b981" />
      </View>
    );
  }

  if (!data || data.ingredients.length === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Nguyên Liệu Phổ Biến</Text>
        <Text style={styles.emptyText}>Chưa có dữ liệu</Text>
      </View>
    );
  }

  const maxSearchCount = Math.max(...data.ingredients.map((item) => item.searchCount));

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Nguyên Liệu Phổ Biến</Text>
          <Text style={styles.subtitle}>
            Top {data.ingredients.length} nguyên liệu được tìm kiếm nhiều nhất
          </Text>
        </View>
      </View>

      {data.ingredients.map((ingredient, index) => {
        const percentage = (ingredient.searchCount / maxSearchCount) * 100;

        return (
          <View key={ingredient.ingredientId} style={styles.ingredientCard}>
            <View style={styles.ingredientHeader}>
              <View style={styles.rankContainer}>
                <Text style={styles.rank}>#{index + 1}</Text>
              </View>
              <Text style={styles.ingredientName} numberOfLines={1}>
                {ingredient.ingredientName}
              </Text>
            </View>

            <View style={styles.progressBarContainer}>
              <View style={styles.progressBar}>
                <View
                  style={[
                    styles.progressFill,
                    {
                      width: `${percentage}%`,
                      backgroundColor:
                        index < 3 ? '#10b981' : index < 10 ? '#3b82f6' : '#6b7280',
                    },
                  ]}
                />
              </View>
            </View>

            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <Ionicons name="search-outline" size={14} color={Colors.text.secondary} />
                <Text style={styles.statText}>
                  {formatNumber(ingredient.searchCount)} lượt
                </Text>
              </View>

              <View style={styles.statItem}>
                <Ionicons name="document-text-outline" size={14} color={Colors.text.secondary} />
                <Text style={styles.statText}>
                  {formatNumber(ingredient.recipeCount)} công thức
                </Text>
              </View>
            </View>

            <View style={styles.detailsRow}>
              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>Tìm trực tiếp:</Text>
                <Text style={styles.detailValue}>
                  {formatNumber(ingredient.directSearches)}
                </Text>
              </View>
              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>Tìm công thức:</Text>
                <Text style={styles.detailValue}>
                  {formatNumber(ingredient.recipeSearches)}
                </Text>
              </View>
              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>Tỷ lệ:</Text>
                <Text style={styles.detailValue}>
                  {ingredient.searchToRecipeRatio.toFixed(2)}
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
  ingredientCard: {
    backgroundColor: Colors.gray[50],
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  ingredientHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  rankContainer: {
    backgroundColor: '#10b981',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginRight: 8,
  },
  rank: {
    fontSize: 12,
    fontWeight: '700',
    color: '#fff',
  },
  ingredientName: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text.primary,
    flex: 1,
  },
  progressBarContainer: {
    marginBottom: 8,
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
  statsRow: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 8,
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
  detailsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: Colors.gray[200],
  },
  detailItem: {
    alignItems: 'center',
  },
  detailLabel: {
    fontSize: 11,
    color: Colors.text.secondary,
    marginBottom: 2,
  },
  detailValue: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.text.primary,
  },
});