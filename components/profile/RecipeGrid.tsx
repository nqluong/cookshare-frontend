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
  const router = useRouter();

  useEffect(() => {
    fetchRecipes();
  }, [userId, refreshKey]);

  const fetchRecipes = async () => {
    try {
      const data = await RecipeService.getAllRecipesByUserId(userId);
      setRecipes(data || []);
    } catch (error) {
      console.error("Failed to fetch recipes:", error);
    } finally {
      setLoading(false);
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
          uri: getImageUrl(item.featuredImage) + '?t=' + new Date().getTime()
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
    </View>
  );
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
  emptyText: {
    fontSize: 16,
    color: "#999",
    textAlign: "center",
    marginTop: 20,
  },
});

export default RecipeGrid;
