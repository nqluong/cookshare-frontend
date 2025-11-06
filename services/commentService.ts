import { API_CONFIG } from '@/config/api.config';
import { CommentRequest, CommentResponse, PaginatedComments } from '@/types/comment';
import AsyncStorage from '@react-native-async-storage/async-storage';

const BASE_URL = API_CONFIG.BASE_URL;

class CommentService {
  private async getAuthToken(): Promise<string | null> {
    return await AsyncStorage.getItem('access_token');
  }

  private async fetchWithTimeout(url: string, options: RequestInit, timeout = 30000) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);
    const response = await fetch(url, { ...options, signal: controller.signal });
    clearTimeout(timeoutId);
    return response;
  }

  // 📜 Lấy danh sách bình luận theo recipe (phân trang)
  async getCommentsByRecipe(recipeId: string, page: number = 0, size: number = 20): Promise<CommentResponse[]> {
    try {
      const token = await this.getAuthToken();
      const url = `${BASE_URL}/comments/recipe/${recipeId}?page=${page}&size=${size}`;

      const response = await this.fetchWithTimeout(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { Authorization: `Bearer ${token}` }),
        },
      });

      if (!response.ok) throw new Error(await response.text() || 'Không thể tải bình luận');
      const data: PaginatedComments = await response.json();
      return data.content;
    } catch (error: any) {
      console.error('Error fetching comments:', error);
      throw error;
    }
  }

  // 💬 Lấy danh sách trả lời (replies)
  async getReplies(commentId: string): Promise<CommentResponse[]> {
    try {
      const token = await this.getAuthToken();
      const response = await this.fetchWithTimeout(`${BASE_URL}/comments/${commentId}/replies`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { Authorization: `Bearer ${token}` }),
        },
      });

      if (!response.ok) throw new Error(await response.text() || 'Không thể tải trả lời');
      return await response.json();
    } catch (error: any) {
      console.error('Error fetching replies:', error);
      throw error;
    }
  }

  // ✍️ Tạo bình luận mới
  async createComment(request: CommentRequest): Promise<CommentResponse> {
    try {
      const token = await this.getAuthToken();
      const response = await this.fetchWithTimeout(`${BASE_URL}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: JSON.stringify(request),
      });

      if (!response.ok) throw new Error(await response.text() || 'Không thể tạo bình luận');
      return await response.json();
    } catch (error: any) {
      console.error('Error creating comment:', error);
      throw error;
    }
  }

  // 📝 Cập nhật bình luận
  async updateComment(commentId: string, content: string): Promise<CommentResponse> {
    try {
      const token = await this.getAuthToken();
      const response = await this.fetchWithTimeout(`${BASE_URL}/comments/${commentId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: JSON.stringify({ content }),
      });

      if (!response.ok) throw new Error(await response.text() || 'Không thể cập nhật bình luận');
      return await response.json();
    } catch (error: any) {
      console.error('Error updating comment:', error);
      throw error;
    }
  }

  // 🗑️ Xóa bình luận
  async deleteComment(commentId: string): Promise<void> {
    try {
      const token = await this.getAuthToken();
      const response = await this.fetchWithTimeout(`${BASE_URL}/comments/${commentId}`, {
        method: 'DELETE',
        headers: {
          ...(token && { Authorization: `Bearer ${token}` }),
        },
      });

      if (!response.ok) throw new Error(await response.text() || 'Không thể xóa bình luận');
    } catch (error: any) {
      console.error('Error deleting comment:', error);
      throw error;
    }
  }
}

export const commentService = new CommentService();
