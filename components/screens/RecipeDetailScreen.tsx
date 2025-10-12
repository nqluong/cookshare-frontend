import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, Text, View } from "react-native";
import { getIngredientsByRecipeId, getRecipeById } from "../../services/recipeService";
import RecipeDetailView from "../Recipe/RecipeDetailView";

export default function RecipeDetailScreen() {
  const router = useRouter();
  const [recipe, setRecipe] = useState<any>(null);
  const [ingredients, setIngredients] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  const recipeId = "61edb602-a8ad-4354-838f-f39319d47590"; // ID test

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getRecipeById(recipeId);
        setRecipe(data);

        // Gọi API lấy nguyên liệu riêng
        const ingrs = await getIngredientsByRecipeId(recipeId);
        // Giả sử API trả về mảng các object có trường 'name'
        setIngredients(ingrs.map((item: any) => item.name));
      } catch (error) {
        console.error("❌ Lỗi khi gọi API:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading)
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#2196f3" />
      </View>
    );

  if (!recipe)
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text>Không tìm thấy công thức</Text>
      </View>
    );

  return (
    <RecipeDetailView
      recipe={{
        id: recipe.recipeId,
        title: recipe.title,
        description: recipe.description,
        image: recipe.featuredImage,
        author: recipe.createdBy || "Ẩn danh",
        prepTime: recipe.prepTime ?? 0,
        cookTime: recipe.cookTime ?? 0,
        ingredients: ingredients, // lấy từ bảng riêng
        steps: recipe.instructions
          ? recipe.instructions
              .replace(/\d+\.\s*/g, "")
              .split(/(?<=\.)\s+/)
              .filter(Boolean)
          : [],
        video: "",
        comments: [],
        likes: recipe.likeCount ?? 0,
        views: recipe.viewCount ?? 0,
      }}
      onBack={() => router.back()}
      onSearch={() => {}}
    />
  );
}