import { RecipePerformanceDTO, TrendingRecipeDTO } from "@/types/admin/report.types";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { StyleSheet, Text, TouchableOpacity, View, ViewStyle } from "react-native";

interface RecipeCardProps {
  recipe: RecipePerformanceDTO | TrendingRecipeDTO;
  rank?: number;
  showStats?: ("views" | "likes" | "saves" | "comments" | "rating" | "trending")[];
  style?: ViewStyle;
  onPress?: (recipe: RecipePerformanceDTO | TrendingRecipeDTO) => void;
}

export default function RecipeCard({ recipe, rank, showStats, style, onPress }: RecipeCardProps) {
  const handlePress = () => {
    // Kiểm tra xem có onPress được truyền vào không
    if (onPress) {
      onPress(recipe);
    } else {
      // Lấy recipeId từ các trường có thể có
      let recipeId: string | undefined;
      if ('recipeId' in recipe) {
        recipeId = recipe.recipeId;
      } else if ('id' in recipe) {
        recipeId = (recipe as any).id;
      }

      if (recipeId) {
        router.push({
          pathname: '/admin/recipes/[id]',
          params: { id: recipeId }
        } as any);
      }
    }
  };

  const renderStat = (type: string) => {
    switch (type) {
      case "views":
        return (
          <View style={styles.recipeStat}>
            <Ionicons name="eye" size={14} color="#6b7280" />
            <Text style={styles.recipeStatText}>{recipe.viewCount}</Text>
          </View>
        );
      case "likes":
        return (
          <View style={styles.recipeStat}>
            <Ionicons name="heart" size={14} color="#ef4444" />
            <Text style={styles.recipeStatText}>{recipe.likeCount}</Text>
          </View>
        );
      case "saves":
        return "saveCount" in recipe ? (
          <View style={styles.recipeStat}>
            <Ionicons name="bookmark" size={14} color="#3b82f6" />
            <Text style={styles.recipeStatText}>{recipe.saveCount}</Text>
          </View>
        ) : null;
      case "comments":
        return "commentCount" in recipe ? (
          <View style={styles.recipeStat}>
            <Ionicons name="chatbubble" size={14} color="#3b82f6" />
            <Text style={styles.recipeStatText}>{recipe.commentCount}</Text>
          </View>
        ) : null;
      case "rating":
        return "averageRating" in recipe ? (
          <View style={styles.recipeStat}>
            <Ionicons name="star" size={14} color="#f59e0b" />
            <Text style={styles.recipeStatText}>
              {parseFloat(recipe.averageRating).toFixed(1)}
            </Text>
          </View>
        ) : null;
      case "trending":
        return "trendingScore" in recipe ? (
          <View style={styles.recipeStat}>
            <Ionicons name="trending-up" size={14} color="#10b981" />
            <Text style={styles.recipeStatText}>
              {recipe.trendingScore?.toFixed(1) || 0}
            </Text>
          </View>
        ) : null;
      default:
        return null;
    }
  };

  return (
    <TouchableOpacity style={[styles.recipeCard, style]} onPress={handlePress}>
      {rank !== undefined && (
        <View style={styles.recipeRank}>
          <Text style={styles.recipeRankText}>#{rank}</Text>
        </View>
      )}
      <View style={styles.recipeContent}>
        <Text style={styles.recipeTitle} numberOfLines={2}>
          {recipe.title}
        </Text>
        {showStats && (
          <View style={styles.recipeStats}>
            {showStats.map((stat) => (
              <View key={stat}>{renderStat(stat)}</View>
            ))}
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  recipeCard: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  recipeRank: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#f3f4f6",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  recipeRankText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#374151",
  },
  recipeContent: {
    flex: 1,
    gap: 8,
  },
  recipeTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: "#111827",
  },
  recipeStats: {
    flexDirection: "row",
    gap: 16,
  },
  recipeStat: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  recipeStatText: {
    fontSize: 13,
    color: "#6b7280",
  },
});