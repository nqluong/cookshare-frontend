import { CACHE_CATEGORIES, unifiedCacheService } from '@/services/unifiedCacheService';
import { CollectionUserDto } from '@/types/collection.types';
import { Recipe } from '@/types/dish';
import { useCallback, useState } from 'react';

interface UseCachedCollectionDetailOptions {
  userId: string;
  collectionId: string;
}

export function useCachedCollectionDetail({ 
  userId, 
  collectionId 
}: UseCachedCollectionDetailOptions) {
  const [collection, setCollection] = useState<CollectionUserDto | null>(null);
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(false);
  const [isOffline, setIsOffline] = useState(false);

  /**
   * Load chi tiết collection
   */
  const loadCollectionDetail = useCallback(async (
    fetchFunction: (userId: string, collectionId: string) => Promise<any>,
    forceRefresh = false
  ) => {
    if (!userId || !collectionId) {
      console.log(' Missing userId or collectionId');
      return;
    }

    console.log(' Loading collection detail:', collectionId);
    setLoading(true);
    
    try {
      const result = await unifiedCacheService.fetchWithCache(
        CACHE_CATEGORIES.COLLECTION_DETAIL,
        () => fetchFunction(userId, collectionId),
        {
          id: collectionId,
          forceRefresh
        }
      );

      if (result.data) {
        // Parse response structure: { success, code, message, data: CollectionUserDto }
        const collectionData = result.data?.data || result.data;
        setCollection(collectionData);
        console.log(' Collection detail loaded:', collectionData.name);
      } else {
        console.log(' No collection data');
        setCollection(null);
      }
      
      setIsOffline(result.isOffline);
    } catch (error) {
      console.error(' Error loading collection detail:', error);
      
      // Fallback to cache
      try {
        const cachedData = await unifiedCacheService.getFromCache<any>(
          CACHE_CATEGORIES.COLLECTION_DETAIL, 
          collectionId
        );
        
        if (cachedData) {
          const collectionData = cachedData?.data || cachedData;
          setCollection(collectionData);
          setIsOffline(true);
          console.log('📱 Loaded collection from cache');
        } else {
          setCollection(null);
        }
      } catch (cacheError) {
        console.error(' Cache error:', cacheError);
        setCollection(null);
      }
    } finally {
      setLoading(false);
    }
  }, [userId, collectionId]);

  /**
   * Load recipes trong collection
   */
  const loadCollectionRecipes = useCallback(async (
    fetchFunction: (userId: string, collectionId: string, page: number, size: number) => Promise<any>,
    forceRefresh = false,
    page = 0,
    size = 100
  ) => {
    if (!userId || !collectionId) {
      console.log(' Missing userId or collectionId');
      return;
    }

    console.log(' Loading collection recipes:', collectionId);
    setLoading(true);
    
    try {
      const result = await unifiedCacheService.fetchWithCache(
        CACHE_CATEGORIES.COLLECTION_RECIPES,
        () => fetchFunction(userId, collectionId, page, size),
        {
          id: collectionId,
          forceRefresh
        }
      );

      if (result.data) {
        let content: Recipe[] = [];

        // Parse different response structures
        if (result.data?.content && Array.isArray(result.data.content)) {
          content = result.data.content;
          console.log(' Found recipes in result.data.content:', content.length);
        } else if (Array.isArray(result.data)) {
          content = result.data;
          console.log(' Found recipes as direct array:', content.length);
        } else {
          console.log(' Unexpected recipes structure:', Object.keys(result.data));
        }

        setRecipes(content);
      } else {
        console.log(' No recipes data');
        setRecipes([]);
      }
      
      setIsOffline(result.isOffline);
    } catch (error) {
      console.error(' Error loading collection recipes:', error);
      
      // Fallback to cache
      try {
        const cachedData = await unifiedCacheService.getFromCache<any>(
          CACHE_CATEGORIES.COLLECTION_RECIPES, 
          collectionId
        );
        
        if (cachedData) {
          let content: Recipe[] = [];
          
          if (cachedData?.content && Array.isArray(cachedData.content)) {
            content = cachedData.content;
          } else if (Array.isArray(cachedData)) {
            content = cachedData;
          }
          
          setRecipes(content);
          setIsOffline(true);
          console.log(' Loaded recipes from cache:', content.length);
        } else {
          setRecipes([]);
        }
      } catch (cacheError) {
        console.error(' Cache error:', cacheError);
        setRecipes([]);
      }
    } finally {
      setLoading(false);
    }
  }, [userId, collectionId]);

  /**
   * Load cả collection detail và recipes cùng lúc
   */
  const loadAll = useCallback(async (
    detailFetchFn: (userId: string, collectionId: string) => Promise<any>,
    recipesFetchFn: (userId: string, collectionId: string, page: number, size: number) => Promise<any>,
    forceRefresh = false
  ) => {
    if (!userId || !collectionId) {
      console.log('⚠️ Missing userId or collectionId');
      return;
    }

    console.log(' Loading collection detail + recipes:', collectionId);
    setLoading(true);

    try {
      // Load cả 2 song song
      const [detailResult, recipesResult] = await Promise.all([
        unifiedCacheService.fetchWithCache(
          CACHE_CATEGORIES.COLLECTION_DETAIL,
          () => detailFetchFn(userId, collectionId),
          { id: collectionId, forceRefresh }
        ),
        unifiedCacheService.fetchWithCache(
          CACHE_CATEGORIES.COLLECTION_RECIPES,
          () => recipesFetchFn(userId, collectionId, 0, 100),
          { id: collectionId, forceRefresh }
        )
      ]);

      // Set collection detail
      if (detailResult.data) {
        const collectionData = detailResult.data?.data || detailResult.data;
        setCollection(collectionData);
        console.log(' Collection detail loaded');
      }

      // Set recipes
      if (recipesResult.data) {
        let content: Recipe[] = [];
        if (recipesResult.data?.content && Array.isArray(recipesResult.data.content)) {
          content = recipesResult.data.content;
        } else if (Array.isArray(recipesResult.data)) {
          content = recipesResult.data;
        }
        setRecipes(content);
        console.log(' Recipes loaded:', content.length);
      }

      setIsOffline(detailResult.isOffline || recipesResult.isOffline);
    } catch (error) {
      console.error(' Error loading collection data:', error);
      
      // Fallback to cache
      try {
        const [cachedDetail, cachedRecipes] = await Promise.all([
          unifiedCacheService.getFromCache<any>(CACHE_CATEGORIES.COLLECTION_DETAIL, collectionId),
          unifiedCacheService.getFromCache<any>(CACHE_CATEGORIES.COLLECTION_RECIPES, collectionId)
        ]);

        if (cachedDetail) {
          const collectionData = cachedDetail?.data || cachedDetail;
          setCollection(collectionData);
        }

        if (cachedRecipes) {
          let content: Recipe[] = [];
          if (cachedRecipes?.content && Array.isArray(cachedRecipes.content)) {
            content = cachedRecipes.content;
          } else if (Array.isArray(cachedRecipes)) {
            content = cachedRecipes;
          }
          setRecipes(content);
        }

        setIsOffline(true);
        console.log(' Loaded from cache');
      } catch (cacheError) {
        console.error(' Cache error:', cacheError);
      }
    } finally {
      setLoading(false);
    }
  }, [userId, collectionId]);

  /**
   * Refresh dữ liệu
   */
  const refresh = useCallback(async (
    detailFetchFn: any,
    recipesFetchFn: any
  ) => {
    console.log(' Refreshing collection data...');
    await loadAll(detailFetchFn, recipesFetchFn, true);
  }, [loadAll]);

  /**
   * Xóa cache
   */
  const clearCache = useCallback(async () => {
    console.log(' Clearing collection cache:', collectionId);
    await Promise.all([
      unifiedCacheService.removeFromCache(CACHE_CATEGORIES.COLLECTION_DETAIL, collectionId),
      unifiedCacheService.removeFromCache(CACHE_CATEGORIES.COLLECTION_RECIPES, collectionId)
    ]);
  }, [collectionId]);

  /**
   * Xóa chỉ cache recipes (khi xóa/thêm recipe)
   */
  const clearRecipesCache = useCallback(async () => {
    console.log(' Clearing recipes cache:', collectionId);
    await unifiedCacheService.removeFromCache(CACHE_CATEGORIES.COLLECTION_RECIPES, collectionId);
  }, [collectionId]);

  return {
    collection,
    recipes,
    loading,
    isOffline,
    loadCollectionDetail,
    loadCollectionRecipes,
    loadAll,
    refresh,
    clearCache,
    clearRecipesCache,
  };
}