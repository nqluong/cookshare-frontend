import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { Colors } from "../../../styles/colors";

interface RecipeLoadingStateProps {
  message?: string;
  isLoadingMore?: boolean;
}

export default function RecipeLoadingState({ 
  message = "Đang tải...",
  isLoadingMore = false
}: RecipeLoadingStateProps) {
  if (isLoadingMore) {
    return (
      <View style={styles.loadingMoreContainer}>
        <ActivityIndicator size="small" color={Colors.primary} />
        <Text style={styles.loadingMoreText}>{message}</Text>
      </View>
    );
  }

  return (
    <View style={styles.loadingContainer}>
      <ActivityIndicator size="large" color={Colors.primary} />
      <Text style={styles.loadingText}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 40,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: Colors.text.secondary,
  },
  loadingMoreContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 20,
  },
  loadingMoreText: {
    marginLeft: 8,
    fontSize: 14,
    color: Colors.text.secondary,
  },
});