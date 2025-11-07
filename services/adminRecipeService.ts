import { API_CONFIG } from '@/config/api.config';
import AsyncStorage from '@react-native-async-storage/async-storage';

import {
  AdminRecipeDetailResponse,
  AdminRecipeListResponse,
  AdminRecipeUpdateRequest,
  RecipeStatus
} from '@/types/admin/recipe.types';
import { ApiResponse } from '@/types/api.types';

export const BASE_URL = API_CONFIG.BASE_URL;

class AdminRecipeService {
  private async getAuthToken(): Promise<string | null> {
    return await AsyncStorage.getItem('access_token');
  }

  async getRecipesByStatus(
    status: RecipeStatus,
    search?: string,
    page: number = 0,
    size: number = 10,
    sortBy: string = 'createdAt',
    sortDir: string = 'desc'
  ): Promise<AdminRecipeListResponse> {
    try {
      console.log(`Getting ${status} recipes with pagination:`, { search, page, size, sortBy, sortDir });
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

      const url = `${BASE_URL}/api/admin/recipes/${status.toLowerCase()}?${params.toString()}`;

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`Error fetching ${status} recipes:`, response.status, errorText);
        throw new Error(`Failed to fetch ${status} recipes: ${response.status}`);
      }

      const result: ApiResponse<AdminRecipeListResponse> = await response.json();
      
      // Kiểm tra và xử lý response
      if (!result || !result.data || !result.data.content) {
        console.warn(`Invalid response format for ${status} recipes:`, result);
        return {
          content: [],
          page: page,
          size: size,
          totalElements: 0,
          totalPages: 0,
          first: true,
          last: true,
          empty: true,
          numberOfElements: 0,
          sorted: false
        };
      }
      
      console.log(`Successfully fetched ${status} recipes:`, result.data.content.length, 'items');
      return result.data;
    } catch (error) {
      console.error(`Error in getRecipesByStatus(${status}):`, error);
      throw error;
    }
  }

  // Lấy danh sách tất cả công thức với phân trang và tìm kiếm
  async getAllRecipes(
    search?: string,
    isPublished?: boolean,
    isFeatured?: boolean,
    page: number = 0,
    size: number = 10,
    sortBy: string = 'createdAt',
    sortDir: string = 'desc'
  ): Promise<AdminRecipeListResponse> {
    try {
      console.log('Getting all recipes with pagination:', { search, isPublished, isFeatured, page, size, sortBy, sortDir });
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
      if (isPublished !== undefined) {
        params.append('isPublished', isPublished.toString());
      }
      if (isFeatured !== undefined) {
        params.append('isFeatured', isFeatured.toString());
      }

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000);

      const response = await fetch(`${BASE_URL}/api/admin/recipes?${params.toString()}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Không thể lấy danh sách công thức');
      }

      const result: ApiResponse<AdminRecipeListResponse> = await response.json();
      
      // Kiểm tra và xử lý response
      if (!result || !result.data || !result.data.content) {
        console.warn('Invalid response format for all recipes:', result);
        return {
          content: [],
          page: page,
          size: size,
          totalElements: 0,
          totalPages: 0,
          first: true,
          last: true,
          empty: true,
          numberOfElements: 0,
          sorted: false
        };
      }
      
      console.log('Get all recipes successful, count:', result.data.content.length);
      return result.data;
    } catch (error: any) {
      console.error('Get all recipes error:', error);
      if (error.name === 'AbortError') {
        throw new Error('Timeout - Không thể kết nối đến server');
      }
      throw error;
    }
  }

  // Lấy thông tin chi tiết công thức
  async getRecipeDetail(recipeId: string): Promise<AdminRecipeDetailResponse> {
    try {
      console.log('Getting recipe detail:', recipeId);
      const token = await this.getAuthToken();

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000);

      const response = await fetch(`${BASE_URL}/api/admin/recipes/${recipeId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      console.log('Get recipe detail response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Không thể lấy thông tin công thức');
      }

      const result: ApiResponse<AdminRecipeDetailResponse> = await response.json();
      console.log('Get recipe detail successful:', result.data.title);
      return result.data;
    } catch (error: any) {
      console.error('Get recipe detail error:', error);
      if (error.name === 'AbortError') {
        throw new Error('Timeout - Không thể kết nối đến server');
      }
      throw error;
    }
  }

  // Cập nhật thông tin công thức
  async updateRecipe(recipeId: string, updateData: AdminRecipeUpdateRequest): Promise<AdminRecipeDetailResponse> {
    try {
      console.log('Updating recipe:', recipeId);
      const token = await this.getAuthToken();

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000);

      const response = await fetch(`${BASE_URL}/api/admin/recipes/${recipeId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: JSON.stringify(updateData),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      console.log('Update recipe response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Không thể cập nhật công thức');
      }

      const result: ApiResponse<AdminRecipeDetailResponse> = await response.json();
      console.log('Update recipe successful');
      return result.data;
    } catch (error: any) {
      console.error('Update recipe error:', error);
      if (error.name === 'AbortError') {
        throw new Error('Timeout - Không thể kết nối đến server');
      }
      throw error;
    }
  }

  // Phê duyệt hoặc từ chối công thức
  async approveRecipe(recipeId: string, approved: boolean, reason?: string): Promise<void> {
    try {
      console.log('Approving recipe:', recipeId, 'Approved:', approved);
      const token = await this.getAuthToken();

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000);

      const response = await fetch(`${BASE_URL}/api/admin/recipes/${recipeId}/approve`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: JSON.stringify({ approved, reason }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      console.log('Approve recipe response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Không thể phê duyệt công thức');
      }

      console.log('Approve recipe successful');
    } catch (error: any) {
      console.error('Approve recipe error:', error);
      if (error.name === 'AbortError') {
        throw new Error('Timeout - Không thể kết nối đến server');
      }
      throw error;
    }
  }

  // Xóa công thức
  async deleteRecipe(recipeId: string): Promise<void> {
    try {
      console.log('Deleting recipe:', recipeId);
      const token = await this.getAuthToken();

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000);

      const response = await fetch(`${BASE_URL}/api/admin/recipes/${recipeId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      console.log('Delete recipe response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Không thể xóa công thức');
      }

      console.log('Delete recipe successful');
    } catch (error: any) {
      console.error('Delete recipe error:', error);
      if (error.name === 'AbortError') {
        throw new Error('Timeout - Không thể kết nối đến server');
      }
      throw error;
    }
  }

  // Lấy danh sách công thức chờ phê duyệt
  async getPendingRecipes(
    search?: string,
    page: number = 0,
    size: number = 10,
    sortBy: string = 'createdAt',
    sortDir: string = 'desc'
  ): Promise<AdminRecipeListResponse> {
    try {
      console.log('Getting pending recipes:', { search, page, size, sortBy, sortDir });
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

      const response = await fetch(`${BASE_URL}/api/admin/recipes/pending?${params.toString()}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      console.log('Get pending recipes response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Không thể lấy danh sách công thức chờ phê duyệt');
      }

      const result: ApiResponse<AdminRecipeListResponse> = await response.json();
      
      // Kiểm tra và xử lý response
      if (!result || !result.data || !result.data.content) {
        console.warn('Invalid response format for pending recipes:', result);
        return {
          content: [],
          page: page,
          size: size,
          totalElements: 0,
          totalPages: 0,
          first: true,
          last: true,
          empty: true,
          numberOfElements: 0,
          sorted: false
        };
      }
      
      console.log('Get pending recipes successful, count:', result.data.content.length);
      return result.data;
    } catch (error: any) {
      console.error('Get pending recipes error:', error);
      if (error.name === 'AbortError') {
        throw new Error('Timeout - Không thể kết nối đến server');
      }
      throw error;
    }
  }

  // Lấy danh sách công thức đã được phê duyệt
  async getApprovedRecipes(
    search?: string,
    page: number = 0,
    size: number = 10,
    sortBy: string = 'createdAt',
    sortDir: string = 'desc'
  ): Promise<AdminRecipeListResponse> {
    try {
      console.log('Getting approved recipes:', { search, page, size, sortBy, sortDir });
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

      const response = await fetch(`${BASE_URL}/api/admin/recipes/approved?${params.toString()}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      console.log('Get approved recipes response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Không thể lấy danh sách công thức đã phê duyệt');
      }

      const result: ApiResponse<AdminRecipeListResponse> = await response.json();
      
      // Kiểm tra và xử lý response
      if (!result || !result.data || !result.data.content) {
        console.warn('Invalid response format for approved recipes:', result);
        return {
          content: [],
          page: page,
          size: size,
          totalElements: 0,
          totalPages: 0,
          first: true,
          last: true,
          empty: true,
          numberOfElements: 0,
          sorted: false
        };
      }
      
      console.log('Get approved recipes successful, count:', result.data.content.length);
      return result.data;
    } catch (error: any) {
      console.error('Get approved recipes error:', error);
      if (error.name === 'AbortError') {
        throw new Error('Timeout - Không thể kết nối đến server');
      }
      throw error;
    }
  }

  // Lấy danh sách công thức bị từ chối
  async getRejectedRecipes(
    search?: string,
    page: number = 0,
    size: number = 10,
    sortBy: string = 'createdAt',
    sortDir: string = 'desc'
  ): Promise<AdminRecipeListResponse> {
    try {
      console.log('Getting rejected recipes:', { search, page, size, sortBy, sortDir });
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

      const response = await fetch(`${BASE_URL}/api/admin/recipes/rejected?${params.toString()}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      console.log('Get rejected recipes response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Không thể lấy danh sách công thức bị từ chối');
      }

      const result: ApiResponse<AdminRecipeListResponse> = await response.json();
      
      // Kiểm tra và xử lý response
      if (!result || !result.data || !result.data.content) {
        console.warn('Invalid response format for rejected recipes:', result);
        return {
          content: [],
          page: page,
          size: size,
          totalElements: 0,
          totalPages: 0,
          first: true,
          last: true,
          empty: true,
          numberOfElements: 0,
          sorted: false
        };
      }
      
      console.log('Get rejected recipes successful, count:', result.data.content.length);
      return result.data;
    } catch (error: any) {
      console.error('Get rejected recipes error:', error);
      if (error.name === 'AbortError') {
        throw new Error('Timeout - Không thể kết nối đến server');
      }
      throw error;
    }
  }

  // Đặt công thức làm nổi bật hoặc bỏ nổi bật
  async setFeaturedRecipe(recipeId: string, isFeatured: boolean): Promise<void> {
    try {
      console.log('Setting featured recipe:', recipeId, 'Featured:', isFeatured);
      const token = await this.getAuthToken();

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000);

      const response = await fetch(`${BASE_URL}/api/admin/recipes/${recipeId}/featured?isFeatured=${isFeatured}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      console.log('Set featured recipe response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Không thể đặt nổi bật công thức');
      }

      console.log('Set featured recipe successful');
    } catch (error: any) {
      console.error('Set featured recipe error:', error);
      if (error.name === 'AbortError') {
        throw new Error('Timeout - Không thể kết nối đến server');
      }
      throw error;
    }
  }

  // Xuất bản hoặc ẩn công thức
  async setPublishedRecipe(recipeId: string, isPublished: boolean): Promise<void> {
    try {
      console.log('Setting published recipe:', recipeId, 'Published:', isPublished);
      const token = await this.getAuthToken();

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000);

      const response = await fetch(`${BASE_URL}/api/admin/recipes/${recipeId}/published?isPublished=${isPublished}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      console.log('Set published recipe response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Không thể xuất bản công thức');
      }

      console.log('Set published recipe successful');
    } catch (error: any) {
      console.error('Set published recipe error:', error);
      if (error.name === 'AbortError') {
        throw new Error('Timeout - Không thể kết nối đến server');
      }
      throw error;
    }
  }
}

export const adminRecipeService = new AdminRecipeService();
