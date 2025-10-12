export interface Dish {
  id: number;
  name: string;
  image: string;
  likes: number;
}

export interface Post {
  id: number;
  author: string;
  dishName: string;
  timeAgo: string;
  image: string;
  description: string;
  likes: number;
  comments: number;
  duration: number;
}

export interface Tab {
  id: string;
  icon: string;
  label: string;
}

export interface NavTab {
  id: string;
  icon: string;
}