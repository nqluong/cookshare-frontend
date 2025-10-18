import { API_CONFIG } from '@/config/api.config';
import { ApiResponse } from '@/types/user.types';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import { FollowResponse, FollowUser, PageResponse } from '../types/follow.types';

export const BASE_URL = API_CONFIG.BASE_URL;

class FollowService {
  constructor() {
    console.log(`🔧 FollowService initialized for ${Platform.OS}`);
    console.log(`📡 API Base URL: ${BASE_URL}`);
  }

  private async getAuthToken(): Promise<string | null> {
    return await AsyncStorage.getItem('access_token');
  }

  // Follow user
  async followUser(currentUserId: string, targetUserId: string): Promise<ApiResponse<FollowResponse>> {
    try {
      console.log('Following user:', targetUserId);
      const token = await this.getAuthToken();

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000);

      const response = await fetch(`${BASE_URL}/users/${currentUserId}/follow`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: JSON.stringify({ followingId: targetUserId }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      console.log('Follow response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Không thể follow người dùng');
      }

      const result = await response.json();
      console.log('Follow successful');
      return result;
    } catch (error: any) {
      console.error('Follow error:', error);
      if (error.name === 'AbortError') {
        throw new Error('Timeout - Không thể kết nối đến server');
      }
      throw error;
    }
  }

  // Unfollow user
  async unfollowUser(currentUserId: string, targetUserId: string): Promise<ApiResponse<void>> {
    try {
      console.log('Unfollowing user:', targetUserId);
      const token = await this.getAuthToken();

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000);

      const response = await fetch(`${BASE_URL}/users/${currentUserId}/follow/${targetUserId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      console.log('Unfollow response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Không thể unfollow người dùng');
      }

      const result = await response.json();
      console.log('Unfollow successful');
      return result;
    } catch (error: any) {
      console.error('Unfollow error:', error);
      if (error.name === 'AbortError') {
        throw new Error('Timeout - Không thể kết nối đến server');
      }
      throw error;
    }
  }

  // Get followers
  async getFollowers(userId: string, page: number = 0, size: number = 20): Promise<ApiResponse<PageResponse<FollowUser>>> {
    try {
      console.log('Getting followers for user:', userId);
      const token = await this.getAuthToken();

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000);

      const response = await fetch(
        `${BASE_URL}/users/${userId}/followers?page=${page}&size=${size}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            ...(token && { Authorization: `Bearer ${token}` }),
          },
          signal: controller.signal,
        }
      );

      clearTimeout(timeoutId);
      console.log('Get followers response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Không thể lấy danh sách followers');
      }

      const result = await response.json();
      console.log('Get followers successful, count:', result.data.totalElements);
      return result;
    } catch (error: any) {
      console.error('Get followers error:', error);
      if (error.name === 'AbortError') {
        throw new Error('Timeout - Không thể kết nối đến server');
      }
      throw error;
    }
  }

  // Get following
  async getFollowing(userId: string, page: number = 0, size: number = 20): Promise<ApiResponse<PageResponse<FollowUser>>> {
    try {
      console.log('Getting following for user:', userId);
      const token = await this.getAuthToken();

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000);

      const response = await fetch(
        `${BASE_URL}/users/${userId}/following?page=${page}&size=${size}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            ...(token && { Authorization: `Bearer ${token}` }),
          },
          signal: controller.signal,
        }
      );

      clearTimeout(timeoutId);
      console.log('Get following response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Không thể lấy danh sách following');
      }

      const result = await response.json();
      console.log('Get following successful, count:', result.data.totalElements);
      return result;
    } catch (error: any) {
      console.error('Get following error:', error);
      if (error.name === 'AbortError') {
        throw new Error('Timeout - Không thể kết nối đến server');
      }
      throw error;
    }
  }

  // Check follow status
  async checkFollowStatus(currentUserId: string, targetUserId: string): Promise<ApiResponse<boolean>> {
    try {
      console.log('Checking follow status:', currentUserId, '->', targetUserId);
      const token = await this.getAuthToken();

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000);

      const response = await fetch(
        `${BASE_URL}/users/${currentUserId}/follow/check/${targetUserId}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            ...(token && { Authorization: `Bearer ${token}` }),
          },
          signal: controller.signal,
        }
      );

      clearTimeout(timeoutId);
      console.log('Check follow status response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Không thể kiểm tra trạng thái follow');
      }

      const result = await response.json();
      console.log('Follow status:', result.data);
      return result;
    } catch (error: any) {
      console.error('Check follow status error:', error);
      if (error.name === 'AbortError') {
        throw new Error('Timeout - Không thể kết nối đến server');
      }
      throw error;
    }
  }
}

export const followService = new FollowService();