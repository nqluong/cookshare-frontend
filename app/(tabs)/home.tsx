import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import FeaturedDish from '../../components/home/FeaturedDish';
import SearchBar from '../../components/home/SearchBar';
import TabBar from '../../components/home/TabBar';
import NewestRecipes from '../../components/home/sections/NewestRecipes';
import PopularRecipes from '../../components/home/sections/PopularRecipes';
import TopRatedRecipes from '../../components/home/sections/TopRatedRecipes';
import TrendingRecipes from '../../components/home/sections/TrendingRecipes';
import {
  getHomeSuggestions,
  getNewestRecipes,
  getPopularRecipes,
  getTopRatedRecipes,
  getTrendingRecipes,
  isRecipeLiked,
  likeRecipe,
  unlikeRecipe
} from '../../services/homeService';
import { Colors } from '../../styles/colors';
import { Recipe } from '../../types/dish';

export default function HomeScreen() {
  const [activeTab, setActiveTab] = useState('Đề xuất');
  const router = useRouter();
  
  const [featuredRecipes, setFeaturedRecipes] = useState<Recipe[]>([]);
  const [popularRecipes, setPopularRecipes] = useState<Recipe[]>([]);
  const [newestRecipes, setNewestRecipes] = useState<Recipe[]>([]);
  const [topRatedRecipes, setTopRatedRecipes] = useState<Recipe[]>([]);
  const [trendingRecipes, setTrendingRecipes] = useState<Recipe[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Pagination state
  const [newestPage, setNewestPage] = useState(0); 
  const [hasMoreNewest, setHasMoreNewest] = useState(true); 
  const [isLoadingMoreNewest, setIsLoadingMoreNewest] = useState(false);

  const [trendingPage, setTrendingPage] = useState(0);
  const [hasMoreTrending, setHasMoreTrending] = useState(true);
  const [isLoadingMoreTrending, setIsLoadingMoreTrending] = useState(false);

  const [popularPage, setPopularPage] = useState(0);
  const [hasMorePopular, setHasMorePopular] = useState(true);
  const [isLoadingMorePopular, setIsLoadingMorePopular] = useState(false);

  const [topRatedPage, setTopRatedPage] = useState(0);
  const [hasMoreTopRated, setHasMoreTopRated] = useState(true);
  const [isLoadingMoreTopRated, setIsLoadingMoreTopRated] = useState(false);

  // State cho tracking liked recipes
  const [likedRecipes, setLikedRecipes] = useState<Set<string>>(new Set());
  const [likingRecipeId, setLikingRecipeId] = useState<string | null>(null);

  useEffect(() => {
    fetchHomeSuggestions();
  }, []);

  const fetchHomeSuggestions = async () => {
  try {
    setLoading(true);
    setError(null);

    const response = await getHomeSuggestions();
    
    if (response.success && response.data) {
      const { trendingRecipes, popularRecipes, newestRecipes, topRatedRecipes, featuredRecipes } = response.data;
      
      const allRecipeIds = [
        ...(trendingRecipes || []).map((r: Recipe) => r.recipeId),
        ...(popularRecipes || []).map((r: Recipe) => r.recipeId),
        ...(newestRecipes || []).map((r: Recipe) => r.recipeId),
        ...(topRatedRecipes || []).map((r: Recipe) => r.recipeId),
        ...(featuredRecipes || []).map((r: Recipe) => r.recipeId),
      ];

      const likePromises = allRecipeIds.map(async (recipeId: string) => {
        try {
          const response = await isRecipeLiked(recipeId);
          console.log(`Recipe ${recipeId} is liked:`, response.result);
          return { recipeId, isLiked: response.result };
        } catch (error) {
          console.error(`Lỗi khi kiểm tra like cho recipeId ${recipeId}:`, error);
          return { recipeId, isLiked: false };
        }
      });

      const likeResults = await Promise.all(likePromises);
      const likedSet = new Set(likeResults.filter(r => r.isLiked).map(r => r.recipeId));
      
      setLikedRecipes(likedSet);
      setFeaturedRecipes(featuredRecipes || []);
      setPopularRecipes(popularRecipes || []);
      setNewestRecipes(newestRecipes || []);
      setTopRatedRecipes(topRatedRecipes || []);
      setTrendingRecipes(trendingRecipes || []);
    }
  } catch (err: any) {
    console.error('Error fetching home suggestions:', err);
    setError(err.message || 'Không thể tải dữ liệu');
  } finally {
    setLoading(false);
  }
};

  const handleOpenDetail = (recipe: Recipe) => {
    router.push(`/_recipe-detail/${recipe.recipeId}` as any);
  };

const toggleLike = async (recipeId: string) => {
  if (likingRecipeId) {
    console.log('Không thể toggle like: đang xử lý');
    return;
  }
  
  try {
    setLikingRecipeId(recipeId);
    console.log(`Bắt đầu toggle like cho recipeId: ${recipeId}`);
    const isLikedResponse = await isRecipeLiked(recipeId);
    console.log('isRecipeLiked response:', JSON.stringify(isLikedResponse, null, 2));

    // Kiểm tra phản hồi theo cấu trúc thực tế
    if (typeof isLikedResponse.result !== 'boolean') {
      throw new Error(isLikedResponse.message || 'Phản hồi không hợp lệ từ isRecipeLiked');
    }

    const isLiked = isLikedResponse.result;

    if (isLiked) {
      try {
        const response = await unlikeRecipe(recipeId);
        console.log('unlikeRecipe response:', JSON.stringify(response, null, 2));
        if (response.code === 1000 && response.result === 'Unliked thành công') {
          setLikedRecipes(prev => {
            const newSet = new Set(prev);
            newSet.delete(recipeId);
            console.log('Sau khi unlike, likedRecipes:', Array.from(newSet));
            return newSet;
          });
          updateRecipeLikeCount(recipeId, -1);
          console.log('isRecipeLiked response:', JSON.stringify(isLikedResponse, null, 2));
        } else {
          throw new Error(response.message || 'Không thể bỏ like công thức');
        }
      } catch (error: any) {
        if (error.message === 'Công thức chưa được thích') {
          // Đồng bộ lại trạng thái likedRecipes
          setLikedRecipes(prev => {
            const newSet = new Set(prev);
            newSet.delete(recipeId);
            return newSet;
          });
        } else {
          throw error;
        }
      }
    } else {
      const response = await likeRecipe(recipeId);
      console.log('likeRecipe response:', JSON.stringify(response, null, 2));
      if (response.code === 1000 && response.result) {
        setLikedRecipes(prev => {
          const newSet = new Set(prev);
          newSet.add(recipeId);
          console.log('Sau khi like, likedRecipes:', Array.from(newSet));
          return newSet;
        });
        updateRecipeLikeCount(recipeId, +1);
      } else {
        throw new Error(response.message || 'Không thể like công thức');
      }
    }
  } catch (error: any) {
    console.error('Lỗi khi xử lý like/unlike:', error);
    if (error.message !== 'Công thức chưa được thích') {
      Alert.alert('Lỗi', error.message || 'Không thể thực hiện hành động. Vui lòng thử lại.');
    }
  } finally {
    setLikingRecipeId(null);
  }
};

const updateRecipeLikeCount = (recipeId: string, delta: number) => {
  // Cập nhật trendingRecipes
  setTrendingRecipes(prev => prev.map(recipe => 
    recipe.recipeId === recipeId 
      ? { ...recipe, likeCount: recipe.likeCount + delta }
      : recipe
  ));
  
  // Cập nhật popularRecipes
  setPopularRecipes(prev => prev.map(recipe => 
    recipe.recipeId === recipeId 
      ? { ...recipe, likeCount: recipe.likeCount + delta }
      : recipe
  ));
  
  // Cập nhật newestRecipes
  setNewestRecipes(prev => prev.map(recipe => 
    recipe.recipeId === recipeId 
      ? { ...recipe, likeCount: recipe.likeCount + delta }
      : recipe
  ));
  
  // Cập nhật topRatedRecipes
  setTopRatedRecipes(prev => prev.map(recipe => 
    recipe.recipeId === recipeId 
      ? { ...recipe, likeCount: recipe.likeCount + delta }
      : recipe
  ));
};

  // Load more Newest
  const handleLoadMoreNewest = async () => {
    if (isLoadingMoreNewest || !hasMoreNewest) return;

    try {
      setIsLoadingMoreNewest(true);
      const nextPage = newestPage + 1;
      const response = await getNewestRecipes(nextPage, 10);
      
      if (response.success && response.data) {
        const newRecipes = response.data.content || [];
        setNewestRecipes(prev => [...prev, ...newRecipes]);
        setNewestPage(nextPage);
        setHasMoreNewest(!response.data.last);
      }
    } catch (err: any) {
      console.error('Error loading more newest recipes:', err);
    } finally {
      setIsLoadingMoreNewest(false);
    }
  };

  // Load more Trending
  const handleLoadMoreTrending = async () => {
    if (isLoadingMoreTrending || !hasMoreTrending) return;

    try {
      setIsLoadingMoreTrending(true);
      const nextPage = trendingPage + 1;
      const response = await getTrendingRecipes(nextPage, 10);
      
      if (response.success && response.data) {
        const newRecipes = response.data.content || [];
        setTrendingRecipes(prev => [...prev, ...newRecipes]);
        setTrendingPage(nextPage);
        setHasMoreTrending(!response.data.last);
      }
    } catch (err: any) {
      console.error('Error loading more trending recipes:', err);
    } finally {
      setIsLoadingMoreTrending(false);
    }
  };

  // Load more Popular
  const handleLoadMorePopular = async () => {
    if (isLoadingMorePopular || !hasMorePopular) return;

    try {
      setIsLoadingMorePopular(true);
      const nextPage = popularPage + 1;
      const response = await getPopularRecipes(nextPage, 20);
      
      if (response.success && response.data) {
        const newRecipes = response.data.content || [];
        setPopularRecipes(prev => [...prev, ...newRecipes]);
        setPopularPage(nextPage);
        setHasMorePopular(!response.data.last);
      }
    } catch (err: any) {
      console.error('Error loading more popular recipes:', err);
    } finally {
      setIsLoadingMorePopular(false);
    }
  };

  // Load more TopRated
  const handleLoadMoreTopRated = async () => {
    if (isLoadingMoreTopRated || !hasMoreTopRated) return;

    try {
      setIsLoadingMoreTopRated(true);
      const nextPage = topRatedPage + 1;
      const response = await getTopRatedRecipes(nextPage, 10);
      
      if (response.success && response.data) {
        const newRecipes = response.data.content || [];
        setTopRatedRecipes(prev => [...prev, ...newRecipes]);
        setTopRatedPage(nextPage);
        setHasMoreTopRated(!response.data.last);
      }
    } catch (err: any) {
      console.error('Error loading more topRated recipes:', err);
    } finally {
      setIsLoadingMoreTopRated(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
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
        <View style={styles.centerContainer}>
          <Text style={styles.errorText}>❌ {error}</Text>
          <Text style={styles.retryText} onPress={fetchHomeSuggestions}>
            Thử lại
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <SearchBar />
      <TabBar activeTab={activeTab} onTabChange={setActiveTab} />

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <FeaturedDish recipe={featuredRecipes[0]} onRecipePress={handleOpenDetail} />
        
        <TrendingRecipes 
          recipes={trendingRecipes} 
          onRecipePress={handleOpenDetail}
          onLoadMore={handleLoadMoreTrending}
          hasMore={hasMoreTrending}
          isLoadingMore={isLoadingMoreTrending}
          likedRecipes={likedRecipes}
          likingRecipeId={likingRecipeId}
          onToggleLike={toggleLike}
        />
        
        <PopularRecipes 
          recipes={popularRecipes} 
          onRecipePress={handleOpenDetail}
          onLoadMore={handleLoadMorePopular}
          hasMore={hasMorePopular}
          isLoadingMore={isLoadingMorePopular}
          likedRecipes={likedRecipes}
          likingRecipeId={likingRecipeId}
          onToggleLike={toggleLike}
        />
        
        <TopRatedRecipes 
          recipes={topRatedRecipes} 
          onRecipePress={handleOpenDetail}
          onLoadMore={handleLoadMoreTopRated}
          hasMore={hasMoreTopRated}
          isLoadingMore={isLoadingMoreTopRated}
          likedRecipes={likedRecipes}
          likingRecipeId={likingRecipeId}
          onToggleLike={toggleLike}
        />
        
        <NewestRecipes 
          recipes={newestRecipes} 
          onRecipePress={handleOpenDetail}
          onLoadMore={handleLoadMoreNewest}
          hasMore={hasMoreNewest}
          isLoadingMore={isLoadingMoreNewest}
          likedRecipes={likedRecipes}
          likingRecipeId={likingRecipeId}
          onToggleLike={toggleLike}
        />
        
        <View style={styles.bottomPadding} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollView: {
    flex: 1,
  },
  bottomPadding: {
    height: 80, 
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
