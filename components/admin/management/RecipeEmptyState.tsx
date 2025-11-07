import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, Text, View } from "react-native";
import { Colors } from "../../../styles/colors";

interface RecipeEmptyStateProps {
  message?: string;
  icon?: keyof typeof Ionicons.glyphMap;
}

export default function RecipeEmptyState({ 
  message = "Không tìm thấy công thức nào",
  icon = "restaurant-outline"
}: RecipeEmptyStateProps) {
  return (
    <View style={styles.emptyContainer}>
      <Ionicons name={icon} size={64} color={Colors.text.secondary} />
      <Text style={styles.emptyText}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 40,
  },
  emptyText: {
    marginTop: 12,
    fontSize: 16,
    color: Colors.text.secondary,
  },
});