import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { ActivityIndicator, FlatList, Text, View } from 'react-native';
import CustomIngredientModal from '../../components/Search/CustomIngredientModal';
import IngredientFilter from '../../components/Search/IngredientFilter';
import RecipeCard from '../../components/Search/RecipeCard';
import SearchBar from '../../components/Search/SearchBar';
import { searchRecipes } from '../../services/searchService';
import { searchStyles } from '../../styles/SearchStyles';
import { ApiResponse, ErrorResponse, Recipe } from '../../types/search';

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
  const popularIngredients = Array.from({ length: 10 }, (_, i) => `Nguyên liệu ${i + 1}`);

  const toggleIngredient = (name: string) => {
    setSelectedIngredients((prev) =>
      prev.includes(name) ? prev.filter((item) => item !== name) : [...prev, name]
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

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      setError('Vui lòng nhập tên món ăn');
      return;
    }

    setLoading(true);
    setError(null);
    setHasSearched(true);

    try {
      console.log('🔍 Selected Ingredients:', selectedIngredients);
      console.log('🔍 Ingredients length:', selectedIngredients.length);

      const data: ApiResponse | ErrorResponse = await searchRecipes(searchQuery, selectedIngredients);

      console.log('📦 API Response:', data);

      if ('result' in data && data.code === 1000 && data.result) {
        setRecipes(data.result.content);
        if (data.result.content.length === 0) {
          setError('Không tìm thấy món ăn nào');
        }
      } else if ('message' in data && data.message) {
        setError(data.message);
        if ('details' in data && data.details) {
          console.error('Error details:', data.details);
        }
      } else {
        setError('Có lỗi xảy ra khi tìm kiếm');
      }
    } catch (err) {
      setError('Không thể kết nối đến server');
      console.error('❌ Search Error:', err);
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
      {showFilter && (
        <IngredientFilter
          selectedIngredients={selectedIngredients}
          toggleIngredient={toggleIngredient}
          setShowInputModal={setShowInputModal}
          popularIngredients={popularIngredients}
          customIngredients={customIngredients}
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
