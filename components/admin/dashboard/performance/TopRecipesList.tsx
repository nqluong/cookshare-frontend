// app/admin/components/performance/TopRecipesList.tsx
import { RecipePerformanceDTO } from "@/types/admin/report.types";
import { StyleSheet, Text, View } from "react-native";
import RecipeCard from "../../shared/RecipeCard";

interface TopRecipesListProps {
  title: string;
  recipes: RecipePerformanceDTO[];
  showStats?: ("views" | "likes" | "saves" | "comments" | "rating")[];
  limit?: number;
}

export default function TopRecipesList({
  title,
  recipes,
  showStats = ["views", "likes"],
  limit = 5,
}: TopRecipesListProps) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {recipes.slice(0, limit).map((recipe, index) => (
        <RecipeCard
          key={recipe.recipeId}
          recipe={recipe}
          rank={index + 1}
          showStats={showStats}
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