import { useRecipeSaveContext } from "@/context/RecipeSaveContext";
import { Colors } from "@/styles/colors";
import { CollectionUserDto } from "@/types/collection.types";
import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { Alert, StyleSheet, TouchableOpacity } from "react-native";
import SaveToCollectionModal from "../componentsModal/SaveToCollectionModal";

interface RecipeSaveButtonProps {
  recipeId: string;
  isSaved: boolean;
  isDisabled?: boolean;
  size?: number;
  color?: string;
  savedColor?: string;
  style?: any;
  collections: CollectionUserDto[];
  userUUID: string;
  currentSaveCount: number;
  onSaveSuccess: (recipeId: string, collectionId: string, newSaveCount: number) => void;
  onUnsaveSuccess: (recipeId: string, newSaveCount: number) => void;
  onUnsave: (recipeId: string, currentSaveCount: number, onSuccess: (newSaveCount: number) => void) => Promise<void>;
  onCreateNewCollection?: () => void;
}

export default function RecipeSaveButton({
  recipeId,
  isSaved,
  isDisabled = false,
  size = 16,
  color = Colors.text.light,
  savedColor = "#FFD700",
  style,
  collections,
  userUUID,
  currentSaveCount,
  onSaveSuccess,
  onUnsaveSuccess,
  onUnsave,
  onCreateNewCollection,
}: RecipeSaveButtonProps) {
  const [showModal, setShowModal] = useState(false);
  const { notifySaveUpdate } = useRecipeSaveContext();

  const handlePress = (event: any) => {
    event.stopPropagation();

    if (isSaved) {
      Alert.alert(
        "Công thức đã được lưu",
        "Bạn có muốn gỡ công thức này khỏi bộ sưu tập không?",
        [
          { text: "Hủy", style: "cancel" },
          {
            text: "Gỡ",
            onPress: () => {
              onUnsave(recipeId, currentSaveCount, (newSaveCount) => {
                onUnsaveSuccess(recipeId, newSaveCount);
                // Notify other screens (e.g., RecipeDetailScreen)
                notifySaveUpdate(recipeId, -1);
              });
            },
            style: "destructive",
          },
        ]
      );
    } else {
      setShowModal(true);
    }
  };

  const handleSaveSuccess = (recipeId: string, collectionId: string, newSaveCount: number) => {
    onSaveSuccess(recipeId, collectionId, newSaveCount);
    setShowModal(false);
    // Notify other screens (e.g., RecipeDetailScreen)
    notifySaveUpdate(recipeId, 1);
  };

  return (
    <>
      <TouchableOpacity
        style={[styles.saveButton, style]}
        onPress={handlePress}
        activeOpacity={0.7}
        disabled={isDisabled}
      >
        <Ionicons
          name={isSaved ? "bookmark" : "bookmark-outline"}
          size={size}
          color={isSaved ? savedColor : color}
        />
      </TouchableOpacity>

      <SaveToCollectionModal
        visible={showModal}
        recipeId={recipeId}
        collections={collections}
        userUUID={userUUID}
        onClose={() => setShowModal(false)}
        onSaveSuccess={handleSaveSuccess}
        onCreateNew={onCreateNewCollection}
      />
    </>
  );
}

const styles = StyleSheet.create({
  saveButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.white,
    justifyContent: "center",
    alignItems: "center",
    elevation: 3,
  },
});