import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { API_CONFIG } from "../config/api.config";

// Tạo instance axios có sẵn config
const api = axios.create({
  baseURL: `${API_CONFIG.BASE_URL}/api/recipes`,
  timeout: API_CONFIG.TIMEOUT,
  headers: API_CONFIG.DEFAULT_HEADERS,
});
// ✅ Thêm token tự động
api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem("access_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Hàm xử lý lỗi chung
const handleError = (error: any) => {
  if (error.code === "ECONNABORTED") {
    throw new Error("⏰ Yêu cầu quá thời gian, thử lại sau.");
  } else if (error.response) {
    throw new Error(`❌ Lỗi server: ${error.response.status} - ${error.response.data?.message || "Không xác định"}`);
  } else {
    throw new Error("⚠️ Không thể kết nối tới server. Kiểm tra mạng hoặc backend.");
  }
};

// Lấy danh sách công thức
export const getAllRecipes = async (page = 0, size = 10) => {
  try {
    const res = await api.get(`?page=${page}&size=${size}`);
    return res.data;
  } catch (error) {
    handleError(error);
  }
};

// Lấy chi tiết công thức theo ID
export const getRecipeById = async (id: string, token?: string | null) => {
  try {
    const headers: any = { ...API_CONFIG.DEFAULT_HEADERS };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
      console.log('🔑 Sending request with token');
    } else {
      console.log('⚠️ No token provided');
    }

    const res = await api.get(`/${id}`, { headers });
    return res.data;
  } catch (error) {
    handleError(error);
  }
};

// Tạo mới công thức
export const createRecipe = async (formData: FormData) => {
  try {
    // Log formData để debug
    console.log("FormData being sent:", formData);
    // Log dữ liệu chi tiết
    const jsonData = JSON.parse(formData.get('data') as string);
    console.log("Recipe data:", jsonData);

    const res = await api.post("", formData, {
      headers: { 
        "Content-Type": "multipart/form-data",
        "Accept": "application/json"
      },
      transformRequest: (data) => data, // Prevent axios from trying to transform FormData
    });
    return res.data;
  } catch (error) {
    handleError(error);
  }
};

// Cập nhật công thức
export const updateRecipe = async (id: string, data: any) => {
  try {
    const res = await api.put(`/${id}`, data);
    return res.data;
  } catch (error) {
    handleError(error);
  }
};

// Xóa công thức
export const deleteRecipe = async (id: string) => {
  try {
    const res = await api.delete(`/${id}`);
    return res.data;
  } catch (error) {
    handleError(error);
  }
};

export const getAllRecipesByUserId = async (userId: string) => {
  try {
    const token = await AsyncStorage.getItem('access_token');
    const headers = {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    };
    const res = await api.get(`/user/${userId}`, { headers });
    return res.data;
  } catch (error) {
    handleError(error);
  }
};
// ✅ Gom lại export
export const RecipeService = {
  getAllRecipes,
  getRecipeById,
  createRecipe,
  updateRecipe,
  deleteRecipe,
  getAllRecipesByUserId,
};
// Lấy danh sách công thức nổi bật (featured)
// export const getFeaturedRecipes = async (page = 0, size = 10) => {
//   try {
//     const res = await api.get(`/featured?page=${page}&size=${size}`);
// };
