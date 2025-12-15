import { TrendingRecipeDTO } from "@/types/admin/report.types";
import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, Text, View } from "react-native";
import RecipeCard from "../../shared/RecipeCard";

interface TrendingRecipesProps {
  trending: TrendingRecipeDTO[];
  limit?: number;
}

export default function TrendingRecipes({ trending, limit = 10 }: TrendingRecipesProps) {
  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Ionicons name="flame-outline" size={20} color="#ef4444" />
        <Text style={styles.sectionTitle}>Trending Recipes</Text>
      </View>
      {trending.slice(0, limit).map((recipe, index) => (
        <RecipeCard
          key={recipe.recipeId}
          recipe={recipe}
          rank={index + 1}
          showStats={["views", "likes", "trending"]}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    backgroundColor: "#fff",
    marginTop: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111827",
  },
});