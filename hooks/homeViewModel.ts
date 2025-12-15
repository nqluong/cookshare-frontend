import { Dispatch, SetStateAction } from 'react';
import {
  checkMultipleLikes,
  getDailyRecipes,
  getLikedRecipes,
  getNewestRecipes,
  getPopularRecipes,
  getRecipebyFollowing,
  getTopRatedRecipes,
  getTrendingRecipes,
  getUserSuggestions,
  searchRecipeByUser,
} from '../services/homeService';
import { CACHE_CATEGORIES, unifiedCacheService } from '../services/unifiedCacheService';
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
  private setSearchQuery: (query: string) => void;
  private setIsOffline: (offline: boolean) => void;
  private setLoadingMoreSearch: (loading: boolean) => void;
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
      setSearchQuery: (query: string) => void;
      setIsOffline: (offline: boolean) => void;
      setLoadingMoreSearch: (loading: boolean) => void;
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
    this.setSearchQuery = setters.setSearchQuery;
    this.setIsOffline = setters.setIsOffline;
    this.setLoadingMoreSearch = setters.setLoadingMoreSearch;
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

  async fetchUserSuggestions(query: string): Promise<string[]> {
    try {
      const response = await getUserSuggestions(query, 5);
      if (response.code === 1000 && response.result) {
        return response.result;
      }
      return [];
    } catch (error) {
      console.log('Lỗi khi lấy gợi ý người dùng:', error);
      return [];
    }
  }

  handleQueryChange(query: string, hasSearched: boolean) {
    this.setSearchQuery(query);
    this.searchQuery = query;
    if (hasSearched) {
      this.setHasSearched(false);
      this.setRecipes([]);
      this.setError(null);
    }
  }

  async fetchHomeSuggestions() {
    try {
      this.setLoading(true);
      this.setError(null);

      // Kiểm tra kết nối mạng
      const isOnline = await unifiedCacheService.isConnected();
      this.setIsOffline(!isOnline);

      if (!isOnline) {
        // Nếu offline, load từ cache
        console.log('Offline - Đang tải gợi ý trang chủ từ cache...');
        const cachedData = await unifiedCacheService.getFromCache<any>(CACHE_CATEGORIES.HOME_SUGGESTIONS);

        if (cachedData) {
          const {
            trendingRecipes,
            popularRecipes,
            newestRecipes,
            topRatedRecipes,
            dailyRecipes,
          } = cachedData;

          this.newestPagination.reset(newestRecipes || []);
          this.trendingPagination.reset(trendingRecipes || []);
          this.popularPagination.reset(popularRecipes || []);
          this.topRatedPagination.reset(topRatedRecipes || []);

          // Set daily recommendations từ cache
          this.setDailyRecommendations(dailyRecipes || []);

          console.log('Đã tải gợi ý trang chủ từ cache');
        } else {
          this.setError('Không có dữ liệu offline');
        }
        return;
      }

      // Gọi song song tất cả các API - mỗi API khi có data sẽ hiển thị ngay
      console.log('Đang gọi song song các API trang chủ...');
      const startTime = Date.now();

      // Mảng để thu thập recipeIds cho việc check likes
      const allRecipeIds: string[] = [];
      const cacheData: any = {};

      // Tạo promises và xử lý ngay khi mỗi API trả về
      const newestPromise = getNewestRecipes(0, 10)
        .then(response => {
          const recipes = response?.success && response?.data?.content ? response.data.content : [];
          this.newestPagination.reset(recipes);
          cacheData.newestRecipes = recipes;
          allRecipeIds.push(...recipes.map((r: DishRecipe) => r.recipeId).filter(Boolean));
          console.log(`✅ Newest recipes loaded: ${recipes.length} items`);
          // Tắt loading ngay khi có data đầu tiên
          this.setLoading(false);
          return recipes;
        })
        .catch(err => {
          console.log('Lỗi khi lấy newest recipes:', err.message);
          return [];
        });

      const trendingPromise = getTrendingRecipes(0, 10)
        .then(response => {
          const recipes = response?.success && response?.data?.content ? response.data.content : [];
          this.trendingPagination.reset(recipes);
          cacheData.trendingRecipes = recipes;
          allRecipeIds.push(...recipes.map((r: DishRecipe) => r.recipeId).filter(Boolean));
          console.log(`✅ Trending recipes loaded: ${recipes.length} items`);
          this.setLoading(false);
          return recipes;
        })
        .catch(err => {
          console.log('Lỗi khi lấy trending recipes:', err.message);
          return [];
        });

      const popularPromise = getPopularRecipes(0, 10)
        .then(response => {
          const recipes = response?.success && response?.data?.content ? response.data.content : [];
          this.popularPagination.reset(recipes);
          cacheData.popularRecipes = recipes;
          allRecipeIds.push(...recipes.map((r: DishRecipe) => r.recipeId).filter(Boolean));
          console.log(`✅ Popular recipes loaded: ${recipes.length} items`);
          this.setLoading(false);
          return recipes;
        })
        .catch(err => {
          console.log('Lỗi khi lấy popular recipes:', err.message);
          return [];
        });

      const topRatedPromise = getTopRatedRecipes(0, 10)
        .then(response => {
          const recipes = response?.success && response?.data?.content ? response.data.content : [];
          this.topRatedPagination.reset(recipes);
          cacheData.topRatedRecipes = recipes;
          allRecipeIds.push(...recipes.map((r: DishRecipe) => r.recipeId).filter(Boolean));
          console.log(`✅ Top rated recipes loaded: ${recipes.length} items`);
          this.setLoading(false);
          return recipes;
        })
        .catch(err => {
          console.log('Lỗi khi lấy top rated recipes:', err.message);
          return [];
        });

      const dailyPromise = getDailyRecipes()
        .then(response => {
          const recipes = response?.success && response?.data ? response.data : [];
          this.setDailyRecommendations(recipes);
          cacheData.dailyRecipes = recipes;
          allRecipeIds.push(...recipes.map((r: DishRecipe) => r.recipeId).filter(Boolean));
          console.log(`✅ Daily recipes loaded: ${recipes.length} items`);
          this.setLoading(false);
          return recipes;
        })
        .catch(err => {
          console.log('Lỗi khi lấy daily recipes:', err.message);
          return [];
        });

      // Đợi tất cả API hoàn thành để lưu cache và check likes
      await Promise.allSettled([newestPromise, trendingPromise, popularPromise, topRatedPromise, dailyPromise]);

      const endTime = Date.now();
      console.log(`Đã tải xong tất cả API trong ${endTime - startTime}ms`);

      // Lưu vào cache
      await unifiedCacheService.saveToCache(CACHE_CATEGORIES.HOME_SUGGESTIONS, cacheData);
      console.log('Đã lưu gợi ý trang chủ vào cache');

      // Thu thập và loại bỏ duplicate recipeIds
      const uniqueRecipeIds = Array.from(new Set(allRecipeIds));

      console.log(`Đang kiểm tra likes cho ${uniqueRecipeIds.length} công thức duy nhất`);

      if (uniqueRecipeIds.length > 0) {
        try {
          const likeCheckResponse = await checkMultipleLikes(uniqueRecipeIds);

          if (likeCheckResponse.code === 1000 && likeCheckResponse.result) {
            const likedSet = new Set(
              Object.entries(likeCheckResponse.result)
                .filter(([_, isLiked]) => isLiked)
                .map(([recipeId, _]) => recipeId)
            );

            console.log(`Tìm thấy ${likedSet.size} công thức đã like`);
            this.likeHook.setLikedRecipes(likedSet);
          }
        } catch (likeError: any) {
          console.log('Lỗi khi kiểm tra likes (không nghiêm trọng):', likeError.message);
          // Không throw error, chỉ log - không ảnh hưởng đến việc hiển thị recipes
        }
      }
    } catch (err: any) {
      console.log('Lỗi khi lấy gợi ý trang chủ:', err);
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
      console.log('Lỗi khi tải danh sách yêu thích:', err);
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
      console.log('Lỗi khi tải danh sách công thức theo dõi:', err);
      this.setError('Không thể tải danh sách công thức từ người theo dõi');
    } finally {
      this.setLoading(false);
    }
  }

  async handleSearch(reset = true, requestedPage?: number, queryOverride?: string) {
    const queryToSearch = (queryOverride || this.searchQuery).trim();
    if (!queryToSearch && reset) {
      this.setError('Vui lòng nhập tên người dùng cần tìm kiếm');
      return;
    }
    if (reset && !queryToSearch) {
      this.setError('Vui lòng nhập tên người dùng cần tìm kiếm');
      return;
    }
    console.log('Tìm kiếm người dùng với từ khóa:', queryToSearch);

    if (reset) {
      this.setLoading(true);
    } else {
      this.setLoadingMoreSearch(true);
    }

    this.setError(null);
    this.setHasSearched(true);

    try {
      const currentPage = reset ? 0 : requestedPage ?? this.searchPage;

      // Gọi song song: API recipes của user + API suggestions user
      const [recipesData, usersData] = await Promise.all([
        searchRecipeByUser(queryToSearch, currentPage, 10),
        reset ? getUserSuggestions(queryToSearch, 20) : Promise.resolve({ result: [] })
      ]);

      let combinedResults: SearchRecipe[] = [];

      // Thêm users từ suggestions (chỉ khi reset/search mới)
      if (reset && usersData && 'result' in usersData && usersData.result) {
        const usersList = usersData.result.map((user: any) => ({
          userId: user.userId,
          fullName: user.fullName,
          avatarUrl: user.avatarUrl,
          featuredImage: user.avatarUrl,
          title: '',
          slug: null,
          description: null,
          recipeId: '', // Không có recipeId = user item
          cookTime: 0,
          viewCount: 0,
          likeCount: 0,
          saveCount: 0,
        }));
        combinedResults = [...usersList];
      }

      // Thêm recipes từ searchRecipeByUser
      if ('result' in recipesData && recipesData.result && recipesData.result.content) {
        combinedResults = [...combinedResults, ...recipesData.result.content];
      } else if ('code' in recipesData && recipesData.code !== 1000) {
        this.setError(recipesData.message || 'Lỗi từ server');
        if (reset) {
          this.setRecipes(combinedResults.length > 0 ? combinedResults : []);
        }
        this.setHasMoreSearch(false);
        return;
      }

      if (reset) {
        this.setRecipes(combinedResults);
        this.setSearchPage(0);
      } else {
        this.setRecipes((prev: SearchRecipe[]) => [...prev, ...combinedResults]);
        this.setSearchPage(currentPage);
      }

      this.setHasMoreSearch(recipesData.result ? !recipesData.result.last : false);

      if (combinedResults.length === 0) {
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
            resultCount: combinedResults.length,
            createdAt: new Date().toISOString(),
          };
          return [...prev.filter((item) => item.searchQuery !== this.searchQuery), newItem].slice(0, 5);
        });
      }
    } catch (err: unknown) {
      let errorMessage = 'Lỗi không xác định';
      if (err instanceof Error) {
        errorMessage = err.message;
      }
      this.setError(errorMessage);
    } finally {
      if (reset) {
        this.setLoading(false);
      } else {
        this.setLoadingMoreSearch(false);
      }
    }
  }

  // ✅ HÀM TOGGLELIKE ĐÃ SỬA - CHỈ CÓ MỘT HÀM DUY NHẤT
  async toggleLike(
    recipeId: string,
    dailyRecommendations: DishRecipe[],
    featuredRecipes: DishRecipe[]
  ) {
    // ✅ Kiểm tra trạng thái liked TRƯỚC khi toggle
    const wasLiked = this.likeHook.likedRecipes.has(recipeId);
    const currentTab = this.activeTab; // ✅ Lưu tab hiện tại

    console.log(`🔄 Toggle Like - Recipe: ${recipeId}, Was Liked: ${wasLiked}, Current Tab: ${currentTab}`);

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
      // ✅ QUAN TRỌNG: Cập nhật likeCount cho liked tab
      this.likedPagination.updateRecipe(recipeId, {
        likeCount:
          (this.likedPagination.recipes.find((r) => r.recipeId === recipeId)?.likeCount || 0) + delta,
      });
    };

    const onSuccess = (recipeId: string, isLiked: boolean) => {
      console.log(`✅ Toggle Success - Recipe: ${recipeId}, Is Liked: ${isLiked}, Tab: ${currentTab}`);

      // ✅ XỬ LÝ CHO MỌI TAB, KHÔNG CHỈ TAB "YÊU THÍCH"
      if (isLiked && !wasLiked) {
        // ✅ LIKE MỚI: Thêm vào danh sách liked (dù đang ở tab nào)
        console.log(`➕ Adding recipe ${recipeId} to liked list`);
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
          this.likedPagination.setRecipes((prev) => {
            // Tránh duplicate
            const exists = prev.some((r) => r.recipeId === recipeId);
            if (exists) {
              console.log(`⚠️ Recipe ${recipeId} already in liked list`);
              return prev;
            }
            console.log(`✅ Added recipe to liked list. Total: ${prev.length + 1}`);
            return [found, ...prev];
          });
        } else {
          console.warn(`⚠️ Recipe ${recipeId} not found in any list to add`);
        }
      } else if (!isLiked && wasLiked) {
        // ✅ UNLIKE: Xóa khỏi danh sách liked (dù đang ở tab nào)
        console.log(`➖ Removing recipe ${recipeId} from liked list`);
        this.likedPagination.setRecipes((prev) => {
          const filtered = prev.filter((r) => r.recipeId !== recipeId);
          console.log(`Liked list: ${prev.length} -> ${filtered.length} recipes`);
          return filtered;
        });
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