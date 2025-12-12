import { getImageUrl } from "@/config/api.config";
import { useCachedUserRecipes } from '@/hooks/useCachedUserRecipes';
import { RecipeService } from "@/services/recipeService";
import { Recipe } from "@/types/search";
import { Feather, Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

interface RecipeGridProps {
  userId: string;
  refreshKey?: number;
  isOwnProfile?: boolean;
  currentProfileId?: string;
}

const RecipeGrid: React.FC<RecipeGridProps> = ({
  userId,
  refreshKey,
  isOwnProfile = false,
  currentProfileId,
}) => {
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [menuVisible, setMenuVisible] = useState(false);
  const [sortModalVisible, setSortModalVisible] = useState(false);
  const [sortOption, setSortOption] = useState<string>("newest");
  const router = useRouter();

 const {
    recipes,
    loading,
    isOffline,
    loadRecipes,
    refresh: refreshRecipes,
    clearCache,
    setRecipes
  } = useCachedUserRecipes({ userId, autoFetch: false });

  const isOwn = isOwnProfile || (currentProfileId && userId && currentProfileId === userId);

  useEffect(() => {
    loadRecipes(RecipeService.getAllRecipesByUserId);
  }, [userId, loadRecipes]);

  // Reload when refreshKey changes
  useEffect(() => {
    if ((refreshKey ?? 0) > 0) {
      refreshRecipes(RecipeService.getAllRecipesByUserId);
    }
  }, [refreshKey, refreshRecipes]);

  // Re-sort when option changes
  useEffect(() => {
    setRecipes((prev) => sortRecipes(prev, sortOption));
  }, [sortOption]);

  const sortRecipes = (items: Recipe[], option: string) => {
    if (!items || items.length === 0) return items;
    const arr = [...items];
    // Try to detect a date field on recipe objects
    const getDate = (r: any) => {
      if (!r) return 0;
      const candidates = [
        r.createdAt,
        r.updatedAt,
        r.created_date,
        r.created_at,
        r.timestamp,
      ];
      for (const c of candidates) {
        if (!c) continue;
        const t = Date.parse(c);
        if (!isNaN(t)) return t;
      }
      return 0;
    };

    switch (option) {
      case "newest":
        // sort descending by detected date; if no date available, keep server order
        if (items.some((i) => getDate(i) > 0)) {
          return arr.sort((a, b) => getDate(b) - getDate(a));
        }
        return arr;
      case "oldest":
        if (items.some((i) => getDate(i) > 0)) {
          return arr.sort((a, b) => getDate(a) - getDate(b));
        }
        return arr.reverse();
      case "like_desc":
        return arr.sort((a, b) => (b.likeCount || 0) - (a.likeCount || 0));
      case "like_asc":
        return arr.sort((a, b) => (a.likeCount || 0) - (b.likeCount || 0));
      case "save_desc":
        return arr.sort((a, b) => (b.saveCount || 0) - (a.saveCount || 0));
      case "save_asc":
        return arr.sort((a, b) => (a.saveCount || 0) - (b.saveCount || 0));
      case "view_desc":
        return arr.sort((a, b) => (b.viewCount || 0) - (a.viewCount || 0));
      case "view_asc":
        return arr.sort((a, b) => (a.viewCount || 0) - (b.viewCount || 0));
      default:
        return arr;
    }
  };

  const handleDeleteRecipe = async (id: string) => {
    Alert.alert("Xóa công thức", "Bạn có chắc muốn xóa công thức này không?", [
      { text: "Hủy", style: "cancel" },
      {
        text: "Xóa",
        style: "destructive",
        onPress: async () => {
          try {
            await RecipeService.deleteRecipe(id);
            Alert.alert("✅ Đã xóa công thức");
            await clearCache();
            await refreshRecipes(RecipeService.getAllRecipesByUserId);
            
            Alert.alert("✅ Đã xóa công thức");
            router.push({
              pathname: "/(tabs)/home",
              params: { refresh: Date.now() },
            } as any);
          } catch (error: any) {
            Alert.alert("❌ Lỗi khi xóa", error.message);
          }
        },
      },
    ]);
  };

  // Event Handlers
  const handleOpenDetail = (recipe: Recipe) => {
    router.push(`/_recipe-detail/${recipe.recipeId}` as any);
  };

  const renderRecipeItem = ({ item }: { item: Recipe }) => (
    <TouchableOpacity
      onPress={() => handleOpenDetail(item)}
      style={styles.card}
      activeOpacity={0.8}
    >
      {/* Ảnh - chiếm 45% */}
      <Image
        source={{ uri: getImageUrl(item.featuredImage) }}
        style={styles.image}
        resizeMode="cover"
      />

      {/* Nội dung - chiếm 55%, nền trắng, bo góc phải */}
      <View style={styles.content}>
        <Text style={styles.title} numberOfLines={2}>
          {item.title}
        </Text>

        <Text style={styles.description} numberOfLines={2}>
          {item.description || " "}
        </Text>

        <View style={styles.stats}>
          <View style={styles.statItem}>
            <Ionicons name="heart" size={16} color="#e74c3c" />
            <Text style={styles.statNumber}>{item.likeCount || 0}</Text>
          </View>

          <View style={styles.statItem}>
            <Ionicons name="bookmark" size={16} color="#f39c12" />
            <Text style={styles.statNumber}>{item.saveCount || 0}</Text>
          </View>

          <View style={styles.statItem}>
            <Feather name="eye" size={16} color="#3498db" />
            <Text style={styles.statNumber}>{item.viewCount || 0}</Text>
          </View>
        </View>
      </View>

      {/* Nút 3 chấm - chỉ hiện khi là chủ */}
      {isOwn && (
        <TouchableOpacity
          style={styles.moreButton}
          onPress={(e) => {
            e.stopPropagation(); // Quan trọng: tránh trigger onPress của card
            setSelectedRecipe(item);
            setMenuVisible(true);
          }}
        >
          <Text style={styles.moreText}>⋮</Text>
        </TouchableOpacity>
      )}
    </TouchableOpacity>
  );
  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#FF385C" />
      </View>
    );
  }

  return (
    <View style={styles.container}>

      {isOffline && (
        <View style={styles.offlineBar}>
          <Text style={styles.offlineText}>
            📵 Chế độ offline - Hiển thị dữ liệu đã lưu
          </Text>
        </View>
      )}
      {/* Sort controls */}
      <View style={styles.sortBar}>
        <Text style={styles.sortLabel}>Sắp xếp:</Text>
        <TouchableOpacity
          style={styles.sortButton}
          onPress={() => setSortModalVisible(true)}
        >
          <Text style={styles.sortButtonText}>
            {friendlySortLabel(sortOption)}
          </Text>
        </TouchableOpacity>
      </View>
      {recipes.length === 0 ? (
        <Text style={styles.emptyText}>Chưa có công thức nào</Text>
      ) : (
        <FlatList
          data={recipes}
          renderItem={renderRecipeItem}
          keyExtractor={(item) => item.recipeId}
          scrollEnabled={false}
          contentContainerStyle={styles.list}
        />
      )}

      {/* Modal menu 3 chấm */}
      <Modal
        visible={menuVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setMenuVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPressOut={() => setMenuVisible(false)}
        >
          <View style={styles.menu}>
            <TouchableOpacity
              onPress={() => {
                setMenuVisible(false);
                if (selectedRecipe?.recipeId) {
                  router.push({
                    pathname: "/(tabs)/_recipe-edit/[recipeId]",
                    params: { recipeId: selectedRecipe.recipeId },
                  });
                }
              }}
            >
              <Text style={styles.menuItem}>✏️ Sửa công thức</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => {
                setMenuVisible(false);
                if (selectedRecipe) handleDeleteRecipe(selectedRecipe.recipeId);
              }}
            >
              <Text style={[styles.menuItem, { color: "red" }]}>
                🗑️ Xóa công thức
              </Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Sort options modal */}
      <Modal
        visible={sortModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setSortModalVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPressOut={() => setSortModalVisible(false)}
        >
          <View style={[styles.menu, { width: 260 }]}>
            {[
              { key: "newest", label: "Mới nhất" },
              { key: "oldest", label: "Cũ nhất" },
              { key: "like_desc", label: "Like nhiều → ít" },
              { key: "like_asc", label: "Like ít → nhiều" },
              { key: "save_desc", label: "Lưu nhiều → ít" },
              { key: "save_asc", label: "Lưu ít → nhiều" },
              { key: "view_desc", label: "Xem nhiều → ít" },
              { key: "view_asc", label: "Xem ít → nhiều" },
            ].map((opt) => (
              <TouchableOpacity
                key={opt.key}
                onPress={() => {
                  setSortOption(opt.key);
                  setRecipes((prev) => sortRecipes(prev, opt.key));
                  setSortModalVisible(false);
                }}
              >
                <Text
                  style={[
                    styles.menuItem,
                    sortOption === opt.key ? { fontWeight: "700" } : {},
                  ]}
                >
                  {opt.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

const friendlySortLabel = (key: string) => {
  switch (key) {
    case "newest":
      return "Mới nhất";
    case "oldest":
      return "Cũ nhất";
    case "like_desc":
      return "Like ↓";
    case "like_asc":
      return "Like ↑";
    case "save_desc":
      return "Lưu ↓";
    case "save_asc":
      return "Lưu ↑";
    case "view_desc":
      return "Xem ↓";
    case "view_asc":
      return "Xem ↑";
    default:
      return "Mới nhất";
  }
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 10, backgroundColor: "#f8f8f8" },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f8f8f8",
  },
  list: { paddingBottom: 20 },

  card: {
    flexDirection: "row",
    backgroundColor: "white",
    borderRadius: 16,
    marginBottom: 14,
    overflow: "hidden",
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },

  image: {
    width: "45%",
    height: 115,
    borderRadius: 16,
  },
  content: {
    flex: 1,
    padding: 12,
    justifyContent: "space-between",
    backgroundColor: "white",
    borderTopRightRadius: 16,
    borderBottomRightRadius: 16,
    paddingRight: 40,
  },

  title: {
    fontSize: 14,
    fontWeight: "600",
    color: "#000",
    flex: 1,
    marginRight: 8,
  },

  description: {
    fontSize: 13.5,
    color: "#666",
    marginTop: 4,
    lineHeight: 18,
  },
  moreButton: {
    position: "absolute",
    top: 10,
    right: 10,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.9)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 10,
  },

  moreText: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#555",
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.3)",
  },
  menu: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 8,
    width: 200,
  },
  menuItem: {
    fontSize: 16,
    paddingVertical: 8,
  },
  sortBar: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
    paddingHorizontal: 4,
  },
  sortLabel: {
    fontSize: 14,
    color: "#333",
    marginRight: 8,
  },
  sortButton: {
    backgroundColor: "#f1f1f1",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
  },
  sortButtonText: {
    fontSize: 14,
    color: "#333",
  },
  emptyText: {
    fontSize: 16,
    color: "#999",
    textAlign: "center",
    marginTop: 20,
  },
  stats: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
    paddingHorizontal: 4,
  },

  statItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },

  statNumber: {
    fontSize: 13.5,
    color: "#444",
    fontWeight: "600",
  },
  offlineBar: {
    backgroundColor: '#FFA500',
    paddingVertical: 8,
    paddingHorizontal: 16,
    alignItems: 'center',
    marginBottom: 8,
  },
  offlineText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '600',
  },
});

export default RecipeGrid;
