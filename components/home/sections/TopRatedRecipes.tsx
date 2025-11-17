import { CollectionUserDto } from "@/types/collection.types";
import { getDifficultyText } from "@/utils/recipeUtils";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Colors } from "../../../styles/colors";
import { Recipe } from "../../../types/dish";
import { recipeToDish } from "../../../utils/recipeHelpers";
import { CachedImage, ImagePriority } from "../../ui/CachedImage";
import RecipeSaveButton from "../RecipeSaveButton";

interface TopRatedRecipesProps {
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

export default function TopRatedRecipes({
  recipes,
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
}: TopRatedRecipesProps) {
  const router = useRouter();
  const flatListRef = useRef<FlatList>(null);
  const isLoadingRef = useRef(false);

  const [localSaveCounts, setLocalSaveCounts] = useState<Map<string, number>>(
    new Map()
  );

  useEffect(() => {}, [savedVersion]);

  //Load thêm khi gần cuối danh sách ngang
  const handleEndReached = useCallback(() => {
    if (hasMore && !isLoadingMore && !isLoadingRef.current && onLoadMore) {
      isLoadingRef.current = true;
      onLoadMore();

      setTimeout(() => {
        isLoadingRef.current = false;
      }, 1000);
    }
  }, [hasMore, isLoadingMore, onLoadMore]);

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
    setLocalSaveCounts((prev) => new Map(prev).set(recipeId, newSaveCount));
    updateSavedCache(recipeId, collectionId);
  };

  const handleUnsaveSuccess = (recipeId: string, newSaveCount: number) => {
    setLocalSaveCounts((prev) => new Map(prev).set(recipeId, newSaveCount));
  };

  const handleCreateNewCollection = () => {
    router.push("/create-collection" as any);
  };

  // Render từng item (memoized)
  const renderRecipeItem = useCallback(
    ({ item: recipe, index }: { item: Recipe; index: number }) => {
      const dish = recipeToDish(recipe);
      const isLiked = likedRecipes.has(recipe.recipeId);
      const isLoading = likingRecipeId === recipe.recipeId;
      const currentLikes = recipe.likeCount;
      const saved = isSaved(recipe.recipeId);
      const currentSaveCount =
        localSaveCounts.get(recipe.recipeId) ?? recipe.saveCount ?? 0;

      return (
        <TouchableOpacity
          style={[styles.card, index === 0 && styles.firstCard]}
          onPress={() => onRecipePress?.(recipe)}
          activeOpacity={0.7}
        >
          <View style={styles.imageWrapper}>
            <View style={styles.imageContainer}>
              <CachedImage
                source={{ uri: dish.image }}
                style={styles.image}
                resizeMode="cover"
                priority={index < 3 ? ImagePriority.high : ImagePriority.normal}
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
              {/* Rating badge */}
              <View style={styles.ratingBadge}>
                <Ionicons name="star" size={12} color="#FFD700" />
                <Text style={styles.ratingText}>
                  {recipe.averageRating.toFixed(1)}
                </Text>
              </View>
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
    },
    [
      likedRecipes,
      likingRecipeId,
      localSaveCounts,
      isSaved,
      collections,
      userUUID,
      isLoadingSaved,
      onRecipePress,
      toggleLike,
      handleSaveSuccess,
      handleUnsaveSuccess,
      handleUnsaveRecipe,
      handleCreateNewCollection,
    ]
  );

  // 🔑 Key extractor
  const keyExtractor = useCallback((item: Recipe) => item.recipeId, []);

  // 📍 Footer component với loading
  const renderFooter = useCallback(() => {
    if (!hasMore && !isLoadingMore) return null;

    return (
      <View style={styles.loadingContainer}>
        {isLoadingMore ? (
          <>
            <ActivityIndicator size="small" color={Colors.primary} />
            <Text style={styles.loadingText}>Đang tải...</Text>
          </>
        ) : (
          <TouchableOpacity
            style={styles.loadMoreButton}
            onPress={onLoadMore}
            activeOpacity={0.7}
          >
            <Ionicons name="chevron-forward" size={20} color={Colors.primary} />
          </TouchableOpacity>
        )}
      </View>
    );
  }, [hasMore, isLoadingMore, onLoadMore]);

  // 📍 Item separator
  const ItemSeparator = useCallback(
    () => <View style={styles.separator} />,
    []
  );

  if (!recipes || recipes.length === 0) {
    return null;
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Đánh giá cao nhất ⭐</Text>
        <TouchableOpacity
          style={styles.viewAllButton}
          onPress={() =>
            router.push({
              pathname: "/_view-all",
              params: {
                type: "topRated",
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

      <FlatList
        ref={flatListRef}
        data={recipes}
        renderItem={renderRecipeItem}
        keyExtractor={keyExtractor}
        // 🔥 Horizontal scroll
        horizontal
        showsHorizontalScrollIndicator={false}
        // 🎯 Load thêm khi còn 30% nội dung
        onEndReached={handleEndReached}
        onEndReachedThreshold={0.3}
        // 📍 Components
        ListFooterComponent={renderFooter}
        ItemSeparatorComponent={ItemSeparator}
        // 🚀 Performance optimizations
        removeClippedSubviews={true}
        maxToRenderPerBatch={5}
        updateCellsBatchingPeriod={50}
        initialNumToRender={5}
        windowSize={7}
        // 📏 Item layout (tối ưu cho horizontal scroll)
        getItemLayout={(data, index) => ({
          length: 162, // width: 150 + marginRight: 12
          offset: 162 * index,
          index,
        })}
        // 🎨 Styling
        contentContainerStyle={styles.listContent}
        // 📱 Smooth scrolling
        decelerationRate="fast"
        snapToInterval={162} // Snap to each card
        snapToAlignment="start"
      />
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
  listContent: {
    paddingHorizontal: 16,
  },
  separator: {
    width: 12,
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
  },
  firstCard: {
    // Có thể thêm style đặc biệt cho card đầu tiên nếu cần
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
    position: "relative",
  },
  image: {
    width: "100%",
    height: "100%",
  },
  imagePlaceholder: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: Colors.gray[100],
  },
  ratingBadge: {
    position: "absolute",
    top: 8,
    right: 8,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  ratingText: {
    color: Colors.white,
    fontSize: 11,
    fontWeight: "600",
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
    height: 220,
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
  },
  loadingText: {
    fontSize: 12,
    color: Colors.text.secondary,
    marginTop: 4,
  },
  loadMoreButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: Colors.white,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1,
    borderColor: Colors.primary,
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
});
