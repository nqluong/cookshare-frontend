import { useCollectionManager } from "@/hooks/useCollectionManager";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { getImageUrl } from "../../../config/api.config";
import { Colors } from "../../../styles/colors";
import { Recipe } from "../../../types/dish";
import RecipeSaveButton from "../RecipeSaveButton";

interface NewestRecipesProps {
  recipes: Recipe[]; // Danh sách công thức mới nhất từ API
  onRecipePress?: (recipe: Recipe) => void; // Callback khi nhấn vào công thức
  onLoadMore?: () => void; // Callback khi cần load thêm
  hasMore?: boolean; // Còn data để load không
  isLoadingMore?: boolean; // Đang load thêm không
  likedRecipes?: Set<string>;
  likingRecipeId?: string | null;
  onToggleLike?: (recipeId: string) => Promise<void>;
}

// Component hiển thị danh sách công thức mới nhất (theo createdAt)
export default function NewestRecipes({
  recipes,
  onRecipePress,
  onLoadMore,
  hasMore = false,
  isLoadingMore = false,
  likedRecipes = new Set<string>(),
  likingRecipeId,
  onToggleLike,
}: NewestRecipesProps) {
  const router = useRouter();
  // Sử dụng collection manager hook
  const {
    isSaved,
    collections,
    userUUID,
    isLoadingSaved,
    handleUnsaveRecipe,
    handleSaveRecipe: updateSavedCache,
  } = useCollectionManager();

  // State để quản lý saveCount tạm thời trên UI
  const [localSaveCounts, setLocalSaveCounts] = useState<Map<string, number>>(
    new Map()
  );

  const toggleLike = async (recipeId: string, event: any) => {
    event.stopPropagation();

    // ✅ Kiểm tra đang loading hoặc không có callback
    if (likingRecipeId === recipeId || !onToggleLike) {
      return;
    }

    await onToggleLike(recipeId); // ✅ Gọi callback từ parent
  };

  const getDifficultyText = (difficulty: string) => {
    switch (difficulty) {
      case "EASY":
        return "Dễ";
      case "MEDIUM":
        return "Trung bình";
      case "HARD":
        return "Khó";
      default:
        return difficulty;
    }
  };

  const handleSaveSuccess = (
    recipeId: string,
    collectionId: string,
    newSaveCount: number
  ) => {
    // 1. Cập nhật saveCount trên UI
    setLocalSaveCounts((prev) => new Map(prev).set(recipeId, newSaveCount));

    // 2. Cập nhật cache (savedRecipes & recipeToCollectionMap)
    updateSavedCache(recipeId, collectionId);
  };

  const handleUnsaveSuccess = (recipeId: string, newSaveCount: number) => {
    setLocalSaveCounts((prev) => new Map(prev).set(recipeId, newSaveCount));
  };

  const handleCreateNewCollection = () => {
    // TODO: Điều hướng đến màn hình tạo bộ sưu tập
    router.push("/create-collection" as any);
  };

  if (!recipes || recipes.length === 0) {
    return null;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Mới nhất</Text>
      {recipes.map((recipe) => {
        const isLiked = likedRecipes.has(recipe.recipeId);
        const isLoading = likingRecipeId === recipe.recipeId;
        const currentLikes = recipe.likeCount;
        const saved = isSaved(recipe.recipeId);
        const currentSaveCount =
        localSaveCounts.get(recipe.recipeId) ?? recipe.saveCount ?? 0;

        return (
          <TouchableOpacity
            key={recipe.recipeId}
            style={styles.card}
            onPress={() => onRecipePress?.(recipe)}
            activeOpacity={0.7}
          >
            {/* Image Section */}
            <View style={styles.imageWrapper}>
              <Image
                source={{ uri: getImageUrl(recipe.featuredImage) }}
                style={styles.image}
                resizeMode="cover"
              />
              {/* Hàng nút ❤️ + 🔖 ở phía dưới ảnh */}
              <View style={styles.actionRow}>
                <TouchableOpacity
                  style={[
                    styles.actionButton,
                    isLoading && styles.loadingLikeButton,
                  ]}
                  onPress={(e) => toggleLike(recipe.recipeId, e)}
                  activeOpacity={0.7}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <ActivityIndicator size={20} color={Colors.primary} />
                  ) : (
                    <Ionicons
                      name={isLiked ? "heart" : "heart-outline"}
                      size={25}
                      color={isLiked ? Colors.primary : Colors.text.light}
                    />
                  )}
                </TouchableOpacity>

                <RecipeSaveButton
                  recipeId={recipe.recipeId}
                  isSaved={saved}
                  isDisabled={isLoadingSaved}
                  size={25}
                  collections={collections}
                  userUUID={userUUID}
                  currentSaveCount={currentSaveCount}
                  onSaveSuccess={handleSaveSuccess}
                  onUnsaveSuccess={handleUnsaveSuccess}
                  onUnsave={handleUnsaveRecipe}
                  onCreateNewCollection={handleCreateNewCollection}
                  style={styles.actionButton}
                />
              </View>
            </View>

            {/* Content Section */}
            <View style={styles.content}>
              {/* Title */}
              <Text style={styles.recipeName} numberOfLines={2}>
                {recipe.title}
              </Text>

              {/* Grid thông tin 2 hàng × 3 cột */}
              <View style={styles.infoGrid}>
                {/* Hàng 1 */}
                <View style={styles.infoRow}>
                  <View style={styles.infoItem}>
                    <Ionicons
                      name="bar-chart-outline"
                      size={16}
                      color={Colors.text.secondary}
                    />
                    <Text style={styles.infoText}>
                      {getDifficultyText(recipe.difficulty)}
                    </Text>
                  </View>
                  <View style={styles.infoItem}>
                    <Ionicons
                      name="time-outline"
                      size={16}
                      color={Colors.text.secondary}
                    />
                    <Text style={styles.infoText}>{recipe.cookTime}p</Text>
                  </View>
                  <View style={styles.infoItem}>
                    <Ionicons
                      name="people-outline"
                      size={16}
                      color={Colors.text.secondary}
                    />
                    <Text style={styles.infoText}>{recipe.servings}</Text>
                  </View>
                </View>

                {/* Hàng 2 */}
                <View style={styles.infoRow}>
                  <View style={styles.infoItem}>
                    <Ionicons name="star" size={16} color="#FFD700" />
                    <Text style={styles.infoText}>
                      {recipe.averageRating.toFixed(1)}
                    </Text>
                    <Text style={styles.statSubText}>
                      ({recipe.ratingCount})
                    </Text>
                  </View>
                  <View style={styles.infoItem}>
                    <Ionicons
                      name="eye-outline"
                      size={16}
                      color={Colors.text.secondary}
                    />
                    <Text style={styles.infoText}>{recipe.viewCount}</Text>
                  </View>
                  <View style={styles.infoItem}>
                    <Ionicons name="heart" size={16} color={Colors.primary} />
                    <Text style={styles.infoText}>{currentLikes}</Text>
                  </View>
                  <View style={styles.infoItem}>
                    <Ionicons name="bookmark" size={16} color="#FFD700" />
                    <Text style={styles.infoText}>
                      {currentSaveCount.toLocaleString()}
                    </Text>
                  </View>
                </View>
              </View>
            </View>
          </TouchableOpacity>
        );
      })}

      {/* Chế độ load thêm */}
      {hasMore && (
        <View style={styles.loadMoreContainer}>
          {isLoadingMore ? (
            <ActivityIndicator size="small" color={Colors.primary} />
          ) : (
            <TouchableOpacity
              style={styles.loadMoreButton}
              onPress={onLoadMore}
              activeOpacity={0.7}
            >
              <Text style={styles.loadMoreText}>Xem thêm</Text>
              <Ionicons name="chevron-down" size={16} color={Colors.primary} />
            </TouchableOpacity>
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  title: {
    fontSize: 17,
    fontWeight: "700",
    color: Colors.text.primary,
    marginBottom: 16,
  },
  card: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    marginBottom: 16,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  imageWrapper: {
    width: "100%",
    height: 200,
    position: "relative",
  },
  image: {
    width: "100%",
    height: "100%",
  },
  likeButton: {
    position: "absolute",
    top: 12,
    right: 12,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  content: {
    padding: 16,
  },
  recipeName: {
    fontSize: 16,
    fontWeight: "700",
    color: Colors.text.primary,
    marginBottom: 12,
    lineHeight: 22,
  },
  statSubText: {
    fontSize: 16,
    color: Colors.text.secondary,
  },
  loadMoreContainer: {
    alignItems: "center",
    paddingVertical: 16,
  },
  loadMoreButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: Colors.white,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.primary,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  loadMoreText: {
    fontSize: 14,
    color: Colors.primary,
    fontWeight: "600",
  },
  loadingLikeButton: {
    opacity: 0.7,
  },
  actionRow: {
  position: "absolute",
  bottom: 12,
  left: 0,
  right: 0,
  flexDirection: "row",
  justifyContent: "space-between",
  alignItems: "center",
  paddingHorizontal: 12, 
},

actionButton: {
  width: 42,
  height: 42,
  borderRadius: 21,
  backgroundColor: Colors.white,
  justifyContent: "center",
  alignItems: "center",
  shadowColor: "#000",
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.2,
  shadowRadius: 3,
  elevation: 5,
  borderWidth: 1,
  borderColor: "rgba(0,0,0,0.05)",
},

  infoGrid: {
    marginTop: 6,
    gap: 6,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 4,
  },
  infoItem: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
  },
  infoText: {
    fontSize: 16,
    color: Colors.text.secondary,
  },
});
