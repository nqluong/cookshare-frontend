// services/useRecipePagination.ts (đã sửa – hỗ trợ cả 2 kiểu API)
import { Recipe } from '@/types/dish';
import { useState } from 'react';

interface PaginationConfig {
  fetchFunction: (page: number, size: number) => Promise<any>;
  pageSize?: number;
}

export const useRecipePagination = ({ fetchFunction, pageSize = 10 }: PaginationConfig) => {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const loadMore = async () => {
    if (isLoadingMore || !hasMore) return;

    try {
      setIsLoadingMore(true);
      const nextPage = page + 1;
      const response = await fetchFunction(nextPage, pageSize);

      let content: any[] = [];
      let isLast = true;

      // Hỗ trợ cả 2 kiểu response
      if (response.success && response.data) {
        // Kiểu cũ: trending, popular, newest...
        content = response.data.content || [];
        isLast = response.data.last ?? false;
      } 
      else if (response.code === 1000 && response.result) {
        // Kiểu mới: getLikedRecipes, getRecipebyFollowing...
        content = response.result.content || [];
        isLast = response.result.last ?? true;
      }
      // Nếu cả 2 đều không match → bỏ qua

      // Xử lý dữ liệu chung
      if (content.length > 0) {
        const newRecipes = content
          .map((item: any) => item?.recipe || item) // vì getLikedRecipes bọc thêm { recipe: ... }
          .filter((r: any) => r && r.recipeId);

        setRecipes(prev => {
          const merged = [...prev, ...newRecipes];
          const unique = merged.filter(
            (r, i, self) => i === self.findIndex(x => x.recipeId === r.recipeId)
          );
          return unique;
        });
      }

      setPage(nextPage);
      setHasMore(!isLast && content.length >= pageSize); // thêm điều kiện an toàn

    } catch (err: any) {
      console.log('Error loading more recipes:', err);
    } finally {
      setIsLoadingMore(false);
    }
  };

  const reset = (initialRecipes: Recipe[] = []) => {
    setRecipes(initialRecipes);
    setPage(initialRecipes.length > 0 ? 1 : 0); // nếu có data → page tiếp theo là 1
    setHasMore(initialRecipes.length >= pageSize);
    setIsLoadingMore(false);
  };

  const updateRecipe = (recipeId: string, updates: Partial<Recipe>) => {
    setRecipes(prev => prev.map(recipe =>
      recipe.recipeId === recipeId
        ? { ...recipe, ...updates }
        : recipe
    ));
  };

  return {
    recipes,
    page,
    hasMore,
    isLoadingMore,
    loadMore,
    reset,
    updateRecipe,
    setRecipes
  };
};