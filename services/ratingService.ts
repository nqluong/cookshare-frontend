import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from "axios";
import { API_CONFIG } from "../config/api.config";
// Tạo instance axios có sẵn config
const api = axios.create({
  baseURL: API_CONFIG.API_V1_URL,
  timeout: API_CONFIG.TIMEOUT,
  headers: API_CONFIG.DEFAULT_HEADERS,
});

export const ratingService = {
  // Gửi đánh giá
  submitRating: async (recipeId: string, rating: number) => {
    const token = await AsyncStorage.getItem('authToken');
    const response = await api.post(
      `/likes-ratings/rating`,
      null,
      {
        params: {
          recipeId,
          rating,
        },
        headers: {
      Authorization: `Bearer ${token}`,
    },
      }
    );
    return response.data;
  },
  getMyRating: async (recipeId: string): Promise<number | null> => {
    try {
         const token = await AsyncStorage.getItem('authToken');
      const res = await api.get('/likes-ratings/my-rating', { params: { recipeId }, headers: { Authorization: `Bearer ${token}` } });
      return res.data.data; // trả về 1,2,3,4,5 hoặc null
    } catch (error) {
      return null;
    }
  },

  // Kiểm tra user đã rating chưa
  hasUserRated: async (recipeId: string): Promise<boolean> => {
    try {
        const token = await AsyncStorage.getItem('authToken');
      const response = await api.get(`/likes-ratings/is-rated`, {
        params: { recipeId },
        headers: {
      Authorization: `Bearer ${token}`,
    },
      });
      
      return response.data.result === true;
    } catch (error: any) {
      if (error.response?.status === 401) {
        return false; // chưa login
      }
      console.error("Lỗi check rating:", error);
      return false;
    }
  },
};