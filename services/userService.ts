import { API_CONFIG } from '@/config/api.config';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import { UserProfile } from '../types/user.types';

export const BASE_URL = API_CONFIG.BASE_URL;

class UserService {
  constructor() {
    console.log(`🔧 UserService initialized for ${Platform.OS}`);
    console.log(`📡 API Base URL: ${BASE_URL}`);
  }

  private async getAuthToken(): Promise<string | null> {
    return await AsyncStorage.getItem('access_token');
  }

  // Lấy thông tin user theo ID
  async getUserById(userId: string): Promise<UserProfile> {
    try {
      console.log('Getting user by ID:', userId);
      const token = await this.getAuthToken();

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000);

      const response = await fetch(`${BASE_URL}/users/${userId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      console.log('Get user response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Không thể lấy thông tin người dùng');
      }

      const user = await response.json();
      console.log('Get user successful:', user.username);
      return user;
    } catch (error: any) {
      console.error('Get user error:', error);
      if (error.name === 'AbortError') {
        throw new Error('Timeout - Không thể kết nối đến server');
      }
      throw error;
    }
  }

  // Lấy thông tin user theo username
  async getUserByUsername(username: string): Promise<UserProfile> {
    try {
      console.log('Getting user by username:', username);
      const token = await this.getAuthToken();

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000);

      const response = await fetch(`${BASE_URL}/users/username/${username}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      console.log('Get user by username response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Không thể lấy thông tin người dùng');
      }

      const user = await response.json();
      console.log('Get user by username successful:', user.username);
      return user;
    } catch (error: any) {
      console.error('Get user by username error:', error);
      if (error.name === 'AbortError') {
        throw new Error('Timeout - Không thể kết nối đến server');
      }
      throw error;
    }
  }

  // Update user profile
  async updateUser(userId: string, userData: Partial<UserProfile>): Promise<UserProfile> {
    try {
      console.log('Updating user:', userId);
      const token = await this.getAuthToken();

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000);

      const response = await fetch(`${BASE_URL}/users/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: JSON.stringify(userData),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      console.log('Update user response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Không thể cập nhật thông tin');
      }

      const updatedUser = await response.json();
      console.log('Update user successful');
      return updatedUser;
    } catch (error: any) {
      console.error('Update user error:', error);
      if (error.name === 'AbortError') {
        throw new Error('Timeout - Không thể kết nối đến server');
      }
      throw error;
    }
  }

  // Update user profile (using the new /profile endpoint)
  async updateUserProfile(userId: string, profileData: {
    username?: string;
    email?: string;
    fullName?: string;
    avatarUrl?: string;
    bio?: string;
  }): Promise<UserProfile> {
    try {
      console.log('Updating user profile:', userId);
      const token = await this.getAuthToken();

      if (!token) {
        throw new Error('Không tìm thấy token xác thực');
      }

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000);

      const response = await fetch(`${BASE_URL}/users/${userId}/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(profileData),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      console.log('Update user profile response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Không thể cập nhật thông tin');
      }

      const updatedUser = await response.json();
      console.log('Update user profile successful');
      return updatedUser;
    } catch (error: any) {
      console.error('Update user profile error:', error);
      if (error.name === 'AbortError') {
        throw new Error('Timeout - Không thể kết nối đến server');
      }
      throw error;
    }
  }

  // Get all users (for search/discovery)
  async getAllUsers(): Promise<UserProfile[]> {
    try {
      console.log('Getting all users');
      const token = await this.getAuthToken();

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000);

      const response = await fetch(`${BASE_URL}/users`, {
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

      const users = await response.json();
      console.log('Get all users successful, count:', users.length);
      return users;
    } catch (error: any) {
      console.error('Get all users error:', error);
      if (error.name === 'AbortError') {
        throw new Error('Timeout - Không thể kết nối đến server');
      }
      throw error;
    }
  }

  // Check if username exists
  async checkUsernameExists(username: string): Promise<boolean> {
    try {
      console.log('Checking username exists:', username);
      const token = await this.getAuthToken();

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);

      const response = await fetch(`${BASE_URL}/users/exists/username/${encodeURIComponent(username)}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error('Không thể kiểm tra username');
      }

      const exists = await response.json();
      console.log('Username exists:', exists);
      return exists;
    } catch (error: any) {
      console.error('Check username exists error:', error);
      if (error.name === 'AbortError') {
        throw new Error('Timeout - Không thể kết nối đến server');
      }
      throw error;
    }
  }

  // Check if email exists
  async checkEmailExists(email: string): Promise<boolean> {
    try {
      console.log('Checking email exists:', email);
      const token = await this.getAuthToken();

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);

      const response = await fetch(`${BASE_URL}/users/exists/email/${encodeURIComponent(email)}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error('Không thể kiểm tra email');
      }

      const exists = await response.json();
      console.log('Email exists:', exists);
      return exists;
    } catch (error: any) {
      console.error('Check email exists error:', error);
      if (error.name === 'AbortError') {
        throw new Error('Timeout - Không thể kết nối đến server');
      }
      throw error;
    }
  }
}

export const userService = new UserService();