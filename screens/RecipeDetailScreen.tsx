import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from 'react-native-safe-area-context';
import RecipeDetailView from "../components/Recipe/RecipeDetailView";
import { useAuth } from "../context/AuthContext";
import { getRecipeById } from "../services/recipeService";
import { Colors } from '../styles/colors';

type Ingredient = {
  ingredientId?: string;
  name: string;
  quantity?: number | string;
  unit?: string;
  notes?: string;
};

type Step = {
  stepId: string;
  stepNumber: number;
  instruction: string;
};

type Comment = {
  user: string;
  text: string;
  icon?: string;
  time?: string;
};

const fetchWithTimeout = async (promise: Promise<any>, timeoutMs = 7000) => {
  return Promise.race([
    promise,
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error("⏰ Quá thời gian phản hồi, thử lại sau")), timeoutMs)
    ),
  ]);
};

export default function RecipeDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const [recipe, setRecipe] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const recipeId = id || "";
  const { user } = useAuth();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const token = await AsyncStorage.getItem('authToken');
        const data = await fetchWithTimeout(getRecipeById(recipeId), 7000);
        // Debug: log recipe payload so we can see which author field is present
        try {
          // eslint-disable-next-line no-console
          console.log('Recipe detail payload:', data);
        } catch (e) {}
        setRecipe(data);
      } catch (err: any) {
        console.error("Lỗi API:", err.message);
        setError(err.message);

        if (err.message.includes('401')) {
          Alert.alert("Lỗi xác thực", "Vui lòng đăng nhập lại", [
            { text: "OK", onPress: () => router.replace('/auth/login') }
          ]);
        } else {
          Alert.alert("Lỗi", err.message);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [recipeId]);

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <Header router={router} />
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>Đang tải...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error || !recipe) {
    return (
      <SafeAreaView style={styles.container}>
        <Header router={router} />
        <View style={styles.centerContainer}>
          <Text style={styles.errorText}>{error || "Không tìm thấy công thức"}</Text>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={styles.retryText}>⬅ Quay lại</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // Chuẩn hóa dữ liệu từ backend
  const ingredients: Ingredient[] = recipe.ingredients || [];
  const steps: Step[] = recipe.steps
    ? recipe.steps.map((s: any) => ({
        stepId: `step-${s.stepNumber}`,
        stepNumber: s.stepNumber,
        instruction: s.instruction,
      }))
    : [];
  const comments: Comment[] = recipe.comments || [];

  return (
    <View style={styles.container}>
      <SafeAreaView edges={['top']} style={styles.safeArea}>
        <Header router={router} />
      </SafeAreaView>

      <RecipeDetailView
        recipe={{
          id: recipe.recipeId,
          title: recipe.title,
          description: recipe.description,
          image: recipe.featuredImage,
          // Prefer full name from recipe details, then createdBy, then logged-in username, then fallback
          author: recipe.fullName || recipe.createdBy || user?.username || "",
          prepTime: recipe.prepTime ?? 0,
          cookTime: recipe.cookTime ?? 0,
          ingredients,
          steps,
          video: recipe.videoUrl || "",
          comments,
          likes: recipe.likeCount ?? 0,
          views: recipe.viewCount ?? 0,
        }}
        onBack={() => router.back()}
        onSearch={() => router.push('/(tabs)/search')}
      />
    </View>
  );
}

const Header = ({ router }: { router: any }) => (
  <View style={styles.header}>
    <TouchableOpacity
      onPress={() =>
        router.canGoBack()
          ? router.back()
          : router.replace('/(tabs)/home')
      }
      style={styles.backButton}
    >
      <Ionicons name="arrow-back" size={24} color={Colors.text.primary} />
    </TouchableOpacity>
    <Text style={styles.headerTitle}>Chi tiết công thức</Text>
    <TouchableOpacity
      onPress={() => router.push('/(tabs)/search')}
      style={styles.backButton}
    >
      <Ionicons name="search" size={24} color={Colors.text.primary} />
    </TouchableOpacity>
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  safeArea: { backgroundColor: Colors.white },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray[100],
  },
  backButton: { padding: 4 },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text.primary,
  },
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  loadingText: { marginTop: 12, fontSize: 16, color: Colors.text.secondary },
  errorText: { fontSize: 16, color: '#FF3B30', textAlign: 'center', marginBottom: 16 },
  retryText: {
    fontSize: 16,
    color: Colors.primary,
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
});
