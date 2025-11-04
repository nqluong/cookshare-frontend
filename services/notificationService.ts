import { API_CONFIG } from '@/config/api.config';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Notification, NotificationResponse } from '../types/notification';

const BASE_URL = API_CONFIG.BASE_URL;

interface PaginatedNotifications {
  content: Notification[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
}

class NotificationService {
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

  // 🔔 Lấy danh sách thông báo
  async getNotifications(userId: string, page = 0, size = 20): Promise<NotificationResponse> {
    try {
      const token = await this.getAuthToken();
      const response = await this.fetchWithTimeout(`${BASE_URL}/notifications?page=${page}&size=${size}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { Authorization: `Bearer ${token}` }),
        },
      });

      if (!response.ok) throw new Error(await response.text() || 'Không thể tải thông báo');
      const data: PaginatedNotifications = await response.json();

      return {
        notifications: data.content,
        pagination: {
          currentPage: data.number,
          totalPages: data.totalPages,
          totalItems: data.totalElements,
          itemsPerPage: data.size,
          isFirst: data.first,
          isLast: data.last,
        },
      };
    } catch (error: any) {
      console.error('Error fetching notifications:', error);
      throw error;
    }
  }

  // 🔢 Đếm số thông báo chưa đọc
  async getUnreadCount(userId: string): Promise<number> {
    try {
      const token = await this.getAuthToken();
      const response = await this.fetchWithTimeout(`${BASE_URL}/notifications/unread-count`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { Authorization: `Bearer ${token}` }),
        },
      });

      if (!response.ok) throw new Error(await response.text());
      const data = await response.json();
      return data.unreadCount;
    } catch (error) {
      console.error('Error fetching unread count:', error);
      return 0;
    }
  }

  // ✅ Đánh dấu 1 thông báo là đã đọc
  async markAsRead(userId: string, notificationId: string): Promise<Notification> {
    try {
      const token = await this.getAuthToken();
      const response = await this.fetchWithTimeout(`${BASE_URL}/notifications/${notificationId}/read`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: JSON.stringify({}),
      });

      if (!response.ok) throw new Error(await response.text() || 'Không thể cập nhật thông báo');
      return await response.json();
    } catch (error: any) {
      console.error('Error marking notification as read:', error);
      throw error;
    }
  }

  // ✅ Đánh dấu tất cả là đã đọc
  async markAllAsRead(userId: string): Promise<void> {
    try {
      const token = await this.getAuthToken();
      const response = await this.fetchWithTimeout(`${BASE_URL}/notifications/read-all`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: JSON.stringify({}),
      });

      if (!response.ok) throw new Error(await response.text() || 'Không thể cập nhật thông báo');
    } catch (error: any) {
      console.error('Error marking all as read:', error);
      throw error;
    }
  }

  // 🗑️ Xóa 1 thông báo
  async deleteNotification(userId: string, notificationId: string): Promise<void> {
    try {
      const token = await this.getAuthToken();
      const response = await this.fetchWithTimeout(`${BASE_URL}/notifications/${notificationId}`, {
        method: 'DELETE',
        headers: {
          ...(token && { Authorization: `Bearer ${token}` }),
        },
      });

      if (!response.ok) throw new Error(await response.text() || 'Không thể xóa thông báo');
    } catch (error: any) {
      console.error('Error deleting notification:', error);
      throw error;
    }
  }
}

export const notificationService = new NotificationService();
