import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { ActivityIndicator, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Colors } from '../../../styles/colors';
import { Recipe } from '../../../types/dish';
import { recipeToDish } from '../../../utils/recipeHelpers';

interface PopularRecipesProps {
  recipes: Recipe[];
  onRecipePress?: (recipe: Recipe) => void;
  onLoadMore?: () => void;
  hasMore?: boolean;
  isLoadingMore?: boolean;
  likedRecipes?: Set<string>;
  likingRecipeId?: string | null;
  onToggleLike?: (recipeId: string) => Promise<void>;
}

// Component hiển thị danh sách công thức phổ biến (theo saveCount)
export default function PopularRecipes({ 
  recipes, 
  onRecipePress, 
  onLoadMore, 
  hasMore = false, 
  isLoadingMore = false,
  likedRecipes = new Set<string>(), 
  likingRecipeId,
  onToggleLike 
}: PopularRecipesProps) {
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
  
    if (likingRecipeId === recipeId || !onToggleLike) {
      return;
    }

    await onToggleLike(recipeId); 
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
    return null; // Không hiển thị nếu không có dữ liệu
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Phổ biến nhất</Text>
        <TouchableOpacity 
          style={styles.viewAllButton}
          onPress={() => router.push({ pathname: '/_view-all', params: { type: 'popular' } })}
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
        {recipes.map((recipe) => {
          const dish = recipeToDish(recipe);
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
              <View style={styles.imageWrapper}>
                <View style={styles.imageContainer}>
                  <Image 
                    source={{ uri: dish.image }}
                    style={styles.image}
                    resizeMode="cover"
                  />
                </View>
                <TouchableOpacity
                  style={[
                    styles.likeButton,
                    isLoading && styles.loadingLikeButton 
                  ]}
                  onPress={(e) => toggleLike(recipe.recipeId, e)}
                  activeOpacity={0.7}
                  disabled={isLoading}
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
              <View style={styles.info}>
                <Text style={styles.dishName} numberOfLines={2}>
                  {dish.name}
                </Text>
                
                {/* Thông tin: Độ khó | Thời gian | Khẩu phần */}
                <View style={styles.detailsRow}>
                  <View style={styles.detailItem}>
                    <Ionicons name="bar-chart-outline" size={11} color={Colors.text.secondary} />
                    <Text style={styles.detailText}>{getDifficultyText(recipe.difficulty)}</Text>
                  </View>
                  <View style={styles.divider} />
                  <View style={styles.detailItem}>
                    <Ionicons name="time-outline" size={11} color={Colors.text.secondary} />
                    <Text style={styles.detailText}>{recipe.cookTime}p</Text>
                  </View>
                  <View style={styles.divider} />
                  <View style={styles.detailItem}>
                    <Ionicons name="people-outline" size={11} color={Colors.text.secondary} />
                    <Text style={styles.detailText}>{recipe.servings}</Text>
                  </View>
                </View>

                {/* Stats: Views và Likes */}
                <View style={styles.stats}>
                  <View style={styles.stat}>
                    <Ionicons name="eye-outline" size={12} color={Colors.text.secondary} />
                    <Text style={styles.statText}>{recipe.viewCount}</Text>
                  </View>
                  <View style={styles.stat}>
                    <Ionicons name="heart" size={12} color={Colors.primary} />
                    <Text style={styles.statText}>{currentLikes}</Text>
                  </View>
                </View>
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
    width: 150,
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  imageWrapper: {
    position: 'relative',
    marginBottom: 8,
  },
  imageContainer: {
    width: '100%',
    height: 134,
    borderRadius: 8,
    backgroundColor: Colors.gray[100],
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  likeButton: {
    position: 'absolute',
    bottom: 4,
    right: 4,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 3,
  },
  info: {
    gap: 6,
  },
  dishName: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.text.primary,
    minHeight: 32,
    lineHeight: 16,
  },
  detailsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    flex: 1,
  },
  divider: {
    width: 1,
    height: 10,
    backgroundColor: Colors.gray[200],
    marginHorizontal: 2,
  },
  detailText: {
    fontSize: 9,
    color: Colors.text.secondary,
    fontWeight: '500',
  },
  stats: {
    flexDirection: 'row',
    gap: 8,
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: Colors.gray[100],
  },
  stat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  statText: {
    fontSize: 11,
    color: Colors.text.secondary,
    fontWeight: '500',
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
    width: 150,
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
  },
   loadingLikeButton: {
    opacity: 0.7,
  },
});


