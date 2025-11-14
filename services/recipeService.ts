import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { API_CONFIG } from "../config/api.config";

// ✅ Tạo instance axios có sẵn config
const api = axios.create({
  baseURL: `${API_CONFIG.BASE_URL}/api/recipes`,
  timeout: 30000,
  headers: {
    ...API_CONFIG.DEFAULT_HEADERS,
    Accept: "application/json",
  },
  maxBodyLength: Infinity,
  maxContentLength: Infinity,
  validateStatus: (status) => status < 500, // không crash với lỗi 4xx
});

// ✅ Tự động thêm token vào header
api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem("access_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// ✅ Hàm xử lý lỗi chung
const handleError = (error: any) => {
  console.error("❌ API Error:", {
    code: error.code,
    message: error.message,
    response: error.response?.data,
    status: error.response?.status,
  });

  if (error.code === "ECONNABORTED") {
    throw new Error("⏰ Request timed out. Try again with smaller images.");
  } else if (error.response?.status === 413) {
    throw new Error("❌ File size too large. Please use smaller images.");
  } else if (error.response?.status === 415) {
    throw new Error("❌ Invalid file type. Please use JPG, PNG, or WebP images.");
  } else if (error.response?.data?.message) {
    throw new Error(`❌ ${error.response.data.message}`);
  } else if (!error.response) {
    throw new Error("⚠️ Network error. Check your connection.");
  } else {
    throw new Error(`❌ Server error: ${error.response.status}`);
  }
};

// ✅ Helper: loại trùng / dữ liệu null để tránh vi phạm ràng buộc DB
const sanitizeRecipePayload = (recipe: any) => {
  if (!recipe || typeof recipe !== "object") return recipe;

  const unique = (arr: any[]) =>
    Array.from(new Set((arr || []).filter((v) => v !== null && v !== undefined && v !== "")));

  const cleaned: any = { ...recipe };

  if (Array.isArray(cleaned.categoryIds)) cleaned.categoryIds = unique(cleaned.categoryIds);
  if (Array.isArray(cleaned.tagIds)) cleaned.tagIds = unique(cleaned.tagIds);

  if (Array.isArray(cleaned.ingredientDetails)) {
    cleaned.ingredientDetails = cleaned.ingredientDetails
      .filter((d: any) => d && d.ingredientId)
      .map((d: any) => ({
        ingredientId: d.ingredientId,
        quantity:
          d.quantity !== undefined && d.quantity !== null
            ? Number(d.quantity)
            : null,
        unit: d.unit || null,
        notes: d.notes || null,
      }));
  }

  if (Array.isArray(cleaned.steps)) {
    cleaned.steps = cleaned.steps
      .map((s: any, idx: number) => ({
        stepNumber: s?.stepNumber ?? idx + 1,
        instruction: s?.instruction ?? "",
        imageUrl: s?.imageUrl ?? null,
      }))
      .filter(
        (s: any) => (s.instruction && s.instruction.trim() !== "") || s.imageUrl
      );
  }

  if (cleaned.prepTime !== undefined) cleaned.prepTime = Number(cleaned.prepTime) || 0;
  if (cleaned.cookTime !== undefined) cleaned.cookTime = Number(cleaned.cookTime) || 0;
  if (cleaned.servings !== undefined) cleaned.servings = Number(cleaned.servings) || 0;

  return cleaned;
};

// ============================== API METHODS ==============================

// ✅ Lấy danh sách công thức
export const getAllRecipes = async (page = 0, size = 10) => {
  try {
    const res = await api.get(`?page=${page}&size=${size}`);
    return res.data;
  } catch (error) {
    handleError(error);
  }
};

// ✅ Lấy chi tiết công thức
export const getRecipeById = async (id: string, token?: string | null) => {
  try {
    const headers: any = { ...API_CONFIG.DEFAULT_HEADERS };
    if (token) headers.Authorization = `Bearer ${token}`;
    
    console.log(`📥 Fetching recipe ${id}...`);
    const res = await api.get(`/${id}`, { headers });
    
    console.log(`✅ Recipe ${id} loaded:`, {
      title: res.data?.title,
      stepsCount: res.data?.steps?.length,
      stepsWithImages: res.data?.steps?.filter((s: any) => s.imageUrl).length
    });
    
    return res.data;
  } catch (error) {
    handleError(error);
  }
};

// ✅ Tạo mới công thức
export const createRecipe = async (formData: FormData) => {
  try {
    const jsonData = JSON.parse(formData.get("data") as string);
    const image = formData.get("image");
    const stepImages = formData.getAll("stepImages");

    const sanitizedData = sanitizeRecipePayload(jsonData);

    const uploadForm = new FormData();
    uploadForm.append("data", JSON.stringify(sanitizedData));
    if (image) uploadForm.append("image", image as any);
    if (stepImages?.length)
      stepImages.forEach((si: any) => uploadForm.append("stepImages", si));

    console.log("📤 Creating recipe:", {
      title: jsonData.title,
      stepCount: jsonData.steps?.length || 0,
      stepImages: stepImages.length,
    });

    const res = await api.post("", uploadForm, {
      headers: {
        "Content-Type": "multipart/form-data",
        Accept: "application/json",
      },
      transformRequest: (d) => d,
      timeout: 30000,
      maxBodyLength: Infinity,
      maxContentLength: Infinity,
    });

    console.log("✅ Recipe created:", res.data.title);
    return res.data;
  } catch (error) {
    console.error("❌ Recipe creation failed:", error);
    handleError(error);
  }
};

// ✅ Cập nhật công thức
export const updateRecipe = async (id: string, data: any) => {
  try {
    if (data instanceof FormData) {
      const jsonData = JSON.parse((data.get("data") as string) || "{}");
      const stepImages = data.getAll("stepImages");
      
      console.log("📤 Updating recipe:", {
        id,
        title: jsonData.title,
        stepCount: jsonData.steps?.length || 0,
        newStepImages: stepImages.length,
        existingStepsWithImages: jsonData.steps?.filter((s: any) => s.imageUrl).length || 0
      });

      const res = await api.put(`/${id}`, data, {
        headers: {
          "Content-Type": "multipart/form-data",
          Accept: "application/json",
        },
        transformRequest: (d) => d,
        timeout: 30000,
        maxBodyLength: Infinity,
        maxContentLength: Infinity,
      });
      
      console.log("✅ Recipe updated successfully:", {
        title: res.data?.title,
        stepsCount: res.data?.steps?.length,
        stepsWithImages: res.data?.steps?.filter((s: any) => s.imageUrl).length
      });
      
      return res.data;
    }

    const payload = sanitizeRecipePayload(data);
    const res = await api.put(`/${id}`, payload);
    return res.data;
  } catch (error) {
    console.error("❌ Recipe update failed:", error);
    handleError(error);
  }
};

// ✅ Xóa công thức
export const deleteRecipe = async (id: string) => {
  try {
    const res = await api.delete(`/${id}`);
    return res.data;
  } catch (error) {
    handleError(error);
  }
};

// ✅ Lấy danh sách công thức của người dùng
export const getAllRecipesByUserId = async (userId: string) => {
  try {
    const token = await AsyncStorage.getItem("access_token");
    const headers = {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
    };
    const res = await api.get(`/user/${userId}`, { headers });
    return res.data;
  } catch (error) {
    handleError(error);
  }
};

// ✅ Lấy danh sách công thức nổi bật (featured)
export const getFeaturedRecipes = async (page = 0, size = 10) => {
  try {
    const res = await api.get(`/featured?page=${page}&size=${size}`);
    return res.data;
  } catch (error) {
    handleError(error);
  }
};

// ✅ Gom export lại
export const RecipeService = {
  getAllRecipes,
  getRecipeById,
  createRecipe,
  updateRecipe,
  deleteRecipe,
  getAllRecipesByUserId,
  getFeaturedRecipes,
};