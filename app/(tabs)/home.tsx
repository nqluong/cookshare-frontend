import LikedRecipes from '@/components/home/LikedRecipes';
import RecipeFollowing from '@/components/home/RecipeFollowing';
import { SearchHistoryItem } from '@/types/search';
import { useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
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
  isRecipeLiked,
  likeRecipe,
  searchRecipeByUser,
  unlikeRecipe,
} from '../../services/homeService';
import { Colors } from '../../styles/colors';
import { searchStyles } from '../../styles/SearchStyles';
import { Recipe as DishRecipe } from '../../types/dish';
import { Recipe as SearchRecipe } from '../../types/search';

export default function HomeScreen() {
  const [activeTab, setActiveTab] = useState('Đề xuất');
  const router = useRouter();
  const [dailyRecommendations, setDailyRecommendations] = useState<DishRecipe[]>([]);
  const [featuredRecipes, setFeaturedRecipes] = useState<DishRecipe[]>([]);
  const [popularRecipes, setPopularRecipes] = useState<DishRecipe[]>([]);
  const [newestRecipes, setNewestRecipes] = useState<DishRecipe[]>([]);
  const [topRatedRecipes, setTopRatedRecipes] = useState<DishRecipe[]>([]);
  const [trendingRecipes, setTrendingRecipes] = useState<DishRecipe[]>([]);

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
  const [likedRecipesList, setLikedRecipesList] = useState<DishRecipe[]>([]);
  const [likedPage, setLikedPage] = useState(0);
  const [hasMoreLiked, setHasMoreLiked] = useState(true);
  const [isLoadingMoreLiked, setIsLoadingMoreLiked] = useState(false);
  const [isLikedTabLoaded, setIsLikedTabLoaded] = useState(false);
  
  // Search-related states
  const [searchQuery, setSearchQuery] = useState('');
  const [recipes, setRecipes] = useState<SearchRecipe[]>([]);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [hasSearched, setHasSearched] = useState(false);
  const [history, setHistory] = useState<SearchHistoryItem[]>([]);

  // Ref để lưu debounce timers và trạng thái ban đầu cho like
  const likeTimersRef = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());
  const likeStatesRef = useRef<Map<string, { initialState: boolean; clickCount: number }>>(new Map());
  const [followingRecipesList, setFollowingRecipesList] = useState<DishRecipe[]>([]);
const [followingPage, setFollowingPage] = useState(0);
const [hasMoreFollowing, setHasMoreFollowing] = useState(true);
const [isLoadingMoreFollowing, setIsLoadingMoreFollowing] = useState(false);
const [isFollowingTabLoaded, setIsFollowingTabLoaded] = useState(false);
  useEffect(() => {
    fetchHomeSuggestions();
  }, []);

  useEffect(() => {
    if (activeTab === 'Yêu thích' && !isLikedTabLoaded) {
      fetchLikedRecipes();
      setIsLikedTabLoaded(true);
    } else if (activeTab === 'Theo dõi' && !isFollowingTabLoaded) {
    fetchFollowingRecipes();
    setIsFollowingTabLoaded(true);
  }
  }, [activeTab]);

  // Cleanup timers khi component unmount
  useEffect(() => {
    return () => {
      likeTimersRef.current.forEach(timer => clearTimeout(timer));
      likeTimersRef.current.clear();
      likeStatesRef.current.clear();
    };
  }, []);

  const fetchLikedRecipes = async () => {
    try {
      setLoading(true);
      const response = await getLikedRecipes(0, 10);
      console.log("Liked Recipes response:", response);

      if (response.code === 1000 && response.result) {
        const liked = response.result.content
          .map((item: any) => item?.recipe)
          .filter((r: any) => r && r.recipeId);

        setLikedRecipesList(liked);
        setHasMoreLiked(!response.result.last);
      } else {
        console.warn("Không có dữ liệu công thức yêu thích.");
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
    // ✅ Sửa lại điều kiện kiểm tra
    if (response.success && response.data && response.data.content) {
      const following = response.data.content
        .map((item: any) => item?.recipe || item)
        .filter((r: any) => r && r.recipeId);

      setFollowingRecipesList(following);
      setHasMoreFollowing(!response.data.last);
    } else {
      console.warn("Không có dữ liệu công thức từ người theo dõi.");
      console.warn("Response:", response);
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
        const { trendingRecipes, popularRecipes, newestRecipes, topRatedRecipes, featuredRecipes, dailyRecommendations } = response.data;
        
        const allRecipeIds = [
          ...(trendingRecipes || []).map((r: DishRecipe) => r.recipeId),
          ...(popularRecipes || []).map((r: DishRecipe) => r.recipeId),
          ...(newestRecipes || []).map((r: DishRecipe) => r.recipeId),
          ...(topRatedRecipes || []).map((r: DishRecipe) => r.recipeId),
          ...(featuredRecipes || []).map((r: DishRecipe) => r.recipeId),
          ...(dailyRecommendations || []).map((r: DishRecipe) => r.recipeId),
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
        setDailyRecommendations(dailyRecommendations || []);
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

  // Optimistic update function
  const optimisticToggleLike = (recipeId: string) => {
    const isCurrentlyLiked = likedRecipes.has(recipeId);
    
    // Cập nhật UI ngay lập tức
    setLikedRecipes(prev => {
      const newSet = new Set(prev);
      if (isCurrentlyLiked) {
        newSet.delete(recipeId);
      } else {
        newSet.add(recipeId);
      }
      return newSet;
    });
    
    // Cập nhật like count ngay lập tức
    updateRecipeLikeCount(recipeId, isCurrentlyLiked ? -1 : +1);
  };

  // Hàm toggle like mới với debounce và theo dõi số lần click
  const toggleLike = async (recipeId: string) => {
  let likeState = likeStatesRef.current.get(recipeId);
  
  if (!likeState) {
    likeState = {
      initialState: likedRecipes.has(recipeId),
      clickCount: 0
    };
    likeStatesRef.current.set(recipeId, likeState);
  }

  likeState.clickCount++;

  const existingTimer = likeTimersRef.current.get(recipeId);
  if (existingTimer) clearTimeout(existingTimer);

  optimisticToggleLike(recipeId);

  const timer = setTimeout(async () => {
    try {
      const state = likeStatesRef.current.get(recipeId);
      if (!state) return;

      const shouldToggle = state.clickCount % 2 === 1;
      if (!shouldToggle) {
        likeStatesRef.current.delete(recipeId);
        return;
      }

      const finalState = !state.initialState;

      if (finalState) {
        // Cần like
        const response = await likeRecipe(recipeId);
        if (response.code !== 1000 || !response.result) {
          setLikedRecipes(prev => {
            const newSet = new Set(prev);
            newSet.delete(recipeId);
            return newSet;
          });
          updateRecipeLikeCount(recipeId, -1);
          console.warn('Không thể like công thức, đã rollback');
        } else {
          // ✅ Nếu không ở tab Yêu thích -> thêm ngay vào danh sách local
          if (activeTab !== 'Yêu thích') {
            setLikedRecipesList(prev => {
              // tránh trùng nếu đã có
              const exists = prev.some(r => r.recipeId === recipeId);
              if (exists) return prev;
              // tìm recipe trong các list khác để thêm
              const allRecipes = [
                ...dailyRecommendations,
                ...featuredRecipes,
                ...popularRecipes,
                ...newestRecipes,
                ...topRatedRecipes,
                ...trendingRecipes,
                ...followingRecipesList
              ];
              const found = allRecipes.find(r => r.recipeId === recipeId);
              return found ? [found, ...prev] : prev;
            });
          } else {
            // Nếu đang ở tab "Yêu thích" → gọi lại API để sync server
            fetchLikedRecipes();
          }
        }
      } else {
        // Cần unlike
        try {
          const response = await unlikeRecipe(recipeId);
          if (response.code !== 1000) {
            setLikedRecipes(prev => {
              const newSet = new Set(prev);
              newSet.add(recipeId);
              return newSet;
            });
            updateRecipeLikeCount(recipeId, +1);
            console.warn('Không thể bỏ like công thức, đã rollback');
          } else {
            // ✅ Nếu đang ở tab "Yêu thích" → cập nhật local, không reload toàn trang
            setLikedRecipesList(prev => prev.filter(r => r.recipeId !== recipeId));
          }
        } catch (error: any) {
          if (error.message !== 'Công thức chưa được thích') {
            setLikedRecipes(prev => {
              const newSet = new Set(prev);
              newSet.add(recipeId);
              return newSet;
            });
            updateRecipeLikeCount(recipeId, +1);
          }
        }
      }
    } catch (error: any) {
      console.error('Lỗi khi xử lý like/unlike:', error.message || error);
    } finally {
      likeTimersRef.current.delete(recipeId);
      likeStatesRef.current.delete(recipeId);
    }
  }, 1800);

  likeTimersRef.current.set(recipeId, timer);
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
      const currentPage = reset ? 0 : requestedPage ?? page;
      const data = await searchRecipeByUser(searchQuery, currentPage, 10);
      
      if ('code' in data && data.code !== 1000) {
        setError(data.message || 'Lỗi từ server');
        setRecipes([]);
        setHasMore(false);
        return;
      }
      
      if ('result' in data && data.result && data.result.content) {
        const newRecipes = data.result.content;
        
        if (reset) {
          setRecipes(newRecipes);
          setPage(0);
        } else {
          setRecipes(prev => [...prev, ...newRecipes]);
        }
        
        setHasMore(!data.result.last);
        
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
            const updated = [
              ...prev.filter(item => item.searchQuery !== searchQuery),
              newItem,
            ].slice(0, 5);
            return updated;
          });
        }
      } else {
        setError('Response không đúng format');
      }
    } catch (err: unknown) { 
      let errorMessage = 'Lỗi không xác định';
      if (err instanceof Error) {
        errorMessage = err.message;
      } else if (typeof err === 'string') {
        errorMessage = err;
      } else if (err && typeof err === 'object' && 'message' in err) {
        errorMessage = (err as { message?: string }).message || 'Unknown error object';
      }
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const updateRecipeLikeCount = (recipeId: string, delta: number) => {
    setTrendingRecipes(prev => prev.map(recipe => 
      recipe.recipeId === recipeId 
        ? { ...recipe, likeCount: recipe.likeCount + delta }
        : recipe
    ));
    
    setPopularRecipes(prev => prev.map(recipe => 
      recipe.recipeId === recipeId 
        ? { ...recipe, likeCount: recipe.likeCount + delta }
        : recipe
    ));
    
    setNewestRecipes(prev => prev.map(recipe => 
      recipe.recipeId === recipeId 
        ? { ...recipe, likeCount: recipe.likeCount + delta }
        : recipe
    ));
    
    setTopRatedRecipes(prev => prev.map(recipe => 
      recipe.recipeId === recipeId 
        ? { ...recipe, likeCount: recipe.likeCount + delta }
        : recipe
    ));
    setFollowingRecipesList(prev => prev.map(recipe => 
    recipe.recipeId === recipeId 
      ? { ...recipe, likeCount: recipe.likeCount + delta }
      : recipe
  ));
  };

  const handleLoadMoreNewest = async () => {
  if (isLoadingMoreNewest || !hasMoreNewest) return;

  try {
    setIsLoadingMoreNewest(true);
    const nextPage = newestPage + 1;
    const response = await getNewestRecipes(nextPage, 10);
    
    if (response.success && response.data) {
      const newRecipes = response.data.content || [];
      setNewestRecipes(prev => {
        const merged = [...prev, ...newRecipes];
        const unique = merged.filter(
          (r, i, self) => i === self.findIndex(x => x.recipeId === r.recipeId)
        );
        return unique;
      });
      setNewestPage(nextPage);
      setHasMoreNewest(!response.data.last);
    }
  } catch (err: any) {
    console.error('Error loading more newest recipes:', err);
  } finally {
    setIsLoadingMoreNewest(false);
  }
};


  const handleLoadMoreTrending = async () => {
  if (isLoadingMoreTrending || !hasMoreTrending) return;

  try {
    setIsLoadingMoreTrending(true);
    const nextPage = trendingPage + 1;
    const response = await getTrendingRecipes(nextPage, 10);
    
    if (response.success && response.data) {
      const newRecipes = response.data.content || [];
      setTrendingRecipes(prev => {
        const merged = [...prev, ...newRecipes];
        const unique = merged.filter(
          (r, i, self) => i === self.findIndex(x => x.recipeId === r.recipeId)
        );
        return unique;
      });
      setTrendingPage(nextPage);
      setHasMoreTrending(!response.data.last);
    }
  } catch (err: any) {
    console.error('Error loading more trending recipes:', err);
  } finally {
    setIsLoadingMoreTrending(false);
  }
};


  const handleLoadMorePopular = async () => {
  if (isLoadingMorePopular || !hasMorePopular) return;

  try {
    setIsLoadingMorePopular(true);
    const nextPage = popularPage + 1;
    const response = await getPopularRecipes(nextPage, 20);
    
    if (response.success && response.data) {
      const newRecipes = response.data.content || [];
      setPopularRecipes(prev => {
        const merged = [...prev, ...newRecipes];
        const unique = merged.filter(
          (r, i, self) => i === self.findIndex(x => x.recipeId === r.recipeId)
        );
        return unique;
      });
      setPopularPage(nextPage);
      setHasMorePopular(!response.data.last);
    }
  } catch (err: any) {
    console.error('Error loading more popular recipes:', err);
  } finally {
    setIsLoadingMorePopular(false);
  }
};


  const handleLoadMoreTopRated = async () => {
  if (isLoadingMoreTopRated || !hasMoreTopRated) return;

  try {
    setIsLoadingMoreTopRated(true);
    const nextPage = topRatedPage + 1;
    const response = await getTopRatedRecipes(nextPage, 10);
    
    if (response.success && response.data) {
      const newRecipes = response.data.content || [];
      setTopRatedRecipes(prev => {
        const merged = [...prev, ...newRecipes];
        const unique = merged.filter(
          (r, i, self) => i === self.findIndex(x => x.recipeId === r.recipeId)
        );
        return unique;
      });
      setTopRatedPage(nextPage);
      setHasMoreTopRated(!response.data.last);
    }
  } catch (err: any) {
    console.error('Error loading more topRated recipes:', err);
  } finally {
    setIsLoadingMoreTopRated(false);
  }
};

  const handleLoadMoreLiked = async () => {
    if (isLoadingMoreLiked || !hasMoreLiked) return;
    
    try {
      setIsLoadingMoreLiked(true);
      const nextPage = likedPage + 1;
      const response = await getLikedRecipes(nextPage, 10);
      
      if (response.code === 1000 && response.result) {
        const newRecipes = response.result.content.map((item: any) => item.recipe);
        setLikedRecipesList(prev => [...prev, ...newRecipes]);
        setLikedPage(nextPage);
        setHasMoreLiked(!response.result.last);
      }
    } catch (err: any) {
      console.error('Error loading more liked recipes:', err);
    } finally {
      setIsLoadingMoreLiked(false);
    }
  };
  const handleLoadMoreFollowing = async () => {
  if (isLoadingMoreFollowing || !hasMoreFollowing) return;
  
  try {
    setIsLoadingMoreFollowing(true);
    const nextPage = followingPage + 1;
    const response = await getRecipebyFollowing(nextPage, 10);
    
    if (response.code === 1000 && response.result) {
      const newRecipes = response.result.content
        .map((item: any) => item?.recipe || item)
        .filter((r: any) => r && r.recipeId);
      setFollowingRecipesList(prev => [...prev, ...newRecipes]);
      setFollowingPage(nextPage);
      setHasMoreFollowing(!response.result.last);
    }
  } catch (err: any) {
    console.error('Error loading more following recipes:', err);
  } finally {
    setIsLoadingMoreFollowing(false);
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
                {page > 0 && (
                  <TouchableOpacity
                    style={[
                      {
                        backgroundColor: '#fbbc05',
                        paddingHorizontal: 15,
                        paddingVertical: 8,
                        borderRadius: 8,
                        marginHorizontal: 5,
                      },
                      loading && { opacity: 0.6 }
                    ]}
                    onPress={() => {
                      const prevPage = page - 1;
                      setPage(prevPage);
                      handleSearch(false, prevPage);
                    }}
                    disabled={loading}
                  >
                    <Text style={{ color: '#fff' }}>Trang trước</Text>
                  </TouchableOpacity>
                )}
                <Text style={{ marginHorizontal: 10, fontWeight: 'bold', color: '#333' }}>
                  Trang {page + 1}
                </Text>
                {hasMore && (
                  <TouchableOpacity
                    style={[
                      {
                        backgroundColor: '#fbbc05',
                        paddingHorizontal: 15,
                        paddingVertical: 8,
                        borderRadius: 8,
                        marginHorizontal: 5,
                      },
                      loading && { opacity: 0.6 }
                    ]}
                    onPress={() => {
                      const nextPage = page + 1;
                      setPage(nextPage);
                      handleSearch(false, nextPage);
                    }}
                    disabled={loading}
                  >
                    <Text style={{ color: '#fff' }}>Trang sau</Text>
                  </TouchableOpacity>
                )}
              </View>
              {recipes.length > 0 && (
                <TouchableOpacity
                  style={{
                    backgroundColor: '#666',
                    paddingHorizontal: 15,
                    paddingVertical: 8,
                    borderRadius: 8,
                    marginTop: 10,
                  }}
                  onPress={() => {
                    setPage(0);
                    handleSearch(true);
                  }}
                >
                  <Text style={{ color: '#fff' }}>Về trang đầu</Text>
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
            </>
          ) : activeTab === 'Yêu thích' ? (
            <LikedRecipes
              recipes={likedRecipesList}
              onRecipePress={handleOpenDetail}
              onLoadMore={handleLoadMoreLiked}
              hasMore={hasMoreLiked}
              isLoadingMore={isLoadingMoreLiked}
              likedRecipes={likedRecipes}
              likingRecipeId={likingRecipeId}
              onToggleLike={toggleLike}
            />
          ) : activeTab === 'Theo dõi' ? (
            <RecipeFollowing
              recipes={followingRecipesList}  // ✅ Dùng state riêng
              onRecipePress={handleOpenDetail}
              onLoadMore={handleLoadMoreFollowing}  // ✅ Handler riêng
              hasMore={hasMoreFollowing}  // ✅ State riêng
              isLoadingMore={isLoadingMoreFollowing}  // ✅ State riêng
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
});