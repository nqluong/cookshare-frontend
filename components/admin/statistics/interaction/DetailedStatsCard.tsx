import { formatNumber } from '@/services/adminStatisticsService';
import { Colors } from '@/styles/colors';
import { DetailedInteractionStats } from '@/types/admin/interaction.types';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

interface DetailedStatsCardProps {
  data: DetailedInteractionStats | null;
  loading: boolean;
}

export default function DetailedStatsCard({ data, loading }: DetailedStatsCardProps) {
  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#10b981" />
      </View>
    );
  }

  if (!data) return null;

  const StatRow = ({ label, value }: { label: string; value: number }) => (
    <View style={styles.statRow}>
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={styles.statValue}>{formatNumber(value)}</Text>
    </View>
  );

  const DistributionBar = ({ distribution, total }: { distribution: any; total: number }) => {
    const segments = [
      { label: '0-10', count: distribution.count0to10, color: '#ef4444' },
      { label: '11-50', count: distribution.count11to50, color: '#f97316' },
      { label: '51-100', count: distribution.count51to100, color: '#eab308' },
      { label: '101-500', count: distribution.count101to500, color: '#22c55e' },
      { label: '500+', count: distribution.countOver500, color: '#10b981' },
    ];

    return (
      <View style={styles.distributionContainer}>
        <View style={styles.barContainer}>
          {segments.map((segment, index) => {
            const percentage = (segment.count / total) * 100;
            return percentage > 0 ? (
              <View
                key={index}
                style={[
                  styles.barSegment,
                  { flex: segment.count, backgroundColor: segment.color },
                ]}
              />
            ) : null;
          })}
        </View>
        <View style={styles.legendContainer}>
          {segments.map((segment, index) => (
            <View key={index} style={styles.legendItem}>
              <View style={[styles.legendColor, { backgroundColor: segment.color }]} />
              <Text style={styles.legendText}>
                {segment.label}: {segment.count}
              </Text>
            </View>
          ))}
        </View>
      </View>
    );
  };

  const totalRecipes = data.likeDistribution.count0to10 +
    data.likeDistribution.count11to50 +
    data.likeDistribution.count51to100 +
    data.likeDistribution.count101to500 +
    data.likeDistribution.countOver500;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Thống Kê Chi Tiết</Text>

      {/* Average Stats */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Trung Bình</Text>
        <StatRow label="Likes / Công Thức" value={data.averageLikesPerRecipe} />
        <StatRow label="Comments / Công Thức" value={data.averageCommentsPerRecipe} />
        <StatRow label="Saves / Công Thức" value={data.averageSavesPerRecipe} />
      </View>

      {/* Median Stats */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Trung Vị</Text>
        <StatRow label="Likes / Công Thức" value={data.medianLikesPerRecipe} />
        <StatRow label="Comments / Công Thức" value={data.medianCommentsPerRecipe} />
        <StatRow label="Saves / Công Thức" value={data.medianSavesPerRecipe} />
      </View>

      {/* Max Stats */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Cao Nhất</Text>
        <StatRow label="Likes trên 1 Công Thức" value={data.maxLikesOnRecipe} />
        <StatRow label="Comments trên 1 Công Thức" value={data.maxCommentsOnRecipe} />
        <StatRow label="Saves trên 1 Công Thức" value={data.maxSavesOnRecipe} />
      </View>

      {/* Distributions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Phân Phối Likes</Text>
        <DistributionBar distribution={data.likeDistribution} total={totalRecipes} />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Phân Phối Comments</Text>
        <DistributionBar distribution={data.commentDistribution} total={totalRecipes} />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Phân Phối Saves</Text>
        <DistributionBar distribution={data.saveDistribution} total={totalRecipes} />
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
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: 12,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray[100],
  },
  statLabel: {
    fontSize: 13,
    color: Colors.text.secondary,
  },
  statValue: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text.primary,
  },
  distributionContainer: {
    marginTop: 8,
  },
  barContainer: {
    flexDirection: 'row',
    height: 24,
    borderRadius: 6,
    overflow: 'hidden',
    backgroundColor: Colors.gray[100],
  },
  barSegment: {
    height: '100%',
  },
  legendContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 12,
    gap: 8,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  legendColor: {
    width: 12,
    height: 12,
    borderRadius: 2,
    marginRight: 4,
  },
  legendText: {
    fontSize: 11,
    color: Colors.text.secondary,
  },
});