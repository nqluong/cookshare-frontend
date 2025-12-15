import { RecipePerformanceDTO } from "@/types/admin/report.types";
import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, Text, View } from "react-native";
import RecipeCard from "../../shared/RecipeCard";

interface TopRecipesListProps {
  title: string;
  icon?: keyof typeof Ionicons.glyphMap;
  iconColor?: string;
  recipes: RecipePerformanceDTO[];
  showStats?: ("views" | "likes" | "saves" | "comments" | "rating")[];
  limit?: number;
}

export default function TopRecipesList({
  title,
  icon,
  iconColor = "#10b981",
  recipes,
  showStats = ["views", "likes"],
  limit = 5,
}: TopRecipesListProps) {
  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        {icon && <Ionicons name={icon} size={20} color={iconColor} />}
        <Text style={styles.sectionTitle}>{title}</Text>
      </View>
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