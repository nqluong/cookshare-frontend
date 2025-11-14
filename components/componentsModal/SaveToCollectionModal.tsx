import { collectionService } from "@/services/collectionService";
import { RecipeService } from "@/services/recipeService";
import { Colors } from "@/styles/colors";
import { CollectionUserDto } from "@/types/collection.types";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useState } from "react";
import {
  Alert,
  FlatList,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

interface SaveToCollectionModalProps {
  visible: boolean;
  recipeId: string | null;
  collections: CollectionUserDto[];
  userUUID: string;
  onClose: () => void;
  onSaveSuccess: (recipeId: string, collectionId: string, newSaveCount: number) => void;
  onCreateNew?: () => void;
}

export default function SaveToCollectionModal({
  visible,
  recipeId,
  collections,
  userUUID,
  onClose,
  onSaveSuccess,
  onCreateNew,
}: SaveToCollectionModalProps) {
  const [isSaving, setIsSaving] = useState(false);

  const handleSaveToCollection = async (collectionId: string) => {
    if (!recipeId) return;

    setIsSaving(true);
    try {
      // 1. Lưu recipe vào collection
      await collectionService.addRecipeToCollection(
        userUUID,
        collectionId,
        { recipeId }
      );


      // 2. Gọi API để lấy thông tin recipe mới nhất (có saveCount đã cập nhật)
      const token = await AsyncStorage.getItem('authToken');
      const recipeData = await RecipeService.getRecipeById(recipeId, token);
      const newSaveCount = recipeData.saveCount || 0;

      onSaveSuccess(recipeId, collectionId, newSaveCount);
      Alert.alert("Thành công", "Công thức đã được lưu vào bộ sưu tập!");
      onClose();
    } catch (error: any) {
      console.log("Lỗi khi lưu công thức:", error);
      Alert.alert("Lỗi", error.message || "Không thể lưu vào bộ sưu tập.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleCreateNewCollection = () => {
    onClose();
    onCreateNew?.();
  };

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <Text style={styles.modalTitle}>Chọn bộ sưu tập</Text>

          {collections.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>Bạn chưa có bộ sưu tập nào.</Text>
              <TouchableOpacity
                style={styles.createButton}
                onPress={handleCreateNewCollection}
              >
                <Text style={styles.createButtonText}>Tạo mới</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <FlatList
              data={collections}
              keyExtractor={(item) => item.collectionId}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.collectionItem}
                  onPress={() => handleSaveToCollection(item.collectionId)}
                  disabled={isSaving}
                >
                  <Text style={styles.collectionName}>{item.name}</Text>
                </TouchableOpacity>
              )}
              style={{ maxHeight: 200 }}
            />
          )}

          <TouchableOpacity
            style={styles.cancelButton}
            onPress={onClose}
            disabled={isSaving}
          >
            <Text style={styles.cancelText}>Hủy</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 20,
    width: "80%",
    maxHeight: "70%",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: Colors.text.primary,
    marginBottom: 12,
  },
  collectionItem: {
    paddingVertical: 10,
  },
  collectionName: {
    fontSize: 15,
    color: Colors.text.primary,
  },
  emptyContainer: {
    alignItems: "center",
    marginVertical: 16,
  },
  emptyText: {
    color: Colors.text.secondary,
    marginBottom: 8,
  },
  createButton: {
    backgroundColor: Colors.primary,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  createButtonText: {
    color: Colors.white,
    fontWeight: "600",
  },
  cancelButton: {
    marginTop: 12,
    alignSelf: "center",
  },
  cancelText: {
    color: Colors.text.secondary,
    fontSize: 15,
  },
});