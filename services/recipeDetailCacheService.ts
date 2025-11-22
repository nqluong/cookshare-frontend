import AsyncStorage from '@react-native-async-storage/async-storage';

// Cấu hình cache
const CACHE_CONFIG = {
  MAX_RECIPES: 20, // Giới hạn số công thức được cache (LRU)
  EXPIRY_TIME: 7 * 24 * 60 * 60 * 1000, // 7 ngày
  CACHE_KEY_PREFIX: 'recipe_detail_',
  CACHE_INDEX_KEY: 'recipe_detail_index',
};

interface CachedRecipe {
  data: any;
  timestamp: number;
  lastAccessed: number;
}

interface CacheIndex {
  recipeId: string;
  lastAccessed: number;
}

class RecipeDetailCacheService {
  /**
   * Lưu chi tiết công thức vào cache
   */
  async cacheRecipeDetail(recipeId: string, recipeData: any): Promise<void> {
    try {
      const cacheKey = `${CACHE_CONFIG.CACHE_KEY_PREFIX}${recipeId}`;
      const cachedRecipe: CachedRecipe = {
        data: recipeData,
        timestamp: Date.now(),
        lastAccessed: Date.now(),
      };

      // Lưu recipe vào cache
      await AsyncStorage.setItem(cacheKey, JSON.stringify(cachedRecipe));
      console.log(`Đã cache công thức: ${recipeId}`);

      // Cập nhật cache index
      await this.updateCacheIndex(recipeId);
    } catch (error) {
      console.error('Lỗi khi cache công thức:', error);
    }
  }

  /**
   * Lấy chi tiết công thức từ cache
   */
  async getCachedRecipeDetail(recipeId: string): Promise<any | null> {
    try {
      const cacheKey = `${CACHE_CONFIG.CACHE_KEY_PREFIX}${recipeId}`;
      const cachedString = await AsyncStorage.getItem(cacheKey);

      if (!cachedString) {
        console.log(`Không tìm thấy cache cho công thức: ${recipeId}`);
        return null;
      }

      const cachedRecipe: CachedRecipe = JSON.parse(cachedString);

      // Kiểm tra cache có hết hạn không
      const isExpired = Date.now() - cachedRecipe.timestamp > CACHE_CONFIG.EXPIRY_TIME;

      if (isExpired) {
        console.log(`Cache đã hết hạn cho công thức: ${recipeId}`);
        await this.removeCachedRecipe(recipeId);
        return null;
      }

      // Cập nhật thời gian truy cập
      cachedRecipe.lastAccessed = Date.now();
      await AsyncStorage.setItem(cacheKey, JSON.stringify(cachedRecipe));
      await this.updateCacheIndex(recipeId);

      console.log(`Đã tải công thức từ cache: ${recipeId}`);
      return cachedRecipe.data;
    } catch (error) {
      console.error('Lỗi khi đọc cache công thức:', error);
      return null;
    }
  }

  /**
   * Cập nhật cache index và quản lý LRU
   */
  private async updateCacheIndex(recipeId: string): Promise<void> {
    try {
      // Lấy cache index hiện tại
      const indexString = await AsyncStorage.getItem(CACHE_CONFIG.CACHE_INDEX_KEY);
      let cacheIndex: CacheIndex[] = indexString ? JSON.parse(indexString) : [];

      // Cập nhật hoặc thêm recipe vào index
      const existingIndex = cacheIndex.findIndex(item => item.recipeId === recipeId);
      
      if (existingIndex >= 0) {
        cacheIndex[existingIndex].lastAccessed = Date.now();
      } else {
        cacheIndex.push({
          recipeId,
          lastAccessed: Date.now(),
        });
      }

      // Sắp xếp theo thời gian truy cập (mới nhất trước)
      cacheIndex.sort((a, b) => b.lastAccessed - a.lastAccessed);

      // Nếu vượt quá giới hạn, xóa những recipe ít được truy cập nhất
      if (cacheIndex.length > CACHE_CONFIG.MAX_RECIPES) {
        const recipesToRemove = cacheIndex.slice(CACHE_CONFIG.MAX_RECIPES);
        
        for (const item of recipesToRemove) {
          await this.removeCachedRecipe(item.recipeId);
        }

        cacheIndex = cacheIndex.slice(0, CACHE_CONFIG.MAX_RECIPES);
        console.log(`Đã xóa ${recipesToRemove.length} công thức ít được truy cập`);
      }

      // Lưu cache index
      await AsyncStorage.setItem(CACHE_CONFIG.CACHE_INDEX_KEY, JSON.stringify(cacheIndex));
    } catch (error) {
      console.error('Lỗi khi cập nhật cache index:', error);
    }
  }

  /**
   * Xóa một công thức khỏi cache
   */
  async removeCachedRecipe(recipeId: string): Promise<void> {
    try {
      const cacheKey = `${CACHE_CONFIG.CACHE_KEY_PREFIX}${recipeId}`;
      await AsyncStorage.removeItem(cacheKey);
      console.log(`Đã xóa cache công thức: ${recipeId}`);

      // Cập nhật cache index
      const indexString = await AsyncStorage.getItem(CACHE_CONFIG.CACHE_INDEX_KEY);
      if (indexString) {
        let cacheIndex: CacheIndex[] = JSON.parse(indexString);
        cacheIndex = cacheIndex.filter(item => item.recipeId !== recipeId);
        await AsyncStorage.setItem(CACHE_CONFIG.CACHE_INDEX_KEY, JSON.stringify(cacheIndex));
      }
    } catch (error) {
      console.error('Lỗi khi xóa cache công thức:', error);
    }
  }

  /**
   * Xóa toàn bộ cache công thức
   */
  async clearAllCache(): Promise<void> {
    try {
      const indexString = await AsyncStorage.getItem(CACHE_CONFIG.CACHE_INDEX_KEY);
      
      if (indexString) {
        const cacheIndex: CacheIndex[] = JSON.parse(indexString);
        
        // Xóa tất cả các recipe
        for (const item of cacheIndex) {
          const cacheKey = `${CACHE_CONFIG.CACHE_KEY_PREFIX}${item.recipeId}`;
          await AsyncStorage.removeItem(cacheKey);
        }
      }

      // Xóa cache index
      await AsyncStorage.removeItem(CACHE_CONFIG.CACHE_INDEX_KEY);
      console.log('Đã xóa toàn bộ cache công thức');
    } catch (error) {
      console.error('Lỗi khi xóa toàn bộ cache:', error);
    }
  }

  /**
   * Lấy danh sách các công thức đã cache
   */
  async getCachedRecipeIds(): Promise<string[]> {
    try {
      const indexString = await AsyncStorage.getItem(CACHE_CONFIG.CACHE_INDEX_KEY);
      
      if (!indexString) {
        return [];
      }

      const cacheIndex: CacheIndex[] = JSON.parse(indexString);
      return cacheIndex.map(item => item.recipeId);
    } catch (error) {
      console.error('Lỗi khi lấy danh sách cache:', error);
      return [];
    }
  }

  /**
   * Kiểm tra công thức có trong cache không
   */
  async isRecipeCached(recipeId: string): Promise<boolean> {
    try {
      const cacheKey = `${CACHE_CONFIG.CACHE_KEY_PREFIX}${recipeId}`;
      const cachedString = await AsyncStorage.getItem(cacheKey);
      return cachedString !== null;
    } catch (error) {
      return false;
    }
  }

  /**
   * Lấy thông tin thống kê cache
   */
  async getCacheStats(): Promise<{
    totalCached: number;
    cacheSize: string;
    oldestCache: number | null;
  }> {
    try {
      const indexString = await AsyncStorage.getItem(CACHE_CONFIG.CACHE_INDEX_KEY);
      
      if (!indexString) {
        return {
          totalCached: 0,
          cacheSize: '0 KB',
          oldestCache: null,
        };
      }

      const cacheIndex: CacheIndex[] = JSON.parse(indexString);
      
      // Tính toán kích thước cache (ước tính)
      let totalSize = 0;
      let oldestTimestamp: number | null = null;

      for (const item of cacheIndex) {
        const cacheKey = `${CACHE_CONFIG.CACHE_KEY_PREFIX}${item.recipeId}`;
        const cachedString = await AsyncStorage.getItem(cacheKey);
        
        if (cachedString) {
          totalSize += cachedString.length;
          const cached: CachedRecipe = JSON.parse(cachedString);
          
          if (!oldestTimestamp || cached.timestamp < oldestTimestamp) {
            oldestTimestamp = cached.timestamp;
          }
        }
      }

      const sizeInKB = (totalSize / 1024).toFixed(2);

      return {
        totalCached: cacheIndex.length,
        cacheSize: `${sizeInKB} KB`,
        oldestCache: oldestTimestamp,
      };
    } catch (error) {
      console.error('Lỗi khi lấy thống kê cache:', error);
      return {
        totalCached: 0,
        cacheSize: '0 KB',
        oldestCache: null,
      };
    }
  }
}

export const recipeDetailCacheService = new RecipeDetailCacheService();
