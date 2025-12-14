// types/admin/groupedReport.types.ts

export type ReportType = 
  | 'HARASSMENT' 
  | 'COPYRIGHT' 
  | 'SPAM' 
  | 'INAPPROPRIATE' 
  | 'MISLEADING' 
  | 'OTHER';

export type ReportPriority = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';

export type ReportStatus = 
  | 'PENDING' 
  | 'RESOLVED' 
  | 'REJECTED';

export type ReportActionType = 
  | 'NO_ACTION'
  | 'USER_WARNED'
  | 'USER_SUSPENDED'
  | 'USER_BANNED'
  | 'RECIPE_UNPUBLISHED'
  | 'RECIPE_EDITED'
  | 'CONTENT_REMOVED'
  | 'OTHER';

// Individual report within a grouped report
export interface GroupedReportItem {
  reportId: string;
  reporterId: string;
  reporterUsername: string;
  reporterFullName: string;
  reporterAvatar: string | null;
  reportType: ReportType;
  reason: string;
  description: string | null;
  status: ReportStatus;
  createdAt: string;
  actionTaken: ReportActionType | null;
  actionDescription: string | null;
  adminNote: string | null;
  reviewedBy: string | null;
  reviewerUsername: string | null;
  reviewerFullName: string | null;
  reviewedAt: string | null;
}

export interface GroupedReport {
  recipeId: string;
  recipeTitle: string;
  recipeFeaturedImage: string;
  recipeThumbnail: string;
  
  authorId: string;
  authorUsername: string;
  authorFullName: string;
  authorAvatarUrl: string;
  
  reportCount: number;
  weightedScore: number;
  mostSevereType: ReportType;
  latestReportTime: string;
  oldestReportTime: string;
  
  reportTypeBreakdown?: { [key in ReportType]?: number };
  
  autoActioned: boolean;
  exceedsThreshold: boolean;
  threshold?: number;
  priority: ReportPriority;
  allResolved: boolean;
  
  topReporters: string[];
  
  // Reports array (from detail API)
  reports?: GroupedReportItem[];
  
  // Summary fields for resolved reports (optional, derived from reports)
  lastActionTaken?: ReportActionType;
  lastReviewerUsername?: string;
  lastReviewerFullName?: string;
  lastReviewedAt?: string;
}

export interface GroupedReportResponse {
  page: number;
  size: number;
  totalPages: number;
  totalElements: number;
  content: GroupedReport[];
}

export interface ReportPriorityConfig {
  label: string;
  color: string;
  backgroundColor: string;
  icon: string;
}

export const REPORT_PRIORITY_CONFIG: Record<ReportPriority, ReportPriorityConfig> = {
  CRITICAL: {
    label: 'Nghiêm trọng',
    color: '#FFFFFF',
    backgroundColor: '#DC2626',
    icon: '🔴',
  },
  HIGH: {
    label: 'Cao',
    color: '#FFFFFF',
    backgroundColor: '#EA580C',
    icon: '🟠',
  },
  MEDIUM: {
    label: 'Trung bình',
    color: '#1F2937',
    backgroundColor: '#FBBF24',
    icon: '🟡',
  },
  LOW: {
    label: 'Thấp',
    color: '#FFFFFF',
    backgroundColor: '#16A34A',
    icon: '🟢',
  },
};

export const REPORT_TYPE_LABELS: Record<ReportType, string> = {
  HARASSMENT: 'Quấy rối',
  COPYRIGHT: 'Bản quyền',
  SPAM: 'Spam',
  INAPPROPRIATE: 'Nội dung không phù hợp',
  MISLEADING: 'Gây hiểu lầm',
  OTHER: 'Khác',
};

export const REPORT_TYPE_COLORS: Record<ReportType, string> = {
  HARASSMENT: '#DC2626',
  COPYRIGHT: '#7C3AED',
  SPAM: '#F59E0B',
  INAPPROPRIATE: '#EC4899',
  MISLEADING: '#3B82F6',
  OTHER: '#6B7280',
};

export const REPORT_STATUS_LABELS: Record<ReportStatus, string> = {
  PENDING: 'Chờ xử lý',
  RESOLVED: 'Đã được xử lý',
  REJECTED: 'Đã từ chối'
};

export const REPORT_STATUS_COLORS: Record<ReportStatus, string> = {
  PENDING: '#F59E0B',
  RESOLVED: '#10B981',
  REJECTED: '#EF4444'
};

export const REPORT_ACTION_TYPE_LABELS: Record<ReportActionType, string> = {
  NO_ACTION: 'Không có hành động',
  USER_WARNED: 'Cảnh cáo người dùng',
  USER_SUSPENDED: 'Tạm khóa tài khoản',
  USER_BANNED: 'Vĩnh viễn cấm',
  RECIPE_UNPUBLISHED: 'Gỡ công thức',
  RECIPE_EDITED: 'Yêu cầu chỉnh sửa',
  CONTENT_REMOVED: 'Xóa nội dung',
  OTHER: 'Hành động khác',
};

export const REPORT_ACTION_TYPE_COLORS: Record<ReportActionType, string> = {
  NO_ACTION: '#10B981',
  USER_WARNED: '#F59E0B',
  USER_SUSPENDED: '#EA580C',
  USER_BANNED: '#DC2626',
  RECIPE_UNPUBLISHED: '#3B82F6',
  RECIPE_EDITED: '#8B5CF6',
  CONTENT_REMOVED: '#EF4444',
  OTHER: '#6B7280',
};

// Chi tiết một báo cáo cá nhân
export interface IndividualReport {
  reportId: string;
  reporterId: string;
  reporterUsername: string;
  reporterFullName: string;
  reporterAvatar: string | null;
  reportType: ReportType;
  reason: string;
  description: string | null;
  status: ReportStatus;
  createdAt: string;
  // Fields for resolved reports
  actionTaken: ReportActionType | null;
  actionDescription: string | null;
  adminNote: string | null;
  reviewedBy: string | null;
  reviewerUsername: string | null;
  reviewerFullName: string | null;
  reviewedAt: string | null;
}

// Response cho danh sách báo cáo đã xử lý (individual reports)
export interface ProcessedReportReporter {
  userId: string;
  username: string;
  avatarUrl: string | null;
  fullName: string | null;
}

export interface ProcessedReportRecipe {
  recipeId: string;
  title: string;
  slug: string;
  featuredImage: string | null;
  status: string;
  isPublished: boolean;
  viewCount: number;
  userId: string;
  authorUsername: string;
  authorFullName: string | null;
}

export interface ProcessedReportReviewer {
  userId: string;
  username: string;
  fullName: string | null;
  avatarUrl: string | null;
}

export interface ProcessedReport {
  reportId: string;
  reporter: ProcessedReportReporter;
  reportedUser: any | null;
  reportedRecipe: ProcessedReportRecipe | null;
  reportType: ReportType;
  reason: string;
  description: string | null;
  status: ReportStatus;
  actionTaken: ReportActionType | null;
  actionDescription: string | null;
  adminNote: string | null;
  reviewer: ProcessedReportReviewer | null;
  reviewedAt: string | null;
  createdAt: string;
  reportersNotified: boolean | null;
}

export interface ProcessedReportResponse {
  page: number;
  size: number;
  totalPages: number;
  totalElements: number;
  content: ProcessedReport[];
}

// Response chi tiết nhóm báo cáo của một công thức
export interface GroupedReportDetail {
  recipeId: string;
  recipeTitle: string;
  recipeThumbnail: string;
  
  authorId: string;
  authorUsername: string;
  authorFullName: string;
  
  reportCount: number;
  weightedScore: number;
  mostSevereType: ReportType;
  exceedsThreshold: boolean;
  threshold: number;
  
  reportTypeBreakdown?: { [key in ReportType]?: number };
  
  reports: IndividualReport[];
}

// ====== Report Review Types ======

export type ReviewStatus = 'PENDING' | 'REJECTED' | 'RESOLVED';

export type ActionType = 
  | 'NO_ACTION'
  | 'USER_WARNED'
  | 'USER_SUSPENDED'
  | 'USER_BANNED'
  | 'RECIPE_UNPUBLISHED'
  | 'RECIPE_EDITED'
  | 'CONTENT_REMOVED'
  | 'OTHER';

export interface ReviewReportRequest {
  status: ReviewStatus;
  actionType: ActionType;
  actionDescription?: string;
  adminNote?: string;
  notifyAllReporters?: boolean;
}

export interface ReviewReportResponse {
  status: ReviewStatus;
  actionType: ActionType;
  actionDescription: string;
  adminNote: string;
  notifyAllReporters: boolean;
}

export interface ActionOption {
  actionType: ActionType;
  status: ReviewStatus;
  label: string;
  description: string;
  icon: string;
  color: string;
  requiresDescription: boolean;
}

export const ACTION_OPTIONS: ActionOption[] = [
  {
    actionType: 'NO_ACTION',
    status: 'REJECTED',
    label: 'Bỏ qua',
    description: 'Báo cáo không hợp lệ, không cần xử lý',
    icon: 'checkmark-circle-outline',
    color: '#10B981',
    requiresDescription: false,
  },
  {
    actionType: 'USER_WARNED',
    status: 'RESOLVED',
    label: 'Cảnh cáo tác giả',
    description: 'Gửi cảnh cáo đến tác giả công thức',
    icon: 'warning-outline',
    color: '#F59E0B',
    requiresDescription: true,
  },
  {
    actionType: 'RECIPE_UNPUBLISHED',
    status: 'RESOLVED',
    label: 'Gỡ công thức',
    description: 'Ẩn công thức khỏi hệ thống',
    icon: 'eye-off-outline',
    color: '#3B82F6',
    requiresDescription: true,
  },
  {
    actionType: 'RECIPE_EDITED',
    status: 'RESOLVED',
    label: 'Yêu cầu chỉnh sửa',
    description: 'Yêu cầu tác giả chỉnh sửa nội dung',
    icon: 'create-outline',
    color: '#8B5CF6',
    requiresDescription: true,
  },
  {
    actionType: 'CONTENT_REMOVED',
    status: 'RESOLVED',
    label: 'Xóa nội dung',
    description: 'Xóa nội dung vi phạm',
    icon: 'trash-outline',
    color: '#EF4444',
    requiresDescription: true,
  },
  {
    actionType: 'USER_SUSPENDED',
    status: 'RESOLVED',
    label: 'Tạm khóa tài khoản',
    description: 'Tạm khóa tài khoản tác giả',
    icon: 'time-outline',
    color: '#EA580C',
    requiresDescription: true,
  },
  {
    actionType: 'USER_BANNED',
    status: 'RESOLVED',
    label: 'Cấm vĩnh viễn',
    description: 'Cấm vĩnh viễn tài khoản tác giả',
    icon: 'ban-outline',
    color: '#DC2626',
    requiresDescription: true,
  },
];

// Report Statistics Types
export interface RecentReport {
  reportId: string;
  recipeTitle: string;
  reportType: ReportType;
  createdAt: string;
}

export interface TopReportedRecipe {
  itemId: string;
  itemName: string;
  reportCount: number;
}

export interface ReportStatistics {
  totalReports: number;
  pendingReports: number;
  resolvedReports: number;
  rejectedReports: number;
  totalReportedRecipes: number;
  recipesWithPendingReports: number;
  reportsByType?: {
    SPAM?: number;
    INAPPROPRIATE_CONTENT?: number;
    COPYRIGHT?: number;
    HARASSMENT?: number;
    MISLEADING?: number;
    OTHER?: number;
  };
  recentReports?: RecentReport[];
  topReportedRecipes?: TopReportedRecipe[];
}

export interface ReportStatisticsResponse {
  success: boolean;
  message: string;
  data: ReportStatistics;
}
