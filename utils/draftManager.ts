// 📁 utils/draftManager.ts
// Quản lý lưu trữ draft recipe trên AsyncStorage (React Native)

import AsyncStorage from '@react-native-async-storage/async-storage';
import { DraftMetadata, RecipeDraft } from '../types/recipe';

const DRAFT_KEY = '@cookshare_recipe_drafts';
const MAX_DRAFTS = 10;

/**
 * Lưu draft mới hoặc cập nhật draft hiện có
 */
export const saveDraft = async (draft: RecipeDraft): Promise<string> => {
  try {
    const drafts = await getDrafts();
    const draftId = draft.draftId || `draft_${Date.now()}`;
    
    const draftData: RecipeDraft = {
      ...draft,
      draftId,
      lastModified: new Date().toISOString(),
      version: 1
    };
    
    drafts[draftId] = draftData;
    
    // Giới hạn số lượng draft
    const draftIds = Object.keys(drafts);
    if (draftIds.length > MAX_DRAFTS) {
      const oldestId = draftIds.sort((a, b) => 
        new Date(drafts[a].lastModified).getTime() - new Date(drafts[b].lastModified).getTime()
      )[0];
      delete drafts[oldestId];
      console.log(`🗑️ Đã xóa draft cũ: ${oldestId}`);
    }
    
    await AsyncStorage.setItem(DRAFT_KEY, JSON.stringify(drafts));
    console.log(`✅ Draft đã lưu: ${draftId}`);
    
    return draftId;
  } catch (error) {
    console.error('❌ Lỗi khi lưu draft:', error);
    throw error;
  }
};

/**
 * Lấy tất cả draft
 */
export const getDrafts = async (): Promise<Record<string, RecipeDraft>> => {
  try {
    const data = await AsyncStorage.getItem(DRAFT_KEY);
    return data ? JSON.parse(data) : {};
  } catch (error) {
    console.error('❌ Lỗi khi đọc draft:', error);
    return {};
  }
};

/**
 * Lấy một draft cụ thể
 */
export const getDraft = async (draftId: string): Promise<RecipeDraft | null> => {
  try {
    const drafts = await getDrafts();
    return drafts[draftId] || null;
  } catch (error) {
    console.error('❌ Lỗi khi lấy draft:', error);
    return null;
  }
};

/**
 * Xóa một draft
 */
export const deleteDraft = async (draftId: string): Promise<void> => {
  try {
    const drafts = await getDrafts();
    delete drafts[draftId];
    await AsyncStorage.setItem(DRAFT_KEY, JSON.stringify(drafts));
    console.log(`🗑️ Draft đã xóa: ${draftId}`);
  } catch (error) {
    console.error('❌ Lỗi khi xóa draft:', error);
    throw error;
  }
};

/**
 * Xóa tất cả draft
 */
export const clearAllDrafts = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem(DRAFT_KEY);
    console.log('🗑️ Đã xóa tất cả draft');
  } catch (error) {
    console.error('❌ Lỗi khi xóa tất cả draft:', error);
    throw error;
  }
};

/**
 * Lấy danh sách draft metadata (để hiển thị list)
 */
export const getDraftList = async (): Promise<DraftMetadata[]> => {
  try {
    const drafts = await getDrafts();
    return Object.values(drafts)
      .map(draft => ({
        draftId: draft.draftId,
        title: draft.title || '(Chưa có tiêu đề)',
        lastModified: draft.lastModified,
        stepsCount: draft.steps?.filter(s => s.description.trim()).length || 0,
        ingredientsCount: draft.selectedIngredients?.length || 0
      }))
      .sort((a, b) => 
        new Date(b.lastModified).getTime() - new Date(a.lastModified).getTime()
      );
  } catch (error) {
    console.error('❌ Lỗi khi lấy danh sách draft:', error);
    return [];
  }
};

/**
 * Kiểm tra có draft nào tồn tại không
 */
export const hasDrafts = async (): Promise<boolean> => {
  try {
    const drafts = await getDrafts();
    return Object.keys(drafts).length > 0;
  } catch (error) {
    return false;
  }
};

/**
 * Đếm số lượng draft
 */
export const countDrafts = async (): Promise<number> => {
  try {
    const drafts = await getDrafts();
    return Object.keys(drafts).length;
  } catch (error) {
    return 0;
  }
};