import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';

// Cấu hình cache cho từng loại dữ liệu
interface CacheConfig {
  expiryTime: number; // Thời gian hết hạn (ms)
  maxItems?: number; // Giới hạn số lượng item (cho LRU)
  useLRU?: boolean; // Có sử dụng LRU không
}

// Các khóa cache và config tương ứng
const CACHE_CONFIGS: Record<string, CacheConfig> = {
  // Home page caches - 1 giờ, không giới hạn
  HOME_SUGGESTIONS: { expiryTime: 60 * 60 * 1000 },
  NEWEST_RECIPES: { expiryTime: 60 * 60 * 1000 },
  TRENDING_RECIPES: { expiryTime: 60 * 60 * 1000 },
  POPULAR_RECIPES: { expiryTime: 60 * 60 * 1000 },
  TOP_RATED_RECIPES: { expiryTime: 60 * 60 * 1000 },
  LIKED_RECIPES: { expiryTime: 60 * 60 * 1000 },
  FOLLOWING_RECIPES: { expiryTime: 60 * 60 * 1000 },
  
  // Recipe details - 7 ngày, giới hạn 20 items, dùng LRU
  RECIPE_DETAIL: { 
    expiryTime: 7 * 24 * 60 * 60 * 1000, 
    maxItems: 20, 
    useLRU: true 
  },
  USER_COLLECTIONS: { expiryTime: 60 * 60 * 1000 },
  COLLECTION_DETAIL: { 
    expiryTime: 7 * 24 * 60 * 60 * 1000, 
    maxItems: 20, 
    useLRU: true 
  },
  COLLECTION_RECIPES: { 
    expiryTime: 7 * 24 * 60 * 60 * 1000, 
    maxItems: 20, 
    useLRU: true 
  },
  USER_RECIPES: { 
    expiryTime: 7 * 24 * 60 * 60 * 1000, 
    maxItems: 10, 
    useLRU: true 
  },
};

// Prefix cho các cache key
const CACHE_KEY_PREFIX = 'unified_cache_';

interface CacheData<T> {
  data: T;
  timestamp: number;
  lastAccessed: number;
}

interface CacheIndex {
  key: string;
  lastAccessed: number;
}

class UnifiedCacheService {
  removeCategory(USER_COLLECTIONS: any) {
    throw new Error("Method not implemented.");
  }
  /**
   * Kiểm tra thiết bị có kết nối internet không
   */
  async isConnected(): Promise<boolean> {
    const netInfo = await NetInfo.fetch();
    return netInfo.isConnected ?? false;
  }

  /**
   * Tạo cache key đầy đủ
   */
  private getCacheKey(category: string, id?: string): string {
    return id 
      ? `${CACHE_KEY_PREFIX}${category}_${id}`
      : `${CACHE_KEY_PREFIX}${category}`;
  }

  /**
   * Lấy config cho loại cache
   */
  private getConfig(category: string): CacheConfig {
    return CACHE_CONFIGS[category] || { expiryTime: 60 * 60 * 1000 };
  }

  /**
   * Lưu dữ liệu vào cache
   */
  async saveToCache<T>(
    category: string, 
    data: T, 
    id?: string
  ): Promise<void> {
    try {
      const cacheKey = this.getCacheKey(category, id);
      const cachedData: CacheData<T> = {
        data,
        timestamp: Date.now(),
        lastAccessed: Date.now(),
      };

      await AsyncStorage.setItem(cacheKey, JSON.stringify(cachedData));
      console.log(`Đã lưu cache: ${category}${id ? `/${id}` : ''}`);

      // Nếu dùng LRU, cập nhật index
      const config = this.getConfig(category);
      if (config.useLRU && config.maxItems) {
        await this.updateLRUIndex(category, cacheKey, config.maxItems);
      }
    } catch (error) {
      console.log(`Lỗi khi lưu cache ${category}:`, error);
    }
  }

  /**
   * Lấy dữ liệu từ cache
   */
  async getFromCache<T>(
    category: string, 
    id?: string
  ): Promise<T | null> {
    try {
      const cacheKey = this.getCacheKey(category, id);
      const cachedString = await AsyncStorage.getItem(cacheKey);

      if (!cachedString) {
        console.log(`Không tìm thấy cache: ${category}${id ? `/${id}` : ''}`);
        return null;
      }

      const cachedData: CacheData<T> = JSON.parse(cachedString);
      const config = this.getConfig(category);

      // Kiểm tra hết hạn
      const isExpired = Date.now() - cachedData.timestamp > config.expiryTime;
      if (isExpired) {
        console.log(`Cache đã hết hạn: ${category}${id ? `/${id}` : ''}`);
        await this.removeFromCache(category, id);
        return null;
      }

      // Cập nhật thời gian truy cập
      cachedData.lastAccessed = Date.now();
      await AsyncStorage.setItem(cacheKey, JSON.stringify(cachedData));

      // Cập nhật LRU index nếu cần
      if (config.useLRU && config.maxItems) {
        await this.updateLRUIndex(category, cacheKey, config.maxItems);
      }

      console.log(`Đã tải từ cache: ${category}${id ? `/${id}` : ''}`);
      return cachedData.data;
    } catch (error) {
      console.log(`Lỗi khi đọc cache ${category}:`, error);
      return null;
    }
  }

  /**
   * Xóa cache
   */
  async removeFromCache(category: string, id?: string): Promise<void> {
    try {
      const cacheKey = this.getCacheKey(category, id);
      await AsyncStorage.removeItem(cacheKey);
      console.log(`Đã xóa cache: ${category}${id ? `/${id}` : ''}`);

      // Xóa khỏi LRU index nếu có
      const config = this.getConfig(category);
      if (config.useLRU) {
        await this.removeFromLRUIndex(category, cacheKey);
      }
    } catch (error) {
      console.log(`Lỗi khi xóa cache ${category}:`, error);
    }
  }

  /**
   * Fetch dữ liệu với cache fallback
   */
  async fetchWithCache<T>(
    category: string,
    fetchFunction: () => Promise<T>,
    options?: {
      id?: string;
      forceRefresh?: boolean;
    }
  ): Promise<{ data: T | null; fromCache: boolean; isOffline: boolean }> {
    const isOnline = await this.isConnected();
    const { id, forceRefresh } = options || {};

    // Force refresh khi online
    if (forceRefresh && isOnline) {
      try {
        const freshData = await fetchFunction();
        await this.saveToCache(category, freshData, id);
        return { data: freshData, fromCache: false, isOffline: false };
      } catch (error) {
        console.log('Lỗi khi fetch, fallback sang cache:', error);
        const cachedData = await this.getFromCache<T>(category, id);
        return { data: cachedData, fromCache: true, isOffline: false };
      }
    }

    // Offline - dùng cache
    if (!isOnline) {
      console.log('Thiết bị offline, đang tải từ cache...');
      const cachedData = await this.getFromCache<T>(category, id);
      return { data: cachedData, fromCache: true, isOffline: true };
    }

    // Online - fetch và cache
    try {
      const freshData = await fetchFunction();
      await this.saveToCache(category, freshData, id);
      return { data: freshData, fromCache: false, isOffline: false };
    } catch (error) {
      console.log('Lỗi khi fetch, fallback sang cache:', error);
      const cachedData = await this.getFromCache<T>(category, id);
      return { data: cachedData, fromCache: true, isOffline: false };
    }
  }

  /**
   * Lưu cache phân trang
   */
  async savePaginationCache<T>(
    category: string,
    page: number,
    data: T[]
  ): Promise<void> {
    try {
      const pageKey = `${category}_page_${page}`;
      await this.saveToCache(pageKey, data);

      // Lưu max page
      const maxPageKey = `${CACHE_KEY_PREFIX}${category}_max_page`;
      const currentMax = await AsyncStorage.getItem(maxPageKey);
      const maxPage = currentMax ? Math.max(parseInt(currentMax), page) : page;
      await AsyncStorage.setItem(maxPageKey, maxPage.toString());
    } catch (error) {
      console.log('Lỗi khi lưu cache phân trang:', error);
    }
  }

  /**
   * Lấy tất cả trang đã cache
   */
  async getAllCachedPages<T>(category: string): Promise<T[]> {
    try {
      const maxPageKey = `${CACHE_KEY_PREFIX}${category}_max_page`;
      const maxPageString = await AsyncStorage.getItem(maxPageKey);

      if (!maxPageString) return [];

      const maxPage = parseInt(maxPageString);
      const allData: T[] = [];

      for (let i = 0; i <= maxPage; i++) {
        const pageKey = `${category}_page_${i}`;
        const pageData = await this.getFromCache<T[]>(pageKey);
        if (pageData) {
          allData.push(...pageData);
        }
      }

      return allData;
    } catch (error) {
      console.log('Lỗi khi lấy các trang đã cache:', error);
      return [];
    }
  }

  /**
   * Cập nhật LRU index
   */
  private async updateLRUIndex(
    category: string,
    cacheKey: string,
    maxItems: number
  ): Promise<void> {
    try {
      const indexKey = `${CACHE_KEY_PREFIX}${category}_lru_index`;
      const indexString = await AsyncStorage.getItem(indexKey);
      let index: CacheIndex[] = indexString ? JSON.parse(indexString) : [];

      // Cập nhật hoặc thêm mới
      const existingIndex = index.findIndex(item => item.key === cacheKey);
      if (existingIndex >= 0) {
        index[existingIndex].lastAccessed = Date.now();
      } else {
        index.push({ key: cacheKey, lastAccessed: Date.now() });
      }

      // Sắp xếp theo thời gian truy cập
      index.sort((a, b) => b.lastAccessed - a.lastAccessed);

      // Xóa items vượt quá giới hạn
      if (index.length > maxItems) {
        const itemsToRemove = index.slice(maxItems);
        for (const item of itemsToRemove) {
          await AsyncStorage.removeItem(item.key);
        }
        index = index.slice(0, maxItems);
        console.log(`Đã xóa ${itemsToRemove.length} items cũ (LRU cleanup)`);
      }

      // Lưu index
      await AsyncStorage.setItem(indexKey, JSON.stringify(index));
    } catch (error) {
      console.log('Lỗi khi cập nhật LRU index:', error);
    }
  }

  /**
   * Xóa khỏi LRU index
   */
  private async removeFromLRUIndex(
    category: string,
    cacheKey: string
  ): Promise<void> {
    try {
      const indexKey = `${CACHE_KEY_PREFIX}${category}_lru_index`;
      const indexString = await AsyncStorage.getItem(indexKey);
      
      if (indexString) {
        let index: CacheIndex[] = JSON.parse(indexString);
        index = index.filter(item => item.key !== cacheKey);
        await AsyncStorage.setItem(indexKey, JSON.stringify(index));
      }
    } catch (error) {
      console.log('Lỗi khi xóa khỏi LRU index:', error);
    }
  }

  /**
   * Xóa toàn bộ cache của một category
   */
  async clearCategoryCache(category: string): Promise<void> {
    try {
      const config = this.getConfig(category);

      if (config.useLRU) {
        // Xóa theo LRU index
        const indexKey = `${CACHE_KEY_PREFIX}${category}_lru_index`;
        const indexString = await AsyncStorage.getItem(indexKey);
        
        if (indexString) {
          const index: CacheIndex[] = JSON.parse(indexString);
          for (const item of index) {
            await AsyncStorage.removeItem(item.key);
          }
          await AsyncStorage.removeItem(indexKey);
        }
      } else {
        // Xóa cache đơn giản
        const cacheKey = this.getCacheKey(category);
        await AsyncStorage.removeItem(cacheKey);
      }

      console.log(`Đã xóa toàn bộ cache của ${category}`);
    } catch (error) {
      console.log(`Lỗi khi xóa cache ${category}:`, error);
    }
  }

  /**
   * Xóa toàn bộ cache
   */
  async clearAllCache(): Promise<void> {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const cacheKeys = keys.filter(key => key.startsWith(CACHE_KEY_PREFIX));
      
      if (cacheKeys.length > 0) {
        await AsyncStorage.multiRemove(cacheKeys);
        console.log(`Đã xóa ${cacheKeys.length} cache entries`);
      }
    } catch (error) {
      console.log('Lỗi khi xóa toàn bộ cache:', error);
    }
  }

  /**
   * Lấy thống kê cache
   */
  async getCacheStats(category?: string): Promise<{
    totalItems: number;
    totalSize: string;
    categories: Record<string, number>;
  }> {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const cacheKeys = keys.filter(key => {
        if (!key.startsWith(CACHE_KEY_PREFIX)) return false;
        if (category) {
          return key.includes(`_${category}_`);
        }
        return true;
      });

      let totalSize = 0;
      const categories: Record<string, number> = {};

      for (const key of cacheKeys) {
        const value = await AsyncStorage.getItem(key);
        if (value) {
          totalSize += value.length;
          
          // Đếm theo category
          const match = key.match(/unified_cache_([A-Z_]+)/);
          if (match) {
            const cat = match[1];
            categories[cat] = (categories[cat] || 0) + 1;
          }
        }
      }

      return {
        totalItems: cacheKeys.length,
        totalSize: `${(totalSize / 1024).toFixed(2)} KB`,
        categories,
      };
    } catch (error) {
      console.log('Lỗi khi lấy thống kê cache:', error);
      return {
        totalItems: 0,
        totalSize: '0 KB',
        categories: {},
      };
    }
  }

  /**
   * Kiểm tra có cache không
   */
  async isCached(category: string, id?: string): Promise<boolean> {
    try {
      const cacheKey = this.getCacheKey(category, id);
      const value = await AsyncStorage.getItem(cacheKey);
      return value !== null;
    } catch (error) {
      return false;
    }
  }
}

export const unifiedCacheService = new UnifiedCacheService();

// Export constants để dùng chung
export const CACHE_CATEGORIES = {
  HOME_SUGGESTIONS: 'HOME_SUGGESTIONS',
  NEWEST_RECIPES: 'NEWEST_RECIPES',
  TRENDING_RECIPES: 'TRENDING_RECIPES',
  POPULAR_RECIPES: 'POPULAR_RECIPES',
  TOP_RATED_RECIPES: 'TOP_RATED_RECIPES',
  LIKED_RECIPES: 'LIKED_RECIPES',
  FOLLOWING_RECIPES: 'FOLLOWING_RECIPES',
  RECIPE_DETAIL: 'RECIPE_DETAIL',
  USER_COLLECTIONS: 'USER_COLLECTIONS',
  COLLECTION_DETAIL: 'COLLECTION_DETAIL',
  COLLECTION_RECIPES: 'COLLECTION_RECIPES',
  USER_RECIPES: 'USER_RECIPES',
} as const;
