import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, Alert, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from 'react-native-safe-area-context';
import RecipeDetailView from "../components/Recipe/RecipeDetailView";
import { getRecipeById } from "../services/recipeService";
import { Colors } from '../styles/colors';

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

  // Nếu không có id truyền vào thì dùng id test
  const recipeId = id || "";

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Lấy token từ AsyncStorage
        const token = await AsyncStorage.getItem('authToken');
        console.log('Token found:', token ? 'Yes' : 'No ');
        
        const data = await fetchWithTimeout(getRecipeById(recipeId, token), 5000);
        setRecipe(data);
      } catch (err: any) {
        console.error(" Lỗi khi gọi API:", err.message);
        setError(err.message);
        
        // Nếu lỗi 401, có thể chuyển về login
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

  const canGoBack = router.canGoBack();

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={Colors.text.primary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Chi tiết công thức</Text>
          <View style={styles.placeholder} />
        </View>
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>Đang tải...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={Colors.text.primary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Chi tiết công thức</Text>
          <View style={styles.placeholder} />
        </View>
        <View style={styles.centerContainer}>
          <Text style={styles.errorText}> {error}</Text>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={styles.retryText}>Quay lại</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  if (!recipe) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={Colors.text.primary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Chi tiết công thức</Text>
          <View style={styles.placeholder} />
        </View>
        <View style={styles.centerContainer}>
          <Text style={styles.errorText}>Không tìm thấy công thức</Text>
        </View>
      </SafeAreaView>
    );
  }

  const hardcodedIngredients = [
    "500g thịt bò",
    "1kg bún",
    "Hành lá, rau thơm",
    "Gia vị vừa đủ",
  ];

  return (
    <View style={styles.container}>
      <SafeAreaView edges={['top']} style={styles.safeArea}>
        <View style={styles.header}>
          <TouchableOpacity 
            onPress={() => canGoBack ? router.back() : router.replace('/(tabs)/home')} 
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
      </SafeAreaView>

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
        onSearch={() => router.push('/(tabs)/search')}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  safeArea: {
    backgroundColor: Colors.white,
  },
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
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text.primary,
  },
  placeholder: {
    width: 32,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: Colors.text.secondary,
  },
  errorText: {
    fontSize: 16,
    color: '#FF3B30',
    textAlign: 'center',
    marginBottom: 16,
  },
  retryText: {
    fontSize: 16,
    color: Colors.primary,
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
});
