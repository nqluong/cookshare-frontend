import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useEffect, useReducer } from 'react';
import { authService } from '../services/authService';
import { AuthContextType, LoginRequest, RegisterRequest, User } from '../types/auth';

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
      if (!state.user) return state; // Không làm gì nếu user là null

      // Cập nhật user object với các trường mới được truyền vào (payload)
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

  // Khôi phục token khi app khởi động
  useEffect(() => {
    const restoreToken = async () => {
      try {
        const token = await AsyncStorage.getItem('access_token');
        const userData = await AsyncStorage.getItem('user_data');
        
        if (token && userData) {
          const user = JSON.parse(userData);
          dispatch({ type: 'RESTORE_TOKEN', payload: { user, token } });
        } else {
          dispatch({ type: 'RESTORE_TOKEN', payload: { user: null, token: null } });
        }
      } catch (error) {
        console.error('Error restoring token:', error);
        dispatch({ type: 'RESTORE_TOKEN', payload: { user: null, token: null } });
      }
    };

    restoreToken();
  }, []);

  const login = async (credentials: LoginRequest): Promise<boolean> => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      
      // Gọi API login → backend trả về { accessToken, tokenType, expiresIn, user }
      const rawResponse = await authService.login(credentials);
      const response = typeof rawResponse === 'string' ? JSON.parse(rawResponse) : rawResponse;
      const { accessToken, user } = response;

      // Lưu token và user data vào AsyncStorage
      await AsyncStorage.setItem('access_token', accessToken);
      await AsyncStorage.setItem('user_data', JSON.stringify(user));

      // Cập nhật state
      dispatch({ type: 'LOGIN_SUCCESS', payload: { user, token: accessToken } });
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
      await AsyncStorage.multiRemove(['access_token', 'user_data']);
      dispatch({ type: 'LOGOUT' });
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const updateAuthUser = async (newUserData: Partial<User>) => {
    if (!state.user) return;

    // 1. Cập nhật state cục bộ (UI)
    dispatch({ type: 'UPDATE_USER', payload: newUserData });

    // 2. Cập nhật trong AsyncStorage để duy trì trạng thái sau khi app khởi động lại
    try {
        const updatedUser = { ...state.user, ...newUserData };
        await AsyncStorage.setItem('user_data', JSON.stringify(updatedUser));
    } catch (error) {
        console.error('Error updating user data in AsyncStorage:', error);
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
    updateAuthUser,
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