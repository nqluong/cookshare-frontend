import { Dispatch, SetStateAction } from 'react';
import {
    getHomeSuggestions,
    getLikedRecipes,
    getRecipebyFollowing,
    searchRecipeByUser,
} from '../services/homeService';
import { useRecipePagination } from '../services/useRecipePagination';
import { useRecipeLike } from '../services/userRecipeLike';
import { Recipe as DishRecipe } from '../types/dish';
import { SearchHistoryItem, Recipe as SearchRecipe } from '../types/search';

export class HomeViewModel {
  // States
  private setActiveTab: (tab: string) => void;
  private setDailyRecommendations: (recipes: DishRecipe[]) => void;
  private setFeaturedRecipes: (recipes: DishRecipe[]) => void;
  private setLoading: (loading: boolean) => void;
  private setError: (error: string | null) => void;
  private setRecipes: Dispatch<SetStateAction<SearchRecipe[]>>;
  private setSearchPage: (page: number) => void;
  private setHasMoreSearch: (hasMore: boolean) => void;
  private setHasSearched: (searched: boolean) => void;
  private setHistory: (updater: (prev: SearchHistoryItem[]) => SearchHistoryItem[]) => void;
  private setIsLikedTabLoaded: (loaded: boolean) => void;
  private setIsFollowingTabLoaded: (loaded: boolean) => void;

  // Hooks
  public likeHook: ReturnType<typeof useRecipeLike>;
  public newestPagination: ReturnType<typeof useRecipePagination>;
  public trendingPagination: ReturnType<typeof useRecipePagination>;
  public popularPagination: ReturnType<typeof useRecipePagination>;
  public topRatedPagination: ReturnType<typeof useRecipePagination>;
  public likedPagination: ReturnType<typeof useRecipePagination>;
  public followingPagination: ReturnType<typeof useRecipePagination>;

  // Current states
  private searchQuery: string;
  private searchPage: number;
  private activeTab: string;

  constructor(
    setters: {
      setActiveTab: (tab: string) => void;
      setDailyRecommendations: (recipes: DishRecipe[]) => void;
      setFeaturedRecipes: (recipes: DishRecipe[]) => void;
      setLoading: (loading: boolean) => void;
      setError: (error: string | null) => void;
      setRecipes: Dispatch<SetStateAction<SearchRecipe[]>>;
      setSearchPage: (page: number) => void;
      setHasMoreSearch: (hasMore: boolean) => void;
      setHasSearched: (searched: boolean) => void;
      setHistory: (updater: (prev: SearchHistoryItem[]) => SearchHistoryItem[]) => void;
      setIsLikedTabLoaded: (loaded: boolean) => void;
      setIsFollowingTabLoaded: (loaded: boolean) => void;
    },
    hooks: {
      likeHook: ReturnType<typeof useRecipeLike>;
      newestPagination: ReturnType<typeof useRecipePagination>;
      trendingPagination: ReturnType<typeof useRecipePagination>;
      popularPagination: ReturnType<typeof useRecipePagination>;
      topRatedPagination: ReturnType<typeof useRecipePagination>;
      likedPagination: ReturnType<typeof useRecipePagination>;
      followingPagination: ReturnType<typeof useRecipePagination>;
    },
    currentStates: {
      searchQuery: string;
      searchPage: number;
      activeTab: string;
    }
  ) {
    this.setActiveTab = setters.setActiveTab;
    this.setDailyRecommendations = setters.setDailyRecommendations;
    this.setFeaturedRecipes = setters.setFeaturedRecipes;
    this.setLoading = setters.setLoading;
    this.setError = setters.setError;
    this.setRecipes = setters.setRecipes;
    this.setSearchPage = setters.setSearchPage;
    this.setHasMoreSearch = setters.setHasMoreSearch;
    this.setHasSearched = setters.setHasSearched;
    this.setHistory = setters.setHistory;
    this.setIsLikedTabLoaded = setters.setIsLikedTabLoaded;
    this.setIsFollowingTabLoaded = setters.setIsFollowingTabLoaded;

    this.likeHook = hooks.likeHook;
    this.newestPagination = hooks.newestPagination;
    this.trendingPagination = hooks.trendingPagination;
    this.popularPagination = hooks.popularPagination;
    this.topRatedPagination = hooks.topRatedPagination;
    this.likedPagination = hooks.likedPagination;
    this.followingPagination = hooks.followingPagination;

    this.searchQuery = currentStates.searchQuery;
    this.searchPage = currentStates.searchPage;
    this.activeTab = currentStates.activeTab;
  }

  // Update current states (called from screen)
  updateCurrentStates(states: { searchQuery?: string; searchPage?: number; activeTab?: string }) {
    if (states.searchQuery !== undefined) this.searchQuery = states.searchQuery;
    if (states.searchPage !== undefined) this.searchPage = states.searchPage;
    if (states.activeTab !== undefined) this.activeTab = states.activeTab;
  }

  async fetchHomeSuggestions() {
    try {
      this.setLoading(true);
      this.setError(null);

      const response = await getHomeSuggestions();

      if (response.success && response.data) {
        const {
          trendingRecipes,
          popularRecipes,
          newestRecipes,
          topRatedRecipes,
          featuredRecipes,
          dailyRecommendations,
        } = response.data;

        // Reset paginations
        this.newestPagination.reset(newestRecipes || []);
        this.trendingPagination.reset(trendingRecipes || []);
        this.popularPagination.reset(popularRecipes || []);
        this.topRatedPagination.reset(topRatedRecipes || []);

        this.setFeaturedRecipes(featuredRecipes || []);
        this.setDailyRecommendations(dailyRecommendations || []);

        // Check liked status
        const allRecipeIds = [
          ...(trendingRecipes || []).map((r: DishRecipe) => r.recipeId),
          ...(popularRecipes || []).map((r: DishRecipe) => r.recipeId),
          ...(newestRecipes || []).map((r: DishRecipe) => r.recipeId),
          ...(topRatedRecipes || []).map((r: DishRecipe) => r.recipeId),
          ...(featuredRecipes || []).map((r: DishRecipe) => r.recipeId),
          ...(dailyRecommendations || []).map((r: DishRecipe) => r.recipeId),
        ];

        await this.likeHook.checkLikedStatus(allRecipeIds);
      }
    } catch (err: any) {
      console.error('Error fetching home suggestions:', err);
      this.setError(err.message || 'Không thể tải dữ liệu');
    } finally {
      this.setLoading(false);
    }
  }

  async fetchLikedRecipes() {
    try {
      this.setLoading(true);
      const response = await getLikedRecipes(0, 10);

      if (response.code === 1000 && response.result) {
        const likedList = response.result.content
          .map((item: any) => item?.recipe)
          .filter((r: any) => r && r.recipeId);

        this.likedPagination.reset(likedList);
      }
    } catch (err: any) {
      console.error('Lỗi khi tải danh sách yêu thích:', err);
      this.setError('Không thể tải danh sách yêu thích');
    } finally {
      this.setLoading(false);
    }
  }

  async fetchFollowingRecipes() {
    try {
      this.setLoading(true);
      const response = await getRecipebyFollowing(0, 10);

      if (response.success && response.data && response.data.content) {
        const followingList = response.data.content
          .map((item: any) => item?.recipe || item)
          .filter((r: any) => r && r.recipeId);

        this.followingPagination.reset(followingList);
      }
    } catch (err: any) {
      console.error('Lỗi khi tải danh sách công thức theo dõi:', err);
      this.setError('Không thể tải danh sách công thức từ người theo dõi');
    } finally {
      this.setLoading(false);
    }
  }

  async handleSearch(reset = true, requestedPage?: number) {
    if (reset && !this.searchQuery.trim()) {
      this.setError('Vui lòng nhập tên người dùng cần tìm kiếm');
      return;
    }

    this.setLoading(true);
    this.setError(null);
    this.setHasSearched(true);

    try {
      const currentPage = reset ? 0 : requestedPage ?? this.searchPage;
      const data = await searchRecipeByUser(this.searchQuery, currentPage, 10);

      if ('code' in data && data.code !== 1000) {
        this.setError(data.message || 'Lỗi từ server');
        this.setRecipes([]);
        this.setHasMoreSearch(false);
        return;
      }

      if ('result' in data && data.result && data.result.content) {
        const newRecipes = data.result.content;

        if (reset) {
          this.setRecipes(newRecipes);
          this.setSearchPage(0);
        } else {
          this.setRecipes((prev: SearchRecipe[]) => [...prev, ...newRecipes]);
        }

        this.setHasMoreSearch(!data.result.last);

        if (newRecipes.length === 0) {
          this.setError('Không tìm người dùng nào phù hợp');
        } else {
          this.setError(null);
        }

        if (reset && this.searchQuery.trim()) {
          this.setHistory((prev) => {
            const newItem: SearchHistoryItem = {
              searchId: Math.random().toString(36).substring(2, 9),
              userId: 'local',
              searchQuery: this.searchQuery,
              searchType: 'recipe',
              resultCount: newRecipes.length,
              createdAt: new Date().toISOString(),
            };
            return [...prev.filter((item) => item.searchQuery !== this.searchQuery), newItem].slice(0, 5);
          });
        }
      }
    } catch (err: unknown) {
      let errorMessage = 'Lỗi không xác định';
      if (err instanceof Error) {
        errorMessage = err.message;
      }
      this.setError(errorMessage);
    } finally {
      this.setLoading(false);
    }
  }

  async toggleLike(
    recipeId: string,
    dailyRecommendations: DishRecipe[],
    featuredRecipes: DishRecipe[]
  ) {
    const updateCount = (delta: number) => {
      this.newestPagination.updateRecipe(recipeId, {
        likeCount:
          (this.newestPagination.recipes.find((r) => r.recipeId === recipeId)?.likeCount || 0) + delta,
      });
      this.trendingPagination.updateRecipe(recipeId, {
        likeCount:
          (this.trendingPagination.recipes.find((r) => r.recipeId === recipeId)?.likeCount || 0) + delta,
      });
      this.popularPagination.updateRecipe(recipeId, {
        likeCount:
          (this.popularPagination.recipes.find((r) => r.recipeId === recipeId)?.likeCount || 0) + delta,
      });
      this.topRatedPagination.updateRecipe(recipeId, {
        likeCount:
          (this.topRatedPagination.recipes.find((r) => r.recipeId === recipeId)?.likeCount || 0) + delta,
      });
      this.followingPagination.updateRecipe(recipeId, {
        likeCount:
          (this.followingPagination.recipes.find((r) => r.recipeId === recipeId)?.likeCount || 0) + delta,
      });
    };

    const onSuccess = (recipeId: string, isLiked: boolean) => {
      if (this.activeTab === 'Yêu thích') {
        if (isLiked) {
          const allRecipes = [
            ...dailyRecommendations,
            ...featuredRecipes,
            ...this.popularPagination.recipes,
            ...this.newestPagination.recipes,
            ...this.topRatedPagination.recipes,
            ...this.trendingPagination.recipes,
            ...this.followingPagination.recipes,
          ];
          const found = allRecipes.find((r) => r.recipeId === recipeId);
          if (found) {
            this.likedPagination.setRecipes((prev) => [found, ...prev]);
          }
        } else {
          this.likedPagination.setRecipes((prev) => prev.filter((r) => r.recipeId !== recipeId));
        }
      }
    };

    await this.likeHook.toggleLike(recipeId, updateCount, onSuccess);
  }

  handleTabChange(tab: string, isLikedTabLoaded: boolean, isFollowingTabLoaded: boolean) {
    this.setActiveTab(tab);
    
    if (tab === 'Yêu thích' && !isLikedTabLoaded) {
      this.fetchLikedRecipes();
      this.setIsLikedTabLoaded(true);
    } else if (tab === 'Theo dõi' && !isFollowingTabLoaded) {
      this.fetchFollowingRecipes();
      this.setIsFollowingTabLoaded(true);
    }
  }
}