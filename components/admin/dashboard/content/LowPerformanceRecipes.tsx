// components/admin/dashboard/content/LowPerformanceRecipes.tsx
import { RecipePerformanceDTO } from "@/types/admin/report.types";
import { StyleSheet, Text, View } from "react-native";
import RecipeCard from "../../shared/RecipeCard";

interface LowPerformanceRecipesProps {
  lowPerformance: RecipePerformanceDTO[];
  limit?: number;
}

export default function LowPerformanceRecipes({
  lowPerformance,
  limit = 5,
}: LowPerformanceRecipesProps) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>⚠️ Cần Cải Thiện</Text>
      {lowPerformance.slice(0, limit).map((recipe) => (
        <RecipeCard
          key={recipe.recipeId}
          recipe={recipe}
          showStats={["views", "likes", "comments"]}
          style={styles.lowPerformanceCard}
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
  lowPerformanceCard: {
    backgroundColor: "#fef2f2",
  },
});