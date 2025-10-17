import { ApiResponse, ErrorResponse } from '../types/search';

export const BASE_URL = 'http://192.168.43.36:8080';

const fetchApi = async (url: string) => {
  try {
    const response = await fetch(url);
    const data = await response.json();
    return data;
  } catch (err) {
    throw new Error('Không thể kết nối đến server');
  }
};

export const searchRecipes = async (
  searchQuery: string,
  selectedIngredients: string[]
): Promise<ApiResponse | ErrorResponse> => {
  let url = '';
  if (selectedIngredients.length > 0) {
    const ingredientsParam = encodeURIComponent(selectedIngredients.join(','));
    url = `${BASE_URL}/searchs/ingredient?title=${encodeURIComponent(
      searchQuery
    )}&ingredients=${ingredientsParam}&page=0&size=10`;
    console.log('✅ Calling API WITH ingredients:', url);
  } else {
    url = `${BASE_URL}/searchs/recipe?title=${encodeURIComponent(
      searchQuery
    )}&page=0&size=10&sortBy=title&direction=ASC`;
    console.log('✅ Calling API WITHOUT ingredients:', url);
  }
  return fetchApi(url);
};