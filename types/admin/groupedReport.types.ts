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
