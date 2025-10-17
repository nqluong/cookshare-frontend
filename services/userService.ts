import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import { UserProfile } from '../types/user.types';

const getAPIBaseURL = () => {
  if (__DEV__) {
    if (Platform.OS === 'web') return 'http://localhost:8080';
    if (Platform.OS === 'android') return 'http://192.168.0.102:8080';
    return 'http://192.168.0.102:8080';
  }
  return 'https://your-production-domain.com';
};

const API_BASE_URL = getAPIBaseURL();

class UserService {
  constructor() {
    console.log(`🔧 UserService initialized for ${Platform.OS}`);
    console.log(`📡 API Base URL: ${API_BASE_URL}`);
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

      const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
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

      const response = await fetch(`${API_BASE_URL}/users/username/${username}`, {
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

      const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
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

  // Get all users (for search/discovery)
  async getAllUsers(): Promise<UserProfile[]> {
    try {
      console.log('Getting all users');
      const token = await this.getAuthToken();

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000);

      const response = await fetch(`${API_BASE_URL}/users`, {
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
}

export const userService = new UserService();