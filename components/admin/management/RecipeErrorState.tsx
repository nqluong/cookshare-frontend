import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Colors } from "../../../styles/colors";

interface RecipeErrorStateProps {
  message: string;
  onRetry?: () => void;
}

export default function RecipeErrorState({ 
  message,
  onRetry
}: RecipeErrorStateProps) {
  return (
    <View style={styles.errorContainer}>
      <Ionicons name="alert-circle-outline" size={64} color="#ef4444" />
      <Text style={styles.errorText}>{message}</Text>
      {onRetry && (
        <TouchableOpacity style={styles.retryButton} onPress={onRetry}>
          <Text style={styles.retryButtonText}>Thử lại</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  errorContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  errorText: {
    marginTop: 12,
    fontSize: 16,
    color: Colors.text.secondary,
    textAlign: "center",
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});