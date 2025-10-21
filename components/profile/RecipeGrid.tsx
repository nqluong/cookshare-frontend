import { getAllRecipesByUserId } from "@/services/recipeService";
import { BASE_URL } from "@/services/searchService";
import { Recipe } from "@/types/search";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

interface RecipeGridProps {
  userId: string;
}

const RecipeGrid: React.FC<RecipeGridProps> = ({ userId }) => {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRecipes = async () => {
      try {
        const data = await getAllRecipesByUserId(userId);
        setRecipes(data || []);
      } catch (error) {
        console.error("Failed to fetch recipes:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchRecipes();
  }, [userId]);
  

  const renderRecipeItem = ({ item }: { item: Recipe }) => (
    <TouchableOpacity style={styles.card}>
      <Image source={{ uri: `${BASE_URL}/${item.featuredImage.replace(/\\/g, '/')}` }}
       style={styles.image}
       resizeMode="cover" />
      <View style={styles.textContainer}>
        <Text style={styles.title}>{item.title}</Text>
        <Text style={styles.description}>
          {item.description || "No description"}
        </Text>
        <View style={styles.stats}>
          <Text>❤️ {item.likeCount}</Text>
          <Text>💾 {item.saveCount}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#FF385C" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {recipes.length === 0 ? (
        <Text style={styles.emptyText}>Chưa có công thức nào</Text>
      ) : (
        <FlatList
          data={recipes}
          renderItem={renderRecipeItem}
          keyExtractor={(item) => item.recipeId}
          scrollEnabled={false}
          contentContainerStyle={styles.list}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
    backgroundColor: "#fff",
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#fff",
  },
  list: {
    padding: 10,
    paddingBottom: 20,
  },
  card: {
    flexDirection: "row",
    backgroundColor: "#f9f9f9",
    borderRadius: 8,
    marginBottom: 10,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  image: {
    width: 100,
    height: 100,
    borderTopLeftRadius: 8,
    borderBottomLeftRadius: 8,
  },
  textContainer: {
    flex: 1,
    padding: 10,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
  },
  description: {
    fontSize: 14,
    color: "#666",
  },
  stats: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 5,
  },
  emptyText: {
    fontSize: 16,
    color: "#999",
    textAlign: "center",
    marginTop: 20,
  },
});

export default RecipeGrid;
