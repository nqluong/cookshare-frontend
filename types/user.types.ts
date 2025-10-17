export interface UserProfile {
  userId: string;
  username: string;
  email: string;
  fullName: string;
  avatarUrl?: string;
  bio?: string | null;
  role: string;
  isActive: boolean;
  emailVerified: boolean;
  lastActive?: string;
  followerCount?: number;
  followingCount?: number;
  recipeCount?: number;
  createdAt?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  code: number;
  message: string;
  data: T;
  timestamp: string;
}