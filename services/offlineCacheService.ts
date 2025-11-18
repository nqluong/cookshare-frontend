import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';

// Cache keys
const CACHE_KEYS = {
  DAILY_RECOMMENDATIONS: 'cache_daily_recommendations',
  FEATURED_RECIPES: 'cache_featured_recipes',
  NEWEST_RECIPES: 'cache_newest_recipes',
  TRENDING_RECIPES: 'cache_trending_recipes',
  POPULAR_RECIPES: 'cache_popular_recipes',
  TOP_RATED_RECIPES: 'cache_top_rated_recipes',
  LIKED_RECIPES: 'cache_liked_recipes',
  FOLLOWING_RECIPES: 'cache_following_recipes',
  CACHE_TIMESTAMP: 'cache_timestamp_',
};

// Cache expiry time (1 hour)
const CACHE_EXPIRY_TIME = 60 * 60 * 1000; // 1 hour in milliseconds

interface CacheData<T> {
  data: T;
  timestamp: number;
}

class OfflineCacheService {
  /**
   * Check if device is connected to internet
   */
  async isConnected(): Promise<boolean> {
    const netInfo = await NetInfo.fetch();
    return netInfo.isConnected ?? false;
  }

  /**
   * Save data to cache with timestamp
   */
  async saveToCache<T>(key: string, data: T): Promise<void> {
    try {
      const cacheData: CacheData<T> = {
        data,
        timestamp: Date.now(),
      };
      await AsyncStorage.setItem(key, JSON.stringify(cacheData));
      console.log(`✅ Cached data for ${key}`);
    } catch (error) {
      console.error(`❌ Error saving to cache for ${key}:`, error);
    }
  }

  /**
   * Get data from cache
   */
  async getFromCache<T>(key: string): Promise<T | null> {
    try {
      const cachedString = await AsyncStorage.getItem(key);
      if (!cachedString) {
        return null;
      }

      const cacheData: CacheData<T> = JSON.parse(cachedString);
      const isExpired = Date.now() - cacheData.timestamp > CACHE_EXPIRY_TIME;

      if (isExpired) {
        console.log(`⏰ Cache expired for ${key}`);
        await AsyncStorage.removeItem(key);
        return null;
      }

      console.log(`✅ Loaded from cache: ${key}`);
      return cacheData.data;
    } catch (error) {
      console.error(`❌ Error reading cache for ${key}:`, error);
      return null;
    }
  }

  /**
   * Clear specific cache
   */
  async clearCache(key: string): Promise<void> {
    try {
      await AsyncStorage.removeItem(key);
      console.log(`🗑️ Cleared cache for ${key}`);
    } catch (error) {
      console.error(`❌ Error clearing cache for ${key}:`, error);
    }
  }

  /**
   * Clear all recipe caches
   */
  async clearAllCaches(): Promise<void> {
    try {
      const keys = Object.values(CACHE_KEYS);
      await AsyncStorage.multiRemove(keys);
      console.log('🗑️ Cleared all caches');
    } catch (error) {
      console.error('❌ Error clearing all caches:', error);
    }
  }

  /**
   * Get cache age in minutes
   */
  async getCacheAge(key: string): Promise<number | null> {
    try {
      const cachedString = await AsyncStorage.getItem(key);
      if (!cachedString) return null;

      const cacheData: CacheData<any> = JSON.parse(cachedString);
      const ageInMinutes = Math.floor((Date.now() - cacheData.timestamp) / (60 * 1000));
      return ageInMinutes;
    } catch (error) {
      return null;
    }
  }

  /**
   * Fetch data with cache fallback
   * - If online: fetch from API and cache result
   * - If offline: return cached data
   */
  async fetchWithCache<T>(
    cacheKey: string,
    fetchFunction: () => Promise<T>,
    options?: {
      forceRefresh?: boolean;
      skipCache?: boolean;
    }
  ): Promise<{ data: T | null; fromCache: boolean; isOffline: boolean }> {
    const isOnline = await this.isConnected();
    
    // If force refresh is enabled and we're online, skip cache
    if (options?.forceRefresh && isOnline) {
      try {
        const freshData = await fetchFunction();
        await this.saveToCache(cacheKey, freshData);
        return { data: freshData, fromCache: false, isOffline: false };
      } catch (error) {
        console.error('Error fetching fresh data:', error);
        // Fallback to cache if fetch fails
        const cachedData = await this.getFromCache<T>(cacheKey);
        return { data: cachedData, fromCache: true, isOffline: false };
      }
    }

    // If offline, return cached data
    if (!isOnline) {
      console.log('📵 Device is offline, loading from cache...');
      const cachedData = await this.getFromCache<T>(cacheKey);
      return { data: cachedData, fromCache: true, isOffline: true };
    }

    // If online, try to fetch fresh data
    try {
      const freshData = await fetchFunction();
      await this.saveToCache(cacheKey, freshData);
      return { data: freshData, fromCache: false, isOffline: false };
    } catch (error) {
      console.error('Error fetching data, falling back to cache:', error);
      const cachedData = await this.getFromCache<T>(cacheKey);
      return { data: cachedData, fromCache: true, isOffline: false };
    }
  }

  /**
   * Save pagination data (for incremental loading)
   */
  async savePaginationCache<T>(
    baseKey: string,
    page: number,
    data: T[]
  ): Promise<void> {
    try {
      const paginationKey = `${baseKey}_page_${page}`;
      await this.saveToCache(paginationKey, data);
      
      const maxPageKey = `${baseKey}_max_page`;
      const currentMax = await AsyncStorage.getItem(maxPageKey);
      const maxPage = currentMax ? Math.max(parseInt(currentMax), page) : page;
      await AsyncStorage.setItem(maxPageKey, maxPage.toString());
    } catch (error) {
      console.error('Error saving pagination cache:', error);
    }
  }

  /**
   * Get all cached pages
   */
  async getAllCachedPages<T>(baseKey: string): Promise<T[]> {
    try {
      const maxPageKey = `${baseKey}_max_page`;
      const maxPageString = await AsyncStorage.getItem(maxPageKey);
      
      if (!maxPageString) return [];

      const maxPage = parseInt(maxPageString);
      const allData: T[] = [];

      for (let i = 0; i <= maxPage; i++) {
        const pageKey = `${baseKey}_page_${i}`;
        const pageData = await this.getFromCache<T[]>(pageKey);
        if (pageData) {
          allData.push(...pageData);
        }
      }

      return allData;
    } catch (error) {
      console.error('Error getting cached pages:', error);
      return [];
    }
  }
}

export const offlineCacheService = new OfflineCacheService();
export { CACHE_KEYS };
