import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { router } from "expo-router";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Colors } from "../../../styles/colors";

interface RecipeCardProps {
  recipeId: string;
  recipeTitle: string;
  recipeThumbnail: string | null;
  authorFullName: string;
  authorUsername: string;
}

export default function RecipeCard({
  recipeId,
  recipeTitle,
  recipeThumbnail,
  authorFullName,
  authorUsername,
}: RecipeCardProps) {
  return (
    <View style={styles.card}>
      <Text style={styles.sectionTitle}>Công thức bị báo cáo</Text>
      <TouchableOpacity 
        style={styles.recipeRow}
        onPress={() => router.push(`/admin/recipes/${recipeId}`)}
        activeOpacity={0.7}
      >
        {recipeThumbnail ? (
          <Image
            source={{ uri: recipeThumbnail }}
            style={styles.recipeThumbnail}
            contentFit="cover"
          />
        ) : (
          <View style={styles.thumbnailPlaceholder}>
            <Ionicons name="image-outline" size={32} color={Colors.text.light} />
          </View>
        )}
        <View style={styles.recipeInfo}>
          <Text style={styles.recipeTitle}>{recipeTitle}</Text>
          <View style={styles.authorRow}>
            <View style={styles.avatarPlaceholder}>
              <Ionicons name="person" size={14} color={Colors.text.light} />
            </View>
            <View>
              <Text style={styles.authorName}>{authorFullName}</Text>
              <Text style={styles.authorUsername}>@{authorUsername}</Text>
            </View>
          </View>
        </View>
        <Ionicons name="chevron-forward" size={20} color={Colors.text.light} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#FFFFFF",
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 16,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.text.secondary,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 12,
  },
  recipeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },
  recipeThumbnail: {
    width: 100,
    height: 100,
    borderRadius: 12,
  },
  thumbnailPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 12,
    backgroundColor: Colors.gray[100],
    alignItems: "center",
    justifyContent: "center",
  },
  recipeInfo: {
    flex: 1,
    justifyContent: "center",
  },
  recipeTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: Colors.text.primary,
    marginBottom: 10,
  },
  authorRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  avatarPlaceholder: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.gray[100],
    alignItems: "center",
    justifyContent: "center",
  },
  authorName: {
    fontSize: 14,
    fontWeight: "500",
    color: Colors.text.primary,
  },
  authorUsername: {
    fontSize: 12,
    color: Colors.text.secondary,
  },
});
