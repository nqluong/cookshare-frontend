// 📁 hooks/useAutosave.ts
// Hook tự động lưu draft recipe (React Native)

import { useEffect, useRef, useState } from 'react';
import { RecipeDraft } from '../types/recipe';
import { saveDraft } from '../utils/draftManager';

interface UseAutosaveReturn {
  lastSaved: Date | null;
  isSaving: boolean;
  forceSave: () => Promise<void>;
}

/**
 * Hook tự động lưu draft
 * @param formData - Dữ liệu form cần lưu
 * @param delay - Thời gian chờ (ms) trước khi lưu (default: 3000ms)
 * @param enabled - Bật/tắt autosave (default: true)
 */
export const useAutosave = (
  formData: RecipeDraft,
  delay: number = 3000,
  enabled: boolean = true
): UseAutosaveReturn => {
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const timeoutRef = useRef<number | null>(null);
  const previousDataRef = useRef<string | null>(null);

  // Kiểm tra xem dữ liệu có thay đổi không
  const hasChanged = (): boolean => {
    const currentData = JSON.stringify(formData);
    if (!previousDataRef.current) return true;
    return currentData !== previousDataRef.current;
  };

  // Kiểm tra form có nội dung tối thiểu không
  const hasMinimumContent = (): boolean => {
    return !!(formData.title && formData.title.trim().length > 0);
  };

  // Hàm lưu draft
  const saveNow = async (): Promise<void> => {
    if (!hasMinimumContent()) {
      console.log('⚠️ Không có nội dung tối thiểu để lưu');
      return;
    }

    if (!hasChanged()) {
      console.log('ℹ️ Dữ liệu không thay đổi, bỏ qua lưu');
      return;
    }

    setIsSaving(true);
    
    try {
      const draftId = await saveDraft(formData);
      setLastSaved(new Date());
      previousDataRef.current = JSON.stringify(formData);
      
      // Cập nhật draftId vào formData nếu chưa có
      if (!formData.draftId) {
        formData.draftId = draftId;
      }
      
      console.log('💾 Autosave thành công');
    } catch (error) {
      console.error('❌ Autosave thất bại:', error);
    } finally {
      setIsSaving(false);
    }
  };

  // Effect để tự động lưu
  useEffect(() => {
    if (!enabled) return;

    // Clear timeout cũ
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Đặt timeout mới
    timeoutRef.current = setTimeout(() => {
      saveNow();
    }, delay);

    // Cleanup
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [formData, delay, enabled]);

  return {
    lastSaved,
    isSaving,
    forceSave: saveNow
  };
};