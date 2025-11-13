import { formatNumber } from '@/services/adminStatisticsService';
import { Colors } from '@/styles/colors';
import { ZeroResultKeywords } from '@/types/admin/search.types';
import { Ionicons } from '@expo/vector-icons';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

interface ZeroResultKeywordsCardProps {
  data: ZeroResultKeywords | null;
  loading: boolean;
}

export default function ZeroResultKeywordsCard({ data, loading }: ZeroResultKeywordsCardProps) {
  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#10b981" />
      </View>
    );
  }

  if (!data || data.keywords.length === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Ionicons name="alert-circle-outline" size={24} color="#10b981" />
          <Text style={styles.title}>Từ Khóa Không Có Kết Quả</Text>
        </View>
        <Text style={styles.emptyText}>Tuyệt vời! Không có từ khóa nào không tìm thấy kết quả</Text>
      </View>
    );
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Ionicons name="alert-circle-outline" size={24} color="#ef4444" />
        <View style={styles.headerText}>
          <Text style={styles.title}>Từ Khóa Không Có Kết Quả</Text>
          <Text style={styles.subtitle}>
            {data.keywords.length} từ khóa ({data.percentageOfTotal.toFixed(1)}% tổng số tìm kiếm)
          </Text>
        </View>
      </View>

      <View style={styles.warningBox}>
        <Ionicons name="warning-outline" size={20} color="#f59e0b" />
        <Text style={styles.warningText}>
          Cần xem xét thêm nội dung hoặc cải thiện thuật toán tìm kiếm
        </Text>
      </View>

      {data.keywords.map((keyword, index) => (
        <View key={`${keyword.keyword}-${index}`} style={styles.keywordCard}>
          <View style={styles.keywordHeader}>
            <View style={styles.rankBadge}>
              <Text style={styles.rankText}>#{index + 1}</Text>
            </View>
            <Text style={styles.keywordText} numberOfLines={1}>
              "{keyword.keyword}"
            </Text>
          </View>

          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Ionicons name="search-outline" size={14} color={Colors.text.secondary} />
              <Text style={styles.statText}>
                {formatNumber(keyword.searchCount)} lượt tìm
              </Text>
            </View>
            <View style={styles.statItem}>
              <Ionicons name="people-outline" size={14} color={Colors.text.secondary} />
              <Text style={styles.statText}>
                {formatNumber(keyword.uniqueUsers)} người dùng
              </Text>
            </View>
          </View>

          <View style={styles.datesRow}>
            <View style={styles.dateItem}>
              <Text style={styles.dateLabel}>Lần đầu:</Text>
              <Text style={styles.dateValue}>{formatDate(keyword.firstSearched)}</Text>
            </View>
            <View style={styles.dateItem}>
              <Text style={styles.dateLabel}>Lần cuối:</Text>
              <Text style={styles.dateValue}>{formatDate(keyword.lastSearched)}</Text>
            </View>
          </View>

          {/* {keyword.suggestedActions && keyword.suggestedActions.length > 0 && (
            <View style={styles.actionsContainer}>
              <Text style={styles.actionsTitle}>Đề xuất:</Text>
              {keyword.suggestedActions.map((action, idx) => (
                <View key={idx} style={styles.actionItem}>
                  <View style={styles.actionDot} />
                  <Text style={styles.actionText}>{action}</Text>
                </View>
              ))}
            </View>
          )} */}
        </View>
      ))}

      <View style={styles.footer}>
        <Ionicons name="information-circle-outline" size={16} color={Colors.text.secondary} />
        <Text style={styles.footerText}>
          Những từ khóa này có thể là cơ hội để mở rộng nội dung
        </Text>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 8,
  },
  headerText: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text.primary,
  },
  subtitle: {
    fontSize: 13,
    color: Colors.text.secondary,
    marginTop: 2,
  },
  emptyText: {
    fontSize: 14,
    color: Colors.text.secondary,
    textAlign: 'center',
    paddingVertical: 20,
  },
  warningBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fef3c7',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    gap: 8,
  },
  warningText: {
    flex: 1,
    fontSize: 13,
    color: '#92400e',
    lineHeight: 18,
  },
  keywordCard: {
    backgroundColor: Colors.gray[50],
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    borderLeftWidth: 3,
    borderLeftColor: '#ef4444',
  },
  keywordHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  rankBadge: {
    backgroundColor: '#ef4444',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginRight: 8,
  },
  rankText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#fff',
  },
  keywordText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text.primary,
    flex: 1,
    fontStyle: 'italic',
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
  datesRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: Colors.gray[200],
    marginBottom: 8,
  },
  dateItem: {
    flex: 1,
  },
  dateLabel: {
    fontSize: 11,
    color: Colors.text.secondary,
    marginBottom: 2,
  },
  dateValue: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.text.primary,
  },
  actionsContainer: {
    backgroundColor: '#fff',
    borderRadius: 6,
    padding: 8,
    marginTop: 4,
  },
  actionsTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: 6,
  },
  actionItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  actionDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#10b981',
    marginTop: 6,
    marginRight: 6,
  },
  actionText: {
    flex: 1,
    fontSize: 12,
    color: Colors.text.secondary,
    lineHeight: 16,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 8,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.gray[200],
  },
  footerText: {
    flex: 1,
    fontSize: 12,
    color: Colors.text.secondary,
    fontStyle: 'italic',
  },
});