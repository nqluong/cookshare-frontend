import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useState } from "react";
import {
    Image,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Colors } from "../../styles/colors";

interface Recipe {
  id: string;
  name: string;
  author: string;
  time: string;
  likes: string;
  image: any;
}

export default function AdminRecipesScreen() {
  const [searchQuery, setSearchQuery] = useState("");

  // Mock data
  const recipes: Recipe[] = [
    {
      id: "1",
      name: "Phở",
      author: "Chung Lê",
      time: "45'",
      likes: "1.2k",
      image: require("../../assets/images/default-avatar.png"),
    },
    {
      id: "2",
      name: "Phở",
      author: "Chung Lê",
      time: "45'",
      likes: "1.2k",
      image: require("../../assets/images/default-avatar.png"),
    },
    {
      id: "3",
      name: "Phở",
      author: "Chung Lê",
      time: "45'",
      likes: "1.2k",
      image: require("../../assets/images/default-avatar.png"),
    },
    {
      id: "4",
      name: "Phở",
      author: "Chung Lê",
      time: "45'",
      likes: "1.2k",
      image: require("../../assets/images/default-avatar.png"),
    },
    {
      id: "5",
      name: "Phở",
      author: "Chung Lê",
      time: "45'",
      likes: "1.2k",
      image: require("../../assets/images/default-avatar.png"),
    },
  ];

  const filteredRecipes = recipes.filter((recipe) =>
    recipe.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={Colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Công Thức</Text>
        <TouchableOpacity style={styles.notificationButton}>
          <Ionicons name="notifications-outline" size={24} color={Colors.text.primary} />
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={20} color={Colors.text.light} />
          <TextInput
            style={styles.searchInput}
            placeholder="Tìm kiếm..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor={Colors.text.light}
          />
        </View>
        <TouchableOpacity style={styles.searchButton}>
          <Ionicons name="search" size={24} color={Colors.text.primary} />
        </TouchableOpacity>
      </View>

      {/* Recipes List */}
      <View style={styles.listSection}>
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          {filteredRecipes.map((recipe) => (
            <View key={recipe.id} style={styles.recipeItem}>
              <Image source={recipe.image} style={styles.recipeImage} />

              <View style={styles.recipeMainInfo}>
                <Text style={styles.recipeName}>{recipe.name}</Text>
                <View style={styles.recipeStats}>
                  <View style={styles.statItem}>
                    <Ionicons name="heart" size={14} color="#ef4444" />
                    <Text style={styles.statText}>{recipe.likes}</Text>
                  </View>
                  <View style={styles.statItem}>
                    <Ionicons name="time-outline" size={14} color="#ef4444" />
                    <Text style={styles.statText}>{recipe.time}</Text>
                  </View>
                </View>
              </View>

              <Text style={styles.recipeAuthor}>{recipe.author}</Text>

              <View style={styles.recipeActions}>
                <TouchableOpacity style={styles.actionButton}>
                  <Ionicons name="eye-outline" size={20} color={Colors.text.secondary} />
                </TouchableOpacity>
                <TouchableOpacity style={styles.actionButton}>
                  <Ionicons name="create-outline" size={20} color={Colors.text.secondary} />
                </TouchableOpacity>
                <TouchableOpacity style={styles.actionButton}>
                  <Ionicons name="trash-outline" size={20} color="#ef4444" />
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#10b981",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#10b981",
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: Colors.text.primary,
  },
  notificationButton: {
    padding: 4,
  },
  searchContainer: {
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
    backgroundColor: "#10b981",
  },
  searchBar: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 25,
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: Colors.text.primary,
  },
  searchButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  listSection: {
    flex: 1,
    backgroundColor: "#d1f4e0",
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    paddingTop: 24,
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 20,
  },
  recipeItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 12,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  recipeImage: {
    width: 60,
    height: 60,
    borderRadius: 12,
    marginRight: 12,
  },
  recipeMainInfo: {
    flex: 1,
  },
  recipeName: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.text.primary,
    marginBottom: 6,
  },
  recipeStats: {
    flexDirection: "row",
    gap: 12,
  },
  statItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  statText: {
    fontSize: 12,
    color: Colors.text.secondary,
    fontWeight: "500",
  },
  recipeAuthor: {
    fontSize: 13,
    color: Colors.text.secondary,
    marginRight: 12,
  },
  recipeActions: {
    flexDirection: "row",
    gap: 8,
  },
  actionButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.gray[100],
    alignItems: "center",
    justifyContent: "center",
  },
});

