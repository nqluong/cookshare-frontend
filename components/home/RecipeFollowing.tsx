import { Ionicons } from '@expo/vector-icons';
import { ActivityIndicator, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { getImageUrl } from '../../config/api.config';
import { Colors } from '../../styles/colors';
import { Recipe } from '../../types/dish';

interface LikedRecipesProps {
  recipes: Recipe[]; // Danh sách công thức đã thích từ API
  onRecipePress?: (recipe: Recipe) => void; // Callback khi nhấn vào công thức
  onLoadMore?: () => void; // Callback khi cần load thêm
  hasMore?: boolean; // Còn data để load không
  isLoadingMore?: boolean; // Đang load thêm không
  likedRecipes?: Set<string>;
  likingRecipeId?: string | null;
  onToggleLike?: (recipeId: string) => Promise<void>;
}

// Component hiển thị danh sách công thức đã thích
export default function LikedRecipes({
  recipes,
  onRecipePress,
  onLoadMore,
  hasMore = false,
  isLoadingMore = false,
  likedRecipes = new Set<string>(),
  likingRecipeId,
  onToggleLike,
}: LikedRecipesProps) {
  const toggleLike = async (recipeId: string, event: any) => {
    event.stopPropagation();
    // ✅ Kiểm tra đang loading hoặc không có callback
    if (likingRecipeId === recipeId || !onToggleLike) {
      return;
    }
    await onToggleLike(recipeId); // ✅ Gọi callback từ parent
  };

  const getDifficultyText = (difficulty: string) => {
    switch (difficulty) {
      case 'EASY': return 'Dễ';
      case 'MEDIUM': return 'Trung bình';
      case 'HARD': return 'Khó';
      default: return difficulty;
    }
  };

  if (!recipes || recipes.length === 0) {
    return null;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Công thức đã theo dõi</Text>

      {recipes.map((recipe) => {
        const isLiked = likedRecipes.has(recipe.recipeId);
        const isLoading = likingRecipeId === recipe.recipeId;
        const currentLikes = recipe.likeCount;

        return (
          <TouchableOpacity
            key={recipe.recipeId}
            style={styles.card}
            onPress={() => onRecipePress?.(recipe)}
            activeOpacity={0.7}
          >
            {/* Image Section */}
            <View style={styles.imageWrapper}>
              <Image
                source={{ uri: getImageUrl(recipe.featuredImage) }}
                style={styles.image}
                resizeMode="cover"
              />
              <TouchableOpacity
                style={styles.likeButton}
                onPress={(e) => toggleLike(recipe.recipeId, e)}
                activeOpacity={0.7}
              >
                {isLoading ? (
                  <ActivityIndicator size="small" color={Colors.white} />
                ) : (
                  <Ionicons
                    name={isLiked ? 'heart' : 'heart-outline'}
                    size={20}
                    color={isLiked ? Colors.primary : Colors.white}
                  />
                )}
              </TouchableOpacity>
            </View>

            {/* Content Section */}
            <View style={styles.content}>
              {/* Title */}
              <Text style={styles.recipeName} numberOfLines={2}>
                {recipe.title}
              </Text>

              {/* Details Row: Độ khó | Thời gian | Khẩu phần */}
              <View style={styles.detailsRow}>
                <View style={styles.detailItem}>
                  <Ionicons name="bar-chart-outline" size={14} color={Colors.text.secondary} />
                  <Text style={styles.detailText}>{getDifficultyText(recipe.difficulty)}</Text>
                </View>
                <View style={styles.divider} />
                <View style={styles.detailItem}>
                  <Ionicons name="time-outline" size={14} color={Colors.text.secondary} />
                  <Text style={styles.detailText}>{recipe.cookTime} phút</Text>
                </View>
                <View style={styles.divider} />
                <View style={styles.detailItem}>
                  <Ionicons name="people-outline" size={14} color={Colors.text.secondary} />
                  <Text style={styles.detailText}>{recipe.servings} người</Text>
                </View>
              </View>

              {/* Stats Row: Rating | Views | Likes */}
              <View style={styles.statsRow}>
                {/* Rating */}
                <View style={styles.statItem}>
                  <Ionicons name="star" size={14} color="#FFD700" />
                  <Text style={styles.statText}>{recipe.averageRating.toFixed(1)}</Text>
                  <Text style={styles.statSubText}>({recipe.ratingCount})</Text>
                </View>

                {/* Views */}
                <View style={styles.statItem}>
                  <Ionicons name="eye-outline" size={14} color={Colors.text.secondary} />
                  <Text style={styles.statText}>{recipe.viewCount}</Text>
                </View>

                {/* Likes */}
                <View style={styles.statItem}>
                  <Ionicons name="heart" size={14} color={Colors.primary} />
                  <Text style={styles.statText}>{currentLikes}</Text>
                </View>
              </View>
            </View>
          </TouchableOpacity>
        );
      })}

      {/* Load More Section */}
      {hasMore && (
        <View style={styles.loadMoreContainer}>
          {isLoadingMore ? (
            <ActivityIndicator size="small" color={Colors.primary} />
          ) : (
            <TouchableOpacity
              style={styles.loadMoreButton}
              onPress={onLoadMore}
              activeOpacity={0.7}
            >
              <Text style={styles.loadMoreText}>Xem thêm</Text>
              <Ionicons name="chevron-down" size={16} color={Colors.primary} />
            </TouchableOpacity>
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  title: {
    fontSize: 17,
    fontWeight: '700',
    color: Colors.text.primary,
    marginBottom: 16,
  },
  card: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    marginBottom: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  imageWrapper: {
    width: '100%',
    height: 200,
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  likeButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    padding: 16,
  },
  recipeName: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text.primary,
    marginBottom: 12,
    lineHeight: 22,
  },
  detailsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray[100],
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    flex: 1,
  },
  divider: {
    width: 1,
    height: 14,
    backgroundColor: Colors.gray[200],
    marginHorizontal: 8,
  },
  detailText: {
    fontSize: 13,
    color: Colors.text.secondary,
    fontWeight: '500',
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statText: {
    fontSize: 13,
    color: Colors.text.primary,
    fontWeight: '600',
  },
  statSubText: {
    fontSize: 12,
    color: Colors.text.secondary,
  },
  loadMoreContainer: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  loadMoreButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: Colors.white,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.primary,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  loadMoreText: {
    fontSize: 14,
    color: Colors.primary,
    fontWeight: '600',
  },
});
