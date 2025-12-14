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
  validateStatus: (status) => status < 500,
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

    console.log("📋 Original recipe data from frontend:", {
      title: jsonData.title,
      newCategories: jsonData.newCategories?.length || 0,
      newTags: jsonData.newTags?.length || 0,
      newIngredients: jsonData.newIngredients?.length || 0,
      categoryIds: jsonData.categoryIds?.length || 0,
      tagIds: jsonData.tagIds?.length || 0,
      ingredientDetails: jsonData.ingredientDetails?.length || 0,
      steps: jsonData.steps?.length || 0,
    });

    // ✅ LOG CHI TIẾT newIngredients và ingredientDetails
    if (jsonData.newIngredients && jsonData.newIngredients.length > 0) {
      console.log("🔍 newIngredients structure:", JSON.stringify(jsonData.newIngredients, null, 2));
    }

    if (jsonData.ingredientDetails && jsonData.ingredientDetails.length > 0) {
      console.log("🔍 ingredientDetails structure:", JSON.stringify(jsonData.ingredientDetails, null, 2));
    }

    // ✅ Tạo FormData mới - GỬI NGUYÊN DATA
    const uploadForm = new FormData();
    uploadForm.append("data", JSON.stringify(jsonData));

    if (image) uploadForm.append("image", image as any);

    if (stepImages?.length) {
      stepImages.forEach((si: any) => uploadForm.append("stepImages", si));
    }

    console.log("📤 Sending to backend:", {
      hasImage: !!image,
      stepImagesCount: stepImages.length,
      dataKeys: Object.keys(jsonData)
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

    console.log("✅ Recipe created successfully:", {
      id: res.data.recipeId,
      title: res.data.title,
    });

    return res.data;
  } catch (error) {
    console.error("❌ Recipe creation failed:", error);
    handleError(error);
  }
};

// ✅ Cập nhật công thức - IMPROVED VERSION
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
        existingStepsWithImages: jsonData.steps?.filter((s: any) => s.imageUrl).length || 0,
        newCategories: jsonData.newCategories?.length || 0,
        newTags: jsonData.newTags?.length || 0,
        newIngredients: jsonData.newIngredients?.length || 0,
      });

      // ✅ VALIDATION: Đảm bảo ingredientDetails có đủ thông tin
      if (jsonData.ingredientDetails && jsonData.ingredientDetails.length > 0) {
        console.log("🔍 Before validation - ingredientDetails:",
          JSON.stringify(jsonData.ingredientDetails, null, 2)
        );

        jsonData.ingredientDetails = jsonData.ingredientDetails.map((detail: any, idx: number) => {
          if (!detail.ingredientId) {
            console.warn(`⚠️ ingredientDetails[${idx}] missing ingredientId`);
          }
          return {
            ingredientId: detail.ingredientId,
            quantity: detail.quantity !== undefined ? detail.quantity : 0,
            unit: detail.unit || "",
            notes: detail.notes || "",
            orderIndex: detail.orderIndex !== undefined ? detail.orderIndex : idx
          };
        });

        console.log("✅ After validation - ingredientDetails:",
          JSON.stringify(jsonData.ingredientDetails, null, 2)
        );
      }

      // ✅ LOG CHI TIẾT về newIngredients
      if (jsonData.newIngredients && jsonData.newIngredients.length > 0) {
        console.log("🆕 New ingredients to be created:",
          jsonData.newIngredients.map((i: any) => ({
            name: i.name,
            category: i.category
          }))
        );
      }

      // ✅ LOG CHI TIẾT về steps có ảnh
      if (jsonData.steps && jsonData.steps.length > 0) {
        console.log("📋 Steps image summary:");
        jsonData.steps.forEach((step: any, idx: number) => {
          const imageStatus = step.imageUrl
            ? (step.imageUrl.startsWith('http') ? '🔗 OLD URL' : '🆕 NEW')
            : '❌ NO IMAGE';
          console.log(`  Step ${step.stepNumber || idx + 1}: ${imageStatus}`,
            step.imageUrl ? `(${step.imageUrl.substring(0, 50)}...)` : ''
          );
        });
      }

      // ✅ LOG CHI TIẾT về step images files
      if (stepImages && stepImages.length > 0) {
        console.log("📸 Step images being uploaded:");
        stepImages.forEach((si: any, idx: number) => {
          const fileName = si instanceof File ? si.name : "unknown";
          console.log(`  [${idx + 1}] ${fileName}`);
        });
      }

      // ✅ GỬI NGUYÊN DATA - KHÔNG XÓA GÌ CẢ
      const uploadForm = new FormData();
      uploadForm.append("data", JSON.stringify(jsonData));

      if (data.get("image")) {
        uploadForm.append("image", data.get("image") as any);
        console.log("📷 Featured image will be updated");
      }

      if (stepImages && stepImages.length > 0) {
        stepImages.forEach((si: any) => uploadForm.append("stepImages", si));
      }

      console.log("📤 Final FormData being sent with:", {
        hasData: !!uploadForm.get("data"),
        hasImage: !!uploadForm.get("image"),
        stepImagesCount: stepImages.length
      });

      const res = await api.put(`/${id}`, uploadForm, {
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
        id: res.data?.recipeId,
        title: res.data?.title,
        stepsCount: res.data?.steps?.length || 0,
        stepsWithImages: res.data?.steps?.filter((s: any) => s.imageUrl).length || 0,
        categories: res.data?.categories?.length || 0,
        tags: res.data?.tags?.length || 0,
        ingredients: res.data?.ingredients?.length || 0,
      });

      return res.data;
    }

    // ✅ Nếu không phải FormData, gửi nguyên data
    console.log("📤 Updating recipe with JSON data:", id);
    const res = await api.put(`/${id}`, data);
    console.log("✅ Recipe updated (JSON mode):", res.data?.title);
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
export const getAllRecipesByUserId = async (userId: string, currentUserId?: string) => {
  try {
    const token = await AsyncStorage.getItem("access_token");
    const headers = {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
    };

    // Nếu đang xem profile của chính mình, thêm includeAll=true để lấy cả công thức đang chờ duyệt
    const isOwnProfile = currentUserId && userId === currentUserId;
    let url = `/user/${userId}`;
    const params: string[] = [];

    if (currentUserId) {
      params.push(`currentUserId=${currentUserId}`);
    }
    if (isOwnProfile) {
      params.push('includeAll=true');
    }

    if (params.length > 0) {
      url += `?${params.join('&')}`;
    }

    const res = await api.get(url, { headers });
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

// ✅ Toggle privacy (công khai/riêng tư)
export const togglePrivacy = async (recipeId: string) => {
  try {
    console.log(`🔄 Toggling privacy for recipe ${recipeId}...`);
    const res = await api.put(`/${recipeId}/toggle-privacy`);
    console.log(`✅ Privacy toggled successfully`);
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
  togglePrivacy,
};