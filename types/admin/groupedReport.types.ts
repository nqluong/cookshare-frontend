// types/admin/groupedReport.types.ts

export type ReportType = 
  | 'HARASSMENT' 
  | 'COPYRIGHT' 
  | 'SPAM' 
  | 'INAPPROPRIATE_CONTENT' 
  | 'MISLEADING' 
  | 'OTHER';

export type ReportPriority = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';

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
  
  reportTypeBreakdown: { [key in ReportType]?: number };
  
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
  
  reportTypeBreakdown: { [key in ReportType]?: number };
  
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
