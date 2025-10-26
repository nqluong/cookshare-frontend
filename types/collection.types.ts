export interface CollectionUserDto {
  collectionId: string;
  userId: string;
  name: string;
  description: string | null;
  isPublic: boolean;
  coverImage: string | null;
  recipeCount: number;
  viewCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCollectionRequest {
  name: string;
  description?: string;
  isPublic?: boolean;
  coverImage?: string;
}

export interface UpdateCollectionRequest {
  name?: string;
  description?: string;
  isPublic?: boolean;
  coverImage?: string;
}

export interface AddRecipeToCollectionRequest {
  recipeId: string;
}

export interface CollectionResponse {
  collectionId: string;
  name: string;
  description: string | null;
  isPublic: boolean;
  coverImage: string | null;
  recipeCount: number;
  viewCount: number;
  createdAt: string;
  updatedAt: string;
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

export interface ApiResponse<T> {
  success: boolean;
  code: number;
  message: string;
  data: T;
  timestamp: string;
}