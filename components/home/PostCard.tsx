import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Colors } from '../../styles/colors';
import { Post } from '../../types/post';

interface PostCardProps {
  post: Post;
  onPress?: () => void; // ✅ prop để điều hướng khi nhấn
}

export default function PostCard({ post, onPress }: PostCardProps) {
  const [isLiked, setIsLiked] = useState(post.isLiked || false);
  const [likesCount, setLikesCount] = useState(post.likes);

  const handleLike = () => {
    setIsLiked(!isLiked);
    setLikesCount(isLiked ? likesCount - 1 : likesCount + 1);
  };

  return (
    // ✅ Bọc toàn bộ card trong TouchableOpacity để bắt sự kiện nhấn
    <TouchableOpacity onPress={onPress} activeOpacity={0.8} style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.avatar}>
          <Ionicons name="person" size={20} color={Colors.text.light} />
        </View>
        <View style={styles.authorInfo}>
          <Text style={styles.authorName}>{post.author}</Text>
          <Text style={styles.timeAgo}>{post.timeAgo}</Text>
        </View>
        <Ionicons name="ellipsis-vertical" size={20} color={Colors.text.secondary} />
      </View>

      {/* Image */}
      <Image source={{ uri: post.image }} style={styles.image} resizeMode="cover" />

      {/* Content */}
      <View style={styles.content}>
        <Text style={styles.description}>{post.description}</Text>
        <View style={styles.actions}>
          <TouchableOpacity style={styles.actionButton} onPress={handleLike}>
            <Ionicons
              name={isLiked ? 'heart' : 'heart-outline'}
              size={20}
              color={isLiked ? Colors.primary : Colors.text.secondary}
            />
            <Text style={[styles.actionText, isLiked && styles.likedText]}>
              {likesCount}
            </Text>
          </TouchableOpacity>
          <View style={styles.actionButton}>
            <Ionicons name="chatbubble-outline" size={20} color={Colors.text.secondary} />
            <Text style={styles.actionText}>{post.comments}</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    marginBottom: 16,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.gray[200],
    justifyContent: 'center',
    alignItems: 'center',
  },
  authorInfo: {
    flex: 1,
    marginLeft: 12,
  },
  authorName: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: 2,
  },
  timeAgo: {
    fontSize: 12,
    color: Colors.text.secondary,
  },
  image: {
    width: '100%',
    height: 200,
    backgroundColor: Colors.gray[100],
  },
  content: {
    padding: 12,
  },
  description: {
    fontSize: 14,
    color: Colors.text.primary,
    lineHeight: 20,
    marginBottom: 12,
  },
  actions: {
    flexDirection: 'row',
    gap: 20,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  actionText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text.secondary,
  },
  likedText: {
    color: Colors.primary,
  },
});
