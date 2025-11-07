export interface RecipeOverviewDTO {
  totalRecipes: number;
  newRecipesToday: number;
  newRecipesThisWeek: number;
  newRecipesThisMonth: number;
  growthRateDaily: number;
  growthRateWeekly: number;
  growthRateMonthly: number;
  recipesByCategory: { [key: string]: number };
  recipesByDifficulty: { [key: string]: number };
}

export interface RecipePerformanceDTO {
  recipeId: string;
  title: string;
  slug: string;
  viewCount: number;
  likeCount: number;
  saveCount: number;
  commentCount: number;
  averageRating: string;
  ratingCount: number;
  authorName: string;
  createdAt: string;
  trendingScore?: number;
}

export interface TrendingRecipeDTO {
  recipeId: string;
  title: string;
  slug: string;
  viewCount: number;
  likeCount: number;
  trendingScore: number;
  growthRate: number;
  createdAt: string;
}

export interface TimeSeriesStatDTO {
  period: string;
  recipeCount: number;
  viewCount: number;
  likeCount: number;
  commentCount: number;
  timestamp: string;
}

export interface RecipeContentAnalysisDTO {
  avgCookTime: number;
  avgPrepTime: number;
  avgTotalTime: number;
  avgIngredientCount: number;
  avgStepCount: number;
  recipesWithImage: number;
  recipesWithVideo: number;
  imagePercentage: number;
  videoPercentage: number;
  avgDescriptionLength: number;
  avgInstructionLength: number;
}

export interface TopAuthorDTO {
  userId: string;
  authorName: string;
  username: string;
  recipeCount: number;
  totalViews: number;
  totalLikes: number;
  avgRating: number;
}

export interface EngagementRateDTO {
  recipeId: string;
  title: string;
  viewCount: number;
  engagementCount: number;
  engagementRate: number;
}

export interface CategoryPerformanceDTO {
  categoryName: string;
  recipeCount: number;
  totalViews: number;
  totalLikes: number;
  avgRating: number;
  avgEngagementRate: number;
}

export interface RecipeCompletionStatsDTO {
  totalRecipes: number;
  withDescription: number;
  withImage: number;
  withVideo: number;
  withIngredients: number;
  withSteps: number;
  completeRecipes: number;
  completionRate: number;
}

export interface RecipeStatisticsResponse {
  overview: RecipeOverviewDTO;
  topViewedRecipes: RecipePerformanceDTO[];
  topLikedRecipes: RecipePerformanceDTO[];
  topSavedRecipes: RecipePerformanceDTO[];
  trendingRecipes: TrendingRecipeDTO[];
  lowPerformanceRecipes: RecipePerformanceDTO[];
  contentAnalysis: RecipeContentAnalysisDTO;
  timeSeriesData: TimeSeriesStatDTO[];
}