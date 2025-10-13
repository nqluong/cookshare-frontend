import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, Alert, Text, View } from "react-native";
import RecipeDetailView from "../components/Recipe/RecipeDetailView";
import { getRecipeById } from "../services/recipeService";

// ✅ Hàm giới hạn thời gian chờ API (timeout)
const fetchWithTimeout = async (promise: Promise<any>, timeoutMs = 5000) => {
  return Promise.race([
    promise,
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error("⏰ Yêu cầu quá thời gian, thử lại sau")), timeoutMs)
    ),
  ]);
};

export default function RecipeDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const [recipe, setRecipe] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const recipeId = id || "61edb602-a8ad-4354-838f-f39319d47590";

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const data = await fetchWithTimeout(getRecipeById(recipeId), 5000);
        setRecipe(data);
      } catch (err: any) {
        console.error("❌ Lỗi khi gọi API:", err.message);
        setError(err.message);
        Alert.alert("Lỗi", err.message); // ⚠️ hiện popup báo lỗi
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
        <Text>Đang tải công thức...</Text>
      </View>
    );

  if (error)
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text style={{ color: "red" }}>{error}</Text>
      </View>
    );

  if (!recipe)
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text>Không tìm thấy công thức</Text>
      </View>
    );

  const hardcodedIngredients = [
    "500g thịt bò",
    "1kg bún",
    "Hành lá, rau thơm",
    "Gia vị vừa đủ",
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
      onSearch={() => { }}
    />
  );
}
