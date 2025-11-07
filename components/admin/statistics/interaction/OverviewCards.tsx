import { Ionicons } from '@expo/vector-icons';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { Colors } from '../../../../styles/colors';
import { InteractionOverview } from '../../../../types/admin/interaction.types';

interface OverviewCardsProps {
  data: InteractionOverview | null;
  loading: boolean;
}

export default function OverviewCards({ data, loading }: OverviewCardsProps) {
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
      icon: 'heart' as const,
      label: 'Tổng Likes',
      value: formatNumber(data.totalLikes),
      color: '#ef4444',
      bgColor: '#fee2e2',
    },
    {
      icon: 'chatbubble' as const,
      label: 'Bình Luận',
      value: formatNumber(data.totalComments),
      color: '#3b82f6',
      bgColor: '#dbeafe',
    },
    {
      icon: 'bookmark' as const,
      label: 'Lưu',
      value: formatNumber(data.totalSaves),
      color: '#f59e0b',
      bgColor: '#fef3c7',
    },
    {
      icon: 'trending-up' as const,
      label: 'Tỷ Lệ Tương Tác',
      value: `${data.engagementRate.toFixed(1)}%`,
      color: '#10b981',
      bgColor: '#d1fae5',
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