import { useFocusEffect } from "@react-navigation/native";
import { useGlobalSearchParams, useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";

import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// Components
import LikedRecipes from '@/components/home/LikedRecipes';
import RecipeFollowing from '@/components/home/RecipeFollowing';
import FeaturedDish from '../../components/home/FeaturedDish';
import SearchBar from '../../components/home/SearchBar';
import SearchResults from '../../components/home/SearchResult';
import TabBar from '../../components/home/TabBar';
import NewestRecipes from '../../components/home/sections/NewestRecipes';
import PopularRecipes from '../../components/home/sections/PopularRecipes';
import TopRatedRecipes from '../../components/home/sections/TopRatedRecipes';
import TrendingRecipes from '../../components/home/sections/TrendingRecipes';

// Services & Hooks
import { useCachedPagination } from '../../hooks/useCachedRecipes';
import {
  getLikedRecipes,
  getNewestRecipes,
  getPopularRecipes,
  getRecipebyFollowing,
  getTopRatedRecipes,
  getTrendingRecipes
} from '../../services/homeService';
import { CACHE_CATEGORIES as CACHE_KEYS } from '../../services/unifiedCacheService';
import { useRecipeLikeContext } from '@/context/RecipeLikeContext';

// Types & Styles
import { SearchHistoryItem } from '@/types/search';
import { Colors } from '../../styles/colors';
import { Recipe as DishRecipe } from '../../types/dish';
import { Recipe as SearchRecipe } from '../../types/search';

// ViewModel
import { useCollectionManager } from "@/hooks/useCollectionManager";
import { HomeViewModel } from "../../hooks/homeViewModel";

export default function HomeScreen() {
  const router = useRouter();
  const { refresh } = useLocalSearchParams<{ refresh?: string }>();

  // UI States
  const [activeTab, setActiveTab] = useState("Đề xuất");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Data States
  const [dailyRecommendations, setDailyRecommendations] = useState<
    DishRecipe[]
  >([]);
  const [featuredRecipes, setFeaturedRecipes] = useState<DishRecipe[]>([]);

  // Search States
  const [searchQuery, setSearchQuery] = useState("");
  const [recipes, setRecipes] = useState<SearchRecipe[]>([]);
  const [searchPage, setSearchPage] = useState(0);
  const [hasMoreSearch, setHasMoreSearch] = useState(true);
  const [hasSearched, setHasSearched] = useState(false);
  const [loadingMoreSearch, setLoadingMoreSearch] = useState(false);
  const [history, setHistory] = useState<SearchHistoryItem[]>([]);

  // Tab Load Flags
  const [isLikedTabLoaded, setIsLikedTabLoaded] = useState(false);
  const [isFollowingTabLoaded, setIsFollowingTabLoaded] = useState(false);
  const [isOffline, setIsOffline] = useState(false);

  const {
    isSaved,
    savedVersion,
    collections,
    userUUID,
    isLoadingSaved,
    handleUnsaveRecipe,
    handleSaveRecipe: updateSavedCache,
  } = useCollectionManager();

  // Hooks
  // Cached Data with hooks
  // Note: dailyRecommendations và featuredRecipes sẽ được load từ state, không cache
  const likeHook = useRecipeLikeContext();
  const newest = useCachedPagination({
    cacheKey: CACHE_KEYS.NEWEST_RECIPES,
    fetchFunction: getNewestRecipes,
    pageSize: 10,
    autoFetch: false // Không tự động fetch
  });
  const trending = useCachedPagination({
    cacheKey: CACHE_KEYS.TRENDING_RECIPES,
    fetchFunction: getTrendingRecipes,
    pageSize: 10,
    autoFetch: false
  });
  const popular = useCachedPagination({
    cacheKey: CACHE_KEYS.POPULAR_RECIPES,
    fetchFunction: getPopularRecipes,
    pageSize: 20,
    autoFetch: false
  });
  const topRated = useCachedPagination({
    cacheKey: CACHE_KEYS.TOP_RATED_RECIPES,
    fetchFunction: getTopRatedRecipes,
    pageSize: 10,
    autoFetch: false
  });
  const liked = useCachedPagination({
    cacheKey: CACHE_KEYS.LIKED_RECIPES,
    fetchFunction: getLikedRecipes,
    pageSize: 10,
    autoFetch: false
  });
  const following = useCachedPagination({
    cacheKey: CACHE_KEYS.FOLLOWING_RECIPES,
    fetchFunction: getRecipebyFollowing,
    pageSize: 10,
    autoFetch: false
  });

  // Init HomeViewModel with proper dependencies
  const viewModel = new HomeViewModel(
    {
      setActiveTab,
      setDailyRecommendations,
      setFeaturedRecipes,
      setLoading,
      setError,
      setRecipes,
      setSearchPage,
      setHasMoreSearch,
      setHasSearched,
      setHistory,
      setIsLikedTabLoaded,
      setIsFollowingTabLoaded,
      setSearchQuery,
      setIsOffline,
      setLoadingMoreSearch,
    },
    {
      likeHook,
      newestPagination: newest,
      trendingPagination: trending,
      popularPagination: popular,
      topRatedPagination: topRated,
      likedPagination: liked,
      followingPagination: following,
    },
    {
      searchQuery,
      searchPage,
      activeTab,
    }
  );
  const globalParams = useGlobalSearchParams(); // ← Dùng global để chắc chắn bắt được param từ màn khác

  const lastRefetchTrigger = useRef<string>("0");

  // Register callback to update like counts when liked from detail screen
  useEffect(() => {
    const handleLikeUpdate = (recipeId: string, delta: number) => {
      console.log(`📢 Like count updated for ${recipeId}: ${delta > 0 ? '+' : ''}${delta}`);

      // Update in all paginations
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
      liked.updateRecipe(recipeId, {
        likeCount: (liked.recipes.find(r => r.recipeId === recipeId)?.likeCount || 0) + delta
      });
      following.updateRecipe(recipeId, {
        likeCount: (following.recipes.find(r => r.recipeId === recipeId)?.likeCount || 0) + delta
      });

      // Update in dailyRecommendations and featuredRecipes
      setDailyRecommendations(prev => prev.map(r =>
        r.recipeId === recipeId ? { ...r, likeCount: (r.likeCount || 0) + delta } : r
      ));
      setFeaturedRecipes(prev => prev.map(r =>
        r.recipeId === recipeId ? { ...r, likeCount: (r.likeCount || 0) + delta } : r
      ));
    };

    likeHook.registerLikeUpdateCallback(handleLikeUpdate);

    return () => {
      likeHook.unregisterLikeUpdateCallback(handleLikeUpdate);
    };
  }, [likeHook, newest, trending, popular, topRated, liked, following]);

  useFocusEffect(
    useCallback(() => {
      const trigger = globalParams.refetchTrigger as string;
      if (trigger && trigger !== lastRefetchTrigger.current) {
        lastRefetchTrigger.current = trigger;

        console.log("Rating completed → Refreshing entire Home feed...");
        viewModel.fetchHomeSuggestions();


        router.setParams({ refetchTrigger: undefined });
      }
    }, [globalParams.refetchTrigger, viewModel])
  );
  // Effects
  useEffect(() => {
    setLoading(newest.loading);
  }, [newest.loading]);

  useEffect(() => {
    // Load initial data
    viewModel.fetchHomeSuggestions();
  }, []);

  useEffect(() => {
    if (refresh) {
      viewModel.fetchHomeSuggestions();
      newest.refresh();
      trending.refresh();
      popular.refresh();
      topRated.refresh();
      liked.refresh();
      following.refresh();
    }
  }, [refresh]);

  useEffect(() => {
    if (activeTab === 'Yêu thích' && !isLikedTabLoaded) {
      liked.refresh();
      setIsLikedTabLoaded(true);
    } else if (activeTab === 'Theo dõi' && !isFollowingTabLoaded) {
      following.refresh();
      setIsFollowingTabLoaded(true);
    }

    // Flush pending likes when tab changes
    likeHook.flushPendingLikes();
  }, [activeTab]);

  // Event Handlers
  const handleOpenDetail = async (recipe: DishRecipe) => {
    // Flush pending likes before navigating to detail
    await likeHook.flushPendingLikes();
    router.push(`/_recipe-detail/${recipe.recipeId}?from=/(tabs)/home` as any);
  };

  const handleSearch = async (
    reset = true,
    requestedPage?: number,
    queryOverride?: string
  ) => {
    await viewModel.handleSearch(reset, requestedPage, queryOverride);
  };

  const handleLoadMoreSearch = () => {
    if (!loading && !loadingMoreSearch && hasMoreSearch && recipes.length > 0) {
      handleSearch(false, searchPage + 1);
    }
  };

  const handleToggleLike = async (recipeId: string) => {
    await viewModel.toggleLike(recipeId, dailyRecommendations, featuredRecipes);
  };

  const handleRefreshAll = () => {
    viewModel.fetchHomeSuggestions();
    newest.refresh();
    trending.refresh();
    popular.refresh();
    topRated.refresh();
    if (activeTab === 'Yêu thích') liked.refresh();
    if (activeTab === 'Theo dõi') following.refresh();
  };

  // Loading State
  if (loading && !newest.recipes.length && !dailyRecommendations.length) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>Đang tải...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Error State
  if (error && !newest.recipes.length) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerContainer}>
          <Text style={styles.errorText}>⚠ {error}</Text>
          <Text style={styles.retryText} onPress={() => viewModel.fetchHomeSuggestions()}>
            Thử lại
          </Text>
        </View>
      </SafeAreaView>
    );
  }


  // Main Content
  return (
    <SafeAreaView style={styles.container}>

      {isOffline && (
        <View style={styles.offlineBar}>
          <Text style={styles.offlineText}>
            📵 Chế độ offline - Hiển thị dữ liệu đã lưu
          </Text>
        </View>
      )}
      <SearchBar
        searchQuery={searchQuery}
        setSearchQuery={(query) =>
          viewModel.handleQueryChange(query, hasSearched)
        }
        onSearch={handleSearch}
        onGetSuggestions={(query) => viewModel.fetchUserSuggestions(query)}
        showSuggestions={!hasSearched}
      />
      {!hasSearched && (
        <TabBar
          activeTab={activeTab}
          onTabChange={setActiveTab}
          onPress={() => setHasSearched(false)}
        />
      )}

      {hasSearched ? (
        <SearchResults
          recipes={recipes}
          hasMoreSearch={hasMoreSearch}
          loadingMore={loadingMoreSearch}
          onLoadMore={handleLoadMoreSearch}
        />
      ) : (
        <MainContent
          activeTab={activeTab}
          dailyRecommendations={dailyRecommendations}
          featuredRecipes={featuredRecipes}
          newest={newest}
          trending={trending}
          popular={popular}
          topRated={topRated}
          liked={liked}
          following={following}
          likedRecipes={likeHook.likedRecipes}
          likingRecipeId={likeHook.likingRecipeId}
          onRecipePress={handleOpenDetail}
          onToggleLike={handleToggleLike}
          isSaved={isSaved}
          savedVersion={savedVersion}
          collections={collections}
          userUUID={userUUID}
          isLoadingSaved={isLoadingSaved}
          handleUnsaveRecipe={handleUnsaveRecipe}
          updateSavedCache={updateSavedCache}
        />
      )}
    </SafeAreaView>
  );
}

// Main Content Component
function MainContent({
  activeTab,
  dailyRecommendations,
  featuredRecipes,
  newest,
  trending,
  popular,
  topRated,
  liked,
  following,
  likedRecipes,
  likingRecipeId,
  onRecipePress,
  onToggleLike,
  isSaved,
  savedVersion,
  collections,
  userUUID,
  isLoadingSaved,
  handleUnsaveRecipe,
  updateSavedCache,
}: any) {
  // Render content based on active tab
  const renderContent = () => {
    if (activeTab === "Đề xuất") {
      return [
        { id: "featured", type: "featured" },
        { id: "trending", type: "trending" },
        { id: "popular", type: "popular" },
        { id: "topRated", type: "topRated" },
        { id: "newest", type: "newest" },
      ];
    } else if (activeTab === "Yêu thích") {
      return [{ id: "liked", type: "liked" }];
    } else if (activeTab === "Theo dõi") {
      return [{ id: "following", type: "following" }];
    }
    return [];
  };

  const renderItem = ({ item }: { item: any }) => {
    switch (item.type) {
      case 'featured':
        return <FeaturedDish recipes={dailyRecommendations} onRecipePress={onRecipePress} />;
      case 'trending':
        return (
          <TrendingRecipes
            recipes={trending.recipes || []}
            onRecipePress={onRecipePress}
            onLoadMore={trending.loadMore}
            hasMore={trending.hasMore}
            isLoadingMore={trending.isLoadingMore}
            likedRecipes={likedRecipes}
            likingRecipeId={likingRecipeId}
            onToggleLike={onToggleLike}
            isSaved={isSaved}
            savedVersion={savedVersion}
            collections={collections}
            userUUID={userUUID}
            isLoadingSaved={isLoadingSaved}
            handleUnsaveRecipe={handleUnsaveRecipe}
            updateSavedCache={updateSavedCache}
          />
        );
      case "popular":
        return (
          <PopularRecipes
            recipes={popular.recipes || []}
            onRecipePress={onRecipePress}
            onLoadMore={popular.loadMore}
            hasMore={popular.hasMore}
            isLoadingMore={popular.isLoadingMore}
            likedRecipes={likedRecipes}
            likingRecipeId={likingRecipeId}
            onToggleLike={onToggleLike}
            isSaved={isSaved}
            savedVersion={savedVersion}
            collections={collections}
            userUUID={userUUID}
            isLoadingSaved={isLoadingSaved}
            handleUnsaveRecipe={handleUnsaveRecipe}
            updateSavedCache={updateSavedCache}
          />
        );
      case "topRated":
        return (
          <TopRatedRecipes
            recipes={topRated.recipes || []}
            onRecipePress={onRecipePress}
            onLoadMore={topRated.loadMore}
            hasMore={topRated.hasMore}
            isLoadingMore={topRated.isLoadingMore}
            likedRecipes={likedRecipes}
            likingRecipeId={likingRecipeId}
            onToggleLike={onToggleLike}
            isSaved={isSaved}
            savedVersion={savedVersion}
            collections={collections}
            userUUID={userUUID}
            isLoadingSaved={isLoadingSaved}
            handleUnsaveRecipe={handleUnsaveRecipe}
            updateSavedCache={updateSavedCache}
          />
        );
      case "newest":
        return (
          <NewestRecipes
            recipes={newest.recipes || []}
            onRecipePress={onRecipePress}
            onLoadMore={newest.loadMore}
            hasMore={newest.hasMore}
            isLoadingMore={newest.isLoadingMore}
            likedRecipes={likedRecipes}
            likingRecipeId={likingRecipeId}
            onToggleLike={onToggleLike}
            isSaved={isSaved}
            savedVersion={savedVersion}
            collections={collections}
            userUUID={userUUID}
            isLoadingSaved={isLoadingSaved}
            handleUnsaveRecipe={handleUnsaveRecipe}
            updateSavedCache={updateSavedCache}
          />
        );
      case "liked":
        return (
          <LikedRecipes
            recipes={liked.recipes || []}
            onRecipePress={onRecipePress}
            onLoadMore={liked.loadMore}
            hasMore={liked.hasMore}
            isLoadingMore={liked.isLoadingMore}
            likedRecipes={likedRecipes}
            likingRecipeId={likingRecipeId}
            onToggleLike={onToggleLike}
            isSaved={isSaved}
            savedVersion={savedVersion}
            collections={collections}
            userUUID={userUUID}
            isLoadingSaved={isLoadingSaved}
            handleUnsaveRecipe={handleUnsaveRecipe}
            updateSavedCache={updateSavedCache}
          />
        );
      case "following":
        return (
          <RecipeFollowing
            recipes={following.recipes || []}
            onRecipePress={onRecipePress}
            onLoadMore={following.loadMore}
            hasMore={following.hasMore}
            isLoadingMore={following.isLoadingMore}
            likedRecipes={likedRecipes}
            likingRecipeId={likingRecipeId}
            onToggleLike={onToggleLike}
            isSaved={isSaved}
            savedVersion={savedVersion}
            collections={collections}
            userUUID={userUUID}
            isLoadingSaved={isLoadingSaved}
            handleUnsaveRecipe={handleUnsaveRecipe}
            updateSavedCache={updateSavedCache}
          />
        );
      default:
        return null;
    }
  };

  return (
    <FlatList
      data={renderContent()}
      renderItem={renderItem}
      keyExtractor={(item) => item.id}
      showsVerticalScrollIndicator={false}
      ListFooterComponent={<View style={styles.bottomPadding} />}
      removeClippedSubviews={false}
      contentContainerStyle={styles.flatListContent}
    />
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
  flatListContent: {
    flexGrow: 1,
  },
  bottomPadding: {
    height: 80,
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: Colors.text.secondary,
  },
  errorText: {
    fontSize: 16,
    color: "#FF3B30",
    textAlign: "center",
    marginBottom: 16,
  },
  retryText: {
    fontSize: 16,
    color: Colors.primary,
    fontWeight: "600",
    textDecorationLine: "underline",
  },
  offlineBar: {
    backgroundColor: '#FFA500',
    paddingVertical: 8,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  offlineText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '600',
  },
});
