// components/admin/dashboard/performance/TrendingRecipes.tsx
import { TrendingRecipeDTO } from "@/types/admin/report.types";
import { StyleSheet, Text, View } from "react-native";
import RecipeCard from "../../shared/RecipeCard";

interface TrendingRecipesProps {
  trending: TrendingRecipeDTO[];
  limit?: number;
}

export default function TrendingRecipes({ trending, limit = 10 }: TrendingRecipesProps) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>🔥 Trending Recipes</Text>
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
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 16,
  },
});