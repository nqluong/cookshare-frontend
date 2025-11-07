export interface DateRangeParams {
  startDate?: string;
  endDate?: string;
}

export interface InteractionOverview {
  totalLikes: number;
  totalComments: number;
  totalSaves: number;
  totalRecipes: number;
  engagementRate: number;
  averageLikesPerRecipe: number;
  averageCommentsPerRecipe: number;
  averageSavesPerRecipe: number;
  periodStart: string;
  periodEnd: string;
}

export interface InteractionDistribution {
  count0to10: number;
  count11to50: number;
  count51to100: number;
  count101to500: number;
  countOver500: number;
}

export interface DetailedInteractionStats {
  averageLikesPerRecipe: number;
  averageCommentsPerRecipe: number;
  averageSavesPerRecipe: number;
  medianLikesPerRecipe: number;
  medianCommentsPerRecipe: number;
  medianSavesPerRecipe: number;
  maxLikesOnRecipe: number;
  maxCommentsOnRecipe: number;
  maxSavesOnRecipe: number;
  likeDistribution: InteractionDistribution;
  commentDistribution: InteractionDistribution;
  saveDistribution: InteractionDistribution;
}

export interface HourlyInteraction {
  hour: number;
  likes: number;
  comments: number;
  saves: number;
  totalInteractions: number;
}

export interface DailyInteraction {
  dayNumber: number;
  dayOfWeek: string;
  likes: number;
  comments: number;
  saves: number;
  totalInteractions: number;
}

export interface PeakHoursStats {
  hourlyStats: HourlyInteraction[];
  dailyStats: DailyInteraction[];
  peakHour: number;
  peakDayOfWeek: string;
  periodStart: string;
  periodEnd: string;
}

export interface CommentDetail {
  commentId: string;
  content: string;
  recipeId: string;
  recipeTitle: string;
  userId: string;
  username: string;
  userAvatar: string;
  likeCount: number;
  createdAt: string;
}

export interface TopComments {
  topComments: CommentDetail[];
  totalCount: number;
  periodStart: string;
  periodEnd: string;
}

export interface FollowTrendData {
  date: string;
  newFollows: number;
  cumulativeFollows: number;
}

export interface FollowTrends {
  trendData: FollowTrendData[];
  totalNewFollows: number;
  totalUnfollows: number;
  netFollowGrowth: number;
  followGrowthRate: number;
  periodStart: string;
  periodEnd: string;
}

export interface CategoryEngagement {
  categoryId: string;
  categoryName: string;
  recipeCount: number;
  totalViews: number;
  totalLikes: number;
  totalComments: number;
  totalSaves: number;
  engagementRate: number;
  averageViewsPerRecipe: number;
  averageLikesPerRecipe: number;
  averageCommentsPerRecipe: number;
  averageSavesPerRecipe: number;
}

export interface EngagementByCategory {
  categoryEngagements: CategoryEngagement[];
  overallEngagementRate: number;
  periodStart: string;
  periodEnd: string;
}