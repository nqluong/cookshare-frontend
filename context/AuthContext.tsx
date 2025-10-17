import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { AuthContextType, User, LoginRequest, RegisterRequest } from '../types/auth';
import { authService } from '../services/authService';

// Import API base URL (hoặc define ở đây)
const API_BASE_URL = 'http://localhost:8080'; // Có thể cần cập nhật theo môi trường

interface AuthState {
  user: User | null;
  token: string | null;
  loading: boolean;
}

type AuthAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'LOGIN_SUCCESS'; payload: { user: User; token: string } }
  | { type: 'LOGOUT' }
  | { type: 'RESTORE_TOKEN'; payload: { user: User | null; token: string | null } };

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
    default:
      return state;
  }
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Khôi phục session từ cookies khi app khởi động
  useEffect(() => {
    const restoreSession = async () => {
      try {
        // Kiểm tra xem có session hợp lệ không (cookies sẽ được tự động gửi)
        const hasValidSession = await authService.hasValidSession();

        if (hasValidSession) {
          // Lấy user info từ AsyncStorage
          const userInfo = await authService.getUserInfo();

          if (userInfo) {
            dispatch({ type: 'RESTORE_TOKEN', payload: { user: userInfo, token: 'cookie-based' } });
          } else {
            // Nếu không có user info trong AsyncStorage, thử lấy từ server
            try {
              const response = await fetch(`${API_BASE_URL}/auth/account`, {
                credentials: 'include',
              });

              if (response.ok) {
                const userProfile = await response.json();
                await authService.saveUserInfo(userProfile);
                dispatch({ type: 'RESTORE_TOKEN', payload: { user: userProfile, token: 'cookie-based' } });
              } else {
                dispatch({ type: 'RESTORE_TOKEN', payload: { user: null, token: null } });
              }
            } catch (error) {
              dispatch({ type: 'RESTORE_TOKEN', payload: { user: null, token: null } });
            }
          }
        } else {
          dispatch({ type: 'RESTORE_TOKEN', payload: { user: null, token: null } });
        }
      } catch (error) {
        console.error('Error restoring session:', error);
        dispatch({ type: 'RESTORE_TOKEN', payload: { user: null, token: null } });
      }
    };

    restoreSession();
  }, []);

  const login = async (credentials: LoginRequest): Promise<boolean> => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });

      const token = await authService.login(credentials);

      // Giải mã token để lấy thông tin user
      const decodedToken = authService.decodeToken(token);
      const user: User = {
        username: credentials.username,
        email: decodedToken?.email || '',
        fullname: decodedToken?.fullname || credentials.username,
        role: decodedToken?.role || 'USER', // Lấy role từ token
      };

      // Lưu access token và user info (cookies được browser tự động quản lý)
      await authService.saveAccessToken(token);
      await authService.saveUserInfo(user);

      dispatch({ type: 'LOGIN_SUCCESS', payload: { user, token: 'cookie-based' } });
      return true;
    } catch (error) {
      console.error('Login failed:', error);
      dispatch({ type: 'SET_LOADING', payload: false });
      return false;
    }
  };

  const register = async (userData: RegisterRequest): Promise<boolean> => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });

      await authService.register(userData);

      // Tự động đăng nhập sau khi đăng ký thành công
      const loginSuccess = await login({
        username: userData.username,
        password: userData.password,
      });

      return loginSuccess;
    } catch (error) {
      console.error('Registration failed:', error);
      dispatch({ type: 'SET_LOADING', payload: false });
      return false;
    }
  };

  const logout = async () => {
    try {
      // Gọi logout service để invalidate cookies trên server và xóa user info local
      await authService.logout();
      dispatch({ type: 'LOGOUT' });
    } catch (error) {
      console.error('Logout error:', error);
      // Vẫn logout local dù API call thất bại
      dispatch({ type: 'LOGOUT' });
    }
  };

  const value: AuthContextType = {
    user: state.user,
    token: state.token,
    login,
    register,
    logout,
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