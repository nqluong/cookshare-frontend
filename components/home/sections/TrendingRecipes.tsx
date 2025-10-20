import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { ActivityIndicator, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Colors } from '../../../styles/colors';
import { Recipe } from '../../../types/dish';
import { recipeToDish } from '../../../utils/recipeHelpers';

interface TrendingRecipesProps {
  recipes: Recipe[];
  onRecipePress?: (recipe: Recipe) => void;
  onLoadMore?: () => void;
  hasMore?: boolean;
  isLoadingMore?: boolean;
  likedRecipes?: Set<string>;
  likingRecipeId?: string | null;
  onToggleLike?: (recipeId: string) => Promise<void>;
}

// Component hiển thị danh sách công thức đang thịnh hành (trending)
export default function TrendingRecipes({ 
  recipes, 
  onRecipePress,
  onLoadMore,
  hasMore = false, 
  isLoadingMore = false,
  likedRecipes = new Set<string>(), 
  likingRecipeId,
  onToggleLike 
}: TrendingRecipesProps) {
  const router = useRouter();

  const handleScroll = (event: any) => {
    const { layoutMeasurement, contentOffset, contentSize } = event.nativeEvent;
    const paddingToEnd = 20;
    
    if (layoutMeasurement.width + contentOffset.x >= contentSize.width - paddingToEnd) {
      if (hasMore && !isLoadingMore && onLoadMore) {
        onLoadMore();
      }
    }
  };

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
      <View style={styles.header}>
        <Text style={styles.title}>Đang thịnh hành 🔥</Text>
        <TouchableOpacity 
          style={styles.viewAllButton}
          onPress={() => router.push({ pathname: '/_view-all', params: { type: 'trending' } })}
          activeOpacity={0.7}
        >
          <Text style={styles.viewAllText}>Xem tất cả</Text>
          <Ionicons name="chevron-forward" size={16} color={Colors.primary} />
        </TouchableOpacity>
      </View>
      
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        onScroll={handleScroll}
        scrollEventThrottle={400}
      >
        {recipes.map((recipe, index) => {
          const dish = recipeToDish(recipe);
          const isLiked = likedRecipes.has(recipe.recipeId);
          const isLoading = likingRecipeId === recipe.recipeId;
          const currentLikes = recipe.likeCount; // ✅ Dùng likeCount từ backend

          return (
            <TouchableOpacity
              key={recipe.recipeId}
              style={styles.card}
              onPress={() => onRecipePress?.(recipe)}
              activeOpacity={0.7}
            >
              <View style={styles.imageWrapper}>
                <View style={styles.imageContainer}>
                  <Image 
                    source={{ uri: dish.image }}
                    style={styles.image}
                    resizeMode="cover"
                  />
                  {/* Trending rank badge */}
                  {index < 3 && (
                    <View style={styles.rankBadge}>
                      <Text style={styles.rankText}>#{index + 1}</Text>
                    </View>
                  )}
                </View>
                <TouchableOpacity
                  style={[
                    styles.likeButton,
                    isLoading && styles.loadingLikeButton // ✅ Loading state
                  ]}
                  onPress={(e) => toggleLike(recipe.recipeId, e)}
                  activeOpacity={0.7}
                  disabled={isLoading} // ✅ Disable khi loading
                >
                  {isLoading ? (
                    <ActivityIndicator size={12} color={Colors.primary} />
                  ) : (
                    <Ionicons
                      name={isLiked ? 'heart' : 'heart-outline'}
                      size={16}
                      color={isLiked ? Colors.primary : Colors.text.light}
                    />
                  )}
                </TouchableOpacity>
              </View>
              
              {/* Tên công thức */}
              <Text style={styles.dishName} numberOfLines={1}>
                {dish.name}
              </Text>

              {/* Thống kê: Lượt thích */}
              <View style={styles.likesContainer}>
                <Text style={styles.likesText}>{currentLikes.toLocaleString()}</Text>
                <Ionicons name="heart" size={12} color={Colors.primary} />
              </View>
            </TouchableOpacity>
          );
        })}
        
        {isLoadingMore && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="small" color={Colors.primary} />
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 24,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  title: {
    fontSize: 17,
    fontWeight: '700',
    color: Colors.text.primary,
  },
  scrollContent: {
    paddingHorizontal: 16,
    gap: 12,
  },
  card: {
    width: 90,
    alignItems: 'center',
  },
  imageWrapper: {
    position: 'relative',
    marginBottom: 8,
  },
  imageContainer: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: Colors.white,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: Colors.gray[200],
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  rankBadge: {
    position: 'absolute',
    top: -4,
    left: -4,
    backgroundColor: Colors.primary,
    borderRadius: 12,
    width: 28,
    height: 28,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: Colors.white,
  },
  rankText: {
    color: Colors.white,
    fontSize: 12,
    fontWeight: '700',
  },
  likeButton: {
    position: 'absolute',
    bottom: -4,
    right: -4,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  loadingLikeButton: {
    opacity: 0.7,
  },
  dishName: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.text.primary,
    textAlign: 'center',
    marginBottom: 2,
  },
  likesContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  likesText: {
    fontSize: 11,
    color: Colors.text.secondary,
  },
  viewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  viewAllText: {
    fontSize: 14,
    color: Colors.primary,
    fontWeight: '600',
  },
  loadingContainer: {
    width: 90,
    height: 90,
    justifyContent: 'center',
    alignItems: 'center',
  },
});