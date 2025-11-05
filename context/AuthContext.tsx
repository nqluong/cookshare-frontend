
import { API_CONFIG } from '../config/api.config';
// contexts/AuthContext.tsx - FIXED VERSION
import { userService } from '@/services/userService';
import websocketService from '@/services/websocketService';
import { UserProfile } from '@/types/user.types';
import React, { createContext, useContext, useEffect, useReducer, useState } from 'react';
import { Alert } from 'react-native';
import { authService } from '../services/authService';
import { AuthContextType, LoginRequest, RegisterRequest, User } from '../types/auth';

const API_BASE_URL = 'http://192.168.0.101:8080';

interface AuthState {
  user: User | null;
  token: string | null;
  loading: boolean;
}

type AuthAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'LOGIN_SUCCESS'; payload: { user: User; token: string } }
  | { type: 'LOGOUT' }
  | { type: 'RESTORE_TOKEN'; payload: { user: User | null; token: string | null } }
  | { type: 'UPDATE_USER'; payload: Partial<User> };

const initialState: AuthState = {
  user: null,
  token: null,
  loading: true,
};

function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'LOGIN_SUCCESS':
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        loading: false,
      };
    case 'LOGOUT':
      return {
        ...state,
        user: null,
        token: null,
        loading: false,
      };
    case 'RESTORE_TOKEN':
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        loading: false,
      };
    case 'UPDATE_USER':
      if (!state.user) return state;
      return {
        ...state,
        user: { ...state.user, ...action.payload },
      };
    default:
      return state;
  }
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(authReducer, initialState);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [wsConnected, setWsConnected] = useState(false);

  // Khôi phục session từ AsyncStorage khi app khởi động
  useEffect(() => {
    const restoreSession = async () => {
      try {
        console.log('🔄 App starting - attempting to restore session...');
        const hasValidSession = await authService.hasValidSession();
        console.log('✅ Has valid session:', hasValidSession);

        if (hasValidSession) {
          const userInfo = await authService.getUserInfo();
          console.log('👤 User info from storage:', userInfo ? userInfo.username : 'null');

          if (userInfo) {
            console.log('✅ Restoring session with stored user info');
            dispatch({ type: 'RESTORE_TOKEN', payload: { user: userInfo, token: 'cookie-based' } });
          } else {
            // Nếu không có user info trong AsyncStorage, thử lấy từ server
            console.log('📡 No stored user info, fetching from /auth/account...');
            try {
              const response = await fetch(`${API_CONFIG.BASE_URL}/auth/account`, {
                credentials: 'include',
              });

              console.log('📡 /auth/account response:', response.status);

              if (response.ok) {
                const userProfile = await response.json();
                console.log('✅ Got user from server:', userProfile.username);
                await authService.saveUserInfo(userProfile);

                const token = await authService.getAccessToken();
                dispatch({
                  type: 'RESTORE_TOKEN',
                  payload: { user: userProfile, token }
                });
              } else {
                console.log('❌ Failed to get user from server');
                dispatch({ type: 'RESTORE_TOKEN', payload: { user: null, token: null } });
              }
            } catch (error) {
              console.error('❌ Error fetching user from server:', error);
              dispatch({ type: 'RESTORE_TOKEN', payload: { user: null, token: null } });
            }
          }
        } else {
          console.log('❌ No valid session found');
          dispatch({ type: 'RESTORE_TOKEN', payload: { user: null, token: null } });
        }
      } catch (error) {
        console.error('❌ Error restoring session:', error);
        dispatch({ type: 'RESTORE_TOKEN', payload: { user: null, token: null } });
      }
    };

    restoreSession();
  }, []);

  // ✅ BƯỚC 2: Load profile khi có user
  useEffect(() => {
    const loadProfile = async () => {
      if (!state.user?.username) {
        setUserProfile(null);
        return;
      }

      try {
        console.log("📥 Loading profile for username:", state.user.username);
        const profile = await userService.getUserByUsername(state.user.username);
        setUserProfile(profile);
        console.log("✅ Profile loaded:", profile.username);
      } catch (error: any) {
        console.error("❌ Error loading profile:", error);
        Alert.alert("Lỗi", error.message || "Không thể tải thông tin cá nhân");
      }
    };

    loadProfile();
  }, [state.user?.userId]);

  // ✅ BƯỚC 3: Connect WebSocket KHI ĐÃ CÓ ĐỦ: user + token + profile
  useEffect(() => {
    // ✅ Chỉ connect khi có đủ 3 thứ
    if (!state.user?.userId || !state.token || !userProfile?.userId) {
      console.log("⏸️ Waiting for complete auth data...", {
        hasUser: !!state.user?.userId,
        hasToken: !!state.token,
        hasProfile: !!userProfile?.userId
      });
      return;
    }

    console.log("🔌 Attempting WebSocket connection...");

    // Connect
    websocketService.connect(userProfile.userId, state.token)
      .then(() => {
        console.log("✅ WebSocket connected successfully");
        setWsConnected(true);
      })
      .catch(err => {
        console.error("❌ WebSocket connection failed:", err);
        setWsConnected(false);
      });

    // Setup event listeners
    const handleTokenExpired = () => {
      console.warn("🔐 Token expired");
      Alert.alert("Phiên hết hạn", "Vui lòng đăng nhập lại");
      logout();
    };

    const handleConnectionChange = (connected: boolean) => {
      console.log("🔌 WebSocket status changed:", connected);
      setWsConnected(connected);
    };

    websocketService.on("TOKEN_EXPIRED", handleTokenExpired);
    websocketService.on("connectionStatusChange", handleConnectionChange);

    // Cleanup
    return () => {
      console.log("🧹 Cleaning up WebSocket listeners");
      websocketService.off("TOKEN_EXPIRED", handleTokenExpired);
      websocketService.off("connectionStatusChange", handleConnectionChange);

      // ❌ KHÔNG disconnect ở đây vì có thể component re-render
      // Chỉ disconnect khi logout
    };
  }, [state.user?.userId, state.token, userProfile?.userId]);

  const login = async (credentials: LoginRequest): Promise<boolean> => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });

      const response = await authService.login(credentials);

      // response now contains both token and user object
      const token = response.accessToken;
      const userData = response.user;

      // Use user data from backend response instead of decoding token
      const user: User = {
        userId: userData.userId,
        username: userData.username,
        email: userData.email,
        fullName: userData.fullName || userData.username,
        avatarUrl: userData.avatarUrl,
        bio: userData.bio,
        role: userData.role || 'USER',
        isActive: userData.isActive !== undefined ? userData.isActive : true,
        emailVerified: userData.emailVerified !== undefined ? userData.emailVerified : false,
        followerCount: userData.followerCount,
        followingCount: userData.followingCount,
        recipeCount: userData.recipeCount,
        totalLikes: userData.totalLikes,
        createdAt: userData.createdAt,
      };

      // Lưu access token và user info
      await authService.saveAccessToken(token);
      await authService.saveUserInfo(user);

      dispatch({ type: 'LOGIN_SUCCESS', payload: { user, token } });
      return true;
    } catch (error) {
      console.error('❌ Login failed:', error);
      dispatch({ type: 'SET_LOADING', payload: false });
      return false;
    }
  };

  // Hàm dùng khi backend redirect về app với accessToken/refreshToken/user (social login)
  const loginWithSocialTokens = async (
    accessToken: string,
    refreshToken?: string,
    user?: any
  ): Promise<boolean> => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });

      console.log('💾 Saving social login data...');

      // Lưu tokens và user info
      await authService.loginWithSocial(accessToken, refreshToken || '', user);

      // Lấy thông tin user từ API
      const response = await fetch(`${API_CONFIG.BASE_URL}/auth/account`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Không thể lấy thông tin người dùng');
      }

      const userProfile = await response.json();
      await authService.saveUserInfo(userProfile);

      // Cập nhật state với thông tin user từ API
      dispatch({
        type: 'LOGIN_SUCCESS',
        payload: {
          user: userProfile,
          token: accessToken,
        },
      });

      console.log('✅ Social login successful!');
      return true;
    } catch (error: any) {
      console.error('❌ Social login failed:', error);
      dispatch({ type: 'SET_LOADING', payload: false });
      return false;
    }
  };

  const register = async (userData: RegisterRequest): Promise<boolean> => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });

      await authService.register(userData);

      const loginSuccess = await login({
        username: userData.username,
        password: userData.password,
      });

      return loginSuccess;
    } catch (error) {
      console.error('❌ Registration failed:', error);
      dispatch({ type: 'SET_LOADING', payload: false });
      return false;
    }
  };

  const logout = async () => {
    try {
      console.log("🚪 Logging out...");

      // ✅ Disconnect WebSocket TRƯỚC
      websocketService.disconnect();
      setWsConnected(false);

      await authService.logout();

      // Clear profile
      setUserProfile(null);

      dispatch({ type: 'LOGOUT' });

      console.log("✅ Logout complete");
    } catch (error) {
      console.error('❌ Logout error:', error);

      // Force cleanup ngay cả khi có lỗi
      websocketService.disconnect();
      setWsConnected(false);
      setUserProfile(null);
      dispatch({ type: 'LOGOUT' });
    }
  };

  const updateAuthUser = (newUserData: Partial<User>) => {
    dispatch({ type: 'UPDATE_USER', payload: newUserData });
  };

  const value: AuthContextType = {
    user: state.user,
    token: state.token,
    login,
    loginWithSocialTokens, // Renamed from loginWithServerTokens
    register,
    logout,
    updateAuthUser,
    isAuthenticated: !!state.token,
    loading: state.loading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}