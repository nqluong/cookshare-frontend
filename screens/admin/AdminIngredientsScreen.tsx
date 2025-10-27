import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useState } from "react";
import {
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Colors } from "../../styles/colors";

interface Ingredient {
  id: string;
  name: string;
  category: string;
  unit: string;
}

export default function AdminIngredientsScreen() {
  const [searchQuery, setSearchQuery] = useState("");

  // Mock data
  const ingredients: Ingredient[] = [
    { id: "1", name: "Thịt Bò", category: "Gram, Kg, Miếng", unit: "Thịt" },
    { id: "2", name: "Cải Thìa", category: "Mớ, Bó, Gram", unit: "Rau củ" },
    { id: "3", name: "Gạo Tẻ", category: "Kg, Lon, Bát, Chén", unit: "Tinh bột" },
    { id: "4", name: "Tỏi", category: "Củ, Tép, Gram", unit: "Rau củ" },
    { id: "5", name: "Sữa Tươi", category: "Ml, Lít, Hộp", unit: "Chế phẩm" },
  ];

  const filteredIngredients = ingredients.filter((item) =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={Colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Nguyên Liệu</Text>
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

      {/* Ingredients List */}
      <View style={styles.listSection}>
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          {filteredIngredients.map((item) => (
            <View key={item.id} style={styles.ingredientItem}>
              <View style={styles.ingredientInfo}>
                <Text style={styles.ingredientName}>{item.name}</Text>
                <Text style={styles.ingredientCategory}>{item.category}</Text>
                <Text style={styles.ingredientUnit}>{item.unit}</Text>
              </View>

              <View style={styles.ingredientActions}>
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
  ingredientItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  ingredientInfo: {
    flex: 1,
  },
  ingredientName: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.text.primary,
    marginBottom: 4,
  },
  ingredientCategory: {
    fontSize: 13,
    color: Colors.text.secondary,
    marginBottom: 2,
  },
  ingredientUnit: {
    fontSize: 12,
    color: Colors.text.light,
  },
  ingredientActions: {
    flexDirection: "row",
    gap: 12,
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

