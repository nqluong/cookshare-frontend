
import AsyncStorage from '@react-native-async-storage/async-storage'; // cần cài package này
import { API_CONFIG } from '../config/api.config';
import { ApiResponse, ErrorResponse, Ingredient, IngredientsResponse } from '../types/search';

export const BASE_URL = API_CONFIG.BASE_URL;

const getToken = async (): Promise<string | null> => {
  try {
    const token = await AsyncStorage.getItem('authToken');
    return token;
  } catch (error) {
    console.error('Lỗi khi lấy token từ AsyncStorage:', error);
    return null;
  }
};

const fetchApi = async (url: string) => {
  try {
    const token = await getToken();

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (token) {
      headers.Authorization = `Bearer ${token}`;
    } else {
      console.warn('⚠️ Không tìm thấy token');
    }

    console.log('🚀 URL:', url);
    console.log('🧾 Headers:', headers);

    const response = await fetch(url, {
      method: 'GET',
      headers: headers,
    });

    console.log('📡 Response status:', response.status);
    console.log('📡 Response ok:', response.ok);
    let data;
    try {
      const responseText = await response.text();
      console.log('📄 Raw response:', responseText);
      
      // Parse JSON nếu có content
      if (responseText) {
        data = JSON.parse(responseText);
      } else {
        data = { message: 'No response body' };
      }
    } catch (parseError) {   
      throw new Error(`Server error: ${response.status} - Cannot parse response`);
    }

    // ✅ TRẢ VỀ DATA THAY VÌ THROW ERROR
    if (response.ok) {
      console.log('✅ Success response:', data);
      return data;
    } else {
      
      // Map HTTP status to error codes nếu cần
      if (response.status === 400 || response.status === 422) {
        return {
          success: false,
          code: data.code || 4000,
          message: data.message || 'Validation error',
          path: data.path,
          timestamp: data.timestamp,
        };
      }
      
      return {
        success: false,
        code: data.code || response.status,
        message: data.message || `HTTP ${response.status}`,
        path: data.path || url,
        timestamp: data.timestamp || new Date().toISOString(),
      };
    }
  } catch (err: unknown) { 
    console.error('❌ Network/Fetch error:', err);
    
    // ✅ TYPE GUARD
    let errorMessage = 'Lỗi không xác định';
    
    if (err instanceof Error) {
      errorMessage = err.message;
    } else if (typeof err === 'string') {
      errorMessage = err;
    }
    if (
      errorMessage.includes('Network request failed') ||
      errorMessage.includes('Failed to fetch') ||
      errorMessage.includes('TypeError: Failed to fetch')
    ) {
      throw new Error('Không thể kết nối đến server');
    }
    
    throw new Error(errorMessage); // ✅ Throw với message đã format
  }
};

export const searchRecipes = async (
  searchQuery: string,
  selectedIngredients: string[],
  page = 0,
  size = 10
): Promise<ApiResponse | ErrorResponse> => {
  let url = '';
  if (selectedIngredients.length > 0) {
    const ingredientsParam = encodeURIComponent(selectedIngredients.join(','));
    url = `${BASE_URL}/searchs/recipebyingredient?title=${encodeURIComponent(
      searchQuery
    )}&ingredients=${ingredientsParam}&page=${page}&size=${size}&sortBy=title&direction=ASC`;
    console.log('✅ Calling API WITH ingredients:', url);
  } else {
    url = `${BASE_URL}/searchs/recipe?title=${encodeURIComponent(
      searchQuery
    )}&page=${page}&size=${size}&sortBy=title&direction=ASC`;
    console.log('✅ Calling API WITHOUT ingredients:', url);
  }
  return fetchApi(url);
};
export const fetchPopularIngredients = async (): Promise<Ingredient[]> => {
  try {
    const url = `${BASE_URL}/searchs/ingredients`;
    const data = await fetchApi(url);

    const ingredientsData = data as IngredientsResponse;
    
    if (ingredientsData.code === 1000 && ingredientsData.result && Array.isArray(ingredientsData.result)) {
      console.log('✅ Fetched', ingredientsData.result.length, 'popular ingredients');
      return ingredientsData.result;
    } else {
      console.error('❌ Invalid ingredients response:', ingredientsData);
      return [];
    }
  } catch (error) {
    console.error('❌ Error fetching popular ingredients:', error);
    return [];
  }
};