// services/adminGroupedReportService.ts
import { API_CONFIG } from '@/config/api.config';
import {
  GroupedReportDetail,
  GroupedReportResponse,
  ProcessedReport,
  ProcessedReportResponse,
  ReportStatistics,
  ReviewReportRequest,
  ReviewReportResponse
} from '@/types/admin/groupedReport.types';
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
   * @param reportType Lọc theo loại báo cáo (optional)
   * @param status Lọc theo trạng thái (optional)
   * @param actionType Lọc theo loại hành động (optional)
   */
  async getGroupedReports(
    page: number = 0,
    size: number = 20,
    reportType?: string,
    status?: string,
    actionType?: string
  ): Promise<GroupedReportResponse> {
    const params = new URLSearchParams();
    params.append('page', page.toString());
    params.append('size', size.toString());
    
    if (reportType) {
      params.append('reportType', reportType);
    }
    if (status) {
      params.append('status', status);
    }
    if (actionType) {
      params.append('actionType', actionType);
    }

    return this.handleFetchRequest<GroupedReportResponse>(
      `${BASE_URL}/api/admin/reports/grouped?${params.toString()}`
    );
  }

  /**
   * Lấy chi tiết báo cáo của một công thức
   * @param recipeId ID của công thức
   */
  async getReportDetails(recipeId: string): Promise<GroupedReportDetail> {
    return this.handleFetchRequest<GroupedReportDetail>(
      `${BASE_URL}/api/admin/reports/grouped/recipe/${recipeId}`
    );
  }

  /**
   * Xem xét và xử lý báo cáo
   * @param recipeId ID của công thức
   * @param request Thông tin xem xét báo cáo
   */
  async reviewReport(
    recipeId: string,
    request: ReviewReportRequest
  ): Promise<ReviewReportResponse> {
    return this.handleFetchRequest<ReviewReportResponse>(
      `${BASE_URL}/api/admin/reports/grouped/recipe/${recipeId}/review`,
      'POST',
      request
    );
  }

  /**
   * Lấy thống kê báo cáo
   * @returns Thống kê tổng quan về báo cáo
   */
  async getReportStatistics(): Promise<ReportStatistics> {
    return this.handleFetchRequest<ReportStatistics>(
      `${BASE_URL}/api/admin/reports/statistics`
    );
  }

  /**
   * Lấy danh sách báo cáo đã xử lý (individual reports)
   * Dùng cho RESOLVED và REJECTED status
   * @param page Số trang (bắt đầu từ 0)
   * @param size Số lượng item mỗi trang
   * @param status Lọc theo trạng thái (RESOLVED hoặc REJECTED)
   */
  async getProcessedReports(
    page: number = 0,
    size: number = 20,
    status: 'RESOLVED' | 'REJECTED'
  ): Promise<ProcessedReportResponse> {
    const params = new URLSearchParams();
    params.append('page', page.toString());
    params.append('size', size.toString());
    params.append('status', status);

    return this.handleFetchRequest<ProcessedReportResponse>(
      `${BASE_URL}/api/admin/reports?${params.toString()}`
    );
  }

  /**
   * Lấy chi tiết một báo cáo cá nhân
   * @param reportId ID của báo cáo
   */
  async getIndividualReportDetail(reportId: string): Promise<ProcessedReport> {
    return this.handleFetchRequest<ProcessedReport>(
      `${BASE_URL}/api/admin/reports/${reportId}`
    );
  }
}

export const adminGroupedReportService = new AdminGroupedReportService();
