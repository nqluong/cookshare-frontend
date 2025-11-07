import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { API_CONFIG } from "../config/api.config";

// Tạo instance axios có sẵn config
const api = axios.create({
  baseURL: `${API_CONFIG.BASE_URL}/api/recipes`,
  timeout: 30000, // Increased timeout for file uploads
  headers: {
    ...API_CONFIG.DEFAULT_HEADERS,
    'Accept': 'application/json'
  },
  maxBodyLength: Infinity, // For large file uploads
  maxContentLength: Infinity
});
// ✅ Thêm token tự động
api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem("access_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Common error handler
const handleError = (error: any) => {
  console.error("API Error:", {
    code: error.code,
    message: error.message,
    response: error.response?.data,
    status: error.response?.status
  });

  if (error.code === "ECONNABORTED") {
    throw new Error("⏰ Request timed out. Try again with smaller images.");
  } else if (error.response?.data?.message) {
    throw new Error(`❌ ${error.response.data.message}`);
  } else if (error.response?.status === 413) {
    throw new Error("❌ File size too large. Please use smaller images.");
  } else if (error.response?.status === 415) {
    throw new Error("❌ Invalid file type. Please use JPG, PNG, or WebP images.");
  } else if (!error.response) {
    throw new Error("⚠️ Network error. Check your connection.");
  } else {
    throw new Error(`❌ Server error: ${error.response.status}`);
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

// Create recipe with images
export const createRecipe = async (formData: FormData) => {
  try {
    // Extract and validate request data
    const jsonData = JSON.parse(formData.get('data') as string);
    const image = formData.get('image');
    const stepImages = formData.getAll('stepImages');

    // Sanitize incoming jsonData to avoid duplicate IDs / constraint violations
    const sanitizedData = sanitizeRecipePayload(jsonData);

    // Recreate FormData using sanitized JSON to prevent server-side constraint errors
    const uploadForm = new FormData();
    uploadForm.append('data', JSON.stringify(sanitizedData));
    if (image) uploadForm.append('image', image as any);
    if (stepImages && stepImages.length) {
      stepImages.forEach((si: any) => uploadForm.append('stepImages', si));
    }

    // Log request details for debugging
    console.log("📤 Creating recipe:", {
      data: {
        ...jsonData,
        steps: jsonData.steps?.map((s: any) => ({
          stepNumber: s.stepNumber,
          instruction: s.instruction
        }))
      },
      imageInfo: image instanceof File ? {
        type: image.type,
        size: image.size,
        name: image.name
      } : null,
      stepImagesCount: stepImages.length
    });

    // Make API request (use sanitized form)
    const res = await api.post("", uploadForm, {
      headers: { 
        "Content-Type": "multipart/form-data",
        "Accept": "application/json"
      },
      transformRequest: (data) => data,
      timeout: 30000, // 30s timeout for uploads
      maxBodyLength: Infinity,
      maxContentLength: Infinity
    });

    console.log("✅ Recipe created:", {
      id: res.data.recipeId,
      title: res.data.title,
      imageUrl: res.data.featuredImage
    });
    
    return res.data;
  } catch (error: any) {
    console.error("❌ Recipe creation failed:", {
      error: error.message,
      response: error.response?.data
    });
    handleError(error);
  }
};

// Cập nhật công thức
export const updateRecipe = async (id: string, data: any) => {
  try {
    // Support both JSON updates and multipart/form-data updates
    if (data instanceof FormData) {
      const res = await api.put(`/${id}`, data, {
        headers: {
          "Content-Type": "multipart/form-data",
          "Accept": "application/json",
        },
        transformRequest: (d) => d,
      });
      return res.data;
    }
    // Sanitize JSON payload before sending
    const payload = sanitizeRecipePayload(data);

    const res = await api.put(`/${id}`, payload);
    return res.data;
  } catch (error) {
    handleError(error);
  }
};

// Helper: clean payload to avoid duplicates / invalid values that trigger DB constraints
const sanitizeRecipePayload = (recipe: any) => {
  if (!recipe || typeof recipe !== 'object') return recipe;

  const unique = (arr: any[]) => Array.from(new Set((arr || []).filter((v) => v !== null && v !== undefined && v !== '')));

  const cleaned: any = { ...recipe };

  if (Array.isArray(cleaned.categoryIds)) cleaned.categoryIds = unique(cleaned.categoryIds);
  if (Array.isArray(cleaned.tagIds)) cleaned.tagIds = unique(cleaned.tagIds);
  if (Array.isArray(cleaned.ingredients)) cleaned.ingredients = unique(cleaned.ingredients);

  if (Array.isArray(cleaned.ingredientDetails)) {
    cleaned.ingredientDetails = cleaned.ingredientDetails
      .filter((d: any) => d && d.ingredientId)
      .map((d: any) => ({
        ingredientId: d.ingredientId,
        quantity: d.quantity !== undefined && d.quantity !== null ? Number(d.quantity) : null,
        unit: d.unit || null,
      }));
  }

  if (Array.isArray(cleaned.steps)) {
    cleaned.steps = cleaned.steps
      .map((s: any, idx: number) => ({
        stepNumber: s?.stepNumber ?? idx + 1,
        instruction: s?.instruction ?? '',
        imageUrl: s?.imageUrl ?? null,
      }))
      .filter((s: any) => (s.instruction && s.instruction.trim() !== '') || s.imageUrl);
  }

  if (cleaned.prepTime !== undefined) cleaned.prepTime = Number(cleaned.prepTime) || 0;
  if (cleaned.cookTime !== undefined) cleaned.cookTime = Number(cleaned.cookTime) || 0;
  if (cleaned.servings !== undefined) cleaned.servings = Number(cleaned.servings) || 0;

  return cleaned;
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
