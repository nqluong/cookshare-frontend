import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, Text, TouchableOpacity, View } from 'react-native';
import CustomIngredientModal from '../../components/Search/CustomIngredientModal';
import IngredientFilter from '../../components/Search/IngredientFilter';
import RecipeCard from '../../components/Search/RecipeCard';
import SearchBar from '../../components/Search/SearchBar';
import SearchHistory from '../../components/Search/SearchHistory';
import { fetchPopularIngredients, fetchSearchHistory, searchRecipes } from '../../services/searchService';
import { searchStyles } from '../../styles/SearchStyles';
import { Ingredient, Recipe, SearchHistoryItem } from '../../types/search';
export default function SearchScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [showFilter, setShowFilter] = useState(false);
  const [selectedIngredients, setSelectedIngredients] = useState<string[]>([]);
  const [showInputModal, setShowInputModal] = useState(false);
  const [customIngredient, setCustomIngredient] = useState('');
  const [customIngredients, setCustomIngredients] = useState<string[]>([]);
  const [popularIngredients, setPopularIngredients] = useState<Ingredient[]>([]);
  const [ingredientsLoading, setIngredientsLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [history, setHistory] = useState<SearchHistoryItem[]>([]); 
  const [historyLoading, setHistoryLoading] = useState(true);
  useEffect(() => {
    const loadHistory = async () => {
      try {
        setHistoryLoading(true);
        const historyData = await fetchSearchHistory(); 

        const recipeHistory = historyData
          .filter(item => item.searchType === 'recipe')
          .slice(0, 5) 
          .reverse();
        setHistory(recipeHistory);
      } catch (error) {
        console.error('❌ Load history error:', error);
      } finally {
        setHistoryLoading(false);
      }
    };
    loadHistory();
  }, []);
  const historyStrings = history.map(item => item.searchQuery);

  const handleSelectHistory = (query: string) => {
    setSearchQuery(query);
    handleSearch(true);
  };

  const handleClearAll = () => {
    setHistory([]);
  };

  const handleDeleteItem = (query: string) => {
    setHistory(prev => prev.filter(item => item.searchQuery !== query));
  };
  useEffect(() => {
    const loadIngredients = async () => {
      setIngredientsLoading(true);
      const ingredients = await fetchPopularIngredients();
      setPopularIngredients(ingredients);
      setIngredientsLoading(false);
    };
    loadIngredients();
  }, []);
  const toggleIngredient = (ingredientName: string) => {
  setSelectedIngredients((prev) =>
    prev.includes(ingredientName)
      ? prev.filter((item) => item !== ingredientName)
      : [...prev, ingredientName]
  );
};

  const handleAddCustomIngredient = () => {
    if (customIngredient.trim()) {
      const newIngredient = customIngredient.trim();
      if (!customIngredients.includes(newIngredient)) {
        setCustomIngredients((prev) => [...prev, newIngredient]);
      }
      if (!selectedIngredients.includes(newIngredient)) {
        setSelectedIngredients((prev) => [...prev, newIngredient]);
      }
      setCustomIngredient('');
      setShowInputModal(false);
    }
  };

 const handleSearch = async (reset = true, requestedPage?: number) => {
  if (reset && !searchQuery.trim()) {
    setError('Vui lòng nhập tên món ăn');
    return;
  }

  setLoading(true);
  setError(null);
  setHasSearched(true);

  try {
    const currentPage = reset ? 0 : requestedPage ?? page;
    const data = await searchRecipes(searchQuery, selectedIngredients, currentPage, 10);
    if ('success' in data && data.success === false) {
      setError(data.message || 'Lỗi từ server');
      setRecipes([]);
      setHasMore(false);
      return;
    }

    if ('code' in data && data.code !== 1000) {
      setError(data.message || 'Lỗi từ server');
      setRecipes([]);
      setHasMore(false);
      return;
    }
    if ('result' in data && data.result && data.result.content) {
      const newRecipes = data.result.content;
      
      if (reset) {
        setRecipes(newRecipes);
        setPage(0);
      } else {
        setRecipes(newRecipes);
      }
      
      setHasMore(!data.result.last);
      
      if (newRecipes.length === 0) {
        setError('Không tìm thấy món ăn nào');
      } else {
        setError(null); 
      }
      if (reset && searchQuery.trim()) {
  setHistory(prev => {
    const newItem: SearchHistoryItem = {
      searchId: Math.random().toString(36).substring(2, 9), // hoặc uuid
      userId: 'local', // giả định là người dùng local
      searchQuery,
      searchType: 'recipe',
      resultCount: recipes.length,
      createdAt: new Date().toISOString(),
    };

    const updated = [
      ...prev.filter(item => item.searchQuery !== searchQuery),
      newItem,
    ].slice(0, 5);

    return updated;
  });
}
    } else {
      setError('Response không đúng format');
    }
  } catch (err: unknown) { 
    let errorMessage = 'Lỗi không xác định';
    if (err instanceof Error) {
      errorMessage = err.message;
     
    } else if (typeof err === 'string') {
     
      errorMessage = err;
    } else if (err && typeof err === 'object' && 'message' in err) {
    
      errorMessage = (err as { message?: string }).message || 'Unknown error object';
    }
    
    setError(errorMessage);
  } finally {
    setLoading(false);
  }
};
  return (
    <View style={searchStyles.container}>
      <SearchBar
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        onSearch={handleSearch}
        onToggleFilter={() => setShowFilter(!showFilter)}
      />

      {/* ✅ SearchHistory - chỉ show khi chưa search + có history */}
      {!searchQuery.trim() && history.length > 0 && !historyLoading && (
        <SearchHistory
          history={historyStrings}  
          onSelect={handleSelectHistory}
          onClearAll={handleClearAll}
          onDeleteItem={handleDeleteItem}
          onSearch={handleSearch}
        />
      )}
      
      
      {showFilter && (
        <IngredientFilter
          popularIngredients={popularIngredients}
          selectedIngredients={selectedIngredients}
          toggleIngredient={toggleIngredient}
          setShowInputModal={setShowInputModal}
          customIngredients={customIngredients}
          loading={ingredientsLoading}
        />
      )}
      
      {loading ? (
        <View style={searchStyles.centerContainer}>
          <ActivityIndicator size="large" color="#fbbc05" />
          <Text style={searchStyles.loadingText}>Đang tìm kiếm...</Text>
        </View>
      ) : error ? (
        <View style={searchStyles.centerContainer}>
          <Ionicons name="alert-circle-outline" size={64} color="#999" />
          <Text style={searchStyles.errorText}>{error}</Text>
        </View>
      ) : !hasSearched ? (
        <View style={searchStyles.centerContainer}>
          <Ionicons name="search-outline" size={64} color="#ccc" />
          <Text style={searchStyles.emptyText}>Nhập tên món ăn để tìm kiếm</Text>
        </View>
      ) : (
        <FlatList
          data={recipes}
          renderItem={({ item }) => <RecipeCard item={item} />}
          keyExtractor={(item) => item.recipeId}
          contentContainerStyle={searchStyles.listContainer}
          showsVerticalScrollIndicator={false}
          ListFooterComponent={
            <View style={{ alignItems: 'center', marginVertical: 20 }}>
              <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
                {page > 0 && (
                  <TouchableOpacity
                    style={[
                      {
                        backgroundColor: '#fbbc05',
                        paddingHorizontal: 15,
                        paddingVertical: 8,
                        borderRadius: 8,
                        marginHorizontal: 5,
                      },
                      loading && { opacity: 0.6 }
                    ]}
                    onPress={() => {
                      const prevPage = page - 1;
                      setPage(prevPage);
                      handleSearch(false, prevPage);
                    }}
                    disabled={loading}
                  >
                    <Text style={{ color: '#fff' }}>Trang trước</Text>
                  </TouchableOpacity>
                )}
                
                <Text style={{ marginHorizontal: 10, fontWeight: 'bold', color: '#333' }}>
                  Trang {page + 1}
                </Text>
                
                {hasMore && (
                  <TouchableOpacity
                    style={[
                      {
                        backgroundColor: '#fbbc05',
                        paddingHorizontal: 15,
                        paddingVertical: 8,
                        borderRadius: 8,
                        marginHorizontal: 5,
                      },
                      loading && { opacity: 0.6 }
                    ]}
                    onPress={() => {
                      const nextPage = page + 1;
                      setPage(nextPage);
                      handleSearch(false, nextPage);
                    }}
                    disabled={loading}
                  >
                    <Text style={{ color: '#fff' }}>Trang sau</Text>
                  </TouchableOpacity>
                )}
              </View>
              
              {recipes.length > 0 && (
                <TouchableOpacity
                  style={{
                    backgroundColor: '#666',
                    paddingHorizontal: 15,
                    paddingVertical: 8,
                    borderRadius: 8,
                    marginTop: 10,
                  }}
                  onPress={() => {
                    setPage(0);
                    handleSearch(true);
                  }}
                >
                  <Text style={{ color: '#fff' }}>Về trang đầu</Text>
                </TouchableOpacity>
              )}
            </View>
          }
        />
      )}
      
      <CustomIngredientModal
        visible={showInputModal}
        customIngredient={customIngredient}
        setCustomIngredient={setCustomIngredient}
        onAdd={handleAddCustomIngredient}
        onClose={() => {
          setCustomIngredient('');
          setShowInputModal(false);
        }}
      />
    </View>
  );
}