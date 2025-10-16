// Interface cho Post hiển thị
export interface Post {
  id: number;
  author: string;
  authorAvatar?: string;
  timeAgo: string;
  image: string;
  description: string;
  likes: number;
  comments: number;
  isLiked?: boolean;
}

// Interface cho API Response của danh sách công thức (phân trang)
export interface RecipeListResponse {
  success: boolean;
  code: number;
  message: string;
  data: {
    content: any[]; // Recipe[]
    currentPage: number;
    pageSize: number;
    totalElements: number;
    totalPages: number;
    hasNext: boolean;
    hasPrevious: boolean;
    first: boolean;
    last: boolean;
  };
  timestamp: string;
}

// Interface cho API Response của Home Suggestions
export interface HomeSuggestionsResponse {
  success: boolean;
  code: number;
  message: string;
  data: {
    featuredRecipes: any[]; // Recipe[] - Công thức nổi bật
    popularRecipes: any[]; // Recipe[] - Công thức phổ biến
    newestRecipes: any[]; // Recipe[] - Công thức mới nhất
    topRatedRecipes: any[]; // Recipe[] - Công thức đánh giá cao nhất
    trendingRecipes: any[]; // Recipe[] - Công thức đang thịnh hành
  };
  timestamp: string;
}