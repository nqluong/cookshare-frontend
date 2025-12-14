import { moderateScale, scale, verticalScale } from "@/constants/layout";
import { Colors } from "@/styles/colors";
import { CollectionUserDto } from "@/types/collection.types";
import { Recipe } from "@/types/dish";
import { recipeToDish } from "@/utils/recipeHelpers";
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
import { CachedImage } from "../../ui/CachedImage";
import RecipeSaveButton from "../RecipeSaveButton";

interface TrendingRecipesProps {
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

export default function TrendingRecipes({
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
}: TrendingRecipesProps) {
  const router = useRouter();
  const isLoadingRef = useRef(false);

  const [localSaveCounts, setLocalSaveCounts] = useState<Map<string, number>>(
    new Map()
  );

  const handleScroll = (event: any) => {
    const { layoutMeasurement, contentOffset, contentSize } = event.nativeEvent;
    const threshold = contentSize.width * 0.3;

    if (
      layoutMeasurement.width + contentOffset.x >=
      contentSize.width - threshold
    ) {
      if (hasMore && !isLoadingMore && !isLoadingRef.current && onLoadMore) {
        isLoadingRef.current = true;
        onLoadMore();

        setTimeout(() => {
          isLoadingRef.current = false;
        }, 1000);
      }
    }
  };

  const toggleLike = async (recipeId: string, event: any) => {
    event.stopPropagation();
    if (likingRecipeId === recipeId || !onToggleLike) return;
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

  useEffect(() => { }, [savedVersion]);
  if (!recipes || recipes.length === 0) return null;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Đang thịnh hành</Text>
        <TouchableOpacity
          style={styles.viewAllButton}
          onPress={() =>
            router.push({
              pathname: "/_view-all",
              params: {
                type: "trending",
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
        {recipes.map((recipe, index) => {
          const dish = recipeToDish(recipe);
          const isLiked = likedRecipes.has(recipe.recipeId);
          const isLoadingLike = likingRecipeId === recipe.recipeId;
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
                    priority={"normal"}
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

                {/* RANK BADGE - moved outside imageContainer */}
                {index < 3 && (
                  <View style={styles.rankBadge}>
                    <Text style={styles.rankText}>{index + 1}</Text>
                  </View>
                )}

                {/* LIKE BUTTON */}
                <TouchableOpacity
                  style={[
                    styles.likeButton,
                    isLoadingLike && styles.loadingLikeButton,
                  ]}
                  onPress={(e) => toggleLike(recipe.recipeId, e)}
                  activeOpacity={0.7}
                  disabled={isLoadingLike}
                >
                  {isLoadingLike ? (
                    <ActivityIndicator size={12} color={Colors.primary} />
                  ) : (
                    <Ionicons
                      name={isLiked ? "heart" : "heart-outline"}
                      size={16}
                      color={isLiked ? Colors.primary : Colors.text.light}
                    />
                  )}
                </TouchableOpacity>

                {/* SAVE BUTTON - Sử dụng component mới */}
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
                  style={styles.saveButton}
                />
              </View>

              <Text style={styles.dishName} numberOfLines={1}>
                {dish.name}
              </Text>

              <View style={styles.statsRow}>
                <View style={styles.statItem}>
                  <Ionicons name="heart" size={12} color={Colors.primary} />
                  <Text style={styles.statText}>
                    {(recipe.likeCount || 0).toLocaleString()}
                  </Text>
                </View>
                <View style={styles.statItem}>
                  <Ionicons name="bookmark" size={12} color="#FFD700" />
                  <Text style={styles.statText}>
                    {currentSaveCount.toLocaleString()}
                  </Text>
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
  container: { marginBottom: verticalScale(24) },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: scale(16),
    marginBottom: verticalScale(12),
  },
  title: { fontSize: moderateScale(17), fontWeight: "700", color: Colors.text.primary },
  scrollContent: { paddingHorizontal: scale(16), gap: scale(12) },
  card: { width: scale(90), alignItems: "center" },
  imageWrapper: { position: "relative", marginBottom: verticalScale(8) },
  imageContainer: {
    width: scale(90),
    height: scale(90),
    borderRadius: scale(45),
    backgroundColor: Colors.white,
    borderWidth: scale(2),
    borderColor: Colors.gray[200],
    overflow: "hidden",
  },
  image: { width: "100%", height: "100%" },
  imagePlaceholder: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: Colors.gray[100],
  },
  rankBadge: {
    position: "absolute",
    top: scale(-4),
    left: scale(-4),
    backgroundColor: Colors.primary,
    borderRadius: scale(12),
    width: scale(28),
    height: scale(28),
    justifyContent: "center",
    alignItems: "center",
    borderWidth: scale(2),
    borderColor: Colors.white,
  },
  rankText: { color: Colors.white, fontSize: moderateScale(12), fontWeight: "700" },
  likeButton: {
    position: "absolute",
    bottom: scale(-4),
    left: scale(-4),
    width: scale(28),
    height: scale(28),
    borderRadius: scale(14),
    backgroundColor: Colors.white,
    justifyContent: "center",
    alignItems: "center",
    elevation: 3,
  },
  saveButton: {
    position: "absolute",
    bottom: scale(-4),
    right: scale(-4),
  },
  loadingLikeButton: { opacity: 0.7 },
  dishName: {
    fontSize: moderateScale(13),
    fontWeight: "600",
    color: Colors.text.primary,
    textAlign: "center",
    marginBottom: verticalScale(2),
  },
  statsRow: { flexDirection: "row", gap: scale(6) },
  statItem: { flexDirection: "row", alignItems: "center", gap: scale(3) },
  statText: { fontSize: moderateScale(11), color: Colors.text.secondary },
  viewAllButton: { flexDirection: "row", alignItems: "center", gap: scale(4) },
  viewAllText: { fontSize: moderateScale(14), color: Colors.primary, fontWeight: "600" },
  loadingContainer: {
    width: scale(90),
    height: scale(90),
    justifyContent: "center",
    alignItems: "center",
    gap: scale(8),
  },
  loadingText: {
    fontSize: moderateScale(11),
    color: Colors.text.secondary,
  },
  loadingSaved: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: scale(16),
    marginBottom: verticalScale(8),
    gap: scale(8),
  },
});
