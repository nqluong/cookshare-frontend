import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { API_CONFIG } from "../config/api.config";

const api = axios.create({
  baseURL: `${API_CONFIG.BASE_URL}/api/categories`,
  timeout: API_CONFIG.TIMEOUT,
  headers: API_CONFIG.DEFAULT_HEADERS,
});

// ✅ Interceptor tự thêm token
api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem("access_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// ✅ Xử lý lỗi chung
const handleError = (error: any) => {
  if (error.code === "ECONNABORTED") {
    throw new Error("⏰ Quá thời gian, thử lại sau.");
  } else if (error.response) {
    throw new Error(`❌ Server: ${error.response.status} - ${error.response.data?.message || "Không xác định"}`);
  } else {
    throw new Error("⚠️ Không thể kết nối tới server.");
  }
};

// ✅ API
export const getAllCategories = async () => {
  try {
    const res = await api.get("");
    return res.data;
  } catch (error) {
    handleError(error);
  }
};

export const getCategoryById = async (id: string) => {
  try {
    const res = await api.get(`/${id}`);
    return res.data;
  } catch (error) {
    handleError(error);
  }
};

export const createCategory = async (data: any) => {
  try {
    const res = await api.post("", data);
    return res.data;
  } catch (error) {
    handleError(error);
  }
};

export const updateCategory = async (id: string, data: any) => {
  try {
    const res = await api.put(`/${id}`, data);
    return res.data;
  } catch (error) {
    handleError(error);
  }
};

export const deleteCategory = async (id: string) => {
  try {
    const res = await api.delete(`/${id}`);
    return res.data;
  } catch (error) {
    handleError(error);
  }
};

// ✅ Gom lại
export const CategoryService = {
  getAllCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
};
