// types/admin/groupedReport.types.ts

export type ReportType = 
  | 'HARASSMENT' 
  | 'COPYRIGHT' 
  | 'SPAM' 
  | 'INAPPROPRIATE_CONTENT' 
  | 'MISLEADING' 
  | 'OTHER';

export type ReportPriority = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';

export type ReportStatus = 
  | 'PENDING' 
  | 'APPROVED' 
  | 'UNDER_REVIEW' 
  | 'REVIEWING' 
  | 'RESOLVED' 
  | 'REJECTED' 
  | 'CLOSED';

export type ReportActionType = 
  | 'NO_ACTION'
  | 'USER_WARNED'
  | 'USER_SUSPENDED'
  | 'USER_BANNED'
  | 'RECIPE_UNPUBLISHED'
  | 'RECIPE_EDITED'
  | 'CONTENT_REMOVED'
  | 'OTHER';

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
  priority: ReportPriority;
  
  topReporters: string[];
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
  INAPPROPRIATE_CONTENT: 'Nội dung không phù hợp',
  MISLEADING: 'Gây hiểu lầm',
  OTHER: 'Khác',
};

export const REPORT_TYPE_COLORS: Record<ReportType, string> = {
  HARASSMENT: '#DC2626',
  COPYRIGHT: '#7C3AED',
  SPAM: '#F59E0B',
  INAPPROPRIATE_CONTENT: '#EC4899',
  MISLEADING: '#3B82F6',
  OTHER: '#6B7280',
};

export const REPORT_STATUS_LABELS: Record<ReportStatus, string> = {
  PENDING: 'Chờ xử lý',
  APPROVED: 'Đã phê duyệt',
  UNDER_REVIEW: 'Đang xem xét',
  REVIEWING: 'Đang xem xét',
  RESOLVED: 'Đã giải quyết',
  REJECTED: 'Đã từ chối',
  CLOSED: 'Đã đóng',
};

export const REPORT_STATUS_COLORS: Record<ReportStatus, string> = {
  PENDING: '#F59E0B',
  APPROVED: '#10B981',
  UNDER_REVIEW: '#3B82F6',
  REVIEWING: '#3B82F6',
  RESOLVED: '#10B981',
  REJECTED: '#EF4444',
  CLOSED: '#6B7280',
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
  reportId: string; // ID của người báo cáo 
  reporterId: string;
  reporterUsername: string;
  reporterFullName: string;
  reporterAvatar: string;
  reportType: ReportType;
  reason: string;
  description: string;
  createdAt: string;
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

export type ReviewStatus = 'APPROVED' | 'REJECTED' | 'RESOLVED';

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
  recipeId: string;
  processedCount: number;
  status: ReviewStatus;
  actionType: ActionType;
  reviewedBy: string;
  reviewedAt: string;
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
    status: 'APPROVED',
    label: 'Cảnh cáo tác giả',
    description: 'Gửi cảnh cáo đến tác giả công thức',
    icon: 'warning-outline',
    color: '#F59E0B',
    requiresDescription: true,
  },
  {
    actionType: 'RECIPE_UNPUBLISHED',
    status: 'APPROVED',
    label: 'Gỡ công thức',
    description: 'Ẩn công thức khỏi hệ thống',
    icon: 'eye-off-outline',
    color: '#3B82F6',
    requiresDescription: true,
  },
  {
    actionType: 'RECIPE_EDITED',
    status: 'APPROVED',
    label: 'Yêu cầu chỉnh sửa',
    description: 'Yêu cầu tác giả chỉnh sửa nội dung',
    icon: 'create-outline',
    color: '#8B5CF6',
    requiresDescription: true,
  },
  {
    actionType: 'CONTENT_REMOVED',
    status: 'APPROVED',
    label: 'Xóa nội dung',
    description: 'Xóa nội dung vi phạm',
    icon: 'trash-outline',
    color: '#EF4444',
    requiresDescription: true,
  },
  {
    actionType: 'USER_SUSPENDED',
    status: 'APPROVED',
    label: 'Tạm khóa tài khoản',
    description: 'Tạm khóa tài khoản tác giả',
    icon: 'time-outline',
    color: '#EA580C',
    requiresDescription: true,
  },
  {
    actionType: 'USER_BANNED',
    status: 'APPROVED',
    label: 'Cấm vĩnh viễn',
    description: 'Cấm vĩnh viễn tài khoản tác giả',
    icon: 'ban-outline',
    color: '#DC2626',
    requiresDescription: true,
  },
];
