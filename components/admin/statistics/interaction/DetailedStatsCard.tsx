import { formatNumber } from '@/services/adminStatisticsService';
import { Colors } from '@/styles/colors';
import { DetailedInteractionStats } from '@/types/admin/interaction.types';
import { Ionicons } from '@expo/vector-icons';
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

  const StatCard = ({ 
    icon, 
    label, 
    value, 
    color 
  }: { 
    icon: keyof typeof Ionicons.glyphMap; 
    label: string; 
    value: number; 
    color: string;
  }) => (
    <View style={styles.statCard}>
      <View style={[styles.iconContainer, { backgroundColor: `${color}15` }]}>
        <Ionicons name={icon} size={20} color={color} />
      </View>
      <View style={styles.statContent}>
        <Text style={styles.statCardLabel}>{label}</Text>
        <Text style={[styles.statCardValue, { color }]}>{Math.round(value)}</Text>
      </View>
    </View>
  );

  const DistributionBar = ({ 
    distribution, 
    total,
    title,
    icon,
    iconColor
  }: { 
    distribution: any; 
    total: number;
    title: string;
    icon: keyof typeof Ionicons.glyphMap;
    iconColor: string;
  }) => {
    const segments = [
      { label: '0-10', count: distribution.count0to10, color: '#ef4444' },
      { label: '11-50', count: distribution.count11to50, color: '#f97316' },
      { label: '51-100', count: distribution.count51to100, color: '#eab308' },
      { label: '101-500', count: distribution.count101to500, color: '#22c55e' },
      { label: '500+', count: distribution.countOver500, color: '#10b981' },
    ];

    return (
      <View style={styles.distributionCard}>
        <View style={styles.distributionHeader}>
          <View style={[styles.distributionIconContainer, { backgroundColor: `${iconColor}15` }]}>
            <Ionicons name={icon} size={18} color={iconColor} />
          </View>
          <Text style={styles.distributionTitle}>{title}</Text>
        </View>
        
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
          {segments.map((segment, index) => {
            const percentage = segment.count > 0 ? ((segment.count / total) * 100).toFixed(1) : '0';
            return (
              <View key={index} style={styles.legendItem}>
                <View style={[styles.legendColor, { backgroundColor: segment.color }]} />
                <Text style={styles.legendText}>
                  {segment.label}
                </Text>
                <Text style={styles.legendCount}>
                  {segment.count} ({percentage}%)
                </Text>
              </View>
            );
          })}
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
        <View style={styles.sectionHeader}>
          <Ionicons name="analytics" size={18} color="#3b82f6" />
          <Text style={styles.sectionTitle}>Trung Bình Mỗi Công Thức</Text>
        </View>
        <View style={styles.statsGrid}>
          <StatCard 
            icon="heart" 
            label="Thích" 
            value={data.averageLikesPerRecipe} 
            color="#ef4444"
          />
          <StatCard 
            icon="chatbubble" 
            label="Bình Luận" 
            value={data.averageCommentsPerRecipe} 
            color="#3b82f6"
          />
          <StatCard 
            icon="bookmark" 
            label="Lưu" 
            value={data.averageSavesPerRecipe} 
            color="#10b981"
          />
        </View>
      </View>

      {/* Median Stats */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Ionicons name="stats-chart" size={18} color="#8b5cf6" />
          <Text style={styles.sectionTitle}>Trung Vị Mỗi Công Thức</Text>
        </View>
        <View style={styles.statsGrid}>
          <StatCard 
            icon="heart" 
            label="Thích" 
            value={data.medianLikesPerRecipe} 
            color="#ef4444"
          />
          <StatCard 
            icon="chatbubble" 
            label="Bình Luận" 
            value={data.medianCommentsPerRecipe} 
            color="#3b82f6"
          />
          <StatCard 
            icon="bookmark" 
            label="Lưu" 
            value={data.medianSavesPerRecipe} 
            color="#10b981"
          />
        </View>
      </View>

      {/* Max Stats */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Ionicons name="trophy" size={18} color="#f59e0b" />
          <Text style={styles.sectionTitle}>Kỷ Lục Cao Nhất</Text>
        </View>
        <View style={styles.statsGrid}>
          <StatCard 
            icon="heart" 
            label="Thích" 
            value={data.maxLikesOnRecipe} 
            color="#ef4444"
          />
          <StatCard 
            icon="chatbubble" 
            label="Bình Luận" 
            value={data.maxCommentsOnRecipe} 
            color="#3b82f6"
          />
          <StatCard 
            icon="bookmark" 
            label="Lưu" 
            value={data.maxSavesOnRecipe} 
            color="#10b981"
          />
        </View>
      </View>

      {/* Distributions */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Ionicons name="pie-chart" size={18} color="#ec4899" />
          <Text style={styles.sectionTitle}>Phân Phối Tương Tác</Text>
        </View>
        
        <DistributionBar 
          distribution={data.likeDistribution} 
          total={totalRecipes}
          title="Phân Phối Lượt Thích"
          icon="heart"
          iconColor="#ef4444"
        />
        
        <DistributionBar 
          distribution={data.commentDistribution} 
          total={totalRecipes}
          title="Phân Phối Bình Luận"
          icon="chatbubble"
          iconColor="#3b82f6"
        />
        
        <DistributionBar 
          distribution={data.saveDistribution} 
          total={totalRecipes}
          title="Phân Phối Lưu"
          icon="bookmark"
          iconColor="#10b981"
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
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
    paddingBottom: 8,
    borderBottomWidth: 2,
    borderBottomColor: Colors.gray[200],
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.text.primary,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 8,
  },
  statCard: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.gray[50],
    borderRadius: 8,
    padding: 12,
    gap: 8,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statContent: {
    flex: 1,
  },
  statCardLabel: {
    fontSize: 11,
    color: Colors.text.secondary,
    marginBottom: 2,
  },
  statCardValue: {
    fontSize: 16,
    fontWeight: '700',
  },
  distributionCard: {
    backgroundColor: Colors.gray[50],
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  distributionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  distributionIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  distributionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text.primary,
  },
  barContainer: {
    flexDirection: 'row',
    height: 32,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: Colors.gray[200],
  },
  barSegment: {
    height: '100%',
  },
  legendContainer: {
    marginTop: 12,
    gap: 8,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 6,
    padding: 8,
  },
  legendColor: {
    width: 14,
    height: 14,
    borderRadius: 3,
    marginRight: 8,
  },
  legendText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.text.primary,
    flex: 1,
  },
  legendCount: {
    fontSize: 12,
    color: Colors.text.secondary,
    fontWeight: '500',
  },
});