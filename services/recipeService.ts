// services/recipeService.ts
import axios from "axios";

// ⚠️ Dùng IP thật của máy bạn (xem bằng ipconfig)
const API_BASE_URL = "http://192.168.1.156:8080/api/recipes";

export const getAllRecipes = async (page = 0, size = 10) => {
  const res = await axios.get(`${API_BASE_URL}?page=${page}&size=${size}`);
  return res.data;
};

export const getRecipeById = async (id: string) => {
  const res = await axios.get(`${API_BASE_URL}/${id}`);
  return res.data;
};

export const createRecipe = async (data: any) => {
  const res = await axios.post(API_BASE_URL, data);
  return res.data;
};

export const updateRecipe = async (id: string, data: any) => {
  const res = await axios.put(`${API_BASE_URL}/${id}`, data);
  return res.data;
};

export const deleteRecipe = async (id: string) => {
  const res = await axios.delete(`${API_BASE_URL}/${id}`);
  return res.data;
};
