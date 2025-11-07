import { Colors } from '@/styles/colors';
import { SearchSuccessRate } from '@/types/admin/search.types';
import { Ionicons } from '@expo/vector-icons';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

interface SearchSuccessRateCardProps {
  data: SearchSuccessRate | null;
  loading: boolean;
}

export default function SearchSuccessRateCard({ data, loading }: SearchSuccessRateCardProps) {
  if (loading) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Tỷ Lệ Thành Công</Text>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#10b981" />
        </View>
      </View>
    );
  }

  if (!data) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Tỷ Lệ Thành Công</Text>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Không có dữ liệu</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Tỷ Lệ Thành Công Tìm Kiếm</Text>

      {/* Main Stats */}
      <View style={styles.mainStats}>
        <View style={styles.successContainer}>
          <View style={styles.successCircle}>
            <Text style={styles.successPercentage}>{data.successRate.toFixed(1)}%</Text>
            <Text style={styles.successLabel}>Thành công</Text>
          </View>
        </View>

        <View style={styles.statsGrid}>
          <View style={styles.statItem}>
            <View style={[styles.statIcon, { backgroundColor: '#d1fae5' }]}>
              <Ionicons name="checkmark-circle" size={20} color="#10b981" />
            </View>
            <Text style={styles.statValue}>{data.successfulSearches}</Text>
            <Text style={styles.statLabel}>Có kết quả</Text>
          </View>

          <View style={styles.statItem}>
            <View style={[styles.statIcon, { backgroundColor: '#fee2e2' }]}>
              <Ionicons name="close-circle" size={20} color="#ef4444" />
            </View>
            <Text style={styles.statValue}>{data.failedSearches}</Text>
            <Text style={styles.statLabel}>Không có</Text>
          </View>
        </View>
      </View>

      {/* Success by Type */}
      {data.successByType && data.successByType.length > 0 && (
        <>
          <Text style={styles.sectionTitle}>Theo Loại Tìm Kiếm</Text>
          {data.successByType.map((type, index) => (
            <View key={index} style={styles.typeCard}>
              <View style={styles.typeHeader}>
                <Text style={styles.typeName}>{type.searchType}</Text>
                <Text style={[styles.typeRate, { 
                  color: type.successRate > 80 ? '#10b981' : type.successRate > 50 ? '#f59e0b' : '#ef4444' 
                }]}>
                  {type.successRate.toFixed(1)}%
                </Text>
              </View>
              <View style={styles.progressBar}>
                <View 
                  style={[
                    styles.progressFill, 
                    { 
                      width: `${type.successRate}%`,
                      backgroundColor: type.successRate > 80 ? '#10b981' : type.successRate > 50 ? '#f59e0b' : '#ef4444'
                    }
                  ]} 
                />
              </View>
              <Text style={styles.typeStats}>
                {type.successfulSearches} / {type.totalSearches} tìm kiếm
              </Text>
            </View>
          ))}
        </>
      )}
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
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text.primary,
    marginBottom: 16,
  },
  mainStats: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  successContainer: {
    alignItems: 'center',
    marginRight: 20,
  },
  successCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#d1fae5',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 4,
    borderColor: '#10b981',
  },
  successPercentage: {
    fontSize: 24,
    fontWeight: '700',
    color: '#10b981',
  },
  successLabel: {
    fontSize: 11,
    color: '#10b981',
    marginTop: 2,
  },
  statsGrid: {
    flex: 1,
    gap: 12,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.gray[50],
    padding: 12,
    borderRadius: 12,
  },
  statIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  statValue: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text.primary,
    marginRight: 8,
  },
  statLabel: {
    fontSize: 13,
    color: Colors.text.secondary,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.text.primary,
    marginTop: 8,
    marginBottom: 12,
  },
  typeCard: {
    backgroundColor: Colors.gray[50],
    padding: 12,
    borderRadius: 12,
    marginBottom: 8,
  },
  typeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  typeName: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text.primary,
  },
  typeRate: {
    fontSize: 16,
    fontWeight: '700',
  },
  progressBar: {
    height: 8,
    backgroundColor: Colors.gray[200],
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 6,
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  typeStats: {
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