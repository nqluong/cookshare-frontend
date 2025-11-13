import { isRecipeLiked, likeRecipe, unlikeRecipe } from '@/services/homeService';
import { useEffect, useRef, useState } from 'react';

export const useRecipeLike = () => {
  const [likedRecipes, setLikedRecipes] = useState<Set<string>>(new Set());
  const [likingRecipeId, setLikingRecipeId] = useState<string | null>(null);

  const likeTimersRef = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());
  const likeStatesRef = useRef<Map<string, { initialState: boolean; clickCount: number }>>(new Map());

  // Cleanup timers khi unmount
  useEffect(() => {
    return () => {
      likeTimersRef.current.forEach(timer => clearTimeout(timer));
      likeTimersRef.current.clear();
      likeStatesRef.current.clear();
    };
  }, []);

  // Check liked status cho nhiều recipes
  const checkLikedStatus = async (recipeIds: string[]) => {
    const likePromises = recipeIds.map(async (recipeId: string) => {
      try {
        const response = await isRecipeLiked(recipeId);
        return { recipeId, isLiked: response.result };
      } catch (error) {
        console.log(`Lỗi khi kiểm tra like cho recipeId ${recipeId}:`, error);
        return { recipeId, isLiked: false };
      }
    });

    const likeResults = await Promise.all(likePromises);
    const likedSet = new Set(likeResults.filter(r => r.isLiked).map(r => r.recipeId));
    setLikedRecipes(likedSet);
    return likedSet;
  };

  // Optimistic update
  const optimisticToggleLike = (recipeId: string, onUpdateCount: (delta: number) => void) => {
    const isCurrentlyLiked = likedRecipes.has(recipeId);

    setLikedRecipes(prev => {
      const newSet = new Set(prev);
      if (isCurrentlyLiked) {
        newSet.delete(recipeId);
      } else {
        newSet.add(recipeId);
      }
      return newSet;
    });

    onUpdateCount(isCurrentlyLiked ? -1 : +1);
  };

  // Toggle like với debounce
  const toggleLike = async (
    recipeId: string,
    onUpdateCount: (delta: number) => void,
    onSuccess?: (recipeId: string, isLiked: boolean) => void
  ) => {
    let likeState = likeStatesRef.current.get(recipeId);

    if (!likeState) {
      likeState = {
        initialState: likedRecipes.has(recipeId),
        clickCount: 0
      };
      likeStatesRef.current.set(recipeId, likeState);
    }

    likeState.clickCount++;

    const existingTimer = likeTimersRef.current.get(recipeId);
    if (existingTimer) clearTimeout(existingTimer);

    optimisticToggleLike(recipeId, onUpdateCount);

    const timer = setTimeout(async () => {
      try {
        const state = likeStatesRef.current.get(recipeId);
        if (!state) return;

        const shouldToggle = state.clickCount % 2 === 1;
        if (!shouldToggle) {
          likeStatesRef.current.delete(recipeId);
          return;
        }

        const finalState = !state.initialState;

        if (finalState) {
          const response = await likeRecipe(recipeId);
          if (response.code !== 1000 || !response.result) {
            // Rollback
            setLikedRecipes(prev => {
              const newSet = new Set(prev);
              newSet.delete(recipeId);
              return newSet;
            });
            onUpdateCount(-1);
            console.warn('Không thể like công thức, đã rollback');
          } else {
            onSuccess?.(recipeId, true);
          }
        } else {
          try {
            const response = await unlikeRecipe(recipeId);
            if (response.code !== 1000) {
              // Rollback
              setLikedRecipes(prev => {
                const newSet = new Set(prev);
                newSet.add(recipeId);
                return newSet;
              });
              onUpdateCount(+1);
              console.warn('Không thể bỏ like công thức, đã rollback');
            } else {
              onSuccess?.(recipeId, false);
            }
          } catch (error: any) {
            if (error.message !== 'Công thức chưa được thích') {
              setLikedRecipes(prev => {
                const newSet = new Set(prev);
                newSet.add(recipeId);
                return newSet;
              });
              onUpdateCount(+1);
            }
          }
        }
      } catch (error: any) {
        console.log('Lỗi khi xử lý like/unlike:', error.message || error);
      } finally {
        likeTimersRef.current.delete(recipeId);
        likeStatesRef.current.delete(recipeId);
      }
    }, 1800);

    likeTimersRef.current.set(recipeId, timer);
  };

  return {
    likedRecipes,
    likingRecipeId,
    checkLikedStatus,
    toggleLike,
    setLikedRecipes
  };
};