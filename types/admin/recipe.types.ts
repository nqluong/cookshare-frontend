export type RecipeStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export interface AdminRecipe {
  recipeId: string;
  userId: string;
  title: string;
  slug: string;
  description: string | null;
  prepTime: number;
  cookTime: number;
  servings: number;
  difficulty: string;
  featuredImage: string | null;
  viewCount: number;
  saveCount: number;
  likeCount: number;
  averageRating: number;
  ratingCount: number;
  isPublished: boolean;
  isFeatured: boolean;
  status: RecipeStatus;
  metaKeywords: string | null;
  seasonalTags: string | null;
  createdAt: string;
  updatedAt: string;
  // User information
  username: string;
  userFullName: string;
  userEmail: string;
  // Legacy fields for backward compatibility
  authorName?: string;
  authorId?: string;
  imageUrl?: string | null;
  isApproved?: boolean;
  approvalStatus?: 'PENDING' | 'APPROVED' | 'REJECTED';
  category?: string;
}

export interface AdminRecipeListResponse {
  content: AdminRecipe[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
  empty: boolean;
  numberOfElements: number;
  sorted: boolean;
}

export interface Step {
  stepNumber: number;
  instruction: string;
  imageUrl: string | null;
  videoUrl: string | null;
  estimatedTime: number;
  tips: string | null;
}

export interface Ingredient {
  ingredientId: string;
  name: string;
  quantity: string;
  unit: string;
  notes: string | null;
}

export interface Tag {
  tagId: string;
  name: string;
}

export interface Category {
  categoryId: string;
  name: string;
}

export interface AdminRecipeDetailResponse {
  recipeId: string;
  title: string;
  description: string;
  status: RecipeStatus;
  isPublished: boolean;
  isFeatured: boolean;
  
  // Thông tin chi tiết
  steps: Step[];
  ingredients: Ingredient[];
  tags: Tag[];
  categories: Category[];
  
  // Thông tin người dùng
  username: string;
  userFullName: string;
  userEmail: string;
  userAvatarUrl: string | null;
  
  // Thông tin cơ bản (legacy)
  prepTime?: number;
  cookTime?: number;
  servings?: number;
  difficulty?: string;
  likeCount?: number;
  viewCount?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface AdminRecipeUpdateRequest {
  title?: string;
  description?: string;
  prepTime?: number;
  cookTime?: number;
  servings?: number;
  difficulty?: string;
  category?: string;
  ingredients?: string[];
  instructions?: string[];
  tags?: string[];
}

export interface AdminRecipeApprovalRequest {
  approved: boolean;
  reason?: string;
}