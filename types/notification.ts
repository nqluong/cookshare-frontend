// types/notification.ts

export enum NotificationType {
  FOLLOW = 'FOLLOW',
  LIKE = 'LIKE',
  COMMENT = 'COMMENT',
  RECIPE_PUBLISHED = 'RECIPE_PUBLISHED',
  SYSTEM = 'SYSTEM',
  MENTION = 'MENTION',
  SHARE = 'SHARE',
  RATING = 'RATING',
}

export enum RelatedType {
  RECORD = 'record',
  USER = 'user',
  COMMENT = 'comment',
  COLLECTION = 'collection',
}

export interface Notification {
  notificationId: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  relatedId: string | null;
  relatedType: RelatedType | null;
  isRead: boolean;
  createdAt: string;
  readAt: string | null;
  actorId: string | null;
  actorName: string | null;
  actorAvatar: string | null;
  recipeId: string | null;
  recipeTitle: string | null;
  recipeImage: string | null;
}

export interface NotificationResponse {
  notifications: Notification[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
    isFirst: boolean;
    isLast: boolean;
  };
}