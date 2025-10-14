export interface Recipe {
  recipeId: string;
  userId: string;
  title: string;
  description: string | null;
  username: string | null;
  avatarUrl: string | null;
  featuredImage: string;
  cookTime: number;
  viewCount: number;
  likeCount: number;
  saveCount: number;
}

export interface ApiResponse {
  code: number;
  result?: {
    content: Recipe[];
    page: number;
    size: number;
    totalElements: number;
    totalPages: number;
    first: boolean;
    last: boolean;
    empty: boolean;
  };
  message?: string;
}

export interface ErrorResponse {
  success: boolean;
  code: number;
  message: string;
  details?: string;
  path?: string;
  timestamp?: string;
  validationErrors?: Array<{
    field: string;
    message: string;
  }>;
}