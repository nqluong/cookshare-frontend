import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { searchStyles } from '../../styles/SearchStyles';

interface IngredientFilterProps {
  selectedIngredients: string[];
  toggleIngredient: (name: string) => void;
  setShowInputModal: (show: boolean) => void;
  popularIngredients: string[];
  customIngredients: string[];
}

export default function IngredientFilter({
  selectedIngredients,
  toggleIngredient,
  setShowInputModal,
  popularIngredients,
  customIngredients,
}: IngredientFilterProps) {
  return (
    <View style={searchStyles.filterContainer}>
      <View style={searchStyles.ingredientsGrid}>
        {popularIngredients.map((item) => {
          const isSelected = selectedIngredients.includes(item);
          return (
            <TouchableOpacity
              key={item}
              style={[searchStyles.ingredientButton, isSelected && searchStyles.selectedIngredient]}
              onPress={() => toggleIngredient(item)}
            >
              <Text
                style={[searchStyles.ingredientText, isSelected && searchStyles.selectedText]}
              >
                {item}
              </Text>
            </TouchableOpacity>
          );
        })}
        <TouchableOpacity
          style={searchStyles.inputIngredientButton}
          onPress={() => setShowInputModal(true)}
        >
          <Ionicons name="add-circle-outline" size={18} color="#666" />
          <Text style={searchStyles.inputIngredientText}>Nhập nguyên liệu</Text>
        </TouchableOpacity>
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
              onPress={() => toggleIngredient(item)}
            >
              <Text
                style={[searchStyles.ingredientText, isSelected && searchStyles.selectedText]}
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