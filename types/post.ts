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