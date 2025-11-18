import { Ionicons } from '@expo/vector-icons';
import { useRef, useState } from 'react';
import { Dimensions, FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { getImageUrl } from '../../config/api.config';
import { Colors } from '../../styles/colors';
import { Recipe } from '../../types/dish';
import { CachedImage } from '../ui/CachedImage';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = SCREEN_WIDTH - 32; 

interface FeaturedDishProps {
  recipes?: Recipe[];
  onRecipePress?: (recipe: Recipe) => void;
}

export default function FeaturedDish({ recipes = [], onRecipePress }: FeaturedDishProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);

  if (!recipes || recipes.length === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.card}>
          <View style={styles.content}>
            <Text style={styles.badge}>Món ăn hôm nay ⚡</Text>
            <Text style={styles.title}>Đang tải...</Text>
            <Text style={styles.time}>-- phút</Text>
          </View>
          <View style={styles.imageContainer}>
            <View style={styles.imagePlaceholder}>
              <Ionicons name="image-outline" size={40} color={Colors.gray[400]} />
            </View>
          </View>
        </View>
      </View>
    );
  }

  // Lấy tối đa 3 công thức từ dailyRecommendations
  const displayRecipes = recipes.slice(0, 3);

  const onViewableItemsChanged = useRef(({ viewableItems }: any) => {
    if (viewableItems.length > 0) {
      setCurrentIndex(viewableItems[0].index || 0);
    }
  }).current;

  const viewabilityConfig = useRef({
    itemVisiblePercentThreshold: 50,
  }).current;

  const renderRecipeCard = ({ item: recipe }: { item: Recipe }) => {
    const totalTime = recipe.prepTime + recipe.cookTime;

    return (
      <TouchableOpacity
        style={[styles.card, { width: CARD_WIDTH }]}
        onPress={() => onRecipePress?.(recipe)}
        activeOpacity={0.7}
      >
        <View style={styles.content}>
          <Text style={styles.badge}>Món ăn hôm nay ⚡</Text>
          <Text style={styles.title} numberOfLines={2}>
            {recipe.title}
          </Text>
          <Text style={styles.time}>{totalTime} phút</Text>
        </View>
        <View style={styles.imageContainer}>
          <CachedImage
            source={{ uri: getImageUrl(recipe.featuredImage) }}
            style={styles.image}
            resizeMode="cover"
            priority="high"
            showLoader={true}
            placeholder={
              <View style={styles.imagePlaceholder}>
                <Ionicons 
                  name="restaurant-outline" 
                  size={40} 
                  color={Colors.gray[400]} 
                />
              </View>
            }
          />
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <FlatList
        ref={flatListRef}
        data={displayRecipes}
        renderItem={renderRecipeCard}
        keyExtractor={(item) => item.recipeId}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        snapToInterval={CARD_WIDTH}
        snapToAlignment="start"
        decelerationRate="fast"
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
        contentContainerStyle={styles.flatListContent}
      />
      
      {/* Pagination Dots */}
      {displayRecipes.length > 1 && (
        <View style={styles.pagination}>
          {displayRecipes.map((_, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.dot,
                index === currentIndex && styles.activeDot,
              ]}
              onPress={() => {
                flatListRef.current?.scrollToIndex({
                  index,
                  animated: true,
                });
              }}
            />
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 16,
  },
  flatListContent: {
    paddingHorizontal: 16,
  },
  card: {
    backgroundColor: Colors.orange[100],
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginRight: 0,
  },
  content: {
    flex: 1,
  },
  badge: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text.primary,
    marginBottom: 4,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: 4,
  },
  time: {
    fontSize: 13,
    color: Colors.text.secondary,
  },
  imageContainer: {
    width: 100,
    height: 100,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: Colors.white,
    marginLeft: 12,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  imagePlaceholder: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.gray[100],
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 12,
    gap: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.gray[300],
  },
  activeDot: {
    width: 24,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.orange[100],
  },
});