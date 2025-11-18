import { useEffect, useState } from 'react';
import { offlineCacheService } from '../services/offlineCacheService';
import { Recipe } from '../types/dish';

interface UseCachedRecipesOptions {
  cacheKey: string;
  fetchFunction: () => Promise<Recipe[]>;
  autoFetch?: boolean;
}

interface UseCachedRecipesReturn {
  data: Recipe[];
  loading: boolean;
  error: string | null;
  isFromCache: boolean;
  isOffline: boolean;
  refresh: () => Promise<void>;
  cacheAge: number | null;
}

export function useCachedRecipes({
  cacheKey,
  fetchFunction,
  autoFetch = true,
}: UseCachedRecipesOptions): UseCachedRecipesReturn {
  const [data, setData] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFromCache, setIsFromCache] = useState(false);
  const [isOffline, setIsOffline] = useState(false);
  const [cacheAge, setCacheAge] = useState<number | null>(null);

  const fetchData = async (forceRefresh = false) => {
    setLoading(true);
    setError(null);

    try {
      const result = await offlineCacheService.fetchWithCache(
        cacheKey,
        fetchFunction,
        { forceRefresh }
      );

      if (result.data) {
        setData(result.data);
        setIsFromCache(result.fromCache);
        setIsOffline(result.isOffline);

        // Get cache age
        const age = await offlineCacheService.getCacheAge(cacheKey);
        setCacheAge(age);
      } else {
        setError('Không có dữ liệu');
      }
    } catch (err) {
      setError('Có lỗi xảy ra khi tải dữ liệu');
      console.error('Error in useCachedRecipes:', err);
    } finally {
      setLoading(false);
    }
  };

  const refresh = async () => {
    await fetchData(true);
  };

  useEffect(() => {
    if (autoFetch) {
      fetchData();
    }
  }, [cacheKey]);

  return {
    data,
    loading,
    error,
    isFromCache,
    isOffline,
    refresh,
    cacheAge,
  };
}

// Hook for pagination with cache
interface UseCachedPaginationOptions {
  cacheKey: string;
  fetchFunction: (page: number, pageSize: number) => Promise<any>; // API response object
  pageSize?: number;
  autoFetch?: boolean; // Cho phép tắt auto-fetch
}

interface UseCachedPaginationReturn {
  recipes: Recipe[];
  loading: boolean;
  isLoadingMore: boolean;
  hasMore: boolean;
  isFromCache: boolean;
  isOffline: boolean;
  page: number;
  loadMore: () => Promise<void>;
  refresh: () => Promise<void>;
  reset: (initialRecipes?: Recipe[]) => void;
  updateRecipe: (recipeId: string, updates: Partial<Recipe>) => void;
  setRecipes: React.Dispatch<React.SetStateAction<Recipe[]>>;
}

const parseRecipeArray = (response: any): Recipe[] => {
  if (!response) return [];
  
  if (response.success && response.data) {
    // Nếu data là array
    if (Array.isArray(response.data)) {
      return response.data;
    }
    // Nếu data có content
    if (response.data.content && Array.isArray(response.data.content)) {
      const content = response.data.content;
      if (content.length > 0 && content[0].recipe) {
        return content.map((item: any) => item.recipe).filter(Boolean);
      }
      return content;
    }
  }
  
  if (response.code === 1000 && response.result) {
    if (response.result.content && Array.isArray(response.result.content)) {
      return response.result.content.map((item: any) => item.recipe || item).filter(Boolean);
    }
  }
  
  if (Array.isArray(response)) {
    return response;
  }
  
  return [];
};

export function useCachedPagination({
  cacheKey,
  fetchFunction,
  pageSize = 10,
  autoFetch = true, // Mặc định là true để giữ behavior cũ
}: UseCachedPaginationOptions): UseCachedPaginationReturn {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);
  const [page, setPage] = useState(0);
  const [isFromCache, setIsFromCache] = useState(false);
  const [isOffline, setIsOffline] = useState(false);

  const loadInitialData = async () => {
    setLoading(true);
    
    const online = await offlineCacheService.isConnected();
    setIsOffline(!online);

    if (!online) {
      // Load all cached pages when offline
      const cachedData = await offlineCacheService.getAllCachedPages<Recipe>(cacheKey);
      setRecipes(cachedData);
      setIsFromCache(true);
      setHasMore(false);
      setLoading(false);
      return;
    }

    // When online, fetch first page
    try {
      const response = await fetchFunction(0, pageSize);
      const firstPage = parseRecipeArray(response);
      setRecipes(firstPage);
      setCurrentPage(0);
      setHasMore(firstPage.length === pageSize);
      setIsFromCache(false);
      
      // Cache the first page
      await offlineCacheService.savePaginationCache(cacheKey, 0, firstPage);
    } catch (error) {
      console.error('Error loading initial data:', error);
      // Fallback to cache
      const cachedData = await offlineCacheService.getAllCachedPages<Recipe>(cacheKey);
      setRecipes(cachedData);
      setIsFromCache(true);
    } finally {
      setLoading(false);
    }
  };

  const loadMore = async () => {
    if (isLoadingMore || !hasMore || isOffline) return;

    setIsLoadingMore(true);
    try {
      const nextPage = currentPage + 1;
      const response = await fetchFunction(nextPage, pageSize);
      const newRecipes = parseRecipeArray(response);
      
      if (newRecipes.length > 0) {
        setRecipes((prev) => [...prev, ...newRecipes]);
        setCurrentPage(nextPage);
        setHasMore(newRecipes.length === pageSize);
        
        // Cache the new page
        await offlineCacheService.savePaginationCache(cacheKey, nextPage, newRecipes);
      } else {
        setHasMore(false);
      }
    } catch (error) {
      console.error('Error loading more:', error);
    } finally {
      setIsLoadingMore(false);
    }
  };

  const refresh = async () => {
    setCurrentPage(0);
    setPage(0);
    setHasMore(true);
    await loadInitialData();
  };

  const reset = (initialRecipes?: Recipe[]) => {
    if (initialRecipes) {
      setRecipes(initialRecipes);
      setCurrentPage(0);
      setPage(0);
      setHasMore(initialRecipes.length === pageSize);
    } else {
      setRecipes([]);
      setCurrentPage(0);
      setPage(0);
      setHasMore(true);
    }
  };

  const updateRecipe = (recipeId: string, updates: Partial<Recipe>) => {
    setRecipes((prev) =>
      prev.map((recipe) =>
        recipe.recipeId === recipeId ? { ...recipe, ...updates } : recipe
      )
    );
  };

  useEffect(() => {
    if (autoFetch) {
      loadInitialData();
    }
  }, []);

  return {
    recipes,
    loading,
    isLoadingMore,
    hasMore,
    isFromCache,
    isOffline,
    page,
    loadMore,
    refresh,
    reset,
    updateRecipe,
    setRecipes,
  };
}