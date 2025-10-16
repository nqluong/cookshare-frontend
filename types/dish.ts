// Interface cho món ăn từ API
export interface Dish {
  id: number;
  name: string;
  image: string;
  likes: number;
  cookTime?: number;
}

// Interface cho Recipe từ API backend
export interface Recipe {
  recipeId: string;
  title: string;
  slug: string;
  description: string | null;
  featuredImage: string;
  prepTime: number;
  cookTime: number;
  servings: number;
  difficulty: 'EASY' | 'MEDIUM' | 'HARD';
  userId: string;
  userName: string;
  viewCount: number;
  saveCount: number;
  likeCount: number;
  averageRating: number;
  ratingCount: number;
  isFeatured: boolean;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
}