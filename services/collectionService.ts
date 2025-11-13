import { API_CONFIG } from "@/config/api.config";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";
import {
  AddRecipeToCollectionRequest,
  ApiResponse,
  CollectionResponse,
  CollectionUserDto,
  CreateCollectionRequest,
  PageResponse,
  UpdateCollectionRequest,
} from "../types/collection.types";

export const API_BASE_URL = API_CONFIG.BASE_URL;

class CollectionService {
  constructor() {
    console.log(`🔧 CollectionService initialized for ${Platform.OS}`);
    console.log(`📡 API Base URL: ${API_BASE_URL}`);
  }

  private async getAuthToken(): Promise<string | null> {
    return await AsyncStorage.getItem("access_token");
  }

  // Tạo bộ sưu tập mới
  async createCollection(
    userId: string,
    request: CreateCollectionRequest
  ): Promise<ApiResponse<CollectionResponse>> {
    try {
      console.log("Creating collection for user:", userId);
      const token = await this.getAuthToken();

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000);

      const response = await fetch(
        `${API_BASE_URL}/users/${userId}/collections`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(token && { Authorization: `Bearer ${token}` }),
          },
          body: JSON.stringify(request),
          signal: controller.signal,
        }
      );

      clearTimeout(timeoutId);
      console.log("Create collection response status:", response.status);

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || "Không thể tạo bộ sưu tập");
      }

      const result = await response.json();
      console.log("Create collection successful");
      return result;
    } catch (error: any) {
      console.log("Create collection error:", error);
      if (error.name === "AbortError") {
        throw new Error("Timeout - Không thể kết nối đến server");
      }
      throw error;
    }
  }

  // Lấy danh sách bộ sưu tập của user
  async getUserCollections(
    userId: string,
    page: number = 0,
    size: number = 20
  ): Promise<ApiResponse<PageResponse<CollectionUserDto>>> {
    try {
      console.log("Getting collections for user:", userId);
      const token = await this.getAuthToken();

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000);

      const response = await fetch(
        `${API_BASE_URL}/users/${userId}/collections?page=${page}&size=${size}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            ...(token && { Authorization: `Bearer ${token}` }),
          },
          signal: controller.signal,
        }
      );

      clearTimeout(timeoutId);
      console.log("Get collections response status:", response.status);

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || "Không thể lấy danh sách bộ sưu tập");
      }

      const result = await response.json();
      console.log(
        "Get collections successful, count:",
        result.data.totalElements
      );
      return result;
    } catch (error: any) {
      console.log("Get collections error:", error);
      if (error.name === "AbortError") {
        throw new Error("Timeout - Không thể kết nối đến server");
      }
      throw error;
    }
  }

  // Lấy danh sách public bộ sưu tập của user
  async getPublicCollections(
    userId: string,
    page: number = 0,
    size: number = 20
  ): Promise<ApiResponse<PageResponse<CollectionUserDto>>> {
    try {
      console.log("Getting public collections for user:", userId);
      const token = await this.getAuthToken();

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000);

      const response = await fetch(
        `${API_BASE_URL}/users/${userId}/collections/public?page=${page}&size=${size}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            ...(token && { Authorization: `Bearer ${token}` }),
          },
          signal: controller.signal,
        }
      );

      clearTimeout(timeoutId);
      console.log("Get public collections response status:", response.status);

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          errorText || "Không thể lấy danh sách bộ sưu tập công khai"
        );
      }

      const result = await response.json();
      console.log("Get public collections successful");
      return result;
    } catch (error: any) {
      console.log("Get public collections error:", error);
      if (error.name === "AbortError") {
        throw new Error("Timeout - Không thể kết nối đến server");
      }
      throw error;
    }
  }

  // Lấy chi tiết bộ sưu tập
  async getCollectionDetail(
    userId: string,
    collectionId: string
  ): Promise<ApiResponse<CollectionUserDto>> {
    try {
      console.log("Getting collection detail:", collectionId);
      const token = await this.getAuthToken();

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000);

      const response = await fetch(
        `${API_BASE_URL}/users/${userId}/collections/${collectionId}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            ...(token && { Authorization: `Bearer ${token}` }),
          },
          signal: controller.signal,
        }
      );

      clearTimeout(timeoutId);
      console.log("Get collection detail response status:", response.status);

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || "Không thể lấy chi tiết bộ sưu tập");
      }

      const result = await response.json();
      console.log("Get collection detail successful");
      return result;
    } catch (error: any) {
      console.log("Get collection detail error:", error);
      if (error.name === "AbortError") {
        throw new Error("Timeout - Không thể kết nối đến server");
      }
      throw error;
    }
  }

  // Cập nhật bộ sưu tập
  async updateCollection(
    userId: string,
    collectionId: string,
    request: UpdateCollectionRequest
  ): Promise<ApiResponse<CollectionResponse>> {
    try {
      console.log("Updating collection:", collectionId);
      const token = await this.getAuthToken();

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000);

      const response = await fetch(
        `${API_BASE_URL}/users/${userId}/collections/${collectionId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            ...(token && { Authorization: `Bearer ${token}` }),
          },
          body: JSON.stringify(request),
          signal: controller.signal,
        }
      );

      clearTimeout(timeoutId);
      console.log("Update collection response status:", response.status);

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || "Không thể cập nhật bộ sưu tập");
      }

      const result = await response.json();
      console.log("Update collection successful");
      return result;
    } catch (error: any) {
      console.log("Update collection error:", error);
      if (error.name === "AbortError") {
        throw new Error("Timeout - Không thể kết nối đến server");
      }
      throw error;
    }
  }

  // Xóa bộ sưu tập
  async deleteCollection(userId: string, collectionId: string): Promise<void> {
    try {
      console.log("Deleting collection:", collectionId);
      const token = await this.getAuthToken();

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000);

      const response = await fetch(
        `${API_BASE_URL}/users/${userId}/collections/${collectionId}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            ...(token && { Authorization: `Bearer ${token}` }),
          },
          signal: controller.signal,
        }
      );

      clearTimeout(timeoutId);
      console.log("Delete collection response status:", response.status);

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || "Không thể xóa bộ sưu tập");
      }

      console.log("Delete collection successful");
    } catch (error: any) {
      console.log("Delete collection error:", error);
      if (error.name === "AbortError") {
        throw new Error("Timeout - Không thể kết nối đến server");
      }
      throw error;
    }
  }

  // Lấy danh sách công thức trong collection
  async getCollectionRecipes(
    userId: string,
    collectionId: string,
    page: number = 0,
    size: number = 20
  ) {
    try {
      const token = await this.getAuthToken();
      const response = await fetch(
        `${API_CONFIG.BASE_URL}/users/${userId}/collections/${collectionId}/recipes?page=${page}&size=${size}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) throw new Error("Failed to fetch recipes");
      const data = await response.json();
      return data.data;
    } catch (error) {
      console.log("Error fetching collection recipes:", error);
      throw error;
    }
  }

  // Thêm recipe vào bộ sưu tập
  async addRecipeToCollection(
    userId: string,
    collectionId: string,
    request: AddRecipeToCollectionRequest
  ): Promise<void> {
    try {
      console.log("Adding recipe to collection:", collectionId);
      const token = await this.getAuthToken();

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000);

      const response = await fetch(
        `${API_BASE_URL}/users/${userId}/collections/${collectionId}/recipes`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(token && { Authorization: `Bearer ${token}` }),
          },
          body: JSON.stringify(request),
          signal: controller.signal,
        }
      );

      clearTimeout(timeoutId);
      console.log("Add recipe response status:", response.status);

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || "Không thể thêm công thức vào bộ sưu tập");
      }

      console.log("Add recipe successful");
    } catch (error: any) {
      console.log("Add recipe error:", error);
      if (error.name === "AbortError") {
        throw new Error("Timeout - Không thể kết nối đến server");
      }
      throw error;
    }
  }

  // Xóa recipe khỏi bộ sưu tập
  async removeRecipeFromCollection(
    userId: string,
    collectionId: string,
    recipeId: string
  ): Promise<void> {
    try {
      console.log("Removing recipe from collection:", collectionId);
      const token = await this.getAuthToken();

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000);

      const response = await fetch(
        `${API_BASE_URL}/users/${userId}/collections/${collectionId}/recipes/${recipeId}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            ...(token && { Authorization: `Bearer ${token}` }),
          },
          signal: controller.signal,
        }
      );

      clearTimeout(timeoutId);
      console.log("Remove recipe response status:", response.status);

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || "Không thể xóa công thức khỏi bộ sưu tập");
      }

      console.log("Remove recipe successful");
    } catch (error: any) {
      console.log("Remove recipe error:", error);
      if (error.name === "AbortError") {
        throw new Error("Timeout - Không thể kết nối đến server");
      }
      throw error;
    }
  }

  // Upload cover image cho collection
  async uploadCoverImage(formData: FormData, signal: AbortSignal): Promise<{ url: string }> {
    try {
      console.log("Uploading cover image...");
      const token = await this.getAuthToken();

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000);

      const response = await fetch(`${API_BASE_URL}/users/upload`, {
        method: "POST",
        headers: {
          ...(token && { Authorization: `Bearer ${token}` }),
          // Không set Content-Type vì FormData tự động set
        },
        body: formData,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorText = await response.text();
        console.log("Upload error response:", errorText);
        throw new Error(errorText || "Không thể upload ảnh bìa");
      }

      const data = await response.json();
      console.log("Upload successful:", data);
      return data;
    } catch (error: any) {
      console.log("Error uploading cover image:", error);
      if (error.name === "AbortError") {
        throw new Error("Timeout - Không thể kết nối đến server");
      }
      throw error;
    }
  }
}

export const collectionService = new CollectionService();
