import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';

// Các khóa cache
const CACHE_KEYS = {
  DAILY_RECOMMENDATIONS: 'cache_daily_recommendations',
  FEATURED_RECIPES: 'cache_featured_recipes',
  NEWEST_RECIPES: 'cache_newest_recipes',
  TRENDING_RECIPES: 'cache_trending_recipes',
  POPULAR_RECIPES: 'cache_popular_recipes',
  TOP_RATED_RECIPES: 'cache_top_rated_recipes',
  LIKED_RECIPES: 'cache_liked_recipes',
  FOLLOWING_RECIPES: 'cache_following_recipes',
  HOME_SUGGESTIONS: 'cache_home_suggestions', // Cache cho toàn bộ home suggestions
  CACHE_TIMESTAMP: 'cache_timestamp_',
};

// Thời gian hết hạn cache (1 giờ)
const CACHE_EXPIRY_TIME = 60 * 60 * 1000; // 1 giờ tính bằng milliseconds

interface CacheData<T> {
  data: T;
  timestamp: number;
}

class OfflineCacheService {
  /**
   * Kiểm tra thiết bị có kết nối internet không
   */
  async isConnected(): Promise<boolean> {
    const netInfo = await NetInfo.fetch();
    return netInfo.isConnected ?? false;
  }

  /**
   * Lưu dữ liệu vào cache kèm timestamp
   */
  async saveToCache<T>(key: string, data: T): Promise<void> {
    try {
      const cacheData: CacheData<T> = {
        data,
        timestamp: Date.now(),
      };
      await AsyncStorage.setItem(key, JSON.stringify(cacheData));
      console.log(`Đã lưu cache cho ${key}`);
    } catch (error) {
      console.error(`Lỗi khi lưu cache cho ${key}:`, error);
    }
  }

  /**
   * Lấy dữ liệu từ cache
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
        console.log(`Cache đã hết hạn cho ${key}`);
        await AsyncStorage.removeItem(key);
        return null;
      }

      console.log(`Đã tải từ cache: ${key}`);
      return cacheData.data;
    } catch (error) {
      console.error(`Lỗi khi đọc cache cho ${key}:`, error);
      return null;
    }
  }

  /**
   * Xóa cache cụ thể
   */
  async clearCache(key: string): Promise<void> {
    try {
      await AsyncStorage.removeItem(key);
      console.log(`Đã xóa cache cho ${key}`);
    } catch (error) {
      console.error(`Lỗi khi xóa cache cho ${key}:`, error);
    }
  }

  /**
   * Xóa tất cả cache công thức
   */
  async clearAllCaches(): Promise<void> {
    try {
      const keys = Object.values(CACHE_KEYS);
      await AsyncStorage.multiRemove(keys);
      console.log('Đã xóa tất cả cache');
    } catch (error) {
      console.error('Lỗi khi xóa tất cả cache:', error);
    }
  }

  /**
   * Lấy tuổi của cache tính bằng phút
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
   * Lấy dữ liệu với cache dự phòng
   * - Nếu online: lấy từ API và lưu cache
   * - Nếu offline: trả về dữ liệu đã cache
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
    
    // Nếu bật force refresh và đang online, bỏ qua cache
    if (options?.forceRefresh && isOnline) {
      try {
        const freshData = await fetchFunction();
        await this.saveToCache(cacheKey, freshData);
        return { data: freshData, fromCache: false, isOffline: false };
      } catch (error) {
        console.error('Lỗi khi lấy dữ liệu mới:', error);
        // Dự phòng bằng cache nếu fetch thất bại
        const cachedData = await this.getFromCache<T>(cacheKey);
        return { data: cachedData, fromCache: true, isOffline: false };
      }
    }

    // Nếu offline, trả về dữ liệu đã cache
    if (!isOnline) {
      console.log('Thiết bị đang offline, đang tải từ cache...');
      const cachedData = await this.getFromCache<T>(cacheKey);
      return { data: cachedData, fromCache: true, isOffline: true };
    }

    // Nếu online, thử lấy dữ liệu mới
    try {
      const freshData = await fetchFunction();
      await this.saveToCache(cacheKey, freshData);
      return { data: freshData, fromCache: false, isOffline: false };
    } catch (error) {
      console.error('Lỗi khi lấy dữ liệu, dự phòng bằng cache:', error);
      const cachedData = await this.getFromCache<T>(cacheKey);
      return { data: cachedData, fromCache: true, isOffline: false };
    }
  }

  /**
   * Lưu dữ liệu phân trang (cho việc tải thêm dữ liệu)
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
      console.error('Lỗi khi lưu cache phân trang:', error);
    }
  }

  /**
   * Lấy tất cả các trang đã cache
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
      console.error('Lỗi khi lấy các trang đã cache:', error);
      return [];
    }
  }
}

export const offlineCacheService = new OfflineCacheService();
export { CACHE_KEYS };

