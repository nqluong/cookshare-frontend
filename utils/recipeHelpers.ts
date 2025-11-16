import { getImageUrl } from '../config/api.config';
import { Dish, Post } from '../types';
import { Recipe } from '../types/dish';

export const getTimeAgo = (dateString: string): string => {
  const now = new Date();
  const createdDate = new Date(dateString);
  const diffInSeconds = Math.floor((now.getTime() - createdDate.getTime()) / 1000);

  if (diffInSeconds < 60) {
    return 'Vừa xong';
  } else if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60);
    return `${minutes} phút trước`;
  } else if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600);
    return `${hours} giờ trước`;
  } else if (diffInSeconds < 604800) {
    const days = Math.floor(diffInSeconds / 86400);
    return `${days} ngày trước`;
  } else if (diffInSeconds < 2592000) {
    const weeks = Math.floor(diffInSeconds / 604800);
    return `${weeks} tuần trước`;
  } else {
    const months = Math.floor(diffInSeconds / 2592000);
    return `${months} tháng trước`;
  }
};

// Chuyển đổi Recipe từ API sang định dạng Post để hiển thị
export const recipeToPost = (recipe: Recipe): Post => {
  return {
    id: parseInt(recipe.recipeId.slice(0, 8), 16), // Chuyển UUID thành số
    author: recipe.userName,
    dishName: recipe.title,
    timeAgo: getTimeAgo(recipe.createdAt),
    image: getImageUrl(recipe.featuredImage), 
    description: recipe.description || recipe.title,
    likes: recipe.likeCount,
    comments: recipe.ratingCount, // Dùng số đánh giá làm comments
    isLiked: false,
  };
};

// Chuyển đổi Recipe từ API sang định dạng Dish cho Top Dishes
export const recipeToDish = (recipe: Recipe): Dish => {
  return {
    id: parseInt(recipe.recipeId.slice(0, 8), 16),
    name: recipe.title,
    image: getImageUrl(recipe.featuredImage), 
    likes: recipe.likeCount,
    cookTime: recipe.cookTime,
  };
};

// Lấy top N món ăn có like cao nhất
export const getTopDishes = (recipes: Recipe[], count: number = 10): Dish[] => {
  return recipes
    .sort((a, b) => b.likeCount - a.likeCount) 
    .slice(0, count) 
    .map(recipeToDish); 
};

