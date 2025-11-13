import { getImageUrl } from "@/config/api.config";
import { RecipeService } from "@/services/recipeService";
import { Recipe } from "@/types/search";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, Alert, FlatList, Image, Modal, StyleSheet, Text, TouchableOpacity, View, } from "react-native";

interface RecipeGridProps {
  userId: string;
  refreshKey?: number;
}

const RecipeGrid: React.FC<RecipeGridProps> = ({ userId, refreshKey }) => {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [menuVisible, setMenuVisible] = useState(false);
  const [sortModalVisible, setSortModalVisible] = useState(false);
  const [sortOption, setSortOption] = useState<string>('newest');
  const router = useRouter();

  useEffect(() => {
    fetchRecipes();
  }, [userId, refreshKey]);

  // Re-sort current list when sort option changes
  useEffect(() => {
    setRecipes(prev => sortRecipes(prev, sortOption));
  }, [sortOption]);

  const fetchRecipes = async () => {
    try {
      const data = await RecipeService.getAllRecipesByUserId(userId);
      const list: Recipe[] = data || [];
      setRecipes(sortRecipes(list, sortOption));
    } catch (error) {
      console.error("Failed to fetch recipes:", error);
    } finally {
      setLoading(false);
    }
  };

  const sortRecipes = (items: Recipe[], option: string) => {
    if (!items || items.length === 0) return items;
    const arr = [...items];
    switch (option) {
      case 'newest':
        // assuming recipeId contains time-order or server returns newest first — fallback to original order
        return arr;
      case 'oldest':
        return arr.reverse();
      case 'like_desc':
        return arr.sort((a, b) => (b.likeCount || 0) - (a.likeCount || 0));
      case 'like_asc':
        return arr.sort((a, b) => (a.likeCount || 0) - (b.likeCount || 0));
      case 'save_desc':
        return arr.sort((a, b) => (b.saveCount || 0) - (a.saveCount || 0));
      case 'save_asc':
        return arr.sort((a, b) => (a.saveCount || 0) - (b.saveCount || 0));
      case 'view_desc':
        return arr.sort((a, b) => (b.viewCount || 0) - (a.viewCount || 0));
      case 'view_asc':
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
            fetchRecipes();
            // Navigate to home and include a changing param so HomeScreen can detect and refresh
            router.push({ pathname: "/(tabs)/home", params: { refresh: Date.now() } } as any);
          } catch (error: any) {
            Alert.alert("❌ Lỗi khi xóa", error.message);
          }
        },
      },
    ]);
  };

  const renderRecipeItem = ({ item }: { item: Recipe }) => (
    <View style={styles.card}>
      <Image
        source={{ 
          uri: getImageUrl(item.featuredImage)
        }}
        style={styles.image}
        resizeMode="cover"
      />
      <View style={styles.textContainer}>
        <Text style={styles.title}>{item.title}</Text>
        <Text style={styles.description}>
          {item.description || "Không có mô tả"}
        </Text>
        <View style={styles.stats}>
          <Text>❤️ {item.likeCount}</Text>
          <Text>💾 {item.saveCount}</Text>
        </View>
      </View>

      {/* Nút 3 chấm */}
      <TouchableOpacity
        style={styles.moreButton}
        onPress={() => {
          setSelectedRecipe(item);
          setMenuVisible(true);
        }}
      >
        <Text style={{ fontSize: 22 }}>⋮</Text>
      </TouchableOpacity>
    </View>
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
      {/* Sort controls */}
      <View style={styles.sortBar}>
        <Text style={styles.sortLabel}>Sắp xếp:</Text>
        <TouchableOpacity style={styles.sortButton} onPress={() => setSortModalVisible(true)}>
          <Text style={styles.sortButtonText}>{friendlySortLabel(sortOption)}</Text>
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
                if (selectedRecipe)
                  handleDeleteRecipe(selectedRecipe.recipeId);
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
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPressOut={() => setSortModalVisible(false)}>
          <View style={[styles.menu, { width: 260 }]}>
            {[
              { key: 'newest', label: 'Mới nhất' },
              { key: 'oldest', label: 'Cũ nhất' },
              { key: 'like_desc', label: 'Like nhiều → ít' },
              { key: 'like_asc', label: 'Like ít → nhiều' },
              { key: 'save_desc', label: 'Lưu nhiều → ít' },
              { key: 'save_asc', label: 'Lưu ít → nhiều' },
              { key: 'view_desc', label: 'Xem nhiều → ít' },
              { key: 'view_asc', label: 'Xem ít → nhiều' },
            ].map(opt => (
              <TouchableOpacity
                key={opt.key}
                onPress={() => {
                  setSortOption(opt.key);
                  setRecipes(prev => sortRecipes(prev, opt.key));
                  setSortModalVisible(false);
                }}
              >
                <Text style={[styles.menuItem, sortOption === opt.key ? { fontWeight: '700' } : {}]}>{opt.label}</Text>
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
    case 'newest': return 'Mới nhất';
    case 'oldest': return 'Cũ nhất';
    case 'like_desc': return 'Like ↓';
    case 'like_asc': return 'Like ↑';
    case 'save_desc': return 'Lưu ↓';
    case 'save_asc': return 'Lưu ↑';
    case 'view_desc': return 'Xem ↓';
    case 'view_asc': return 'Xem ↑';
    default: return 'Mới nhất';
  }
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 10, backgroundColor: "#fff" },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#fff",
  },
  list: { padding: 10, paddingBottom: 20 },
  card: {
    flexDirection: "row",
    backgroundColor: "#f9f9f9",
    borderRadius: 8,
    marginBottom: 10,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    position: "relative",
  },
  image: {
    width: 100,
    height: 100,
    borderTopLeftRadius: 8,
    borderBottomLeftRadius: 8,
  },
  textContainer: { flex: 1, padding: 10 },
  title: { fontSize: 18, fontWeight: "bold" },
  description: { fontSize: 14, color: "#666" },
  stats: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 5,
  },
  moreButton: {
    position: "absolute",
    right: 10,
    top: 10,
    padding: 5,
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
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    paddingHorizontal: 4,
  },
  sortLabel: {
    fontSize: 14,
    color: '#333',
    marginRight: 8,
  },
  sortButton: {
    backgroundColor: '#f1f1f1',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
  },
  sortButtonText: {
    fontSize: 14,
    color: '#333',
  },
  emptyText: {
    fontSize: 16,
    color: "#999",
    textAlign: "center",
    marginTop: 20,
  },
});

export default RecipeGrid;
