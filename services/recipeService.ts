import axios from "axios";

// ⚠️ Dùng IP thật của máy bạn (xem bằng ipconfig)
let API_BASE_URL = "http://192.168.21.104:8080/api/recipes";


// 🧩 Tạo instance axios có sẵn config
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 5000, // ⏰ Timeout 5 giây (có thể tăng/giảm)
  headers: {
    "Content-Type": "application/json",
  },
});

// 🧠 Hàm xử lý lỗi chung
const handleError = (error: any) => {
  if (error.code === "ECONNABORTED") {
    throw new Error("⏰ Yêu cầu quá thời gian, thử lại sau.");
  } else if (error.response) {
    throw new Error(`❌ Lỗi server: ${error.response.status} - ${error.response.data?.message || "Không xác định"}`);
  } else {
    throw new Error("⚠️ Không thể kết nối tới server. Kiểm tra mạng hoặc backend.");
  }
};

// 📜 Lấy danh sách công thức
export const getAllRecipes = async (page = 0, size = 10) => {
  try {
    const res = await api.get(`?page=${page}&size=${size}`);
    return res.data;
  } catch (error) {
    handleError(error);
  }
};

// 🔍 Lấy chi tiết công thức theo ID
export const getRecipeById = async (id: string) => {
  try {
    const res = await api.get(`/${id}`);
    return res.data;
  } catch (error) {
    handleError(error);
  }
};

// ➕ Tạo mới công thức
export const createRecipe = async (data: any) => {
  try {
    const res = await api.post("", data);
    return res.data;
  } catch (error) {
    handleError(error);
  }
};

// ✏️ Cập nhật công thức
export const updateRecipe = async (id: string, data: any) => {
  try {
    const res = await api.put(`/${id}`, data);
    return res.data;
  } catch (error) {
    handleError(error);
  }
};

// 🗑️ Xóa công thức
export const deleteRecipe = async (id: string) => {
  try {
    const res = await api.delete(`/${id}`);
    return res.data;
  } catch (error) {
    handleError(error);
  }
};
