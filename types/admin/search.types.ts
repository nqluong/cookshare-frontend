export interface SearchOverview {
  totalSearches: number;
  uniqueSearchQueries: number;
  successfulSearches: number;
  failedSearches: number;
  successRate: number;
  averageResultsPerSearch: number;
  totalUsers: number;
  averageSearchesPerUser: number;
  periodStart: string;
  periodEnd: string;
}

export interface KeywordStats {
  keyword: string;
  searchCount: number;
  uniqueUsers: number;
  averageResults: number;
  successRate: number;
  lastSearched: string;
  trend: string;
}

export interface PopularKeywords {
  keywords: KeywordStats[];
  totalUniqueKeywords: number;
  periodStart: string;
  periodEnd: string;
}

export interface IngredientSearchStats {
  ingredientId: string;
  ingredientName: string;
  searchCount: number;
  directSearches: number;
  recipeSearches: number;
  recipeCount: number;
  searchToRecipeRatio: number;
}

export interface PopularIngredients {
  ingredients: IngredientSearchStats[];
  totalCount: number;
  periodStart: string;
  periodEnd: string;
}

export interface CategoryViewStats {
  categoryId: string;
  categoryName: string;
  viewCount: number;
  uniqueUsers: number;
  recipeCount: number;
  averageTimeSpent: number;
  clickThroughRate: number;
  viewShare: number;
}

export interface PopularCategories {
  categories: CategoryViewStats[];
  totalCategoryViews: number;
  periodStart: string;
  periodEnd: string;
}

export interface SuccessRateByType {
  searchType: string;
  totalSearches: number;
  successfulSearches: number;
  successRate: number;
}

export interface SuccessRateTrend {
  date: string;
  totalSearches: number;
  successfulSearches: number;
  successRate: number;
}

export interface SearchSuccessRate {
  totalSearches: number;
  successfulSearches: number;
  failedSearches: number;
  successRate: number;
  failureRate: number;
  successByType: SuccessRateByType[];
  trendData: SuccessRateTrend[];
  periodStart: string;
  periodEnd: string;
}

export interface ZeroResultKeyword {
  keyword: string;
  searchCount: number;
  uniqueUsers: number;
  firstSearched: string;
  lastSearched: string;
  suggestedActions: string[];
}

export interface ZeroResultKeywords {
  keywords: ZeroResultKeyword[];
  totalCount: number;
  percentageOfTotal: number;
  periodStart: string;
  periodEnd: string;
}

export interface SearchTrendData {
  date: string;
  totalSearches: number;
  uniqueUsers: number;
  uniqueQueries: number;
  successRate: number;
}

export interface SearchTrends {
  trendData: SearchTrendData[];
  growthRate: number;
  peakPeriod: string;
  periodStart: string;
  periodEnd: string;
}