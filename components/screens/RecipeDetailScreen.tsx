import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, Text, View } from "react-native";
import { getRecipeById } from "../../services/recipeService";
import RecipeDetailView from "../Recipe/RecipeDetailView";

export default function RecipeDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const [recipe, setRecipe] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Nếu không có id truyền vào thì dùng id test
  const recipeId = id || "61edb602-a8ad-4354-838f-f39319d47590";

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getRecipeById(recipeId);
        setRecipe(data);
      } catch (error) {
        console.error("❌ Lỗi khi gọi API:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [recipeId]);

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

  // Nguyên liệu cứng (ví dụ)
  const hardcodedIngredients = [
    "500g thịt bò",
    "1kg bún",
    "Hành lá, rau thơm",
    "Gia vị vừa đủ"
  ];

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
        ingredients: hardcodedIngredients,
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