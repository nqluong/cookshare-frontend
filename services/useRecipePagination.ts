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
      
      if (response.success && response.data) {
        const newRecipes = response.data.content || [];
        setRecipes(prev => {
          const merged = [...prev, ...newRecipes];
          // Remove duplicates
          const unique = merged.filter(
            (r, i, self) => i === self.findIndex(x => x.recipeId === r.recipeId)
          );
          return unique;
        });
        setPage(nextPage);
        setHasMore(!response.data.last);
      }
    } catch (err: any) {
      console.error('Error loading more recipes:', err);
    } finally {
      setIsLoadingMore(false);
    }
  };

  const reset = (initialRecipes: Recipe[] = []) => {
    setRecipes(initialRecipes);
    setPage(0);
    setHasMore(true);
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