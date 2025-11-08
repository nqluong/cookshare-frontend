import LikedRecipes from '@/components/home/LikedRecipes';
import RecipeFollowing from '@/components/home/RecipeFollowing';
import { SearchHistoryItem } from '@/types/search';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import FeaturedDish from '../../components/home/FeaturedDish';
import SearchBar from '../../components/home/SearchBar';
import NewestRecipes from '../../components/home/sections/NewestRecipes';
import PopularRecipes from '../../components/home/sections/PopularRecipes';
import TopRatedRecipes from '../../components/home/sections/TopRatedRecipes';
import TrendingRecipes from '../../components/home/sections/TrendingRecipes';
import TabBar from '../../components/home/TabBar';
import RecipeCard from '../../components/Search/RecipeCard';
import {
  getHomeSuggestions,
  getLikedRecipes,
  getNewestRecipes,
  getPopularRecipes,
  getRecipebyFollowing,
  getTopRatedRecipes,
  getTrendingRecipes,
  searchRecipeByUser,
} from '../../services/homeService';
import { useRecipePagination } from '../../services/useRecipePagination';
import { useRecipeLike } from '../../services/userRecipeLike';
import { Colors } from '../../styles/colors';
import { searchStyles } from '../../styles/SearchStyles';
import { Recipe as DishRecipe } from '../../types/dish';
import { Recipe as SearchRecipe } from '../../types/search';

export default function HomeScreen() {
  const [activeTab, setActiveTab] = useState('Đề xuất');
  const router = useRouter();
  const { refresh } = useLocalSearchParams<{ refresh?: string }>();
  
  const [dailyRecommendations, setDailyRecommendations] = useState<DishRecipe[]>([]);
  const [featuredRecipes, setFeaturedRecipes] = useState<DishRecipe[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Sử dụng custom hooks
  const { likedRecipes, likingRecipeId, checkLikedStatus, toggleLike: handleToggleLike, setLikedRecipes } = useRecipeLike();
  
  // Pagination hooks cho từng section
  const newest = useRecipePagination({ 
    fetchFunction: getNewestRecipes,
    pageSize: 10 
  });
  
  const trending = useRecipePagination({ 
    fetchFunction: getTrendingRecipes,
    pageSize: 10 
  });
  
  const popular = useRecipePagination({ 
    fetchFunction: getPopularRecipes,
    pageSize: 20 
  });
  
  const topRated = useRecipePagination({ 
    fetchFunction: getTopRatedRecipes,
    pageSize: 10 
  });

  const liked = useRecipePagination({ 
    fetchFunction: getLikedRecipes,
    pageSize: 10 
  });

  const following = useRecipePagination({ 
    fetchFunction: getRecipebyFollowing,
    pageSize: 10 
  });

  // Search-related states
  const [searchQuery, setSearchQuery] = useState('');
  const [recipes, setRecipes] = useState<SearchRecipe[]>([]);
  const [searchPage, setSearchPage] = useState(0);
  const [hasMoreSearch, setHasMoreSearch] = useState(true);
  const [hasSearched, setHasSearched] = useState(false);
  const [history, setHistory] = useState<SearchHistoryItem[]>([]);

  const [isLikedTabLoaded, setIsLikedTabLoaded] = useState(false);
  const [isFollowingTabLoaded, setIsFollowingTabLoaded] = useState(false);

  useEffect(() => {
    fetchHomeSuggestions();
  }, []);

  useEffect(() => {
    if (refresh) {
      fetchHomeSuggestions();
    }
  }, [refresh]);

  useEffect(() => {
    if (activeTab === 'Yêu thích' && !isLikedTabLoaded) {
      fetchLikedRecipes();
      setIsLikedTabLoaded(true);
    } else if (activeTab === 'Theo dõi' && !isFollowingTabLoaded) {
      fetchFollowingRecipes();
      setIsFollowingTabLoaded(true);
    }
  }, [activeTab]);

  const fetchLikedRecipes = async () => {
    try {
      setLoading(true);
      const response = await getLikedRecipes(0, 10);

      if (response.code === 1000 && response.result) {
        const likedList = response.result.content
          .map((item: any) => item?.recipe)
          .filter((r: any) => r && r.recipeId);

        liked.reset(likedList);
      }
    } catch (err: any) {
      console.error("Lỗi khi tải danh sách yêu thích:", err);
      setError("Không thể tải danh sách yêu thích");
    } finally {
      setLoading(false);
    }
  };

  const fetchFollowingRecipes = async () => {
    try {
      setLoading(true);
      const response = await getRecipebyFollowing(0, 10);
      
      if (response.success && response.data && response.data.content) {
        const followingList = response.data.content
          .map((item: any) => item?.recipe || item)
          .filter((r: any) => r && r.recipeId);

        following.reset(followingList);
      }
    } catch (err: any) {
      console.error("Lỗi khi tải danh sách công thức theo dõi:", err);
      setError("Không thể tải danh sách công thức từ người theo dõi");
    } finally {
      setLoading(false);
    }
  };

  const fetchHomeSuggestions = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await getHomeSuggestions();
      
      if (response.success && response.data) {
        const { 
          trendingRecipes, 
          popularRecipes, 
          newestRecipes, 
          topRatedRecipes, 
          featuredRecipes, 
          dailyRecommendations 
        } = response.data;
        
        // Reset các pagination
        newest.reset(newestRecipes || []);
        trending.reset(trendingRecipes || []);
        popular.reset(popularRecipes || []);
        topRated.reset(topRatedRecipes || []);
        
        setFeaturedRecipes(featuredRecipes || []);
        setDailyRecommendations(dailyRecommendations || []);

        // Check liked status
        const allRecipeIds = [
          ...(trendingRecipes || []).map((r: DishRecipe) => r.recipeId),
          ...(popularRecipes || []).map((r: DishRecipe) => r.recipeId),
          ...(newestRecipes || []).map((r: DishRecipe) => r.recipeId),
          ...(topRatedRecipes || []).map((r: DishRecipe) => r.recipeId),
          ...(featuredRecipes || []).map((r: DishRecipe) => r.recipeId),
          ...(dailyRecommendations || []).map((r: DishRecipe) => r.recipeId),
        ];

        await checkLikedStatus(allRecipeIds);
      }
    } catch (err: any) {
      console.error('Error fetching home suggestions:', err);
      setError(err.message || 'Không thể tải dữ liệu');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDetail = (recipe: DishRecipe) => {
    router.push(`/_recipe-detail/${recipe.recipeId}` as any);
  };

  // Wrapper cho toggleLike với update count
  const toggleLike = async (recipeId: string) => {
    const updateCount = (delta: number) => {
      newest.updateRecipe(recipeId, { 
        likeCount: (newest.recipes.find(r => r.recipeId === recipeId)?.likeCount || 0) + delta 
      });
      trending.updateRecipe(recipeId, { 
        likeCount: (trending.recipes.find(r => r.recipeId === recipeId)?.likeCount || 0) + delta 
      });
      popular.updateRecipe(recipeId, { 
        likeCount: (popular.recipes.find(r => r.recipeId === recipeId)?.likeCount || 0) + delta 
      });
      topRated.updateRecipe(recipeId, { 
        likeCount: (topRated.recipes.find(r => r.recipeId === recipeId)?.likeCount || 0) + delta 
      });
      following.updateRecipe(recipeId, { 
        likeCount: (following.recipes.find(r => r.recipeId === recipeId)?.likeCount || 0) + delta 
      });
    };

    const onSuccess = (recipeId: string, isLiked: boolean) => {
      if (activeTab === 'Yêu thích') {
        if (isLiked) {
          // Thêm vào danh sách liked
          const allRecipes = [
            ...dailyRecommendations,
            ...featuredRecipes,
            ...popular.recipes,
            ...newest.recipes,
            ...topRated.recipes,
            ...trending.recipes,
            ...following.recipes
          ];
          const found = allRecipes.find(r => r.recipeId === recipeId);
          if (found) {
            liked.setRecipes(prev => [found, ...prev]);
          }
        } else {
          // Xóa khỏi danh sách liked
          liked.setRecipes(prev => prev.filter(r => r.recipeId !== recipeId));
        }
      }
    };

    await handleToggleLike(recipeId, updateCount, onSuccess);
  };

  const handleSearch = async (reset = true, requestedPage?: number) => {
    if (reset && !searchQuery.trim()) {
      setError('Vui lòng nhập tên người dùng cần tìm kiếm');
      return;
    }

    setLoading(true);
    setError(null);
    setHasSearched(true);

    try {
      const currentPage = reset ? 0 : requestedPage ?? searchPage;
      const data = await searchRecipeByUser(searchQuery, currentPage, 10);
      
      if ('code' in data && data.code !== 1000) {
        setError(data.message || 'Lỗi từ server');
        setRecipes([]);
        setHasMoreSearch(false);
        return;
      }
      
      if ('result' in data && data.result && data.result.content) {
        const newRecipes = data.result.content;
        
        if (reset) {
          setRecipes(newRecipes);
          setSearchPage(0);
        } else {
          setRecipes(prev => [...prev, ...newRecipes]);
        }
        
        setHasMoreSearch(!data.result.last);
        
        if (newRecipes.length === 0) {
          setError('Không tìm người dùng nào phù hợp');
        } else {
          setError(null); 
        }
        
        if (reset && searchQuery.trim()) {
          setHistory(prev => {
            const newItem: SearchHistoryItem = {
              searchId: Math.random().toString(36).substring(2, 9),
              userId: 'local',
              searchQuery,
              searchType: 'recipe',
              resultCount: newRecipes.length,
              createdAt: new Date().toISOString(),
            };
            return [
              ...prev.filter(item => item.searchQuery !== searchQuery),
              newItem,
            ].slice(0, 5);
          });
        }
      }
    } catch (err: unknown) { 
      let errorMessage = 'Lỗi không xác định';
      if (err instanceof Error) {
        errorMessage = err.message;
      }
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (loading && !newest.recipes.length) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>Đang tải...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error && !newest.recipes.length) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerContainer}>
          <Text style={styles.errorText}>⚠ {error}</Text>
          <Text style={styles.retryText} onPress={fetchHomeSuggestions}>
            Thử lại
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <SearchBar 
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        onSearch={handleSearch}
      />
      <TabBar activeTab={activeTab} onTabChange={setActiveTab} onPress={() => setHasSearched(false)} />
      
      {hasSearched ? (
        <FlatList
          data={recipes}
          renderItem={({ item }) => <RecipeCard item={item} />}
          keyExtractor={(item) => item.recipeId}
          contentContainerStyle={searchStyles.listContainer} 
          showsVerticalScrollIndicator={false}
          ListFooterComponent={
            <View style={{ alignItems: 'center', marginVertical: 20 }}>
              <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
                {searchPage > 0 && (
                  <TouchableOpacity
                    style={[styles.paginationButton, loading && { opacity: 0.6 }]}
                    onPress={() => {
                      const prevPage = searchPage - 1;
                      setSearchPage(prevPage);
                      handleSearch(false, prevPage);
                    }}
                    disabled={loading}
                  >
                    <Text style={styles.paginationButtonText}>Trang trước</Text>
                  </TouchableOpacity>
                )}
                <Text style={styles.pageIndicator}>Trang {searchPage + 1}</Text>
                {hasMoreSearch && (
                  <TouchableOpacity
                    style={[styles.paginationButton, loading && { opacity: 0.6 }]}
                    onPress={() => {
                      const nextPage = searchPage + 1;
                      setSearchPage(nextPage);
                      handleSearch(false, nextPage);
                    }}
                    disabled={loading}
                  >
                    <Text style={styles.paginationButtonText}>Trang sau</Text>
                  </TouchableOpacity>
                )}
              </View>
              {recipes.length > 0 && (
                <TouchableOpacity
                  style={styles.resetButton}
                  onPress={() => {
                    setSearchPage(0);
                    handleSearch(true);
                  }}
                >
                  <Text style={styles.paginationButtonText}>Về trang đầu</Text>
                </TouchableOpacity>
              )}
            </View>
          }
        />
      ) : (
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          {activeTab === 'Đề xuất' ? (
            <>
              <FeaturedDish recipes={dailyRecommendations} onRecipePress={handleOpenDetail} />
              <TrendingRecipes 
                recipes={trending.recipes}
                onRecipePress={handleOpenDetail}
                onLoadMore={trending.loadMore}
                hasMore={trending.hasMore}
                isLoadingMore={trending.isLoadingMore}
                likedRecipes={likedRecipes}
                likingRecipeId={likingRecipeId}
                onToggleLike={toggleLike}
              />
              <PopularRecipes 
                recipes={popular.recipes}
                onRecipePress={handleOpenDetail}
                onLoadMore={popular.loadMore}
                hasMore={popular.hasMore}
                isLoadingMore={popular.isLoadingMore}
                likedRecipes={likedRecipes}
                likingRecipeId={likingRecipeId}
                onToggleLike={toggleLike}
              />
              <TopRatedRecipes 
                recipes={topRated.recipes}
                onRecipePress={handleOpenDetail}
                onLoadMore={topRated.loadMore}
                hasMore={topRated.hasMore}
                isLoadingMore={topRated.isLoadingMore}
                likedRecipes={likedRecipes}
                likingRecipeId={likingRecipeId}
                onToggleLike={toggleLike}
              />
              <NewestRecipes 
                recipes={newest.recipes}
                onRecipePress={handleOpenDetail}
                onLoadMore={newest.loadMore}
                hasMore={newest.hasMore}
                isLoadingMore={newest.isLoadingMore}
                likedRecipes={likedRecipes}
                likingRecipeId={likingRecipeId}
                onToggleLike={toggleLike}
              />
            </>
          ) : activeTab === 'Yêu thích' ? (
            <LikedRecipes
              recipes={liked.recipes}
              onRecipePress={handleOpenDetail}
              onLoadMore={liked.loadMore}
              hasMore={liked.hasMore}
              isLoadingMore={liked.isLoadingMore}
              likedRecipes={likedRecipes}
              likingRecipeId={likingRecipeId}
              onToggleLike={toggleLike}
            />
          ) : activeTab === 'Theo dõi' ? (
            <RecipeFollowing
              recipes={following.recipes}
              onRecipePress={handleOpenDetail}
              onLoadMore={following.loadMore}
              hasMore={following.hasMore}
              isLoadingMore={following.isLoadingMore}
              likedRecipes={likedRecipes}
              likingRecipeId={likingRecipeId}
              onToggleLike={toggleLike}
            />
          ) : null}
          <View style={styles.bottomPadding} />
        </ScrollView>
      )}
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
  paginationButton: {
    backgroundColor: '#fbbc05',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 8,
    marginHorizontal: 5,
  },
  paginationButtonText: {
    color: '#fff',
  },
  pageIndicator: {
    marginHorizontal: 10,
    fontWeight: 'bold',
    color: '#333',
  },
  resetButton: {
    backgroundColor: '#666',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 8,
    marginTop: 10,
  },
});