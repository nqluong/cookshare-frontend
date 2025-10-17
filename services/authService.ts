import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import { API_CONFIG } from '../config/api.config';
import { LoginRequest, RegisterRequest } from '../types/auth';

export const API_BASE_URL = API_CONFIG.BASE_URL;

class AuthService {
  constructor() {
    console.log(`AuthService initialized for ${Platform.OS}`);
    console.log(` API Base URL: ${API_BASE_URL}`);
  }

  async login(credentials: LoginRequest): Promise<string> {
    try {
      console.log('Attempting login to:', `${API_BASE_URL}/login`);

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 seconds timeout

      const response = await fetch(`${API_BASE_URL}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      console.log('Login response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Đăng nhập thất bại');
      }

      const data = await response.json();
      const accessToken = data.accessToken; 
      await AsyncStorage.setItem('authToken', accessToken);
      console.log('Login successful, received token');
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
      console.log('Attempting register to:', `${API_BASE_URL}/register`);

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 seconds timeout

      const response = await fetch(`${API_BASE_URL}/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
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
      const response = await fetch(`${API_BASE_URL}/login`, {
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
}

export const authService = new AuthService();