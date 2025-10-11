import { LoginRequest, RegisterRequest } from '../types/auth';
import { Platform } from 'react-native';

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
    return 'http://192.168.0.100:8080';
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

      const token = await response.text();
      console.log('Login successful, received token');
      return token;
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
    const possibleIPs = Platform.OS === 'android' ? [
      // Android Emulator URLs
      'http://10.0.2.2:8080',
      'http://localhost:8080',
      // Android Physical Device URLs  
      'http://192.168.0.100:8080',
      'http://192.168.1.100:8080',
      'http://10.0.0.100:8080',
      'http://172.20.10.2:8080'
    ] : [
      // iOS và other platforms
      'http://192.168.0.100:8080',
      'http://192.168.1.100:8080', 
      'http://10.0.0.100:8080',
      'http://172.20.10.2:8080',
      'http://localhost:8080'
    ];

    for (const testUrl of possibleIPs) {
      try {
        console.log('Testing connection to:', testUrl);
        
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 seconds per test

        // Thử gọi login với thông tin test để kiểm tra server
        const response = await fetch(`${testUrl}/login`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ username: 'test', password: 'test' }),
          signal: controller.signal,
        });

        clearTimeout(timeoutId);
        console.log(`${testUrl} response status:`, response.status);
        
        // Server phản hồi (dù là lỗi) nghĩa là kết nối thành công
        if (response.status === 400 || response.status === 401 || response.status === 200) {
          console.log('✅ Found working URL:', testUrl);
          return { success: true, workingUrl: testUrl };
        }
      } catch (error: any) {
        console.log(`❌ ${testUrl} failed:`, error.message);
      }
    }

    return { success: false };
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