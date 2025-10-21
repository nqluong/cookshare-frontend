import { collectionService } from "@/services/collectionService";
import { userService } from "@/services/userService";
import { CollectionUserDto } from "@/types/collection.types";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useAuth } from "../../../context/AuthContext";
import { Colors } from "../../../styles/colors";
import { Recipe } from "../../../types/dish";
import { recipeToDish } from "../../../utils/recipeHelpers";

interface TrendingRecipesProps {
  recipes: Recipe[];
  onRecipePress?: (recipe: Recipe) => void;
  onLoadMore?: () => void;
  hasMore?: boolean;
  isLoadingMore?: boolean;
}

export default function TrendingRecipes({
  recipes,
  onRecipePress,
  onLoadMore,
  hasMore = false,
  isLoadingMore = false,
}: TrendingRecipesProps) {
  const router = useRouter();
  const { user } = useAuth();
  const [likedRecipes, setLikedRecipes] = useState<Set<string>>(new Set());
  const [savedRecipes, setSavedRecipes] = useState<Set<string>>(new Set());
  const [collections, setCollections] = useState<CollectionUserDto[]>([]);
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [userUUID, setUserUUID] = useState<string>("");

  useEffect(() => {
    if (user?.username) {
      initLoad();
    }
  }, [user?.username]);

  const initLoad = async () => {
    try {
      const profile = await userService.getUserByUsername(user!.username);
      setUserUUID(profile.userId);
      const data = await collectionService.getUserCollections(profile.userId);
      setCollections(data.data.content || []);
    } catch (error) {
      console.error("Error initializing:", error);
    }
  };

  const handleScroll = (event: any) => {
    const { layoutMeasurement, contentOffset, contentSize } = event.nativeEvent;
    const paddingToEnd = 20;
    if (
      layoutMeasurement.width + contentOffset.x >=
      contentSize.width - paddingToEnd
    ) {
      if (hasMore && !isLoadingMore && onLoadMore) {
        onLoadMore();
      }
    }
  };

  const toggleLike = (recipeId: string, event: any) => {
    event.stopPropagation();
    setLikedRecipes((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(recipeId)) newSet.delete(recipeId);
      else newSet.add(recipeId);
      return newSet;
    });
  };

  // 🔥 Khi ấn bookmark
  const openSaveModal = (recipe: Recipe, event: any) => {
    event.stopPropagation();
    const isAlreadySaved = savedRecipes.has(recipe.recipeId);
    setSelectedRecipe(recipe);

    if (isAlreadySaved) {
      // Nếu đã lưu → xóa luôn khỏi bộ sưu tập
      handleUnsaveRecipe(recipe);
    } else {
      // Nếu chưa lưu → hiển thị modal chọn bộ sưu tập
      setShowSaveModal(true);
    }
  };

  // 🗑 Hàm xóa công thức khỏi bộ sưu tập (không mở modal)
  const handleUnsaveRecipe = async (recipe: Recipe) => {
    try {
      // Ở đây tạm chọn bộ sưu tập đầu tiên để xóa (hoặc sửa lại logic sau)
      const firstCollectionId = collections[0]?.collectionId;
      if (!firstCollectionId) {
        Alert.alert("⚠️", "Bạn chưa có bộ sưu tập nào.");
        return;
      }

      await collectionService.removeRecipeFromCollection(
        userUUID,
        firstCollectionId,
        recipe.recipeId
      );

      setSavedRecipes((prev) => {
        const newSet = new Set(prev);
        newSet.delete(recipe.recipeId);
        return newSet;
      });

      Alert.alert("🗑 Đã xoá", "Công thức đã được gỡ khỏi bộ sưu tập.");
    } catch (error: any) {
      console.error("❌ Lỗi khi xoá công thức:", error);
      Alert.alert("Lỗi", error.message || "Không thể xoá khỏi bộ sưu tập.");
    }
  };

  const handleSaveToCollection = async (collectionId: string) => {
    if (!selectedRecipe) return;
    const recipeId = selectedRecipe.recipeId;

    try {
      await collectionService.addRecipeToCollection(userUUID, collectionId, {
        recipeId,
      });

      setSavedRecipes((prev) => new Set(prev).add(recipeId));
      Alert.alert("✅ Thành công", "Công thức đã được lưu vào bộ sưu tập!");
    } catch (error: any) {
      console.error("❌ Lỗi khi lưu công thức:", error);
      Alert.alert("Lỗi", error.message || "Không thể lưu vào bộ sưu tập.");
    } finally {
      setShowSaveModal(false);
    }
  };

  const handleCreateNewCollection = () => {
    Alert.alert("Tạo bộ sưu tập mới", "Chuyển sang màn hình tạo bộ sưu tập.");
    setShowSaveModal(false);
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

  if (!recipes || recipes.length === 0) return null;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Đang thịnh hành 🔥</Text>
        <TouchableOpacity
          style={styles.viewAllButton}
          onPress={() =>
            router.push({
              pathname: "/_view-all",
              params: { type: "trending" },
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
          const isSaved = savedRecipes.has(recipe.recipeId);
          const currentLikes = isLiked
            ? recipe.likeCount + 1
            : recipe.likeCount;
          const currentSaves = isSaved
            ? (recipe.saveCount || 0) + 1
            : recipe.saveCount || 0;

          return (
            <TouchableOpacity
              key={recipe.recipeId}
              style={styles.card}
              onPress={() => onRecipePress?.(recipe)}
              activeOpacity={0.7}
            >
              <View style={styles.imageWrapper}>
                <View style={styles.imageContainer}>
                  <Image
                    source={{ uri: dish.image }}
                    style={styles.image}
                    resizeMode="cover"
                  />
                  {index < 3 && (
                    <View style={styles.rankBadge}>
                      <Text style={styles.rankText}>#{index + 1}</Text>
                    </View>
                  )}
                </View>

                {/* Nút like ❤️ */}
                <TouchableOpacity
                  style={styles.likeButton}
                  onPress={(e) => toggleLike(recipe.recipeId, e)}
                  activeOpacity={0.7}
                >
                  <Ionicons
                    name={isLiked ? "heart" : "heart-outline"}
                    size={16}
                    color={isLiked ? Colors.primary : Colors.text.light}
                  />
                </TouchableOpacity>

                {/* Nút save 📑 */}
                <TouchableOpacity
                  style={styles.saveButton}
                  onPress={(e) => openSaveModal(recipe, e)}
                  activeOpacity={0.7}
                >
                  <Ionicons
                    name={isSaved ? "bookmark" : "bookmark-outline"}
                    size={16}
                    color={isSaved ? "#FFD700" : Colors.text.light}
                  />
                </TouchableOpacity>
              </View>

              {/* Tên công thức */}
              <Text style={styles.dishName} numberOfLines={1}>
                {dish.name}
              </Text>

              {/* Lượt thích + lưu */}
              <View style={styles.statsRow}>
                <View style={styles.statItem}>
                  <Ionicons name="heart" size={12} color={Colors.primary} />
                  <Text style={styles.statText}>
                    {currentLikes.toLocaleString()}
                  </Text>
                </View>
                <View style={styles.statItem}>
                  <Ionicons name="bookmark" size={12} color="#FFD700" />
                  <Text style={styles.statText}>
                    {currentSaves.toLocaleString()}
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          );
        })}

        {isLoadingMore && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="small" color={Colors.primary} />
          </View>
        )}
      </ScrollView>

      {/* Modal lưu vào bộ sưu tập */}
      <Modal visible={showSaveModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Chọn bộ sưu tập</Text>

            {collections.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>
                  Bạn chưa có bộ sưu tập nào.
                </Text>
                <TouchableOpacity
                  style={styles.createButton}
                  onPress={handleCreateNewCollection}
                >
                  <Text style={styles.createButtonText}>Tạo mới</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <FlatList
                data={collections}
                keyExtractor={(item) => item.collectionId}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={styles.collectionItem}
                    onPress={() => handleSaveToCollection(item.collectionId)}
                  >
                    <Text style={styles.collectionName}>{item.name}</Text>
                  </TouchableOpacity>
                )}
              />
            )}

            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => setShowSaveModal(false)}
            >
              <Text style={styles.cancelText}>Hủy</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginBottom: 24 },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  title: { fontSize: 17, fontWeight: "700", color: Colors.text.primary },
  scrollContent: { paddingHorizontal: 16, gap: 12 },
  card: { width: 90, alignItems: "center" },
  imageWrapper: { position: "relative", marginBottom: 8 },
  imageContainer: {
    width: 90,
    height: 90,
    borderRadius: 45,
    overflow: "hidden",
    backgroundColor: Colors.white,
    borderWidth: 2,
    borderColor: Colors.gray[200],
  },
  image: { width: "100%", height: "100%" },
  rankBadge: {
    position: "absolute",
    top: -4,
    left: -4,
    backgroundColor: Colors.primary,
    borderRadius: 12,
    width: 28,
    height: 28,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: Colors.white,
  },
  rankText: { color: Colors.white, fontSize: 12, fontWeight: "700" },
  likeButton: {
    position: "absolute",
    bottom: -4,
    left: -4,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.white,
    justifyContent: "center",
    alignItems: "center",
    elevation: 3,
  },
  saveButton: {
    position: "absolute",
    bottom: -4,
    right: -4,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.white,
    justifyContent: "center",
    alignItems: "center",
    elevation: 3,
  },
  dishName: {
    fontSize: 13,
    fontWeight: "600",
    color: Colors.text.primary,
    textAlign: "center",
    marginBottom: 2,
  },
  statsRow: { flexDirection: "row", gap: 6 },
  statItem: { flexDirection: "row", alignItems: "center", gap: 3 },
  statText: { fontSize: 11, color: Colors.text.secondary },
  viewAllButton: { flexDirection: "row", alignItems: "center", gap: 4 },
  viewAllText: { fontSize: 14, color: Colors.primary, fontWeight: "600" },
  loadingContainer: {
    width: 90,
    height: 90,
    justifyContent: "center",
    alignItems: "center",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 20,
    width: "80%",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: Colors.text.primary,
    marginBottom: 12,
  },
  collectionItem: { paddingVertical: 10 },
  collectionName: { fontSize: 15, color: Colors.text.primary },
  emptyContainer: { alignItems: "center", marginVertical: 16 },
  emptyText: { color: Colors.text.secondary, marginBottom: 8 },
  createButton: {
    backgroundColor: Colors.primary,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  createButtonText: { color: Colors.white, fontWeight: "600" },
  cancelButton: { marginTop: 12, alignSelf: "center" },
  cancelText: { color: Colors.text.secondary, fontSize: 15 },
});
