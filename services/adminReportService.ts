import { API_CONFIG } from '@/config/api.config';
import AsyncStorage from '@react-native-async-storage/async-storage';

import {
  CategoryPerformanceDTO,
  EngagementRateDTO,
  RecipeCompletionStatsDTO,
  RecipeContentAnalysisDTO,
  RecipeOverviewDTO,
  RecipePerformanceDTO,
  RecipeStatisticsResponse,
  TimeSeriesStatDTO,
  TopAuthorDTO,
  TrendingRecipeDTO
} from '@/types/admin/report.types';

export const BASE_URL = API_CONFIG.BASE_URL;

class AdminReportService {

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
        console.log('Response error:', {
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
        console.log('Direct response detected, returning as is');
        return result as T;
      }

      if (!('data' in result)) {
        throw new Error('Invalid response: missing data field');
      }

      return result.data;
    } catch (error: any) {
      console.log(`Error in fetch request to ${url}:`, error);
      if (error.name === 'AbortError') {
        throw new Error('Request timeout');
      }
      throw error;
    }
  }

  // Comprehensive statistics
  async getComprehensiveStatistics(
    startDate?: string,
    endDate?: string,
    limit: number = 10
  ): Promise<RecipeStatisticsResponse> {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    params.append('limit', limit.toString());

    return this.handleFetchRequest<RecipeStatisticsResponse>(
      `${BASE_URL}/api/admin/statistics/recipes/comprehensive?${params.toString()}`
    );
  }

  // Overview
  async getRecipeOverview(): Promise<RecipeOverviewDTO> {
    return this.handleFetchRequest<RecipeOverviewDTO>(
      `${BASE_URL}/api/admin/statistics/recipes/overview`
    );
  }

  // Top performers
  async getTopViewedRecipes(limit: number = 10): Promise<RecipePerformanceDTO[]> {
    return this.handleFetchRequest<RecipePerformanceDTO[]>(
      `${BASE_URL}/api/admin/statistics/recipes/top-viewed?limit=${limit}`
    );
  }

  async getTopLikedRecipes(limit: number = 10): Promise<RecipePerformanceDTO[]> {
    return this.handleFetchRequest<RecipePerformanceDTO[]>(
      `${BASE_URL}/api/admin/statistics/recipes/top-liked?limit=${limit}`
    );
  }

  async getTopSavedRecipes(limit: number = 10): Promise<RecipePerformanceDTO[]> {
    return this.handleFetchRequest<RecipePerformanceDTO[]>(
      `${BASE_URL}/api/admin/statistics/recipes/top-saved?limit=${limit}`
    );
  }

  async getTopCommentedRecipes(limit: number = 10): Promise<RecipePerformanceDTO[]> {
    return this.handleFetchRequest<RecipePerformanceDTO[]>(
      `${BASE_URL}/api/admin/statistics/recipes/top-commented?limit=${limit}`
    );
  }

  // Trending
  async getTrendingRecipes(limit: number = 10): Promise<TrendingRecipeDTO[]> {
    return this.handleFetchRequest<TrendingRecipeDTO[]>(
      `${BASE_URL}/api/admin/statistics/recipes/trending?limit=${limit}`
    );
  }

  // Low performance
  async getLowPerformanceRecipes(limit: number = 20): Promise<RecipePerformanceDTO[]> {
    return this.handleFetchRequest<RecipePerformanceDTO[]>(
      `${BASE_URL}/api/admin/statistics/recipes/low-performance?limit=${limit}`
    );
  }

  // Content analysis
  async getContentAnalysis(): Promise<RecipeContentAnalysisDTO> {
    return this.handleFetchRequest<RecipeContentAnalysisDTO>(
      `${BASE_URL}/api/admin/statistics/recipes/content-analysis`
    );
  }

  // Time series
  async getTimeSeriesData(
    startDate?: string,
    endDate?: string
  ): Promise<TimeSeriesStatDTO[]> {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);

    return this.handleFetchRequest<TimeSeriesStatDTO[]>(
      `${BASE_URL}/api/admin/statistics/recipes/time-series?${params.toString()}`
    );
  }

  // Top authors
  async getTopAuthors(limit: number = 15): Promise<TopAuthorDTO[]> {
    return this.handleFetchRequest<TopAuthorDTO[]>(
      `${BASE_URL}/api/admin/statistics/recipes/top-authors?limit=${limit}`
    );
  }

  // High engagement
  async getHighEngagementRecipes(limit: number = 10): Promise<EngagementRateDTO[]> {
    return this.handleFetchRequest<EngagementRateDTO[]>(
      `${BASE_URL}/api/admin/statistics/recipes/high-engagement?limit=${limit}`
    );
  }

  // Category performance
  async getCategoryPerformance(): Promise<CategoryPerformanceDTO[]> {
    return this.handleFetchRequest<CategoryPerformanceDTO[]>(
      `${BASE_URL}/api/admin/statistics/recipes/category-performance`
    );
  }

  // Completion stats
  async getRecipeCompletionStats(): Promise<RecipeCompletionStatsDTO> {
    return this.handleFetchRequest<RecipeCompletionStatsDTO>(
      `${BASE_URL}/api/admin/statistics/recipes/completion-stats`
    );
  }

  // Export statistics
  async exportStatistics(startDate?: string, endDate?: string): Promise<Blob> {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);

    const token = await this.getAuthToken();
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000);

    const response = await fetch(
      `${BASE_URL}/api/admin/statistics/recipes/export?${params.toString()}`,
      {
        method: 'GET',
        headers: {
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        signal: controller.signal,
      }
    );

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.blob();
  }


  /**
   * Lấy danh sách báo cáo với phân trang và filter
   */
  async getReports(params?: {
    reportType?: string;
    status?: string;
    reporterId?: string;
    reportedId?: string;
    recipeId?: string;
    fromDate?: string;
    toDate?: string;
    page?: number;
    size?: number;
    sortBy?: string;
    sortDirection?: string;
  }): Promise<{
    content: any[];
    page: number;
    size: number;
    totalElements: number;
    totalPages: number;
  }> {
    const url = new URL(`${BASE_URL}/api/reports`);
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          url.searchParams.append(key, value.toString());
        }
      });
    }
    return this.handleFetchRequest(url.toString());
  }

  /**
   * Lấy chi tiết một báo cáo
   */
  async getReportById(reportId: string): Promise<any> {
    return this.handleFetchRequest<any>(`${BASE_URL}/api/reports/${reportId}`);
  }

  /**
   * Phê duyệt/từ chối báo cáo (review)
   */
  async reviewReport(
    reportId: string,
    status: string,
    adminNote?: string
  ): Promise<any> {
    return this.handleFetchRequest<any>(
      `${BASE_URL}/api/reports/${reportId}/review`,
      'PATCH',
      { status, adminNote }
    );
  }

  /**
   * Xóa báo cáo
   */
  async deleteReport(reportId: string): Promise<void> {
    return this.handleFetchRequest<void>(
      `${BASE_URL}/api/reports/${reportId}`,
      'DELETE'
    );
  }

  /**
   * Lấy thống kê báo cáo
   */
  async getReportStatistics(): Promise<{
    totalReports: number;
    pendingReports: number;
    reviewedReports: number;
    resolvedReports: number;
    rejectedReports: number;
    reportsByType: Record<string, number>;
    reportsByStatus: Record<string, number>;
  }> {
    return this.handleFetchRequest(`${BASE_URL}/api/reports/statistics`);
  }

  /**
   * Lấy số lượng báo cáo chờ xử lý
   */
  async getPendingCount(): Promise<{ pendingCount: number; totalCount: number }> {
    return this.handleFetchRequest(`${BASE_URL}/api/reports/pending/count`);
  }
}

export const adminApi = new AdminReportService();
export const adminReportService = adminApi; // Export thêm alias

export default adminApi;