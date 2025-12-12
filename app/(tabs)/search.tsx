import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, Text, TouchableOpacity, View } from 'react-native';
import CustomIngredientModal from '../../components/Search/CustomIngredientModal';
import IngredientFilter from '../../components/Search/IngredientFilter';
import RecipeCard from '../../components/Search/RecipeCard';
import SearchBar from '../../components/Search/SearchBar';
import SearchHistory from '../../components/Search/SearchHistory';
import { fetchPopularIngredients, fetchSearchHistory, getRecipeSuggestions, searchRecipes } from '../../services/searchService';
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
  const [loadingMore, setLoadingMore] = useState(false);
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
        console.log('❌ Load history error:', error);
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
  const fetchRecipeSuggestions = async (query: string): Promise<string[]> => {
    try {
      const response = await getRecipeSuggestions(query, 5);
      return response; // ✅ response đã là string[]
    } catch (error) {
      console.log('Error fetching recipe suggestions:', error);
      return [];
    }
  };
  const handleQueryChange = (query: string) => {
    setSearchQuery(query);
    if (hasSearched) {
      setHasSearched(false);
      setRecipes([]);
      setError(null);
    }
  };

  const handleSearch = async (reset = true, requestedPage?: number, queryOverride?: string) => {
    const queryToSearch = queryOverride?.trim() || searchQuery.trim();
    if (reset && !queryToSearch) {
      setError('Vui lòng nhập từ khóa cần tìm kiếm');
      return;
    }

    if (reset) {
      setLoading(true);
    } else {
      setLoadingMore(true);
    }
    setError(null);
    setHasSearched(true);

    try {
      const currentPage = reset ? 0 : requestedPage ?? page;
      const data = await searchRecipes(queryToSearch, selectedIngredients, currentPage, 10);
      if ('success' in data && data.success === false) {
        setError(data.message || 'Lỗi từ server');
        if (reset) setRecipes([]);
        setHasMore(false);
        return;
      }

      if ('code' in data && data.code !== 1000) {
        setError(data.message || 'Lỗi từ server');
        if (reset) setRecipes([]);
        setHasMore(false);
        return;
      }
      if ('result' in data && data.result && data.result.content) {
        const newRecipes = data.result.content;

        if (reset) {
          setRecipes(newRecipes);
          setPage(0);
        } else {
          // Append new recipes to existing list
          setRecipes(prev => [...prev, ...newRecipes]);
          setPage(currentPage);
        }

        setHasMore(!data.result.last);

        if (newRecipes.length === 0 && reset) {
          setError('Không tìm thấy món ăn nào');
        } else {
          setError(null);
        }
        if (reset && searchQuery.trim()) {
          setHistory(prev => {
            const newItem: SearchHistoryItem = {
              searchId: Math.random().toString(36).substring(2, 9),
              userId: 'local',
              searchQuery,
              searchType: 'recipe',
              resultCount: newRecipes.length,
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
      setLoadingMore(false);
    }
  };

  const loadMore = () => {
    if (!loading && !loadingMore && hasMore && recipes.length > 0) {
      handleSearch(false, page + 1);
    }
  };
  return (
    <View style={searchStyles.container}>
      <SearchBar
        searchQuery={searchQuery}
        setSearchQuery={handleQueryChange}
        onSearch={handleSearch}
        onGetSuggestions={fetchRecipeSuggestions}
        showSuggestions={!hasSearched}
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
          onEndReached={loadMore}
          onEndReachedThreshold={0.5}
          ListFooterComponent={
            loadingMore ? (
              <View style={{ paddingVertical: 20, alignItems: 'center' }}>
                <ActivityIndicator size="small" color="#fbbc05" />
                <Text style={{ marginTop: 8, color: '#999', fontSize: 14 }}>Đang tải thêm...</Text>
              </View>
            ) : null
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