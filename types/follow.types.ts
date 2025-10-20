export interface FollowUser {
  userId: string;
  username: string;
  fullName: string;
  avatarUrl: string | null;
  bio: string | null;
  followerCount?: number;
  followingCount? : number;
  isFollowing: boolean | null;
}

export interface FollowResponse {
  followerId: string;
  followingId: string;
  followerUsername: string;
  followingUsername: string;
  createdAt: string;
  message: string;
}

export interface PageResponse<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
  empty: boolean;
}