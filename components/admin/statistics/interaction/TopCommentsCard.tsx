import { formatNumber } from '@/services/adminStatisticsService';
import { Colors } from '@/styles/colors';
import { TopComments } from '@/types/admin/interaction.types';
import { Ionicons } from '@expo/vector-icons';
import { ActivityIndicator, Image, StyleSheet, Text, View } from 'react-native';

interface TopCommentsCardProps {
  data: TopComments | null;
  loading: boolean;
}

export default function TopCommentsCard({ data, loading }: TopCommentsCardProps) {
  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#10b981" />
      </View>
    );
  }

  if (!data || data.topComments.length === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Top Bình Luận</Text>
        <Text style={styles.emptyText}>Chưa có dữ liệu</Text>
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
      <Text style={styles.title}>Top Bình Luận</Text>
      <Text style={styles.subtitle}>
        {data.totalCount} bình luận được yêu thích nhất
      </Text>

      {data.topComments.map((comment, index) => (
        <View key={comment.commentId} style={styles.commentCard}>
          <View style={styles.rankBadge}>
            <Text style={styles.rankText}>#{index + 1}</Text>
          </View>

          <View style={styles.userInfo}>
            <Image
              source={{
                uri: comment.userAvatar || 'https://via.placeholder.com/40',
              }}
              style={styles.avatar}
            />
            <View style={styles.userDetails}>
              <Text style={styles.username}>{comment.username}</Text>
              <Text style={styles.date}>{formatDate(comment.createdAt)}</Text>
            </View>
          </View>

          <Text style={styles.commentContent} numberOfLines={3}>
            {comment.content}
          </Text>

          <View style={styles.recipeInfo}>
            <Ionicons name="restaurant-outline" size={14} color={Colors.text.secondary} />
            <Text style={styles.recipeTitle} numberOfLines={1}>
              {comment.recipeTitle}
            </Text>
          </View>

          <View style={styles.likeCount}>
            <Ionicons name="heart" size={16} color="#ef4444" />
            <Text style={styles.likeText}>{formatNumber(comment.likeCount)}</Text>
          </View>
        </View>
      ))}
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
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 13,
    color: Colors.text.secondary,
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 14,
    color: Colors.text.secondary,
    textAlign: 'center',
    paddingVertical: 20,
  },
  commentCard: {
    backgroundColor: Colors.gray[50],
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    position: 'relative',
  },
  rankBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: '#10b981',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  rankText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#fff',
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.gray[200],
  },
  userDetails: {
    marginLeft: 8,
    flex: 1,
  },
  username: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text.primary,
  },
  date: {
    fontSize: 11,
    color: Colors.text.secondary,
    marginTop: 2,
  },
  commentContent: {
    fontSize: 13,
    color: Colors.text.primary,
    lineHeight: 18,
    marginBottom: 8,
  },
  recipeInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: Colors.gray[200],
  },
  recipeTitle: {
    fontSize: 12,
    color: Colors.text.secondary,
    marginLeft: 4,
    flex: 1,
  },
  likeCount: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  likeText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.text.primary,
    marginLeft: 4,
  },
});