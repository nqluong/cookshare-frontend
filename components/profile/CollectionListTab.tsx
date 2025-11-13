// CollectionListTab.tsx - Updated with Image Upload Feature

import { useAuth } from "@/context/AuthContext";
import { collectionService } from "@/services/collectionService";
import { BASE_URL } from "@/services/followService";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  Modal,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

interface Collection {
  collectionId: string;
  userId: string;
  name: string;
  description: string | null;
  isPublic: boolean;
  coverImage: string | null;
  recipeCount: number;
  viewCount: number;
  createdAt: string;
  updatedAt: string;
}

interface CollectionListTabProps {
  userId: string;
}

export default function CollectionListTab({ userId }: CollectionListTabProps) {
  const { user } = useAuth();
  const [collections, setCollections] = useState<Collection[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [selectedCollection, setSelectedCollection] =
    useState<Collection | null>(null);
  const [menuPosition, setMenuPosition] = useState<{ x: number; y: number }>({
    x: 0,
    y: 0,
  });

  // Form states
  const [formName, setFormName] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formIsPublic, setFormIsPublic] = useState(false);
  const [formCoverImage, setFormCoverImage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  useEffect(() => {
    if (userId) {
      loadCollections(userId);
    }
  }, [userId]);

  const loadCollections = async (uuid: string) => {
    if (!uuid) return;

    try {
      setLoading(true);
      const data = await collectionService.getUserCollections(uuid, 0, 100);
      setCollections(data.data.content || []);
    } catch (error) {
      console.log("Error loading collections:", error);
      Alert.alert("Lỗi", "Không thể tải danh sách collections");
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadCollections(userId);
    setRefreshing(false);
  };

  const getImageUrl = (coverImage?: string | null) => {
    if (!coverImage) return "https://placehold.co/600x400?text=No+Image";

    if (coverImage.startsWith("http")) {
      return coverImage;
    }
    return `${BASE_URL}/${coverImage.replace(/\\/g, "/")}`;
  };

  const pickImage = async () => {
    try {
      const permissionResult =
        await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (permissionResult.granted === false) {
        Alert.alert("Lỗi", "Bạn cần cấp quyền truy cập thư viện ảnh");
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [16, 9],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        await uploadImage(result.assets[0].uri);
      }
    } catch (error) {
      console.log("Error picking image:", error);
      Alert.alert("Lỗi", "Không thể chọn ảnh");
    }
  };

  const uploadImage = async (imageUri: string) => {
    try {
      setIsUploadingImage(true);

      const formData = new FormData();
      const filename = imageUri.split("/").pop() || "image.jpg";
      const match = /\.(\w+)$/.exec(filename);
      const type = match ? `image/${match[1]}` : "image/jpeg";

      formData.append("file", {
        uri: imageUri,
        name: filename,
        type: type,
      } as any);

      const response = await collectionService.uploadCoverImage(
        formData,
        new AbortController().signal
      );

      if (response.url) {
        setFormCoverImage(response.url);
        Alert.alert("Thành công", "Tải ảnh lên thành công");
      }
    } catch (error) {
      console.log("Error uploading image:", error);
      Alert.alert("Lỗi", "Không thể tải ảnh lên");
    } finally {
      setIsUploadingImage(false);
    }
  };

  const handleCreateCollection = async () => {
    if (!formName.trim() || !userId) {
      Alert.alert("Lỗi", "Vui lòng nhập tên collection");
      return;
    }

    try {
      setIsSubmitting(true);
      const response = await collectionService.createCollection(userId, {
        name: formName,
        description: formDescription,
        isPublic: formIsPublic,
        coverImage: formCoverImage ?? " ",
      });

      const newCollection = (response as any).data ?? response;

      setCollections([newCollection, ...collections]);
      resetForm();
      setShowCreateModal(false);
      Alert.alert("Thành công", "Collection đã được tạo");
    } catch (error) {
      console.log("Error creating collection:", error);
      Alert.alert("Lỗi", "Không thể tạo collection");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditCollection = async () => {
    if (!formName.trim() || !userId || !selectedCollection) {
      Alert.alert("Lỗi", "Vui lòng nhập tên collection");
      return;
    }

    try {
      setIsSubmitting(true);
      const updatedResponse = await collectionService.updateCollection(
        userId,
        selectedCollection.collectionId,
        {
          name: formName,
          description: formDescription,
          isPublic: formIsPublic,
          coverImage: formCoverImage ?? " ",
        }
      );

      const updatedCollection = ((updatedResponse as any).data ??
        updatedResponse) as Collection;

      setCollections(
        collections.map((c) =>
          c.collectionId === selectedCollection.collectionId
            ? updatedCollection
            : c
        )
      );

      resetForm();
      setShowEditModal(false);
      setShowMenu(false);
      setSelectedCollection(null);
      Alert.alert("Thành công", "Collection đã được cập nhật");
    } catch (error) {
      console.log("Error updating collection:", error);
      Alert.alert("Lỗi", "Không thể cập nhật collection");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteCollection = () => {
    if (!selectedCollection || !userId) return;

    Alert.alert(
      "Xóa collection",
      `Bạn có chắc chắn muốn xóa "${selectedCollection.name}"?`,
      [
        { text: "Hủy", style: "cancel" },
        {
          text: "Xóa",
          style: "destructive",
          onPress: async () => {
            try {
              await collectionService.deleteCollection(
                userId,
                selectedCollection.collectionId
              );
              setCollections(
                collections.filter(
                  (c) => c.collectionId !== selectedCollection.collectionId
                )
              );
              setShowMenu(false);
              setSelectedCollection(null);
              Alert.alert("Thành công", "Collection đã được xóa");
            } catch (error) {
              console.log("Error deleting collection:", error);
              Alert.alert("Lỗi", "Không thể xóa collection");
            }
          },
        },
      ]
    );
  };

  const openEditMenu = (collection: Collection) => {
    setSelectedCollection(collection);
    setFormName(collection.name);
    setFormDescription(collection.description || "");
    setFormIsPublic(collection.isPublic);
    setFormCoverImage(collection.coverImage);
    setShowMenu(false);
    setShowEditModal(true);
  };

  const resetForm = () => {
    setFormName("");
    setFormDescription("");
    setFormIsPublic(false);
    setFormCoverImage(null);
  };

  const handleMenuPress = (event: any, item: Collection) => {
    const { pageX, pageY } = event.nativeEvent;
    setMenuPosition({ x: pageX, y: pageY });
    setSelectedCollection(item);
    setShowMenu(true);
  };

  const renderCollectionCard = ({ item }: { item: Collection }) => (
    <TouchableOpacity
      style={styles.cardRow}
      onPress={() => {
        router.push({
          pathname: "/collection/Collection-Detail",
          params: { collectionId: item.collectionId },
        } as any);
      }}
    >
      <View style={styles.cardCoverRow}>
        {item.coverImage ? (
          <Image
            source={{ uri: getImageUrl(item.coverImage) }}
            style={styles.cardCoverImageRow}
            resizeMode="cover"
          />
        ) : (
          <View style={[styles.cardCoverImageRow, styles.placeholderCover]}>
            <MaterialCommunityIcons
              name="playlist-music"
              size={40}
              color="#FF385C"
            />
          </View>
        )}
      </View>

      <View style={styles.cardInfoRow}>
        <View style={styles.cardTitleContainer}>
          <Text style={styles.cardNameRow} numberOfLines={2}>
            {item.name}
          </Text>
          <TouchableOpacity
            style={styles.cardMenuButton}
            onPress={(event) => handleMenuPress(event, item)}
          >
            <MaterialCommunityIcons
              name="dots-vertical"
              size={20}
              color="#000"
            />
          </TouchableOpacity>
        </View>

        <Text style={styles.cardDescription} numberOfLines={2}>
          {item.description || "Không có mô tả"}
        </Text>

        <View style={styles.cardMetaRow}>
          <Text style={styles.cardRecipeCountRow}>
            {item.recipeCount} công thức
          </Text>
          {item.isPublic && (
            <View style={styles.cardStatusRow}>
              <Ionicons name="globe-outline" size={12} color="#FF385C" />
              <Text style={styles.statusTextRow}>Công khai</Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderHeader = () => (
    <View style={styles.header}>
      <Text style={styles.headerTitle}>Bộ sưu tập</Text>
      <TouchableOpacity
        style={styles.createButton}
        onPress={() => {
          resetForm();
          setShowCreateModal(true);
        }}
      >
        <Ionicons name="add" size={24} color="white" />
      </TouchableOpacity>
    </View>
  );

  if (loading) {
    return (
      <View style={[styles.container, styles.centerContainer]}>
        <ActivityIndicator size="large" color="#FF385C" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        ListHeaderComponent={renderHeader}
        data={collections}
        renderItem={renderCollectionCard}
        keyExtractor={(item) => item.collectionId}
        numColumns={1}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <MaterialCommunityIcons
              name="playlist-plus"
              size={60}
              color="#ddd"
            />
            <Text style={styles.emptyText}>Chưa có collection nào</Text>
            <TouchableOpacity
              style={styles.createNewButton}
              onPress={() => {
                resetForm();
                setShowCreateModal(true);
              }}
            >
              <Ionicons name="add" size={20} color="white" />
              <Text style={styles.createNewButtonText}>Tạo collection</Text>
            </TouchableOpacity>
          </View>
        }
      />

      {/* Menu Modal */}
      <Modal
        visible={showMenu}
        transparent
        animationType="fade"
        onRequestClose={() => setShowMenu(false)}
      >
        <TouchableOpacity
          style={[styles.overlay, { justifyContent: "flex-start" }]}
          onPress={() => setShowMenu(false)}
          activeOpacity={1}
        >
          <View
            style={[
              styles.menuContent,
              {
                position: "absolute",
                top: menuPosition.y - 100,
                left: menuPosition.x - 150,
                marginTop: 5,
              },
            ]}
          >
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => {
                if (selectedCollection) {
                  openEditMenu(selectedCollection);
                }
              }}
            >
              <Ionicons name="pencil" size={20} color="#000" />
              <Text style={styles.menuItemText}>Sửa</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.menuItem, styles.lastMenuItem]}
              onPress={() => {
                handleDeleteCollection();
              }}
            >
              <Ionicons name="trash" size={20} color="#FF385C" />
              <Text style={[styles.menuItemText, { color: "#FF385C" }]}>
                Xóa
              </Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Create/Edit Modal */}
      <Modal
        visible={showCreateModal || showEditModal}
        transparent
        animationType="slide"
        onRequestClose={() => {
          setShowCreateModal(false);
          setShowEditModal(false);
        }}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity
              onPress={() => {
                setShowCreateModal(false);
                setShowEditModal(false);
                resetForm();
              }}
            >
              <Text style={styles.cancelButton}>Hủy</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>
              {showEditModal ? "Sửa Collection" : "Tạo Collection"}
            </Text>
            <TouchableOpacity
              onPress={
                showEditModal ? handleEditCollection : handleCreateCollection
              }
              disabled={isSubmitting}
            >
              <Text
                style={[
                  styles.saveButton,
                  isSubmitting && styles.saveButtonDisabled,
                ]}
              >
                {isSubmitting ? "..." : "Lưu"}
              </Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalForm}>
            {/* Cover Image Picker */}
            <Text style={styles.label}>Ảnh bìa</Text>
            <TouchableOpacity
              style={styles.imagePickerContainer}
              onPress={pickImage}
              disabled={isUploadingImage || isSubmitting}
            >
              {formCoverImage ? (
                <Image
                  source={{ uri: getImageUrl(formCoverImage) }}
                  style={styles.coverImagePreview}
                  resizeMode="cover"
                />
              ) : (
                <View style={styles.imagePickerPlaceholder}>
                  {isUploadingImage ? (
                    <ActivityIndicator size="large" color="#FF385C" />
                  ) : (
                    <>
                      <Ionicons name="image-outline" size={40} color="#ccc" />
                      <Text style={styles.imagePickerText}>Chọn ảnh bìa</Text>
                    </>
                  )}
                </View>
              )}
            </TouchableOpacity>

            {formCoverImage && (
              <TouchableOpacity
                style={styles.removeImageButton}
                onPress={() => setFormCoverImage(null)}
                disabled={isSubmitting}
              >
                <Ionicons name="trash-outline" size={16} color="#FF385C" />
                <Text style={styles.removeImageText}>Xóa ảnh</Text>
              </TouchableOpacity>
            )}

            <Text style={styles.label}>Tên Collection *</Text>
            <TextInput
              style={styles.input}
              placeholder="Ví dụ: Món ngon từ các nước"
              placeholderTextColor="#ccc"
              value={formName}
              onChangeText={setFormName}
              editable={!isSubmitting}
            />

            <Text style={styles.label}>Mô tả</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Mô tả collection của bạn"
              placeholderTextColor="#ccc"
              value={formDescription}
              onChangeText={setFormDescription}
              multiline
              numberOfLines={4}
              editable={!isSubmitting}
            />

            <View style={styles.switchContainer}>
              <View>
                <Text style={styles.label}>Công khai</Text>
                <Text style={styles.labelHint}>Bất kỳ ai cũng có thể xem</Text>
              </View>
              <TouchableOpacity
                style={[styles.switch, formIsPublic && styles.switchActive]}
                onPress={() => setFormIsPublic(!formIsPublic)}
                disabled={isSubmitting}
              >
                <View
                  style={[
                    styles.switchCircle,
                    formIsPublic && styles.switchCircleActive,
                  ]}
                />
              </TouchableOpacity>
            </View>
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
    paddingTop: 0,
  },
  centerContainer: {
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: "white",
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#000",
  },
  createButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#FF385C",
    justifyContent: "center",
    alignItems: "center",
  },
  listContent: {
    paddingVertical: 12,
  },
  cardRow: {
    flexDirection: "row",
    backgroundColor: "white",
    marginHorizontal: 12,
    marginBottom: 12,
    borderRadius: 12,
  },
  cardCoverRow: {
    width: 150,
    height: 100,
    borderRadius: 12,
    overflow: "hidden",
  },
  cardCoverImageRow: {
    width: "100%",
    height: "100%",
  },
  cardInfoRow: {
    flex: 1,
    padding: 12,
    justifyContent: "space-between",
  },
  cardTitleContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
  },
  cardNameRow: {
    fontSize: 14,
    fontWeight: "600",
    color: "#000",
    flex: 1,
    marginRight: 8,
  },
  cardMenuButton: {
    padding: 4,
  },
  cardDescription: {
    fontSize: 12,
    color: "#999",
    marginVertical: 4,
    lineHeight: 16,
  },
  cardMetaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  cardRecipeCountRow: {
    fontSize: 12,
    color: "#666",
  },
  cardStatusRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
    backgroundColor: "#ffe0e6",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  statusTextRow: {
    fontSize: 10,
    color: "#FF385C",
    fontWeight: "600",
  },
  placeholderCover: {
    backgroundColor: "#f0f0f0",
    justifyContent: "center",
    alignItems: "center",
  },
  emptyContainer: {
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 80,
  },
  emptyText: {
    fontSize: 16,
    color: "#999",
    marginTop: 16,
    marginBottom: 24,
  },
  createNewButton: {
    flexDirection: "row",
    backgroundColor: "#FF385C",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    gap: 8,
  },
  createNewButtonText: {
    color: "white",
    fontSize: 14,
    fontWeight: "600",
  },
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.3)",
    justifyContent: "flex-start",
  },
  menuContent: {
    backgroundColor: "white",
    borderRadius: 12,
    minWidth: 150,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 8,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
    flex: 1,
  },
  lastMenuItem: {
    borderBottomWidth: 0,
  },
  menuItemText: {
    fontSize: 14,
    color: "#000",
    marginLeft: 12,
    fontWeight: "600",
  },
  modalContainer: {
    flex: 1,
    backgroundColor: "white",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#000",
  },
  cancelButton: {
    fontSize: 14,
    color: "#666",
  },
  saveButton: {
    fontSize: 14,
    color: "#FF385C",
    fontWeight: "600",
  },
  saveButtonDisabled: {
    opacity: 0.5,
  },
  modalForm: {
    flex: 1,
    padding: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#000",
    marginBottom: 8,
  },
  labelHint: {
    fontSize: 12,
    color: "#999",
    marginTop: 2,
  },
  input: {
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: "#000",
    marginBottom: 16,
  },
  textArea: {
    textAlignVertical: "top",
    height: 100,
  },
  switchContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 16,
  },
  switch: {
    width: 50,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#e0e0e0",
    justifyContent: "center",
    paddingHorizontal: 2,
  },
  switchActive: {
    backgroundColor: "#FF385C",
  },
  switchCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "white",
  },
  switchCircleActive: {
    alignSelf: "flex-end",
  },
  imagePickerContainer: {
    width: "100%",
    height: 180,
    borderRadius: 12,
    overflow: "hidden",
    marginBottom: 12,
    borderWidth: 2,
    borderStyle: "dashed",
    borderColor: "#e0e0e0",
  },
  imagePickerPlaceholder: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f8f8f8",
  },
  imagePickerText: {
    marginTop: 8,
    fontSize: 14,
    color: "#999",
  },
  coverImagePreview: {
    width: "100%",
    height: "100%",
  },
  removeImageButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 8,
    marginBottom: 16,
  },
  removeImageText: {
    fontSize: 14,
    color: "#FF385C",
    fontWeight: "600",
  },
});
