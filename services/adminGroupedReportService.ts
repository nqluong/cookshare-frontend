// services/adminGroupedReportService.ts
import { API_CONFIG } from '@/config/api.config';
import { GroupedReportResponse } from '@/types/admin/groupedReport.types';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const BASE_URL = API_CONFIG.BASE_URL;

class AdminGroupedReportService {
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

  /**
   * Lấy danh sách báo cáo nhóm theo công thức
   * @param page Số trang (bắt đầu từ 0)
   * @param size Số lượng item mỗi trang
   * @param priority Lọc theo mức độ ưu tiên (optional)
   * @param reportType Lọc theo loại báo cáo (optional)
   */
  async getGroupedReports(
    page: number = 0,
    size: number = 20,
    priority?: string,
    reportType?: string
  ): Promise<GroupedReportResponse> {
    const params = new URLSearchParams();
    params.append('page', page.toString());
    params.append('size', size.toString());
    
    if (priority) {
      params.append('priority', priority);
    }
    if (reportType) {
      params.append('reportType', reportType);
    }

    return this.handleFetchRequest<GroupedReportResponse>(
      `${BASE_URL}/api/admin/reports/grouped?${params.toString()}`
    );
  }

  /**
   * Lấy chi tiết báo cáo của một công thức
   * @param recipeId ID của công thức
   */
  async getReportDetails(recipeId: string): Promise<any> {
    return this.handleFetchRequest<any>(
      `${BASE_URL}/api/admin/reports/recipe/${recipeId}`
    );
  }

  /**
   * Xử lý báo cáo (ẩn/xóa công thức, cảnh báo user, v.v.)
   * @param recipeId ID của công thức
   * @param action Hành động xử lý
   * @param reason Lý do xử lý
   */
  async handleReport(
    recipeId: string,
    action: 'DISMISS' | 'WARN_USER' | 'HIDE_RECIPE' | 'DELETE_RECIPE' | 'BAN_USER',
    reason?: string
  ): Promise<any> {
    return this.handleFetchRequest<any>(
      `${BASE_URL}/api/admin/reports/recipe/${recipeId}/action`,
      'POST',
      { action, reason }
    );
  }

  /**
   * Dismiss (bỏ qua) tất cả báo cáo của một công thức
   * @param recipeId ID của công thức
   * @param reason Lý do bỏ qua
   */
  async dismissReports(recipeId: string, reason?: string): Promise<any> {
    return this.handleFetchRequest<any>(
      `${BASE_URL}/api/admin/reports/recipe/${recipeId}/dismiss`,
      'POST',
      { reason }
    );
  }
}

export const adminGroupedReportService = new AdminGroupedReportService();
