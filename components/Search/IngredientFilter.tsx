import { Ionicons } from '@expo/vector-icons';
import { ActivityIndicator, Text, TouchableOpacity, View } from 'react-native';
import { searchStyles } from '../../styles/SearchStyles';
import { Ingredient } from '../../types/search';

interface IngredientFilterProps {
  selectedIngredients: string[]; 
  toggleIngredient: (ingredientId: string) => void; 
  setShowInputModal: (show: boolean) => void;
  popularIngredients: Ingredient[]; 
  customIngredients: string[]; 
  loading?: boolean; 
}

export default function IngredientFilter({
  selectedIngredients,
  toggleIngredient,
  setShowInputModal,
  popularIngredients,
  customIngredients,
  loading = false, // ✅ Default false
}: IngredientFilterProps) {
  
  // ✅ LOADING STATE
  if (loading) {
    return (
      <View style={searchStyles.filterContainer}>
        <View style={[searchStyles.centerContainer, { padding: 20 }]}>
          <ActivityIndicator size="small" color="#fbbc05" />
          <Text style={[searchStyles.loadingText, { marginTop: 8, textAlign: 'center' }]}>
            Đang tải nguyên liệu...
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={searchStyles.filterContainer}>
      <View style={searchStyles.ingredientsGrid}>
        {/* ✅ RENDER INGREDIENT OBJECTS THAY VÌ STRINGS */}
        {popularIngredients.map((ingredient) => {
          const isSelected = selectedIngredients.includes(ingredient.name);
          return (
            <TouchableOpacity
              key={ingredient.name} 
              style={[
                searchStyles.ingredientButton, 
                isSelected && searchStyles.selectedIngredient
              ]}
              onPress={() => toggleIngredient(ingredient.name)}  
            >
              <Text
                style={[
                  searchStyles.ingredientText, 
                  isSelected && searchStyles.selectedText
                ]}
                numberOfLines={1}
              >
                {ingredient.name} {}
              </Text>
            </TouchableOpacity>
          );
        })}
        
        {/* ✅ NÚT THÊM CUSTOM INGREDIENT */}
        <TouchableOpacity
          style={searchStyles.inputIngredientButton}
          onPress={() => setShowInputModal(true)}
        >
          <Ionicons name="add-circle-outline" size={18} color="#666" />
          <Text style={searchStyles.inputIngredientText}>Nhập nguyên liệu</Text>
        </TouchableOpacity>
        
        {/* ✅ CUSTOM INGREDIENTS (VẪN LÀ STRING[]) */}
        {customIngredients.map((item) => {
          const isSelected = selectedIngredients.includes(item);
          return (
            <TouchableOpacity
              key={item}
              style={[
                searchStyles.ingredientButton,
                searchStyles.customIngredientButton,
                isSelected && searchStyles.selectedIngredient,
              ]}
              onPress={() => toggleIngredient(item)} // ✅ CUSTOM DÙNG NAME
            >
              <Text
                style={[
                  searchStyles.ingredientText,
                  isSelected && searchStyles.selectedText
                ]}
                numberOfLines={1}
              >
                {item}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}