import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getImageUrl } from '../../config/api.config';
import {
  getNewestRecipes,
  getPopularRecipes,
  getTopRatedRecipes,
  getTrendingRecipes,
} from '../../services/homeService';
import { Colors } from '../../styles/colors';
import { Recipe } from '../../types/dish';

type RecipeType = 'trending' | 'popular' | 'topRated' | 'newest';

const TITLES: Record<RecipeType, string> = {
  trending: 'Đang thịnh hành 🔥',
  popular: 'Phổ biến nhất',
  topRated: 'Đánh giá cao nhất ⭐',
  newest: 'Mới nhất',
};

const API_FUNCTIONS: Record<RecipeType, (page: number, size: number) => Promise<any>> = {
  trending: getTrendingRecipes,
  popular: getPopularRecipes,
  topRated: getTopRatedRecipes,
  newest: getNewestRecipes,
};

export default function ViewAllScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const type = (params.type as RecipeType) || 'newest';
  
  // Use canGoBack to determine if we should show back button
  const canGoBack = router.canGoBack();

  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [likedRecipes, setLikedRecipes] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetchRecipes(0, true);
  }, [type]);

  const fetchRecipes = async (pageNum: number, isInitial: boolean = false) => {
    if (!hasMore && !isInitial) return;

    try {
      if (isInitial) {
        setLoading(true);
        setRecipes([]);
        setPage(0);
        setHasMore(true);
      } else {
        setLoadingMore(true);
      }

      const apiFn = API_FUNCTIONS[type];
      const response = await apiFn(pageNum, 20); // 20 items mỗi lần load

      if (response.success && response.data) {
        const newRecipes = response.data.content || [];

        if (isInitial) {
          setRecipes(newRecipes);
        } else {
          setRecipes((prev) => [...prev, ...newRecipes]);
        }

        setPage(pageNum);
        setHasMore(!response.data.last);
      }
    } catch (err: any) {
      console.error('Error fetching recipes:', err);
      setError(err.message || 'Không thể tải dữ liệu');
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const handleLoadMore = () => {
    if (!loadingMore && hasMore) {
      fetchRecipes(page + 1);
    }
  };

  const toggleLike = (recipeId: string) => {
    setLikedRecipes((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(recipeId)) {
        newSet.delete(recipeId);
      } else {
        newSet.add(recipeId);
      }
      return newSet;
    });
  };

  const getDifficultyText = (difficulty: string) => {
    switch (difficulty) {
      case 'EASY':
        return 'Dễ';
      case 'MEDIUM':
        return 'Trung bình';
      case 'HARD':
        return 'Khó';
      default:
        return difficulty;
    }
  };

  const renderRecipeCard = ({ item: recipe }: { item: Recipe }) => {
    const isLiked = likedRecipes.has(recipe.recipeId);
    const currentLikes = isLiked ? recipe.likeCount + 1 : recipe.likeCount;

    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() => router.push(`/_recipe-detail/${recipe.recipeId}` as any)}
        activeOpacity={0.7}
      >
        <View style={styles.imageWrapper}>
          <Image
            source={{ uri: getImageUrl(recipe.featuredImage) }}
            style={styles.image}
            resizeMode="cover"
          />
          <TouchableOpacity
            style={styles.likeButton}
            onPress={() => toggleLike(recipe.recipeId)}
            activeOpacity={0.7}
          >
            <Ionicons
              name={isLiked ? 'heart' : 'heart-outline'}
              size={20}
              color={isLiked ? Colors.primary : Colors.white}
            />
          </TouchableOpacity>
        </View>

        <View style={styles.content}>
          <Text style={styles.recipeName} numberOfLines={2}>
            {recipe.title}
          </Text>

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

          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Ionicons name="star" size={14} color="#FFD700" />
              <Text style={styles.statText}>{recipe.averageRating.toFixed(1)}</Text>
              <Text style={styles.statSubText}>({recipe.ratingCount})</Text>
            </View>

            <View style={styles.statItem}>
              <Ionicons name="eye-outline" size={14} color={Colors.text.secondary} />
              <Text style={styles.statText}>{recipe.viewCount}</Text>
            </View>

            <View style={styles.statItem}>
              <Ionicons name="heart" size={14} color={Colors.primary} />
              <Text style={styles.statText}>{currentLikes}</Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderFooter = () => {
    if (!loadingMore) return null;

    return (
      <View style={styles.footer}>
        <ActivityIndicator size="small" color={Colors.primary} />
      </View>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={Colors.text.primary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{TITLES[type]}</Text>
          <View style={styles.placeholder} />
        </View>
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>Đang tải...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={Colors.text.primary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{TITLES[type]}</Text>
          <View style={styles.placeholder} />
        </View>
        <View style={styles.centerContainer}>
          <Text style={styles.errorText}>❌ {error}</Text>
          <TouchableOpacity onPress={() => fetchRecipes(0, true)}>
            <Text style={styles.retryText}>Thử lại</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <View style={styles.container}>
      <SafeAreaView edges={['top']} style={styles.safeArea}>
        <View style={styles.header}>
          <TouchableOpacity 
            onPress={() => canGoBack ? router.back() : router.replace('/(tabs)/home')} 
            style={styles.backButton}
          >
            <Ionicons name="arrow-back" size={24} color={Colors.text.primary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{TITLES[type]}</Text>
          <View style={styles.placeholder} />
        </View>
      </SafeAreaView>

      <FlatList
        data={recipes}
        renderItem={renderRecipeCard}
        keyExtractor={(item) => item.recipeId}
        contentContainerStyle={styles.listContent}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        ListFooterComponent={renderFooter}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  safeArea: {
    backgroundColor: Colors.white,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray[100],
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text.primary,
  },
  placeholder: {
    width: 32,
  },
  listContent: {
    padding: 16,
    paddingBottom: 100,
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
  footer: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: Colors.text.secondary,
  },
  errorText: {
    fontSize: 16,
    color: '#FF3B30',
    textAlign: 'center',
    marginBottom: 16,
  },
  retryText: {
    fontSize: 16,
    color: Colors.primary,
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
});

