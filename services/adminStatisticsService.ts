import { API_CONFIG } from '@/config/api.config';
import AsyncStorage from '@react-native-async-storage/async-storage';

import {
  DateRangeParams,
  DetailedInteractionStats,
  EngagementByCategory,
  FollowTrends,
  InteractionOverview,
  PeakHoursStats,
  TopComments
} from '@/types/admin/interaction.types';

import {
  PopularCategories,
  PopularIngredients,
  PopularKeywords,
  SearchOverview,
  SearchSuccessRate,
  SearchTrends,
  ZeroResultKeywords
} from '@/types/admin/search.types';


export const BASE_URL = API_CONFIG.BASE_URL;



class AdminStatisticService {

  private async getAuthToken(): Promise<string | null> {
    return await AsyncStorage.getItem('access_token');
  }

  private async handleFetchRequest<T>(
    url: string,
    method: string = 'GET',
    body?: any
  ): Promise<T> {
    try {
      const token = await this.getAuthToken();
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000);

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        ...(body && { body: JSON.stringify(body) }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Response error:', {
          status: response.status,
          body: errorText
        });
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      if (!result || typeof result !== 'object') {
        throw new Error('Invalid response: not an object');
      }

      if (Array.isArray(result) || !('success' in result)) {
        return result as T;
      }
      if (!('data' in result)) {
        throw new Error('Invalid response: missing data field');
      }

      return result.data;
    } catch (error: any) {
      console.error(`Error in fetch request to ${url}:`, error);
      if (error.name === 'AbortError') {
        throw new Error('Request timeout');
      }
      throw error;
    }
  }


  /**
   * Lấy tổng quan thống kê tương tác
   */
  async getInteractionOverview(params?: DateRangeParams): Promise<InteractionOverview> {
    const queryParams = new URLSearchParams();
    if (params?.startDate) queryParams.append('startDate', params.startDate);
    if (params?.endDate) queryParams.append('endDate', params.endDate);

    return this.handleFetchRequest<InteractionOverview>(
      `${BASE_URL}/api/admin/statistics/interaction/overview?${queryParams.toString()}`
    );
  }

  /**
   * Lấy thống kê tương tác chi tiết
   */
  async getDetailedInteractionStats(params?: DateRangeParams): Promise<DetailedInteractionStats> {
    const queryParams = new URLSearchParams();
    if (params?.startDate) queryParams.append('startDate', params.startDate);
    if (params?.endDate) queryParams.append('endDate', params.endDate);

    return this.handleFetchRequest<DetailedInteractionStats>(
      `${BASE_URL}/api/admin/statistics/interaction/detailed?${queryParams.toString()}`
    );
  }

  /**
   * Lấy thống kê giờ cao điểm
   */
  async getPeakHours(params?: DateRangeParams): Promise<PeakHoursStats> {
    const queryParams = new URLSearchParams();
    if (params?.startDate) queryParams.append('startDate', params.startDate);
    if (params?.endDate) queryParams.append('endDate', params.endDate);

    return this.handleFetchRequest<PeakHoursStats>(
      `${BASE_URL}/api/admin/statistics/interaction/peak-hours?${queryParams.toString()}`
    );
  }

  /**
   * Lấy top bình luận được like nhiều nhất
   */
  async getTopComments(
    limit: number = 10,
    params?: DateRangeParams
  ): Promise<TopComments> {
    const queryParams = new URLSearchParams({ limit: limit.toString() });
    if (params?.startDate) queryParams.append('startDate', params.startDate);
    if (params?.endDate) queryParams.append('endDate', params.endDate);

    return this.handleFetchRequest<TopComments>(
      `${BASE_URL}/api/admin/statistics/interaction/top-comments?${queryParams.toString()}`
    );
  }

  /**
   * Lấy xu hướng follow
   */
  async getFollowTrends(
    params?: DateRangeParams & { groupBy?: 'DAY' | 'WEEK' | 'MONTH' }
  ): Promise<FollowTrends> {
    const queryParams = new URLSearchParams();
    if (params?.startDate) queryParams.append('startDate', params.startDate);
    if (params?.endDate) queryParams.append('endDate', params.endDate);
    if (params?.groupBy) queryParams.append('groupBy', params.groupBy);

    return this.handleFetchRequest<FollowTrends>(
      `${BASE_URL}/api/admin/statistics/interaction/follow-trends?${queryParams.toString()}`
    );
  }

  /**
   * Lấy engagement theo danh mục
   */
  async getEngagementByCategory(params?: DateRangeParams): Promise<EngagementByCategory> {
    const queryParams = new URLSearchParams();
    if (params?.startDate) queryParams.append('startDate', params.startDate);
    if (params?.endDate) queryParams.append('endDate', params.endDate);

    return this.handleFetchRequest<EngagementByCategory>(
      `${BASE_URL}/api/admin/statistics/interaction/engagement-by-category?${queryParams.toString()}`
    );
  }
 /**
   * Lấy tổng quan tìm kiếm
   */
  async getSearchOverview(params?: DateRangeParams): Promise<SearchOverview> {
    const queryParams = new URLSearchParams();
    if (params?.startDate) queryParams.append('startDate', params.startDate);
    if (params?.endDate) queryParams.append('endDate', params.endDate);

    return this.handleFetchRequest<SearchOverview>(
      `${BASE_URL}/api/admin/statistics/search/overview?${queryParams.toString()}`
    );
  }

  /**
   * Lấy từ khóa phổ biến
   */
  async getPopularKeywords(
    limit: number = 20,
    params?: DateRangeParams
  ): Promise<PopularKeywords> {
    const queryParams = new URLSearchParams({ limit: limit.toString() });
    if (params?.startDate) queryParams.append('startDate', params.startDate);
    if (params?.endDate) queryParams.append('endDate', params.endDate);

    return this.handleFetchRequest<PopularKeywords>(
      `${BASE_URL}/api/admin/statistics/search/popular-keywords?${queryParams.toString()}`
    );
  }

  /**
   * Lấy nguyên liệu phổ biến
   */
  async getPopularIngredients(
    limit: number = 30,
    params?: DateRangeParams
  ): Promise<PopularIngredients> {
    const queryParams = new URLSearchParams({ limit: limit.toString() });
    if (params?.startDate) queryParams.append('startDate', params.startDate);
    if (params?.endDate) queryParams.append('endDate', params.endDate);

    return this.handleFetchRequest<PopularIngredients>(
      `${BASE_URL}/api/admin/statistics/search/popular-ingredients?${queryParams.toString()}`
    );
  }

  /**
   * Lấy danh mục được xem nhiều
   */
  async getPopularCategories(params?: DateRangeParams): Promise<PopularCategories> {
    const queryParams = new URLSearchParams();
    if (params?.startDate) queryParams.append('startDate', params.startDate);
    if (params?.endDate) queryParams.append('endDate', params.endDate);

    return this.handleFetchRequest<PopularCategories>(
      `${BASE_URL}/api/admin/statistics/search/popular-categories?${queryParams.toString()}`
    );
  }

  /**
   * Lấy tỷ lệ thành công tìm kiếm
   */
  async getSearchSuccessRate(params?: DateRangeParams): Promise<SearchSuccessRate> {
    const queryParams = new URLSearchParams();
    if (params?.startDate) queryParams.append('startDate', params.startDate);
    if (params?.endDate) queryParams.append('endDate', params.endDate);

    return this.handleFetchRequest<SearchSuccessRate>(
      `${BASE_URL}/api/admin/statistics/search/success-rate?${queryParams.toString()}`
    );
  }

  /**
   * Lấy từ khóa không có kết quả
   */
  async getZeroResultKeywords(
    limit: number = 30,
    params?: DateRangeParams
  ): Promise<ZeroResultKeywords> {
    const queryParams = new URLSearchParams({ limit: limit.toString() });
    if (params?.startDate) queryParams.append('startDate', params.startDate);
    if (params?.endDate) queryParams.append('endDate', params.endDate);

    return this.handleFetchRequest<ZeroResultKeywords>(
      `${BASE_URL}/api/admin/statistics/search/zero-result-keywords?${queryParams.toString()}`
    );
  }

  /**
   * Lấy xu hướng tìm kiếm
   */
  async getSearchTrends(
    params?: DateRangeParams & { groupBy?: 'DAY' | 'WEEK' | 'MONTH' }
  ): Promise<SearchTrends> {
    const queryParams = new URLSearchParams();
    if (params?.startDate) queryParams.append('startDate', params.startDate);
    if (params?.endDate) queryParams.append('endDate', params.endDate);
    if (params?.groupBy) queryParams.append('groupBy', params.groupBy);

    return this.handleFetchRequest<SearchTrends>(
      `${BASE_URL}/api/admin/statistics/search/trends?${queryParams.toString()}`
    );
  }
}

export const formatDateForApi = (date: Date): string => {
  return date.toISOString();
};

export const getDefaultDateRange = (): DateRangeParams => {
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - 30);

  return {
    startDate: formatDateForApi(startDate),
    endDate: formatDateForApi(endDate),
  };
};

export const formatNumber = (num: number | null | undefined): string => {
  if (num === null || num === undefined || isNaN(num)) {
    return '0';
  }
  if (num >= 1000000) {
    return `${(num / 1000000).toFixed(1)}M`;
  }
  if (num >= 1000) {
    return `${(num / 1000).toFixed(1)}K`;
  }
  return num.toString();
};

export const adminStatisticApi = new AdminStatisticService();

export default adminStatisticApi;