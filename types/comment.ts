export interface CommentResponse {
  commentId: string;
  recipeId: string;
  userId: string;
  userName: string;
  userAvatar: string | null;
  content: string;
  parentCommentId: string | null;
  createdAt: string;
  updatedAt: string;
  replyCount: number;
  replies: CommentResponse[] ;
}
export interface CommentRequest {
  recipeId: string;
  content: string;
  parentCommentId?: string;
}
export interface PaginatedComments {
  content: CommentResponse[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
}
