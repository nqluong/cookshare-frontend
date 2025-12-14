import { AdminRecipeDetailResponse } from "@/types/admin/recipe.types";
import { Ionicons } from "@expo/vector-icons";
import { Modal, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Colors } from "../../../styles/colors";
import RecipeDetailContent from "./RecipeDetailContent";

interface RecipeDetailModalProps {
  visible: boolean;
  recipeDetail: AdminRecipeDetailResponse | null;
  onClose: () => void;
  onEdit: (recipeId: string) => void;
  onDelete: (recipeId: string) => void;
  onApprove?: (recipeId: string) => void;
  onReject?: (recipeId: string) => void;
  onTogglePublished?: (recipeId: string) => void;
}

export default function RecipeDetailModal({
  visible,
  recipeDetail,
  onClose,
  onEdit,
  onDelete,
  onApprove,
  onReject,
  onTogglePublished,
}: RecipeDetailModalProps) {
  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.modalContainer}>
        {/* Header */}
        <View style={styles.modalHeader}>
          <TouchableOpacity 
            style={styles.modalCloseButton}
            onPress={onClose}
          >
            <Ionicons name="close" size={24} color={Colors.text.primary} />
          </TouchableOpacity>
          <Text style={styles.modalTitle}>Chi tiết công thức</Text>
          <View style={styles.modalHeaderSpacer} />
        </View>

        {/* Content - Sử dụng RecipeDetailContent */}
        <RecipeDetailContent
          recipeDetail={recipeDetail}
          onEdit={(recipeId) => {
            onClose();
            onEdit(recipeId);
          }}
          onDelete={(recipeId) => {
            onClose();
            onDelete(recipeId);
          }}
          onApprove={onApprove ? (recipeId) => {
            onClose();
            onApprove(recipeId);
          } : undefined}
          onReject={onReject ? (recipeId) => {
            onClose();
            onReject(recipeId);
          } : undefined}
          onTogglePublished={onTogglePublished ? (recipeId) => {
            onClose();
            onTogglePublished(recipeId);
          } : undefined}
        />
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: "#fff",
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  modalCloseButton: {
    padding: 4,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: Colors.text.primary,
  },
  modalHeaderSpacer: {
    width: 32,
  },
});