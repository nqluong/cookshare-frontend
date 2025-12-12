import { CACHE_CATEGORIES, unifiedCacheService } from '@/services/unifiedCacheService';
import { Recipe } from '@/types/search';
import { useCallback, useState } from 'react';

interface UseCachedUserRecipesOptions {
  userId: string;
  autoFetch?: boolean;
}

export function useCachedUserRecipes({ userId, autoFetch = false }: UseCachedUserRecipesOptions) {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(false);
  const [isOffline, setIsOffline] = useState(false);

  const loadRecipes = useCallback(async (
    fetchFunction: (userId: string) => Promise<Recipe[]>,
    forceRefresh = false
  ) => {
    if (!userId) {
      console.log('⚠️ No userId provided for recipes');
      return;
    }

    console.log('📥 Loading recipes for userId:', userId);
    setLoading(true);
    
    try {
      const result = await unifiedCacheService.fetchWithCache(
        CACHE_CATEGORIES.USER_RECIPES,
        () => fetchFunction(userId),
        {
          id: userId,
          forceRefresh
        }
      );

      console.log('📦 Recipe result:', { 
        hasData: !!result.data, 
        fromCache: result.fromCache,
        isOffline: result.isOffline 
      });

      if (result.data) {
        setRecipes(Array.isArray(result.data) ? result.data : []);
        console.log('✅ Loaded recipes count:', result.data.length);
      } else {
        setRecipes([]);
      }
      
      setIsOffline(result.isOffline);
    } catch (error) {
      console.error('❌ Error loading recipes:', error);
      // Fallback to cache
      try {
        const cachedData = await unifiedCacheService.getFromCache<Recipe[]>(
          CACHE_CATEGORIES.USER_RECIPES, 
          userId
        );
        if (cachedData) {
          setRecipes(Array.isArray(cachedData) ? cachedData : []);
          setIsOffline(true);
        } else {
          setRecipes([]);
        }
      } catch (cacheError) {
        console.error('❌ Error loading from cache:', cacheError);
        setRecipes([]);
      }
    } finally {
      setLoading(false);
    }
  }, [userId]);

  const refresh = useCallback(async (fetchFunction: any) => {
    console.log('🔄 Refreshing recipes...');
    await loadRecipes(fetchFunction, true);
  }, [loadRecipes]);

  const clearCache = useCallback(async () => {
    console.log('🗑️ Clearing recipes cache for userId:', userId);
    await unifiedCacheService.removeFromCache(CACHE_CATEGORIES.USER_RECIPES, userId);
  }, [userId]);

  return {
    recipes,
    loading,
    isOffline,
    loadRecipes,
    refresh,
    clearCache,
    setRecipes, // Export để có thể update local
  };
}