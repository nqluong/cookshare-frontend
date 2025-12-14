export interface LoginRequest {
  username: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  fullname: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface VerifyOtpRequest {
  email: string;
  otp: number;
}

export interface ResetPasswordRequest {
  email: string;
  newPassword: string;
  confirmPassword: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface User {
  userId: string;
  username: string;
  email: string;
  fullName: string;
  avatarUrl?: string;
  bio?: string | null;
  role?: string;
  isActive: boolean;
  emailVerified: boolean;
  lastActive?: string;
  followerCount?: number;
  followingCount?: number;
  recipeCount?: number;
  totalLikes?: number;
  createdAt?: string;
}

export interface LoginResponse {
  accessToken: string;
  tokenType: string;
  expiresIn: number;
  user: User;
}

export interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (credentials: LoginRequest) => Promise<boolean>;
  // Method chung cho cả Google và Facebook (nhận token trực tiếp từ backend)
  loginWithSocialTokens: (accessToken: string, refreshToken?: string, user?: any) => Promise<boolean>;
  register: (userData: RegisterRequest) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
  loading: boolean;
  updateAuthUser: (newUserData: Partial<User>) => void;
  // Dev-only functions for testing
  __DEV_toggleOfflineMode?: () => void;
  __DEV_isForceOffline?: boolean;
}