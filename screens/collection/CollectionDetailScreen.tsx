import { getImageUrl } from "@/config/api.config";
import { useAuth } from "@/context/AuthContext";
import { collectionService } from "@/services/collectionService";
import { userService } from "@/services/userService";
import { CollectionUserDto } from "@/types/collection.types";
import { Recipe } from "@/types/dish";
import { Feather, Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function CollectionDetailScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const params = useLocalSearchParams<{ collectionId: string }>();
  const collectionId = params?.collectionId;

  const [collection, setCollection] = useState<CollectionUserDto | null>(null);
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [userUUID, setUserUUID] = useState<string>("");

  useEffect(() => {
    console.log(
      "CollectionDetailScreen mounted with collectionId:",
      collectionId
    );
    if (user?.username && collectionId) {
      initLoad();
    }
  }, [user?.username, collectionId]);

  const initLoad = async () => {
    try {
      // Lấy UUID từ username
      const profile = await userService.getUserByUsername(user!.username);
      setUserUUID(profile.userId);

      // Lấy chi tiết collection + recipes
      await loadCollectionDetail(profile.userId);
    } catch (error) {
      console.log("Error initializing:", error);
      Alert.alert("Lỗi", "Không thể tải dữ liệu");
      setLoading(false);
    }
  };

  const loadCollectionDetail = async (uuid: string) => {
    if (!uuid || !collectionId) return;

    try {
      setLoading(true);

      // Lấy chi tiết collection
      const collectionData = await collectionService.getCollectionDetail(
        uuid,
        collectionId
      );
      setCollection(collectionData.data);

      // Lấy danh sách recipes trong collection
      const recipesData = await collectionService.getCollectionRecipes(
        uuid,
        collectionId,
        0,
        100
      );
      setRecipes(recipesData.content || []);
    } catch (error) {
      console.log("Error loading collection detail:", error);
      Alert.alert("Lỗi", "Không thể tải chi tiết collection");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteRecipe = (recipeId: string) => {
    Alert.alert(
      "Xóa công thức",
      "Bạn có chắc chắn muốn xóa công thức này khỏi collection?",
      [
        { text: "Hủy", style: "cancel" },
        {
          text: "Xóa",
          style: "destructive",
          onPress: async () => {
            try {
              if (userUUID && collectionId) {
                await collectionService.removeRecipeFromCollection(
                  userUUID,
                  collectionId,
                  recipeId
                );
                setRecipes(recipes.filter((r) => r.recipeId !== recipeId));
                Alert.alert("Thành công", "Công thức đã được xóa");
              }
            } catch (error) {
              Alert.alert("Lỗi", "Không thể xóa công thức");
            }
          },
        },
      ]
    );
  };

  // Event Handlers
  const handleOpenDetail = (recipe: Recipe) => {
    router.push(`/_recipe-detail/${recipe.recipeId}?from=/collection` as any);
  };

  const renderRecipeItem = ({ item }: { item: Recipe }) => (
    <TouchableOpacity
      onPress={() => handleOpenDetail(item)}
      style={styles.recipeRow}
    >
      {/* Recipe Image - Left */}
      <Image
        source={{ uri: getImageUrl(item.featuredImage) }}
        style={styles.recipeImage}
        resizeMode="cover"
      />

      {/* Recipe Info - Right */}
      <View style={styles.recipeInfo}>
        <View style={styles.recipeHeader}>
          <Text style={styles.recipeTitle} numberOfLines={2}>
            {item.title}
          </Text>
          <TouchableOpacity
            onPress={() => handleDeleteRecipe(item.recipeId)}
            style={styles.deleteButton}
          >
            <MaterialCommunityIcons
              name="trash-can-outline"
              size={26}
              color="#ff4757"
            />
          </TouchableOpacity>
        </View>

        <Text style={styles.recipeDescription} numberOfLines={2}>
          {item.description}
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
    </TouchableOpacity>
  );

  const renderHeader = () => (
    <>
      {collection && (
        <>
          {/* Header Navigation */}
          <View style={styles.headerNav}>
            <TouchableOpacity onPress={() => router.back()}>
              <Ionicons name="chevron-back" size={28} color="#000" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Bộ Sưu Tập</Text>
            <View style={{ width: 28 }} />
          </View>

          {/* Cover Image */}
          <View style={styles.coverSection}>
            {collection.coverImage ? (
              <Image
                source={{ uri: getImageUrl(collection.coverImage) }}
                style={styles.coverImage}
                resizeMode="cover"
              />
            ) : (
              <View style={[styles.coverImage, styles.placeholderCover]}>
                <MaterialCommunityIcons
                  name="playlist-music"
                  size={80}
                  color="#FF385C"
                />
              </View>
            )}
          </View>

          {/* Collection Info */}
          <View style={styles.infoSection}>
            <Text style={styles.collectionName}>{collection.name}</Text>

            <Text style={styles.collectionDescription}>
              {collection.description || " "}
            </Text>

            {/* Stats */}
            <View style={styles.statsRow}>
              <View style={styles.statItemCollection}>
                <Text style={styles.statValue}>{collection.recipeCount}</Text>
                <Text style={styles.statLabel}>Công thức</Text>
              </View>
              <View style={styles.divider} />
              <View style={styles.statItemCollection}>
                <Text style={styles.statValue}>{collection.viewCount}</Text>
                <Text style={styles.statLabel}>Lượt xem</Text>
              </View>
              <View style={styles.divider} />
              <View style={styles.statItemCollection}>
                <Text style={styles.statValue}>
                  {collection.isPublic ? "Công khai" : "Riêng tư"}
                </Text>
                <Text style={styles.statLabel}>Trạng thái</Text>
              </View>
            </View>
          </View>

          {/* Recipes Title */}
          <View style={styles.recipesHeader}>
            <Text style={styles.recipesTitle}>
              Công thức trong collection ({recipes.length})
            </Text>
          </View>
        </>
      )}
    </>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#FF385C" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        ListHeaderComponent={renderHeader}
        data={recipes}
        renderItem={renderRecipeItem}
        keyExtractor={(item) => item.recipeId}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <MaterialCommunityIcons
              name="playlist-remove"
              size={60}
              color="#ddd"
            />
            <Text style={styles.emptyText}>Chưa có công thức nào</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  // Header Navigation
  headerNav: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "white",
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#000",
  },

  // Cover Section
  coverSection: {
    width: "100%",
    height: 240,
    backgroundColor: "#f0f0f0",
  },
  coverImage: {
    width: "100%",
    height: "100%",
  },
  placeholderCover: {
    justifyContent: "center",
    alignItems: "center",
  },

  // Info Section
  infoSection: {
    backgroundColor: "white",
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  collectionName: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#000",
    marginBottom: 8,
  },
  collectionDescription: {
    fontSize: 14,
    color: "#666",
    lineHeight: 20,
    marginBottom: 16,
  },

  // Stats
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    marginBottom: 16,
  },
  statItemCollection: {
    flex: 1,
    alignItems: "center",
  },
  statValue: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#000",
  },
  statLabel: {
    fontSize: 12,
    color: "#999",
    marginTop: 4,
  },
  divider: {
    width: 1,
    height: 40,
    backgroundColor: "#e0e0e0",
  },

  // Buttons
  buttonGroup: {
    flexDirection: "row",
    gap: 12,
  },
  playButton: {
    flex: 1,
    flexDirection: "row",
    backgroundColor: "#FF385C",
    paddingVertical: 12,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
  },
  playButtonText: {
    color: "white",
    fontSize: 14,
    fontWeight: "600",
  },
  actionButton: {
    width: 48,
    height: 48,
    borderRadius: 8,
    backgroundColor: "#f0f0f0",
    justifyContent: "center",
    alignItems: "center",
  },

  // Recipes Header
  recipesHeader: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "white",
  },
  recipesTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#000",
  },

  // List Content
  listContent: {
    paddingHorizontal: 12,
    paddingVertical: 8,
  },

  // Recipe Row
  recipeRow: {
    flexDirection: "row",
    backgroundColor: "white",
    marginBottom: 12,
    borderRadius: 8,
    overflow: "hidden",
  },
  recipeImage: {
    width: "45%",
    height: 115,
    borderRadius: 16,
  },
  recipeInfo: {
    flex: 1,
    padding: 12,
    justifyContent: "space-between",
  },
  recipeHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 4,
  },
  recipeTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#000",
    flex: 1,
    marginRight: 8,
  },
  deleteButton: {
    padding: 4,
  },
  recipeDescription: {
    fontSize: 12,
    color: "#999",
    marginBottom: 8,
    lineHeight: 16,
  },
  stats: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
    paddingHorizontal: 4,
  },
  // Empty
  emptyContainer: {
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 14,
    color: "#999",
    marginTop: 16,
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
});
