import { CACHE_CATEGORIES, unifiedCacheService } from '@/services/unifiedCacheService';
import { CollectionUserDto } from '@/types/collection.types';
import { useCallback, useState } from 'react';

interface UseCachedCollectionsOptions {
  userId: string;
  pageSize?: number;
}

export function useCachedCollections({ userId, pageSize = 100 }: UseCachedCollectionsOptions) {
  const [collections, setCollections] = useState<CollectionUserDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [isOffline, setIsOffline] = useState(false);

  const loadCollections = useCallback(async (
    fetchFunction: (userId: string, page: number, size: number) => Promise<any>,
    forceRefresh = false
  ) => {
    if (!userId) {
      console.log('⚠️ No userId provided');
      return;
    }

    console.log('📥 Loading collections for userId:', userId);
    setLoading(true);
    
    try {
      const result = await unifiedCacheService.fetchWithCache(
        CACHE_CATEGORIES.USER_COLLECTIONS,
        () => fetchFunction(userId, 0, pageSize),
        {
          id: userId,
          forceRefresh
        }
      );

      console.log('📦 Raw result type:', typeof result.data);

      if (result.data) {
        let content: CollectionUserDto[] = [];

        // ✅ API trả về: { success, code, message, data: { content: [...] } }
        // Vậy result.data.data.content chính là collections
        if (result.data?.data?.content && Array.isArray(result.data.data.content)) {
          content = result.data.data.content;
          console.log('✅ Found collections in result.data.data.content:', content.length);
        }
        // Fallback: Có thể cache lưu theo format { content: [...] }
        else if (result.data?.content && Array.isArray(result.data.content)) {
          content = result.data.content;
          console.log('✅ Found collections in result.data.content:', content.length);
        }
        // Fallback: Array trực tiếp
        else if (Array.isArray(result.data)) {
          content = result.data;
          console.log('✅ Found collections as direct array:', content.length);
        }
        else {
          console.log('⚠️ Unexpected data structure:', Object.keys(result.data));
        }

        setCollections(content);
      } else {
        console.log('⚠️ No data in result');
        setCollections([]);
      }
      
      setIsOffline(result.isOffline);
    } catch (error) {
      console.error('❌ Error loading collections:', error);
      
      // Fallback to cache
      try {
        const cachedData = await unifiedCacheService.getFromCache<any>(
          CACHE_CATEGORIES.USER_COLLECTIONS, 
          userId
        );
        
        if (cachedData) {
          let content: CollectionUserDto[] = [];
          
          // Parse cache data với cùng logic
          if (cachedData?.data?.content && Array.isArray(cachedData.data.content)) {
            content = cachedData.data.content;
          } else if (cachedData?.content && Array.isArray(cachedData.content)) {
            content = cachedData.content;
          } else if (Array.isArray(cachedData)) {
            content = cachedData;
          }
          
          console.log('📱 Loaded from cache:', content.length);
          setCollections(content);
          setIsOffline(true);
        } else {
          setCollections([]);
        }
      } catch (cacheError) {
        console.error('❌ Cache error:', cacheError);
        setCollections([]);
      }
    } finally {
      setLoading(false);
    }
  }, [userId, pageSize]);

  const refresh = useCallback(async (fetchFunction: any) => {
    console.log('🔄 Refreshing collections...');
    await loadCollections(fetchFunction, true);
  }, [loadCollections]);

  const clearCache = useCallback(async () => {
    console.log('🗑️ Clearing collection cache for userId:', userId);
    await unifiedCacheService.removeFromCache(CACHE_CATEGORIES.USER_COLLECTIONS, userId);
  }, [userId]);

  return {
    collections,
    loading,
    isOffline,
    loadCollections,
    refresh,
    clearCache,
  };
}