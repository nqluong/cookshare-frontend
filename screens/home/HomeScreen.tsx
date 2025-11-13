import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// Components
import LikedRecipes from '@/components/home/LikedRecipes';
import RecipeFollowing from '@/components/home/RecipeFollowing';
import RecipeCard from '../../components/Search/RecipeCard';
import FeaturedDish from '../../components/home/FeaturedDish';
import SearchBar from '../../components/home/SearchBar';
import TabBar from '../../components/home/TabBar';
import NewestRecipes from '../../components/home/sections/NewestRecipes';
import PopularRecipes from '../../components/home/sections/PopularRecipes';
import TopRatedRecipes from '../../components/home/sections/TopRatedRecipes';
import TrendingRecipes from '../../components/home/sections/TrendingRecipes';

// Services & Hooks
import {
  getLikedRecipes,
  getNewestRecipes,
  getPopularRecipes,
  getRecipebyFollowing,
  getTopRatedRecipes,
  getTrendingRecipes,
} from '../../services/homeService';
import { useRecipePagination } from '../../services/useRecipePagination';
import { useRecipeLike } from '../../services/userRecipeLike';

// Types & Styles
import { SearchHistoryItem } from '@/types/search';
import { searchStyles } from '../../styles/SearchStyles';
import { Colors } from '../../styles/colors';
import { Recipe as DishRecipe } from '../../types/dish';
import { Recipe as SearchRecipe } from '../../types/search';

// ViewModel
import { HomeViewModel } from '../../hooks/homeViewModel';

export default function HomeScreen() {
  const router = useRouter();
  const { refresh } = useLocalSearchParams<{ refresh?: string }>();

  // UI States
  const [activeTab, setActiveTab] = useState('Đề xuất');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Data States
  const [dailyRecommendations, setDailyRecommendations] = useState<DishRecipe[]>([]);
  const [featuredRecipes, setFeaturedRecipes] = useState<DishRecipe[]>([]);

  // Search States
  const [searchQuery, setSearchQuery] = useState('');
  const [recipes, setRecipes] = useState<SearchRecipe[]>([]);
  const [searchPage, setSearchPage] = useState(0);
  const [hasMoreSearch, setHasMoreSearch] = useState(true);
  const [hasSearched, setHasSearched] = useState(false);
  const [history, setHistory] = useState<SearchHistoryItem[]>([]);

  // Tab Load Flags
  const [isLikedTabLoaded, setIsLikedTabLoaded] = useState(false);
  const [isFollowingTabLoaded, setIsFollowingTabLoaded] = useState(false);

  // Hooks
  const likeHook = useRecipeLike();
  const newest = useRecipePagination({ fetchFunction: getNewestRecipes, pageSize: 10 });
  const trending = useRecipePagination({ fetchFunction: getTrendingRecipes, pageSize: 10 });
  const popular = useRecipePagination({ fetchFunction: getPopularRecipes, pageSize: 20 });
  const topRated = useRecipePagination({ fetchFunction: getTopRatedRecipes, pageSize: 10 });
  const liked = useRecipePagination({ fetchFunction: getLikedRecipes, pageSize: 10 });
  const following = useRecipePagination({ fetchFunction: getRecipebyFollowing, pageSize: 10 });

  // ViewModel
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
    { searchQuery, searchPage, activeTab }
  );

  // Effects
  useEffect(() => {
    viewModel.fetchHomeSuggestions();
  }, []);

  useEffect(() => {
    if (refresh) {
      viewModel.fetchHomeSuggestions();
    }
  }, [refresh]);

  useEffect(() => {
    viewModel.updateCurrentStates({ activeTab });
    viewModel.handleTabChange(activeTab, isLikedTabLoaded, isFollowingTabLoaded);
  }, [activeTab]);

  // Event Handlers
  const handleOpenDetail = (recipe: DishRecipe) => {
    router.push(`/_recipe-detail/${recipe.recipeId}` as any);
  };

  const handleSearch = (reset = true, requestedPage?: number) => {
    viewModel.updateCurrentStates({ searchQuery, searchPage });
    viewModel.handleSearch(reset, requestedPage);
  };

  const handleToggleLike = (recipeId: string) => {
    viewModel.updateCurrentStates({ activeTab });
    viewModel.toggleLike(recipeId, dailyRecommendations, featuredRecipes);
  };

  // Loading State
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
      <SearchBar searchQuery={searchQuery} setSearchQuery={setSearchQuery} onSearch={handleSearch} />
      <TabBar activeTab={activeTab} onTabChange={setActiveTab} onPress={() => setHasSearched(false)} />

      {hasSearched ? (
        <SearchResults
          recipes={recipes}
          searchPage={searchPage}
          hasMoreSearch={hasMoreSearch}
          loading={loading}
          onPageChange={(page) => {
            setSearchPage(page);
            handleSearch(false, page);
          }}
          onReset={() => {
            setSearchPage(0);
            handleSearch(true);
          }}
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
        />
      )}
    </SafeAreaView>
  );
}

// Search Results Component
function SearchResults({
  recipes,
  searchPage,
  hasMoreSearch,
  loading,
  onPageChange,
  onReset,
}: {
  recipes: SearchRecipe[];
  searchPage: number;
  hasMoreSearch: boolean;
  loading: boolean;
  onPageChange: (page: number) => void;
  onReset: () => void;
}) {
  return (
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
                onPress={() => onPageChange(searchPage - 1)}
                disabled={loading}
              >
                <Text style={styles.paginationButtonText}>Trang trước</Text>
              </TouchableOpacity>
            )}
            <Text style={styles.pageIndicator}>Trang {searchPage + 1}</Text>
            {hasMoreSearch && (
              <TouchableOpacity
                style={[styles.paginationButton, loading && { opacity: 0.6 }]}
                onPress={() => onPageChange(searchPage + 1)}
                disabled={loading}
              >
                <Text style={styles.paginationButtonText}>Trang sau</Text>
              </TouchableOpacity>
            )}
          </View>
          {recipes.length > 0 && (
            <TouchableOpacity style={styles.resetButton} onPress={onReset}>
              <Text style={styles.paginationButtonText}>Về trang đầu</Text>
            </TouchableOpacity>
          )}
        </View>
      }
    />
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
}: any) {
  return (
    <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
      {activeTab === 'Đề xuất' ? (
        <>
          <FeaturedDish recipes={dailyRecommendations} onRecipePress={onRecipePress} />
          <TrendingRecipes
            recipes={trending.recipes}
            onRecipePress={onRecipePress}
            onLoadMore={trending.loadMore}
            hasMore={trending.hasMore}
            isLoadingMore={trending.isLoadingMore}
            likedRecipes={likedRecipes}
            likingRecipeId={likingRecipeId}
            onToggleLike={onToggleLike}
          />
          <PopularRecipes
            recipes={popular.recipes}
            onRecipePress={onRecipePress}
            onLoadMore={popular.loadMore}
            hasMore={popular.hasMore}
            isLoadingMore={popular.isLoadingMore}
            likedRecipes={likedRecipes}
            likingRecipeId={likingRecipeId}
            onToggleLike={onToggleLike}
          />
          <TopRatedRecipes
            recipes={topRated.recipes}
            onRecipePress={onRecipePress}
            onLoadMore={topRated.loadMore}
            hasMore={topRated.hasMore}
            isLoadingMore={topRated.isLoadingMore}
            likedRecipes={likedRecipes}
            likingRecipeId={likingRecipeId}
            onToggleLike={onToggleLike}
          />
          <NewestRecipes
            recipes={newest.recipes}
            onRecipePress={onRecipePress}
            onLoadMore={newest.loadMore}
            hasMore={newest.hasMore}
            isLoadingMore={newest.isLoadingMore}
            likedRecipes={likedRecipes}
            likingRecipeId={likingRecipeId}
            onToggleLike={onToggleLike}
          />
        </>
      ) : activeTab === 'Yêu thích' ? (
        <LikedRecipes
          recipes={liked.recipes}
          onRecipePress={onRecipePress}
          onLoadMore={liked.loadMore}
          hasMore={liked.hasMore}
          isLoadingMore={liked.isLoadingMore}
          likedRecipes={likedRecipes}
          likingRecipeId={likingRecipeId}
          onToggleLike={onToggleLike}
        />
      ) : activeTab === 'Theo dõi' ? (
        <RecipeFollowing
          recipes={following.recipes}
          onRecipePress={onRecipePress}
          onLoadMore={following.loadMore}
          hasMore={following.hasMore}
          isLoadingMore={following.isLoadingMore}
          likedRecipes={likedRecipes}
          likingRecipeId={likingRecipeId}
          onToggleLike={onToggleLike}
        />
      ) : null}
      <View style={styles.bottomPadding} />
    </ScrollView>
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