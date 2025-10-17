import { LoginRequest, RegisterRequest } from '../types/auth';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Cookies from 'expo-cookies';

// Dynamic API URL cho các platform khác nhau
const getAPIBaseURL = () => {
  if (__DEV__) {
    // Development mode
    if (Platform.OS === 'web') {
      return 'http://localhost:8080';
    }

    // Cho Android Emulator
    if (Platform.OS === 'android') {
      return 'http://10.0.2.2:8080';
    }

    // Cho iOS Simulator và Physical devices  
    return 'http://192.168.0.101:8080'; // IP chính của máy tính
  }

  // Production - thay bằng production URL
  return 'https://your-production-domain.com';
};

const API_BASE_URL = getAPIBaseURL();

class AuthService {
  constructor() {
    console.log(`🔧 AuthService initialized for ${Platform.OS}`);
    console.log(`📡 API Base URL: ${API_BASE_URL}`);
  }

  async login(credentials: LoginRequest): Promise<string> {
    try {
      console.log('Attempting login to:', `${API_BASE_URL}/auth/login`);

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 seconds timeout

      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
        credentials: 'include', // Quan trọng: để nhận cookies từ server
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      console.log('Login response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Đăng nhập thất bại');
      }

      // Lấy response data thay vì chỉ text
      const responseData = await response.json();
      console.log('Login successful, received data:', responseData);

      // Log access token
      const accessToken = responseData.accessToken || responseData.access_token;
      console.log('🔑 Access Token:', accessToken);

      // Trích xuất cookies từ response headers và lưu manually cho iOS
      const setCookieHeader = response.headers.get('set-cookie');
      if (setCookieHeader) {
        console.log('📝 Saving cookies manually for iOS:', setCookieHeader);
        await this.parseAndSaveCookies(setCookieHeader);
      }

      return accessToken;
    } catch (error: any) {
      console.error('Login error:', error);
      if (error.name === 'AbortError') {
        throw new Error('Timeout - Không thể kết nối đến server');
      }
      throw error;
    }
  }

  async register(userData: RegisterRequest): Promise<string> {
    try {
      console.log('Attempting register to:', `${API_BASE_URL}/auth/register`);

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 seconds timeout

      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
        credentials: 'include', // Để nhận cookies nếu cần
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      console.log('Register response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Đăng ký thất bại');
      }

      const message = await response.text();
      console.log('Register successful');
      return message;
    } catch (error: any) {
      console.error('Register error:', error);
      if (error.name === 'AbortError') {
        throw new Error('Timeout - Không thể kết nối đến server');
      }
      throw error;
    }
  }

  // Test kết nối đến server với nhiều IP khác nhau
  async testConnection(): Promise<{ success: boolean; workingUrl?: string }> {
    try {
      console.log('Testing connection to:', API_BASE_URL);

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 seconds timeout

      // Thử gọi login với thông tin test để kiểm tra server
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username: 'test', password: 'test' }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      console.log(`${API_BASE_URL} response status:`, response.status);

      // Server phản hồi (dù là lỗi) nghĩa là kết nối thành công
      if (response.status === 400 || response.status === 401 || response.status === 200) {
        console.log('✅ Connection successful to:', API_BASE_URL);
        return { success: true, workingUrl: API_BASE_URL };
      } else {
        console.log('❌ Unexpected response status:', response.status);
        return { success: false };
      }
    } catch (error: any) {
      console.log(`❌ ${API_BASE_URL} failed:`, error.message);
      return { success: false };
    }
  }

  // Giải mã JWT token để lấy thông tin user (optional)
  decodeToken(token: string) {
    try {
      const payload = token.split('.')[1];
      const decodedPayload = JSON.parse(atob(payload));
      return decodedPayload;
    } catch (error) {
      console.error('Token decode error:', error);
      return null;
    }
  }

  // Parse và lưu refresh token từ Set-Cookie header vào AsyncStorage
  async parseAndSaveCookies(setCookieHeader: string): Promise<void> {
    try {
      // Parse refresh_token từ Set-Cookie header
      const refreshTokenMatch = setCookieHeader.match(/refresh_token=([^;]+)/);
      if (refreshTokenMatch) {
        const refreshToken = refreshTokenMatch[1];
        console.log('🍪 Saving refresh_token to AsyncStorage:', refreshToken.substring(0, 20) + '...');

        await AsyncStorage.setItem('refresh_token', refreshToken);
      }
    } catch (error) {
      console.error('Error saving refresh token:', error);
    }
  }

  // Lấy refresh token từ AsyncStorage
  async getRefreshToken(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem('refresh_token');
    } catch (error) {
      console.error('Error getting refresh token:', error);
      return null;
    }
  }
  async saveAccessToken(token: string): Promise<void> {
    try {
      await AsyncStorage.setItem('access_token', token);
    } catch (error) {
      console.error('Error saving access token:', error);
    }
  }

  // Lấy access token từ AsyncStorage
  async getAccessToken(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem('access_token');
    } catch (error) {
      console.error('Error getting access token:', error);
      return null;
    }
  }

  // Xóa access token
  async clearAccessToken(): Promise<void> {
    try {
      await AsyncStorage.removeItem('access_token');
    } catch (error) {
      console.error('Error clearing access token:', error);
    }
  }
  // Lưu user info vào AsyncStorage (cookies sẽ được browser tự động quản lý)
  async saveUserInfo(user: any): Promise<void> {
    try {
      await AsyncStorage.setItem('user_data', JSON.stringify(user));
      console.log('User info saved to AsyncStorage');
    } catch (error) {
      console.error('Error saving user info:', error);
    }
  }

  // Lấy user info từ AsyncStorage
  async getUserInfo(): Promise<any | null> {
    try {
      const userData = await AsyncStorage.getItem('user_data');
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      console.error('Error getting user info:', error);
      return null;
    }
  }

  // Kiểm tra xem có session không (gọi API /auth/refresh với refresh token)
  async hasValidSession(): Promise<boolean> {
    try {
      console.log('🔍 Checking session with refresh token...');

      const refreshToken = await this.getRefreshToken();
      if (!refreshToken) {
        console.log('❌ No refresh token found');
        return false;
      }

      const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
        method: 'GET',
        headers: {
          'Cookie': `refresh_token=${refreshToken}`,
        },
        credentials: 'include',
      });

      console.log('📡 Refresh token check response status:', response.status);

      if (response.ok) {
        const data = await response.json();
        console.log('✅ Valid session found, refreshed tokens');
        console.log('🔑 New Access Token:', data.accessToken);

        // Lưu access token mới
        await this.saveAccessToken(data.accessToken);

        // Lưu refresh token mới nếu có
        const setCookieHeader = response.headers.get('set-cookie');
        if (setCookieHeader) {
          await this.parseAndSaveCookies(setCookieHeader);
        }

        return true;
      } else {
        const errorText = await response.text();
        console.log('❌ Invalid session. Status:', response.status, 'Error:', errorText);
        return false;
      }
    } catch (error) {
      console.error('💥 Error checking session:', error);
      return false;
    }
  }

  // Xóa user info khi logout
  async clearUserInfo(): Promise<void> {
    try {
      await AsyncStorage.removeItem('user_data');
      await AsyncStorage.removeItem('refresh_token'); // Xóa refresh token
      await this.clearAccessToken(); // Xóa access token
      console.log('User info, refresh token and access token cleared');
    } catch (error) {
      console.error('Error clearing user info:', error);
    }
  }

  // Gọi API logout để invalidate cookies trên server
  async logout(): Promise<void> {
    try {
      // Lấy access token để gửi trong header
      const accessToken = await this.getAccessToken();

      if (!accessToken) {
        console.warn('No access token found, still clearing local data');
        await this.clearUserInfo();
        return;
      }

      await fetch(`${API_BASE_URL}/auth/logout`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
        credentials: 'include', // Gửi cookies để server có thể invalidate
      });

      await this.clearUserInfo();
      console.log('Logout successful');
    } catch (error) {
      console.error('Logout error:', error);
      // Vẫn xóa user info local dù API call thất bại
      await this.clearUserInfo();
    }
  }
}

export const authService = new AuthService();