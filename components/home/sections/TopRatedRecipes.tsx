import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Colors } from '../../../styles/colors';
import { Recipe } from '../../../types/dish';
import { recipeToDish } from '../../../utils/recipeHelpers';

interface TopRatedRecipesProps {
  recipes: Recipe[]; // Danh sách công thức đánh giá cao nhất từ API
  onRecipePress?: (recipe: Recipe) => void; // Callback khi nhấn vào công thức
}

// Component hiển thị danh sách công thức đánh giá cao nhất (theo averageRating)
export default function TopRatedRecipes({ recipes, onRecipePress }: TopRatedRecipesProps) {
  const [likedRecipes, setLikedRecipes] = useState<Set<string>>(new Set());

  const toggleLike = (recipeId: string, event: any) => {
    event.stopPropagation();
    setLikedRecipes(prev => {
      const newSet = new Set(prev);
      if (newSet.has(recipeId)) {
        newSet.delete(recipeId);
      } else {
        newSet.add(recipeId);
      }
      return newSet;
    });
  };

  const getDifficultyText = (difficulty: string) => {
    switch (difficulty) {
      case 'EASY': return 'Dễ';
      case 'MEDIUM': return 'Trung bình';
      case 'HARD': return 'Khó';
      default: return difficulty;
    }
  };

  if (!recipes || recipes.length === 0) {
    return null; 
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Đánh giá cao nhất ⭐</Text>
        <Ionicons name="chevron-forward" size={20} color={Colors.text.secondary} />
      </View>
      
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {recipes.map((recipe) => {
          const dish = recipeToDish(recipe);
          const isLiked = likedRecipes.has(recipe.recipeId);
          const currentLikes = isLiked ? recipe.likeCount + 1 : recipe.likeCount;

          return (
            <TouchableOpacity
              key={recipe.recipeId}
              style={styles.card}
              onPress={() => onRecipePress?.(recipe)}
              activeOpacity={0.7}
            >
              <View style={styles.imageWrapper}>
                <View style={styles.imageContainer}>
                  <Image 
                    source={{ uri: dish.image }}
                    style={styles.image}
                    resizeMode="cover"
                  />
                  {/* Rating badge */}
                  <View style={styles.ratingBadge}>
                    <Ionicons name="star" size={12} color="#FFD700" />
                    <Text style={styles.ratingText}>
                      {recipe.averageRating.toFixed(1)}
                    </Text>
                  </View>
                </View>
                <TouchableOpacity
                  style={styles.likeButton}
                  onPress={(e) => toggleLike(recipe.recipeId, e)}
                  activeOpacity={0.7}
                >
                  <Ionicons
                    name={isLiked ? 'heart' : 'heart-outline'}
                    size={16}
                    color={isLiked ? Colors.primary : Colors.text.light}
                  />
                </TouchableOpacity>
              </View>
              <View style={styles.info}>
                <Text style={styles.dishName} numberOfLines={2}>
                  {dish.name}
                </Text>
                
                {/* Thông tin: Độ khó | Thời gian | Khẩu phần */}
                <View style={styles.detailsRow}>
                  <View style={styles.detailItem}>
                    <Ionicons name="bar-chart-outline" size={11} color={Colors.text.secondary} />
                    <Text style={styles.detailText}>{getDifficultyText(recipe.difficulty)}</Text>
                  </View>
                  <View style={styles.divider} />
                  <View style={styles.detailItem}>
                    <Ionicons name="time-outline" size={11} color={Colors.text.secondary} />
                    <Text style={styles.detailText}>{recipe.cookTime}p</Text>
                  </View>
                  <View style={styles.divider} />
                  <View style={styles.detailItem}>
                    <Ionicons name="people-outline" size={11} color={Colors.text.secondary} />
                    <Text style={styles.detailText}>{recipe.servings}</Text>
                  </View>
                </View>

                {/* Stats: Views và Likes */}
                <View style={styles.stats}>
                  <View style={styles.stat}>
                    <Ionicons name="eye-outline" size={12} color={Colors.text.secondary} />
                    <Text style={styles.statText}>{recipe.viewCount}</Text>
                  </View>
                  <View style={styles.stat}>
                    <Ionicons name="heart" size={12} color={Colors.primary} />
                    <Text style={styles.statText}>{currentLikes}</Text>
                  </View>
                </View>
              </View>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 24,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  title: {
    fontSize: 17,
    fontWeight: '700',
    color: Colors.text.primary,
  },
  scrollContent: {
    paddingHorizontal: 16,
    gap: 12,
  },
  card: {
    width: 150,
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  imageWrapper: {
    position: 'relative',
    marginBottom: 8,
  },
  imageContainer: {
    width: '100%',
    height: 134,
    borderRadius: 8,
    backgroundColor: Colors.gray[100],
    overflow: 'hidden',
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  ratingBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ratingText: {
    color: Colors.white,
    fontSize: 11,
    fontWeight: '600',
  },
  likeButton: {
    position: 'absolute',
    bottom: 4,
    right: 4,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 3,
  },
  info: {
    gap: 6,
  },
  dishName: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.text.primary,
    minHeight: 32,
    lineHeight: 16,
  },
  detailsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    flex: 1,
  },
  divider: {
    width: 1,
    height: 10,
    backgroundColor: Colors.gray[200],
    marginHorizontal: 2,
  },
  detailText: {
    fontSize: 9,
    color: Colors.text.secondary,
    fontWeight: '500',
  },
  stats: {
    flexDirection: 'row',
    gap: 8,
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: Colors.gray[100],
  },
  stat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  statText: {
    fontSize: 11,
    color: Colors.text.secondary,
    fontWeight: '500',
  },
});

