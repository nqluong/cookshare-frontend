import { API_CONFIG } from '@/config/api.config';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

export const BASE_URL = API_CONFIG.BASE_URL;

export interface AdminUser {
  userId: string;
  username: string;
  email: string;
  fullName: string;
  bio?: string;
  avatarUrl: string | null;
  role: string;
  isActive: boolean;
  emailVerified: boolean;
  followerCount: number;
  followingCount: number;
  recipeCount: number;
  lastActive: string;
  createdAt: string;
}

export interface AdminUserListResponse {
  content: AdminUser[];
  pageable: {
    pageNumber: number;
    pageSize: number;
    sort: {
      sorted: boolean;
      unsorted: boolean;
      empty: boolean;
    };
  };
  totalElements: number;
  totalPages: number;
  last: boolean;
  first: boolean;
  numberOfElements: number;
  size: number;
  number: number;
  sort: {
    sorted: boolean;
    unsorted: boolean;
    empty: boolean;
  };
  empty: boolean;
}

export interface AdminUserDetailResponse {
  userId: string;
  username: string;
  email: string;
  fullName: string;
  avatarUrl: string | null;
  role: string;
  isActive: boolean;
  emailVerified: boolean;
  followerCount: number;
  followingCount: number;
  recipeCount: number;
  lastActive: string;
  createdAt: string;
  // Additional detail fields can be added here
}

export interface BanUserRequest {
  reason?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  code: number;
  message: string;
  data: T;
}

class AdminUserService {
  constructor() {
    console.log(`🔧 AdminUserService initialized for ${Platform.OS}`);
    console.log(`📡 API Base URL: ${BASE_URL}`);
  }

  private async getAuthToken(): Promise<string | null> {
    return await AsyncStorage.getItem('access_token');
  }

  // Lấy danh sách tất cả người dùng với phân trang và tìm kiếm
  async getAllUsers(
    search?: string,
    page: number = 0,
    size: number = 10,
    sortBy: string = 'createdAt',
    sortDir: string = 'desc'
  ): Promise<AdminUserListResponse> {
    try {
      console.log('Getting all users with pagination:', { search, page, size, sortBy, sortDir });
      const token = await this.getAuthToken();

      const params = new URLSearchParams({
        page: page.toString(),
        size: size.toString(),
        sortBy,
        sortDir,
      });

      if (search) {
        params.append('search', search);
      }

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000);

      const response = await fetch(`${BASE_URL}/api/admin/users?${params.toString()}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      console.log('Get all users response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Không thể lấy danh sách người dùng');
      }

      const result: ApiResponse<AdminUserListResponse> = await response.json();
      console.log('Get all users successful, count:', result.data.content.length);
      return result.data;
    } catch (error: any) {
      console.log('Get all users error:', error);
      if (error.name === 'AbortError') {
        throw new Error('Timeout - Không thể kết nối đến server');
      }
      throw error;
    }
  }

  // Lấy thông tin chi tiết người dùng
  async getUserDetail(userId: string): Promise<AdminUserDetailResponse> {
    try {
      console.log('Getting user detail:', userId);
      const token = await this.getAuthToken();

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000);

      const response = await fetch(`${BASE_URL}/api/admin/users/${userId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      console.log('Get user detail response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Không thể lấy thông tin người dùng');
      }

      const result: ApiResponse<AdminUserDetailResponse> = await response.json();
      console.log('Get user detail successful:', result.data.username);
      return result.data;
    } catch (error: any) {
      console.log('Get user detail error:', error);
      if (error.name === 'AbortError') {
        throw new Error('Timeout - Không thể kết nối đến server');
      }
      throw error;
    }
  }

  // Cấm người dùng
  async banUser(userId: string, reason?: string): Promise<void> {
    try {
      console.log('Banning user:', userId, 'Reason:', reason);
      const token = await this.getAuthToken();

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000);

      const response = await fetch(`${BASE_URL}/api/admin/users/${userId}/ban`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: JSON.stringify({ reason }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      console.log('Ban user response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Không thể cấm người dùng');
      }

      console.log('Ban user successful');
    } catch (error: any) {
      console.log('Ban user error:', error);
      if (error.name === 'AbortError') {
        throw new Error('Timeout - Không thể kết nối đến server');
      }
      throw error;
    }
  }

  // Gỡ cấm người dùng
  async unbanUser(userId: string): Promise<void> {
    try {
      console.log('Unbanning user:', userId);
      const token = await this.getAuthToken();

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000);

      const response = await fetch(`${BASE_URL}/api/admin/users/${userId}/unban`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      console.log('Unban user response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Không thể gỡ cấm người dùng');
      }

      console.log('Unban user successful');
    } catch (error: any) {
      console.log('Unban user error:', error);
      if (error.name === 'AbortError') {
        throw new Error('Timeout - Không thể kết nối đến server');
      }
      throw error;
    }
  }

  // Xóa người dùng
  async deleteUser(userId: string): Promise<void> {
    try {
      console.log('Deleting user:', userId);
      const token = await this.getAuthToken();

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000);

      const response = await fetch(`${BASE_URL}/api/admin/users/${userId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      console.log('Delete user response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Không thể xóa người dùng');
      }

      console.log('Delete user successful');
    } catch (error: any) {
      console.log('Delete user error:', error);
      if (error.name === 'AbortError') {
        throw new Error('Timeout - Không thể kết nối đến server');
      }
      throw error;
    }
  }

  async getUserById(userId: string): Promise<AdminUser> {
    try {
      console.log('Getting user by ID:', userId);
      const token = await this.getAuthToken();

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000);

      const response = await fetch(`${BASE_URL}/api/admin/users/${userId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      console.log('Get user by ID response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Không thể lấy thông tin người dùng');
      }

      const result: ApiResponse<AdminUser> = await response.json();
      console.log('Get user by ID successful:', result.data.username);
      return result.data;
    } catch (error: any) {
      console.log('Get user by ID error:', error);
      if (error.name === 'AbortError') {
        throw new Error('Timeout - Không thể kết nối đến server');
      }
      throw error;
    }
  }

  async updateUser(userId: string, data: Partial<AdminUser>): Promise<AdminUser> {
    try {
      console.log('Updating user:', userId, data);
      const token = await this.getAuthToken();

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000);

      const response = await fetch(`${BASE_URL}/api/admin/users/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: JSON.stringify(data),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      console.log('Update user response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Không thể cập nhật thông tin người dùng');
      }

      const result: ApiResponse<AdminUser> = await response.json();
      console.log('Update user successful');
      return result.data;
    } catch (error: any) {
      console.log('Update user error:', error);
      if (error.name === 'AbortError') {
        throw new Error('Timeout - Không thể kết nối đến server');
      }
      throw error;
    }
  }
}

export const adminUserService = new AdminUserService();
