import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from "axios";
import { API_CONFIG } from "../config/api.config";
// Tạo instance axios có sẵn config
const api = axios.create({
  baseURL: API_CONFIG.API_V1_URL,
  timeout: API_CONFIG.TIMEOUT,
  headers: API_CONFIG.DEFAULT_HEADERS,
});

const BASE_URL = API_CONFIG.BASE_URL;
//  Hàm xử lý lỗi chung
const handleError = (error: any) => {
  if (error.code === "ECONNABORTED") {
    throw new Error(" Yêu cầu quá thời gian, thử lại sau.");
  } else if (error.response) {
    throw new Error(` Lỗi server: ${error.response.status} - ${error.response.data?.message || "Không xác định"}`);
  } else {
    throw new Error(" Không thể kết nối tới server. Kiểm tra mạng hoặc backend.");
  }
};
export const likeRecipe = async (recipeId: string) => {
  const token = await AsyncStorage.getItem('authToken');
  const response = await api.post(
    '/likes-ratings/like',
    { recipeId },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  console.log("Đã like recipe:", response.data);
  return response.data;
};

export const unlikeRecipe = async (recipeId: string) => {
  const token = await AsyncStorage.getItem('authToken');
  const response = await api.delete(`/likes-ratings/unlike?recipeId=${recipeId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};

export const isRecipeLiked = async (recipeId: string) => {
  const token = await AsyncStorage.getItem('authToken');
  const response = await api.get(`/likes-ratings/is-liked?recipeId=${recipeId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};
export const getLikedRecipes = async (page: number = 0, size: number = 10) => {
  try {
    const token = await AsyncStorage.getItem('authToken');
    const res = await api.get(`/likes-ratings/likedlist?page=${page}&size=${size}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return res.data;
  } catch (error) {
    handleError(error);
  }
};
export const getHomeSuggestions = async () => {
  try {
    const token = await AsyncStorage.getItem('authToken');
    const res = await api.get("/recommendations/home", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return res.data;
  } catch (error) {
    handleError(error);
  }
};
// Lấy danh sách công thức mới nhất với pagination
export const getNewestRecipes = async (page: number = 0, size: number = 10) => {
  try {
    const res = await api.get(`/recommendations/newest/page?page=${page}&size=${size}`);
    return res.data; 
  } catch (error) {
    handleError(error);
  }
};

// Lấy danh sách công thức đang thịnh hành với pagination
export const getTrendingRecipes = async (page: number = 0, size: number = 10) => {
  try {
    const res = await api.get(`/recommendations/trending/page?page=${page}&size=${size}`);
    return res.data;
  } catch (error) {
    handleError(error);
  }
};

// Lấy danh sách công thức phổ biến với pagination
export const getPopularRecipes = async (page: number = 0, size: number = 10) => {
  try {
    const res = await api.get(`/recommendations/popular/page?page=${page}&size=${size}`);
    return res.data;
  } catch (error) {
    handleError(error);
  }
};

// Lấy danh sách công thức đánh giá cao với pagination
export const getTopRatedRecipes = async (page: number = 0, size: number = 10) => {
  try {
    const res = await api.get(`/recommendations/top-rated/page?page=${page}&size=${size}`);
  
    return res.data; 
  } catch (error) {
    handleError(error);
  }
};
export const searchRecipeByUser = async (searchQuery: string, page: number = 0, size: number = 10) => {
  try {
    const token = await AsyncStorage.getItem('authToken');
    const res = await axios.get(
      `${BASE_URL}/searchs/user?name=${encodeURIComponent(searchQuery)}&page=${page}&size=${size}&sortBy=title&direction=ASC`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          ...API_CONFIG.DEFAULT_HEADERS,
        },
        timeout: API_CONFIG.TIMEOUT,
      }
    );
    return res.data;
  } catch (error) {
    handleError(error);
  }
};
export const getUserSuggestions = async (query: string,size: number = 5) => {
  try {
    const token = await AsyncStorage.getItem('authToken');
    const res = await axios.get(
      `${BASE_URL}/searchs/user/suggestions?query=${encodeURIComponent(query)}&size=${size}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          ...API_CONFIG.DEFAULT_HEADERS,
        },
        timeout: API_CONFIG.TIMEOUT,
      }
    );
    return res.data;
  } catch (error) {
    handleError(error);
  }
};
export const getRecipebyFollowing = async (page: number = 0, size: number = 10) => {
  try {
    const token = await AsyncStorage.getItem('authToken');
    const res = await axios.get(
      `${BASE_URL}/users/following/recipes?page=${page}&size=${size}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          ...API_CONFIG.DEFAULT_HEADERS,
        },
        timeout: API_CONFIG.TIMEOUT,
      }
    );
    return res.data;
  } catch (error) {
    handleError(error);
  }
};
export const checkMultipleLikes = async (recipeIds: string[]) => {
  try {
    const token = await AsyncStorage.getItem('authToken');
    const res = await api.post(
      '/likes-ratings/check-likes',
      recipeIds,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return res.data;
  } catch (error) {
    handleError(error);
  }
};
