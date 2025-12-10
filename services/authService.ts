import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import { API_CONFIG } from '../config/api.config';
import { ChangePasswordRequest, LoginRequest, RegisterRequest } from '../types/auth';

export const API_BASE_URL = API_CONFIG.BASE_URL;

class AuthService {
  constructor() {
    console.log(`AuthService initialized for ${Platform.OS}`);
    console.log(`API Base URL: ${API_BASE_URL}`);
  }

  async login(credentials: LoginRequest): Promise<{ accessToken: string; user: any }> {
    try {
      console.log("Attempting login to:", `${API_BASE_URL}/auth/login`);

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000);

      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(credentials),
        credentials: 'include',
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      console.log("Login response status:", response.status);

      if (!response.ok) {
        const errorText = await response.text();
        let errorMessage = "Đăng nhập thất bại";

        try {
          const errorData = JSON.parse(errorText);
          // Lấy message trực tiếp từ backend (đã bao gồm thông tin số ngày còn lại)
          if (errorData.message) {
            errorMessage = errorData.message;
          } else if (errorData.code === 4002) {
            errorMessage = "Tài khoản này đã bị khóa";
          }
        } catch (e) {
          // Nếu không parse được JSON, dùng errorText hoặc message mặc định
          errorMessage = errorText || errorMessage;
        }

        throw new Error(errorMessage);
      }

      const responseData = await response.json();
      console.log('Login successful, user:', responseData.user?.username);
      console.log('🔍 Full user object from backend:', JSON.stringify(responseData.user, null, 2));
      console.log('🖼️ Avatar URL from backend:', responseData.user?.avatarUrl);

      const accessToken = responseData.accessToken || responseData.access_token;
      console.log("🔑 Access Token:", accessToken);
      await AsyncStorage.setItem("authToken", accessToken);

      // Trích xuất cookies từ response headers và lưu manually
      const setCookieHeader = response.headers.get('set-cookie');
      console.log('🍪 Set-Cookie header:', setCookieHeader ? 'Present' : 'Not present');
      if (setCookieHeader) {
        console.log("📝 Saving cookies manually for iOS:", setCookieHeader);
        await this.parseAndSaveCookies(setCookieHeader);
      } else {
        console.log('⚠️ No Set-Cookie header in login response!');
      }

      return {
        accessToken,
        user: responseData.user,
      };
    } catch (error: any) {
      // Log ngắn gọn, chỉ log message thay vì toàn bộ error object
      console.log("❌ Login error:", error.message || error);
      if (error.name === "AbortError") {
        throw new Error("Timeout - Không thể kết nối đến server");
      }
      throw error;
    }
  }

  async register(userData: RegisterRequest): Promise<string> {
    try {
      console.log("Attempting register to:", `${API_BASE_URL}/auth/register`);

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000);

      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userData),
        credentials: 'include',
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      console.log("Register response status:", response.status);

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || "Đăng ký thất bại");
      }

      const message = await response.text();
      console.log("Register successful");
      return message;
    } catch (error: any) {
      console.log("Register error:", error);
      if (error.name === "AbortError") {
        throw new Error("Timeout - Không thể kết nối đến server");
      }
      throw error;
    }
  }

  // Giải mã JWT token để lấy thông tin user
  decodeToken(token: string) {
    try {
      const payload = token.split(".")[1];
      const decodedPayload = JSON.parse(atob(payload));
      return decodedPayload;
    } catch (error) {
      console.log("Token decode error:", error);
      return null;
    }
  }

  // Parse và lưu refresh token từ Set-Cookie header vào AsyncStorage
  async parseAndSaveCookies(setCookieHeader: string): Promise<void> {
    try {
      console.log('🍪 Parsing cookies from header:', setCookieHeader);
      const refreshTokenMatch = setCookieHeader.match(/refresh_token=([^;]+)/);
      if (refreshTokenMatch) {
        const refreshToken = refreshTokenMatch[1];
        console.log('✅ Found refresh token, saving to storage');
        await AsyncStorage.setItem('refresh_token', refreshToken);
        console.log('✅ Refresh token saved successfully');
      } else {
        console.log('⚠️ No refresh_token found in Set-Cookie header');
      }
    } catch (error) {
      console.log('❌ Error saving refresh token:', error);
    }
  }

  // Lấy refresh token từ AsyncStorage
  async getRefreshToken(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem("refresh_token");
    } catch (error) {
      console.log("Error getting refresh token:", error);
      return null;
    }
  }

  async saveAccessToken(token: string): Promise<void> {
    try {
      await AsyncStorage.setItem('access_token', token);
      await AsyncStorage.setItem('authToken', token);
    } catch (error) {
      console.log("Error saving access token:", error);
    }
  }

  async getAccessToken(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem("access_token");
    } catch (error) {
      console.log("Error getting access token:", error);
      return null;
    }
  }

  async clearAccessToken(): Promise<void> {
    try {
      await AsyncStorage.removeItem('access_token');
      await AsyncStorage.removeItem('authToken');
    } catch (error) {
      console.log("Error clearing access token:", error);
    }
  }

  async saveUserInfo(user: any): Promise<void> {
    try {
      await AsyncStorage.setItem("user_data", JSON.stringify(user));
      console.log("User info saved to AsyncStorage");
    } catch (error) {
      console.log("Error saving user info:", error);
    }
  }

  async getUserInfo(): Promise<any | null> {
    try {
      const userData = await AsyncStorage.getItem("user_data");
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      console.log("Error getting user info:", error);
      return null;
    }
  }

  // Kiểm tra xem có session không
  async hasValidSession(): Promise<boolean> {
    try {
      console.log('🔍 Checking for valid session...');
      const refreshToken = await this.getRefreshToken();
      console.log('🍪 Refresh token:', refreshToken ? 'Found' : 'Not found');

      if (!refreshToken) {
        console.log('❌ No refresh token, session invalid');
        return false;
      }

      console.log('📡 Calling /auth/refresh endpoint...');
      const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
        method: "GET",
        headers: {
          'X-Refresh-Token': refreshToken,
        },
        credentials: "include",
      });

      console.log('📡 Refresh response status:', response.status);

      if (response.ok) {
        const data = await response.json();
        console.log('✅ Session refreshed successfully');
        console.log('👤 User from refresh:', data.user?.username);
        await this.saveAccessToken(data.accessToken);

        const setCookieHeader = response.headers.get('set-cookie');
        if (setCookieHeader) {
          await this.parseAndSaveCookies(setCookieHeader);
        }

        return true;
      } else {
        // Log error details
        const errorText = await response.text();
        console.log('❌ Refresh error response:', errorText);
      }

      console.log('❌ Refresh failed, session invalid');
      return false;
    } catch (error) {
      console.log('❌ Error checking session:', error);
      return false;
    }
  }

  // Xóa user info khi logout
  async clearUserInfo(): Promise<void> {
    try {
      await AsyncStorage.removeItem('user_data');
      await AsyncStorage.removeItem('refresh_token');
      await this.clearAccessToken();
      console.log('User info cleared');
    } catch (error) {
      console.log("Error clearing user info:", error);
    }
  }

  async logout(): Promise<void> {
    try {
      const accessToken = await this.getAccessToken();

      if (!accessToken) {
        await this.clearUserInfo();
        return;
      }

      await fetch(`${API_BASE_URL}/auth/logout`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        credentials: 'include',
      });

      await this.clearUserInfo();
      console.log("Logout successful");
    } catch (error) {
      console.log('Logout error:', error);
      await this.clearUserInfo();
    }
  }

  // Social login (Google, Facebook) - method chung
  async loginWithSocial(
    accessToken: string,
    refreshToken: string,
    user: any,
    provider: 'google' | 'facebook' = 'google'
  ): Promise<void> {
    try {
      console.log(`💾 Saving ${provider} login data...`);

      // Lưu tokens
      await AsyncStorage.setItem('access_token', accessToken);
      await AsyncStorage.setItem('refresh_token', refreshToken);
      await AsyncStorage.setItem('authToken', accessToken);
      // Lưu user info
      await this.saveUserInfo(user);

      console.log(`✅ ${provider} login data saved successfully`);
    } catch (error) {
      console.log(`❌ Error saving ${provider} login data:`, error);
      throw error;
    }
  }

  // Forgot Password APIs
  async verifyEmail(email: string): Promise<string> {
    try {
      const response = await fetch(`${API_BASE_URL}/forgotPassword/verifyMail/${email}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Gửi email thất bại');
      }

      return await response.text();
    } catch (error: any) {
      console.log('Verify email error:', error);
      throw error;
    }
  }

  async verifyOtp(email: string, otp: number): Promise<string> {
    try {
      const response = await fetch(`${API_BASE_URL}/forgotPassword/verifyOtp/${email}/${otp}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Xác thực OTP thất bại');
      }

      return await response.text();
    } catch (error: any) {
      console.log('Verify OTP error:', error);
      throw error;
    }
  }

  async resetPassword(email: string, newPassword: string, confirmPassword: string): Promise<string> {
    try {
      const response = await fetch(`${API_BASE_URL}/forgotPassword/resetPassword/${email}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ newPassword, confirmPassword }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Đặt lại mật khẩu thất bại');
      }

      return await response.text();
    } catch (error: any) {
      console.log('Reset password error:', error);
      throw error;
    }
  }

  async changePassword(data: ChangePasswordRequest): Promise<string> {
    try {
      const accessToken = await this.getAccessToken();
      if (!accessToken) {
        throw new Error("Không tìm thấy token xác thực");
      }

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000);

      const response = await fetch(`${API_BASE_URL}/auth/change-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(data),
        credentials: 'include',
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || "Đổi mật khẩu thất bại");
      }

      return await response.text();
    } catch (error: any) {
      console.log("Change password error:", error);
      if (error.name === "AbortError") {
        throw new Error("Timeout - Không thể kết nối đến server");
      }
      throw error;
    }
  }

  // Email Verification Methods
  async sendEmailVerificationOtp(): Promise<string> {
    try {
      const accessToken = await this.getAccessToken();
      if (!accessToken) {
        throw new Error("Không tìm thấy token xác thực");
      }

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000);

      const response = await fetch(`${API_BASE_URL}/api/email-verification/send-otp`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        credentials: 'include',
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || "Gửi mã OTP thất bại");
      }

      return await response.text();
    } catch (error: any) {
      console.log("Send email verification OTP error:", error);
      if (error.name === "AbortError") {
        throw new Error("Timeout - Không thể kết nối đến server");
      }
      throw error;
    }
  }

  async verifyEmailOtp(otp: string): Promise<string> {
    try {
      const accessToken = await this.getAccessToken();
      if (!accessToken) {
        throw new Error("Không tìm thấy token xác thực");
      }

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000);

      const response = await fetch(`${API_BASE_URL}/api/email-verification/verify-otp/${otp}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        credentials: 'include',
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || "Xác thực OTP thất bại");
      }

      return await response.text();
    } catch (error: any) {
      console.log("Verify email OTP error:", error);
      if (error.name === "AbortError") {
        throw new Error("Timeout - Không thể kết nối đến server");
      }
      throw error;
    }
  }
}

export const authService = new AuthService();
