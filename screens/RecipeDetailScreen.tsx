import { useAuth } from '@/context/AuthContext';
import { useRecipeViewContext } from '@/context/RecipeViewContext';
import { useCollectionManager } from '@/hooks/useCollectionManager';
import { commentService } from '@/services/commentService';
import { userService } from '@/services/userService';
import { UserProfile } from '@/types/user.types';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";
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
import { getRecipeById } from "../services/recipeService";
import { CACHE_CATEGORIES, unifiedCacheService } from '../services/unifiedCacheService';
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
  imageUrl?: string;
};

type Comment = {
  user: string;
  text: string;
  icon?: string;
  time?: string;
};

type RecipeAuthor = {
  userId: string;
  username: string;
  fullName: string;
  avatarUrl?: string;
};

const fetchWithTimeout = async (promise: Promise<any>, timeoutMs = 7000) => {
  return Promise.race([
    promise,
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error("Quá thời gian phản hồi, thử lại sau")), timeoutMs)
    ),
  ]);
};

function normalizeCommentsRecursive(comments: any[]): any[] {
  return comments.map((c) => ({
    ...c,
    replies: c.replies?.length ? normalizeCommentsRecursive(c.replies) : [],
  }));
}

function countAllCommentsRecursive(comments: any[]): number {
  if (!comments || comments.length === 0) return 0;
  return comments.reduce((sum, c) => sum + 1 + countAllCommentsRecursive(c.replies || []), 0);
}

export default function RecipeDetailScreen() {
  const router = useRouter();
  const { id, reload, from } = useLocalSearchParams<{ id?: string; reload?: string; from?: string }>();
  const [recipe, setRecipe] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [authorInfo, setAuthorInfo] = useState<RecipeAuthor | null>(null);
  const [isOffline, setIsOffline] = useState(false);
  const [isFromCache, setIsFromCache] = useState(false);
  const [commentCount, setCommentCount] = useState<number>(0);

  const { notifyViewUpdate } = useRecipeViewContext();
  const hasNotifiedView = useRef(false);
  const lastNotifiedRecipeId = useRef<string>("");

  // Collection manager for save functionality
  const {
    isSaved,
    collections,
    userUUID,
    handleSaveRecipe,
    handleUnsaveRecipe,
  } = useCollectionManager();

  const recipeId = id || "";

  // Reset hasNotifiedView when recipeId changes
  useEffect(() => {
    if (recipeId !== lastNotifiedRecipeId.current) {
      hasNotifiedView.current = false;
    }
  }, [recipeId]);

  // Refetch data mỗi khi focus vào screen này (khi quay lại từ chỉnh sửa)
  useFocusEffect(
    useCallback(() => {
      if (recipeId) {
        const fetchData = async () => {
          try {
            setLoading(true);
            setIsFromCache(false);

            // Kiểm tra kết nối mạng (dùng unifiedCacheService để support force offline mode)
            const online = await unifiedCacheService.isConnected();
            setIsOffline(!online);

            let finalCommentCount = 0;

            if (!online) {
              // Nếu offline, thử load từ cache
              const cachedData = await unifiedCacheService.getFromCache(CACHE_CATEGORIES.RECIPE_DETAIL, recipeId) as any;

              if (cachedData) {
                setRecipe(cachedData.recipe);
                if (cachedData.authorInfo) {
                  setAuthorInfo(cachedData.authorInfo);
                }
                finalCommentCount = cachedData.commentCount || 0;
                setIsFromCache(true);
                setError(null);
              } else {
                // Không có cache cho recipe này khi offline
                setError("Không có kết nối internet và chưa có dữ liệu ngoại tuyến");
              }
              return;
            }

            // Nếu online, fetch từ API
            const data = await fetchWithTimeout(getRecipeById(recipeId), 7000);
            setRecipe(data);

            // Load author info from API
            let loadedAuthorInfo = null;
            if (data?.userId) {
              try {
                const authorData = await userService.getUserById(data.userId);
                loadedAuthorInfo = {
                  userId: data.userId,
                  username: authorData?.username || data?.username || "",
                  fullName: authorData?.fullName || data?.fullName || "",
                  avatarUrl: authorData?.avatarUrl || data?.avatarUrl || data?.userAvatarUrl || "",
                };
                setAuthorInfo(loadedAuthorInfo);
              } catch (authorErr) {
                loadedAuthorInfo = {
                  userId: data.userId,
                  username: data?.username || "",
                  fullName: data?.fullName || "",
                  avatarUrl: data?.avatarUrl || data?.userAvatarUrl || "",
                };
                setAuthorInfo(loadedAuthorInfo);
              }
            }

            try {
              const commentsData = await commentService.getCommentsByRecipe(recipeId);
              const normalized = normalizeCommentsRecursive(commentsData);
              finalCommentCount = countAllCommentsRecursive(normalized);
            } catch (commentErr) {
              console.log("Không thể load số bình luận:", commentErr);
              finalCommentCount = data.commentCount || 0; // fallback nếu API recipe có field này
            }

            await unifiedCacheService.saveToCache(CACHE_CATEGORIES.RECIPE_DETAIL, {
              recipe: data,
              authorInfo: loadedAuthorInfo,
              commentCount: finalCommentCount,
            }, recipeId);

            // Xác minh cache
            const isCached = await unifiedCacheService.isCached(CACHE_CATEGORIES.RECIPE_DETAIL, recipeId);

            setCommentCount(finalCommentCount);
            setError(null);

            // Notify view update để Home screen cập nhật view count
            if (!hasNotifiedView.current) {
              console.log(`[RecipeDetailScreen] Notifying view update for: ${recipeId}`);
              notifyViewUpdate(recipeId);
              hasNotifiedView.current = true;
              lastNotifiedRecipeId.current = recipeId;
            }
          } catch (err: any) {
            // Khi có lỗi, chỉ hiển thị thông báo lỗi, không fallback sang cache
            setError(err.message || "Không thể tải công thức");
          } finally {
            setLoading(false);
          }
        };

        fetchData();
      }
    }, [recipeId, notifyViewUpdate])
  );

  useEffect(() => {
    if (user?.username) {
      loadProfile();
    }
  }, [user]);

  const loadProfile = async () => {
    if (!user?.username) return;

    try {
      const profile = await userService.getUserByUsername(user.username);
      setUserProfile(profile);
    } catch (error: any) {
      Alert.alert("Lỗi", error.message || "Không thể tải thông tin cá nhân");
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <Header router={router} sourceRoute={from} />
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
        <Header router={router} sourceRoute={from} />
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
      imageUrl: s.imageUrl,
    }))
    : [];

  return (
    <View style={styles.container}>
      <SafeAreaView edges={['top']} style={styles.safeArea}>
        <Header router={router} sourceRoute={from} />
        {(isOffline || isFromCache) && (
          <View style={styles.offlineBanner}>
            <Ionicons name="cloud-offline-outline" size={16} color="#FFF" />
            <Text style={styles.offlineText}>
              {isOffline ? 'Chế độ offline - Hiển thị dữ liệu đã lưu' : 'Dữ liệu từ cache'}
            </Text>
          </View>
        )}
      </SafeAreaView>

      <RecipeDetailView
        recipe={{
          id: recipe.recipeId,
          title: recipe.title,
          description: recipe.description,
          image: recipe.featuredImage,
          author: recipe.fullName || recipe.createdBy || user?.username || "",
          prepTime: recipe.prepTime ?? 0,
          cookTime: recipe.cookTime ?? 0,
          servings: recipe.servings ?? 1,
          difficulty: recipe.difficulty || recipe.level || "Không rõ",
          averageRating: recipe.averageRating,
          ratingCount: recipe.ratingCount,
          // Xử lý category - lấy name từ array of objects
          category: (() => {
            const catField = recipe.categories || recipe.categoryName || recipe.category;

            if (!catField) return [];

            // Nếu là array of objects → lấy name
            if (Array.isArray(catField)) {
              return catField.map(cat =>
                typeof cat === 'string' ? cat : cat.name
              );
            }

            // Nếu là string
            if (typeof catField === 'string') return [catField];

            // Nếu là object với name property
            if (catField?.name) return [catField.name];

            return [];
          })(),
          // Giữ nguyên object tag từ API để có màu
          tags: recipe.tags ?? [],
          ingredients,
          steps,
          video: recipe.videoUrl || "",
          likes: recipe.likeCount ?? 0,
          views: recipe.viewCount ?? 0,
          saves: recipe.saveCount ?? 0,
          commentCount: commentCount,
        }}
        authorInfo={authorInfo || {
          userId: recipe.userId || recipe.createdBy || "",
          username: recipe.username || "",
          fullName: recipe.fullName || recipe.createdBy || "",
          avatarUrl: recipe.avatarUrl || recipe.userAvatarUrl || "",
        }}
        currentUserId={userProfile ? userProfile.userId : ""}
        currentUserAvatar={userProfile ? userProfile.avatarUrl : undefined}
        router={router}
        onBack={() => router.back()}
        onSearch={() => router.push('/(tabs)/search')}
        sourceRoute={from}
        // Save props
        isSaved={isSaved(recipe.recipeId)}
        collections={collections}
        userUUID={userUUID}
        onSaveSuccess={handleSaveRecipe}
        onUnsaveRecipe={handleUnsaveRecipe}
      />
    </View>
  );
}

const Header = ({ router, sourceRoute }: { router: any; sourceRoute?: string }) => {
  const handleBack = () => {

    // Nếu có source route được truyền, navigate về đó
    if (sourceRoute) {
      router.push(sourceRoute);
    } else if (router.canGoBack()) {
      router.back();
    } else {
      router.push('/(tabs)/home');
    }
  };

  return (
    <View style={styles.header}>
      <TouchableOpacity
        onPress={handleBack}
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
};

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
  offlineBanner: {
    backgroundColor: '#FF9500',
    paddingVertical: 8,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  offlineText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '600',
  },
});