// app/admin/recipes/[id].tsx
import { AdminRecipeDetailResponse } from '@/types/admin/recipe.types';
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import RecipeDetailContent from "../../../components/admin/management/RecipeDetailContent";
import CustomAlert from "../../../components/ui/CustomAlert";
import { useCustomAlert } from "../../../hooks/useCustomAlert";
import { adminRecipeService } from "../../../services/adminRecipeService";
import { Colors } from "../../../styles/colors";

export default function RecipeDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [recipeDetail, setRecipeDetail] = useState<AdminRecipeDetailResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const { alert, showSuccess, showError, showWarning, hideAlert } = useCustomAlert();

  useEffect(() => {
    if (id) {
      loadRecipeDetail();
    }
  }, [id]);

  const loadRecipeDetail = async () => {
    try {
      setLoading(true);
      const data = await adminRecipeService.getRecipeDetail(id as string);
      setRecipeDetail(data);
    } catch (error: any) {
      console.log('Error loading recipe detail:', error);
      showError('Lỗi', 'Không thể tải chi tiết công thức');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (recipeId: string) => {
    showWarning('Chỉnh sửa', 'Chức năng chỉnh sửa sẽ được phát triển');
  };

  const handleApprove = (recipeId: string) => {
    if (!recipeDetail) return;

    showWarning(
      'Phê duyệt công thức',
      `Bạn có chắc chắn muốn phê duyệt công thức "${recipeDetail.title}"?`,
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Phê duyệt',
          style: 'default',
          onPress: async () => {
            try {
              await adminRecipeService.approveRecipe(recipeId, true);
              await loadRecipeDetail();
              showSuccess('Thành công', 'Đã phê duyệt công thức');
            } catch (err: any) {
              showError('Lỗi', err.message || 'Không thể phê duyệt công thức');
            }
          }
        }
      ]
    );
  };

  const handleReject = (recipeId: string) => {
    if (!recipeDetail) return;

    showWarning(
      'Từ chối công thức',
      `Bạn có chắc chắn muốn từ chối công thức "${recipeDetail.title}"?`,
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Từ chối',
          style: 'destructive',
          onPress: async () => {
            try {
              await adminRecipeService.approveRecipe(recipeId, false);
              await loadRecipeDetail();
              showSuccess('Thành công', 'Đã từ chối công thức');
            } catch (err: any) {
              showError('Lỗi', err.message || 'Không thể từ chối công thức');
            }
          }
        }
      ]
    );
  };

  const handleDelete = (recipeId: string) => {
    if (!recipeDetail) return;

    showError(
      'Xóa công thức',
      `Bạn có chắc chắn muốn xóa công thức "${recipeDetail.title}"?`,
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Xóa',
          style: 'destructive',
          onPress: async () => {
            try {
              await adminRecipeService.deleteRecipe(recipeId);
              showSuccess('Thành công', 'Đã xóa công thức');
              router.back();
            } catch (err: any) {
              showError('Lỗi', err.message || 'Không thể xóa công thức');
            }
          }
        }
      ]
    );
  };

  const handleToggleFeatured = async (recipeId: string) => {
    if (!recipeDetail) return;

    try {
      await adminRecipeService.setFeaturedRecipe(recipeId, !recipeDetail.isFeatured);
      await loadRecipeDetail();
      showSuccess('Thành công', recipeDetail.isFeatured ? 'Đã bỏ nổi bật' : 'Đã đặt nổi bật');
    } catch (err: any) {
      showError('Lỗi', err.message || 'Không thể thay đổi trạng thái');
    }
  };

  const handleTogglePublished = async (recipeId: string) => {
    if (!recipeDetail) return;

    try {
      await adminRecipeService.setPublishedRecipe(recipeId, !recipeDetail.isPublished);
      await loadRecipeDetail();
      showSuccess('Thành công', recipeDetail.isPublished ? 'Đã ẩn công thức' : 'Đã xuất bản');
    } catch (err: any) {
      showError('Lỗi', err.message || 'Không thể thay đổi trạng thái');
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={Colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Chi tiết công thức</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Content */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>Đang tải...</Text>
        </View>
      ) : (
        <RecipeDetailContent
          recipeDetail={recipeDetail}
          onEdit={handleEdit}
          onApprove={handleApprove}
          onReject={handleReject}
          onDelete={handleDelete}
          onToggleFeatured={handleToggleFeatured}
          onTogglePublished={handleTogglePublished}
        />
      )}

      <CustomAlert
        visible={alert.visible}
        title={alert.title}
        message={alert.message}
        type={alert.type}
        buttons={alert.buttons}
        onClose={hideAlert}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: Colors.text.primary,
  },
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: Colors.text.secondary,
  },
});