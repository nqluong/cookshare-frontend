import { CollectionUserDto } from "@/types/collection.types";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Colors } from "../../../styles/colors";
import { Recipe } from "../../../types/dish";
import { recipeToDish } from "../../../utils/recipeHelpers";
import { getDifficultyText } from "../../../utils/recipeUtils";
import { CachedImage, ImagePriority } from "../../ui/CachedImage";
import RecipeSaveButton from "../RecipeSaveButton";

interface PopularRecipesProps {
  recipes: Recipe[];
  onRecipePress?: (recipe: Recipe) => void;
  onLoadMore?: () => void;
  hasMore?: boolean;
  isLoadingMore?: boolean;
  likedRecipes?: Set<string>;
  likingRecipeId?: string | null;
  onToggleLike?: (recipeId: string) => Promise<void>;
  isSaved: (recipeId: string) => boolean;
  savedVersion: number;
  collections: CollectionUserDto[];
  userUUID: string;
  isLoadingSaved: boolean;
  handleUnsaveRecipe: (
    recipeId: string,
    currentSaveCount: number,
    onSuccess: (newSaveCount: number) => void
  ) => Promise<void>;
  updateSavedCache: (recipeId: string, collectionId: string) => void;
}

// Component hiển thị danh sách công thức phổ biến (theo saveCount)
export default function PopularRecipes({
  recipes = [],
  onRecipePress,
  onLoadMore,
  hasMore = false,
  isLoadingMore = false,
  likedRecipes = new Set<string>(),
  likingRecipeId,
  onToggleLike,
  isSaved,
  savedVersion,
  collections,
  userUUID,
  isLoadingSaved,
  handleUnsaveRecipe,
  updateSavedCache,
}: PopularRecipesProps) {
  const router = useRouter();
  const isLoadingRef = useRef(false);

  // State để quản lý saveCount tạm thời trên UI
  const [localSaveCounts, setLocalSaveCounts] = useState<Map<string, number>>(
    new Map()
  );
  useEffect(() => {}, [savedVersion]);
  const handleScroll = (event: any) => {
    const { layoutMeasurement, contentOffset, contentSize } = event.nativeEvent;
    // Load thêm khi còn 30% nội dung (tương đương 70% đã scroll)
    const threshold = contentSize.width * 0.3;

    if (
      layoutMeasurement.width + contentOffset.x >=
      contentSize.width - threshold
    ) {
      if (hasMore && !isLoadingMore && !isLoadingRef.current && onLoadMore) {
        isLoadingRef.current = true;
        onLoadMore();

        // Reset loading ref sau 1 giây để tránh gọi liên tục
        setTimeout(() => {
          isLoadingRef.current = false;
        }, 1000);
      }
    }
  };

  const toggleLike = async (recipeId: string, event: any) => {
    event.stopPropagation();

    if (likingRecipeId === recipeId || !onToggleLike) {
      return;
    }

    await onToggleLike(recipeId);
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
    return null; // Không hiển thị nếu không có dữ liệu
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Phổ biến nhất</Text>
        <TouchableOpacity
          style={styles.viewAllButton}
          onPress={() =>
            router.push({
              pathname: "/_view-all",
              params: {
                type: "popular",
                liked: JSON.stringify([...likedRecipes]),
              },
            })
          }
          activeOpacity={0.7}
        >
          <Text style={styles.viewAllText}>Xem tất cả</Text>
          <Ionicons name="chevron-forward" size={16} color={Colors.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        onScroll={handleScroll}
        scrollEventThrottle={400}
      >
        {recipes.map((recipe) => {
          const dish = recipeToDish(recipe);
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
              <View style={styles.imageWrapper}>
                <View style={styles.imageContainer}>
                  <CachedImage
                    source={{ uri: dish.image }}
                    style={styles.image}
                    resizeMode="cover"
                    priority={ImagePriority.normal}
                    placeholder={
                      <View style={styles.imagePlaceholder}>
                        <Ionicons
                          name="image-outline"
                          size={40}
                          color={Colors.gray[400]}
                        />
                      </View>
                    }
                  />
                </View>

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
                      <ActivityIndicator size={12} color={Colors.primary} />
                    ) : (
                      <Ionicons
                        name={isLiked ? "heart" : "heart-outline"}
                        size={16}
                        color={isLiked ? Colors.primary : Colors.text.light}
                      />
                    )}
                  </TouchableOpacity>

                  <RecipeSaveButton
                    recipeId={recipe.recipeId}
                    isSaved={saved}
                    isDisabled={isLoadingSaved}
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
              <View style={styles.info}>
                <Text style={styles.dishName} numberOfLines={2}>
                  {dish.name}
                </Text>

                {/* Grid thông tin 2 hàng × 3 cột */}
                <View style={styles.infoGrid}>
                  {/* Hàng 1 */}
                  <View style={styles.infoRow}>
                    <View style={styles.infoItem}>
                      <Ionicons
                        name="bar-chart-outline"
                        size={12}
                        color={Colors.text.secondary}
                      />
                      <Text style={styles.infoText}>
                        {getDifficultyText(recipe.difficulty)}
                      </Text>
                    </View>
                    <View style={styles.infoItem}>
                      <Ionicons
                        name="time-outline"
                        size={12}
                        color={Colors.text.secondary}
                      />
                      <Text style={styles.infoText}>{recipe.cookTime}p</Text>
                    </View>
                    <View style={styles.infoItem}>
                      <Ionicons
                        name="people-outline"
                        size={12}
                        color={Colors.text.secondary}
                      />
                      <Text style={styles.infoText}>{recipe.servings}</Text>
                    </View>
                  </View>

                  {/* Hàng 2 */}
                  <View style={styles.infoRow}>
                    <View style={styles.infoItem}>
                      <Ionicons
                        name="eye-outline"
                        size={12}
                        color={Colors.text.secondary}
                      />
                      <Text style={styles.infoText}>{recipe.viewCount}</Text>
                    </View>
                    <View style={styles.infoItem}>
                      <Ionicons name="heart" size={12} color={Colors.primary} />
                      <Text style={styles.infoText}>{currentLikes}</Text>
                    </View>
                    <View style={styles.infoItem}>
                      <Ionicons name="bookmark" size={12} color="#FFD700" />
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

        {isLoadingMore && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="small" color={Colors.primary} />
            <Text style={styles.loadingText}>Đang tải...</Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 24,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  title: {
    fontSize: 17,
    fontWeight: "700",
    color: Colors.text.primary,
  },
  scrollContent: {
    paddingHorizontal: 16,
    gap: 12,
  },
  card: {
    width: 150,
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    bottom: 1,
  },
  imageWrapper: {
    position: "relative",
    marginBottom: 8,
  },
  imageContainer: {
    width: "100%",
    height: 134,
    borderRadius: 8,
    backgroundColor: Colors.gray[100],
    overflow: "hidden",
  },
  image: {
    width: "100%",
    height: "100%",
  },
  info: {
    gap: 6,
  },
  dishName: {
    fontSize: 13,
    fontWeight: "600",
    color: Colors.text.primary,
    minHeight: 32,
    lineHeight: 16,
  },
  viewAllButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  viewAllText: {
    fontSize: 14,
    color: Colors.primary,
    fontWeight: "600",
  },
  loadingContainer: {
    width: 150,
    height: 200,
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
  },
  loadingText: {
    fontSize: 12,
    color: Colors.text.secondary,
    marginTop: 4,
  },
  loadingLikeButton: {
    opacity: 0.7,
  },
  actionRow: {
    position: "absolute",
    bottom: 6,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 6,
  },
  actionButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: Colors.white,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 3,
  },
  infoGrid: {
    marginTop: 6,
    gap: 6,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  infoItem: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
  },
  infoText: {
    fontSize: 11,
    color: Colors.text.secondary,
  },
  imagePlaceholder: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: Colors.gray[100],
  },
});
