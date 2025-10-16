import axios from "axios";
import { API_CONFIG } from "../config/api.config";

// Tạo instance axios có sẵn config
const api = axios.create({
  baseURL: API_CONFIG.API_V1_URL,
  timeout: API_CONFIG.TIMEOUT,
  headers: API_CONFIG.DEFAULT_HEADERS,
});

//  Hàm xử lý lỗi chung
const handleError = (error: any) => {
  if (error.code === "ECONNABORTED") {
    throw new Error("⏰ Yêu cầu quá thời gian, thử lại sau.");
  } else if (error.response) {
    throw new Error(`❌ Lỗi server: ${error.response.status} - ${error.response.data?.message || "Không xác định"}`);
  } else {
    throw new Error("⚠️ Không thể kết nối tới server. Kiểm tra mạng hoặc backend.");
  }
};

// Lấy tất cả gợi ý cho trang Home (Featured, Popular, Newest, TopRated, Trending)
export const getHomeSuggestions = async () => {
  try {
    const res = await api.get("/recommendations/home");
    return res.data;
  } catch (error) {
    handleError(error);
  }
};

