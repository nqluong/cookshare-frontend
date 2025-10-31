import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { API_CONFIG } from "../config/api.config";

const api = axios.create({
  baseURL: `${API_CONFIG.BASE_URL}/api/ingredients`,
  timeout: API_CONFIG.TIMEOUT,
  headers: API_CONFIG.DEFAULT_HEADERS,
});

api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem("access_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

const handleError = (error: any) => {
  if (error.code === "ECONNABORTED") {
    throw new Error("⏰ Quá thời gian, thử lại sau.");
  } else if (error.response) {
    throw new Error(`❌ Server: ${error.response.status} - ${error.response.data?.message || "Không xác định"}`);
  } else {
    throw new Error("⚠️ Không thể kết nối tới server.");
  }
};

export const getAllIngredients = async () => {
  try {
    const res = await api.get("");
    return res.data;
  } catch (error) {
    handleError(error);
  }
};

export const getIngredientById = async (id: string) => {
  try {
    const res = await api.get(`/${id}`);
    return res.data;
  } catch (error) {
    handleError(error);
  }
};

export const createIngredient = async (data: any) => {
  try {
    const res = await api.post("", data);
    return res.data;
  } catch (error) {
    handleError(error);
  }
};

export const updateIngredient = async (id: string, data: any) => {
  try {
    const res = await api.put(`/${id}`, data);
    return res.data;
  } catch (error) {
    handleError(error);
  }
};

export const deleteIngredient = async (id: string) => {
  try {
    const res = await api.delete(`/${id}`);
    return res.data;
  } catch (error) {
    handleError(error);
  }
};

export const IngredientService = {
  getAllIngredients,
  getIngredientById,
  createIngredient,
  updateIngredient,
  deleteIngredient,
};
