import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { AuthContextType, User, LoginRequest, RegisterRequest } from '../types/auth';
import { authService } from '../services/authService';
import { API_CONFIG } from '../config/api.config';

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

  // Khôi phục session từ AsyncStorage khi app khởi động
  useEffect(() => {
    const restoreSession = async () => {
      try {
        const hasValidSession = await authService.hasValidSession();

        if (hasValidSession) {
          const userInfo = await authService.getUserInfo();

          if (userInfo) {
            dispatch({ type: 'RESTORE_TOKEN', payload: { user: userInfo, token: 'cookie-based' } });
          } else {
            // Nếu không có user info trong AsyncStorage, thử lấy từ server
            try {
              const response = await fetch(`${API_CONFIG.BASE_URL}/auth/account`, {
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
        userId: decodedToken?.sub || '',
        username: credentials.username,
        email: decodedToken?.email || '',
        fullName: decodedToken?.fullname || credentials.username,
        role: decodedToken?.role || 'USER',
        isActive: true,
        emailVerified: false,
      };

      // Lưu access token và user info
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

      // Cập nhật state
      dispatch({
        type: 'LOGIN_SUCCESS',
        payload: {
          user: {
            userId: user?.userId || user?.id || '',
            username: user?.username || user?.name || '',
            email: user?.email || '',
            fullName: user?.fullName || user?.name || '',
            avatarUrl: user?.avatarUrl,
            role: user?.role || 'USER',
            isActive: user?.isActive !== undefined ? user.isActive : true,
            emailVerified: user?.emailVerified !== undefined ? user.emailVerified : true,
          },
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
      await authService.logout();
      dispatch({ type: 'LOGOUT' });
    } catch (error) {
      console.error('Logout error:', error);
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