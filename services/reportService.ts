import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_CONFIG } from '../config/api.config';

const API_BASE_URL = API_CONFIG.BASE_URL;

export enum ReportType {
  SPAM = 'SPAM',
  INAPPROPRIATE = 'INAPPROPRIATE',
  COPYRIGHT = 'COPYRIGHT',
  HARASSMENT = 'HARASSMENT',
  FAKE = 'FAKE',
  MISLEADING = 'MISLEADING',
  OTHER = 'OTHER'
}

export enum ReportStatus {
  PENDING = 'PENDING',
  REVIEWED = 'REVIEWED',
  RESOLVED = 'RESOLVED',
  REJECTED = 'REJECTED'
}

export interface CreateReportRequest {
  reportType: ReportType;
  reportedId?: string;
  recipeId?: string;
  reason: string;
  description?: string;
}

export interface ReportResponse {
  reportId: string;
  reporter: any;
  reportedUser?: any;
  reportedRecipe?: any;
  reportType: ReportType;
  reason: string;
  description?: string;
  status: ReportStatus;
  adminNote?: string;
  reviewer?: any;
  reviewedAt?: string;
  createdAt: string;
}

class ReportService {
  /**
   * Tạo báo cáo mới
   */
  async createReport(request: CreateReportRequest): Promise<ReportResponse> {
    try {
      console.log('Đang gửi báo cáo:', request);
      console.log('URL:', `${API_BASE_URL}/api/reports`);
      
      // Lấy access token từ AsyncStorage
      const token = await AsyncStorage.getItem('authToken');
      if (!token) {
        throw new Error('Vui lòng đăng nhập để thực hiện báo cáo');
      }
      
      const response = await fetch(`${API_BASE_URL}/api/reports`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        credentials: 'include',
        body: JSON.stringify(request),
      });

      console.log('Response status:', response.status);
      console.log('Response headers:', response.headers);

      // Kiểm tra xem response có content hay không
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const text = await response.text();
        console.log('Response không phải JSON:', text);
        throw new Error(`Server trả về response không hợp lệ (${response.status}): ${text}`);
      }

      const data = await response.json();
      console.log('Response data:', data);
      
      // Xử lý cả success và succes (typo từ backend)
      const isSuccess = data.success === true || data.succes === true;
      
      // Kiểm tra success/succes trước, vì backend có thể trả 200 OK nhưng success=false
      if (!isSuccess) {
        // Tạo error object với thông tin chi tiết
        const error: any = new Error(data.message || 'Không thể tạo báo cáo');
        error.code = data.code;
        error.isAlreadyReported = data.code === 7002;
        console.log('Throwing error with code:', error.code, 'isAlreadyReported:', error.isAlreadyReported);
        throw error;
      }
      
      // Kiểm tra HTTP status code
      if (!response.ok) {
        throw new Error(data.message || `HTTP error! status: ${response.status}`);
      }
      
      return data.data || data.result;
    } catch (error: any) {
      console.log('Lỗi khi tạo báo cáo:', error);
      console.log('Error details:', {
        message: error.message,
        name: error.name,
        stack: error.stack
      });
      throw error;
    }
  }

  /**
   * Lấy danh sách lý do báo cáo và map với ReportType enum
   */
  getReportReasons(): Array<{ type: ReportType; label: string }> {
    return [
      { type: ReportType.SPAM, label: 'Spam hoặc quảng cáo' },
      { type: ReportType.INAPPROPRIATE, label: 'Nội dung không phù hợp' },
      { type: ReportType.COPYRIGHT, label: 'Vi phạm bản quyền' },
      { type: ReportType.HARASSMENT, label: 'Quấy rối hoặc bắt nạt' },
      { type: ReportType.FAKE, label: 'Giả mạo hoặc lừa đảo' },
      { type: ReportType.MISLEADING, label: 'Thông tin sai lệch' },
      { type: ReportType.OTHER, label: 'Lý do khác' },
    ];
  }
}

export const reportService = new ReportService();
