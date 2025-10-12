import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Colors } from '../../styles/colors';
import { Dish } from '../../types/dish';

interface TopDishesProps {
  dishes: Dish[];
}

export default function TopDishes({ dishes }: TopDishesProps) {
  const [likedDishes, setLikedDishes] = useState<Set<number>>(new Set());

  const toggleLike = (dishId: number) => {
    setLikedDishes(prev => {
      const newSet = new Set(prev);
      if (newSet.has(dishId)) {
        newSet.delete(dishId);
      } else {
        newSet.add(dishId);
      }
      return newSet;
    });
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Top món ăn trong tuần</Text>
        <Ionicons name="chevron-forward" size={20} color={Colors.text.secondary} />
      </View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {dishes.map((dish) => (
          <View key={dish.id} style={styles.dishCard}>
            <View style={styles.imageWrapper}>
              <View style={styles.dishImage}>
                <Image
                  source={{ uri: dish.image }}
                  style={styles.image}
                  resizeMode="cover"
                />
              </View>
              <TouchableOpacity
                style={styles.likeButton}
                onPress={() => toggleLike(dish.id)}
              >
                <Ionicons
                  name={likedDishes.has(dish.id) ? 'heart' : 'heart-outline'}
                  size={16}
                  color={likedDishes.has(dish.id) ? Colors.primary : Colors.text.light}
                />
              </TouchableOpacity>
            </View>
            <Text style={styles.dishName}>{dish.name}</Text>
            <View style={styles.likesContainer}>
              <Text style={styles.likesText}>{dish.likes.toLocaleString()}</Text>
              <Ionicons name="heart" size={12} color={Colors.primary} />
            </View>
          </View>
        ))}
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
  dishCard: {
    width: 90,
    alignItems: 'center',
  },
  imageWrapper: {
    position: 'relative',
    marginBottom: 8,
  },
  dishImage: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: Colors.white,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: Colors.gray[200],
  },
  image: {
    width: '100%',
    height: '100%',
  },
  likeButton: {
    position: 'absolute',
    bottom: -4,
    right: -4,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  dishName: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.text.primary,
    textAlign: 'center',
    marginBottom: 2,
  },
  likesContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  likesText: {
    fontSize: 11,
    color: Colors.text.secondary,
  },
});