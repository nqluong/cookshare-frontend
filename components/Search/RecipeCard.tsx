import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Image, Text, TouchableOpacity, View } from 'react-native';
import { BASE_URL } from '../../services/searchService';
import { searchStyles } from '../../styles/SearchStyles';
import { Recipe } from '../../types/search';

interface RecipeCardProps {
  item: Recipe;
}

export default function RecipeCard({ item }: RecipeCardProps) {
  return (
    <TouchableOpacity style={searchStyles.recipeCard}>
      <Image
        source={{ uri: `${BASE_URL}/${item.featuredImage.replace(/\\/g, '/')}` }}
        style={searchStyles.recipeImage}
        resizeMode="cover"
      />
      <View style={searchStyles.recipeInfo}>
        <Text style={searchStyles.recipeTitle} numberOfLines={2}>
          {item.title}
        </Text>
        <View style={searchStyles.recipeStats}>
          <View style={searchStyles.statItem}>
            <Ionicons name="time-outline" size={16} color="#666" />
            <Text style={searchStyles.statText}>{item.cookTime} phút</Text>
          </View>
          <View style={searchStyles.statItem}>
            <Ionicons name="heart-outline" size={16} color="#666" />
            <Text style={searchStyles.statText}>{item.likeCount}</Text>
          </View>
          <View style={searchStyles.statItem}>
            <Ionicons name="bookmark-outline" size={16} color="#666" />
            <Text style={searchStyles.statText}>{item.saveCount}</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}