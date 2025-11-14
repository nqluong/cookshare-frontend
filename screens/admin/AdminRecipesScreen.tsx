// app/admin/recipes/index.tsx
import { AdminRecipe, AdminRecipeDetailResponse, AdminRecipeListResponse } from '@/types/admin/recipe.types';
import { router } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import AdminHeader from "../../components/admin/management/AdminHeader";
import FilterOptions from "../../components/admin/management/FilterOptions";
import FilterTabs from "../../components/admin/management/FilterTabs";
import RecipeDetailModal from "../../components/admin/management/RecipeDetailModal";
import RecipeList from "../../components/admin/management/RecipeList";
import SearchBar from "../../components/admin/management/SearchBar";
import CustomAlert from "../../components/ui/CustomAlert";
import { useCustomAlert } from "../../hooks/useCustomAlert";
import { adminRecipeService } from "../../services/adminRecipeService";

export default function AdminRecipesScreen() {
  const [searchQuery, setSearchQuery] = useState("");
  const [recipes, setRecipes] = useState<AdminRecipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [totalElements, setTotalElements] = useState(0);
  const [selectedRecipe, setSelectedRecipe] = useState<AdminRecipe | null>(null);
  const [selectedRecipeDetail, setSelectedRecipeDetail] = useState<AdminRecipeDetailResponse | null>(null);
  const [showRecipeDetailModal, setShowRecipeDetailModal] = useState(false);
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [filterPublished, setFilterPublished] = useState<boolean | null>(null);
  const [filterFeatured, setFilterFeatured] = useState<boolean | null>(null);
  const [sortBy, setSortBy] = useState<string>('createdAt');
  const [sortDir, setSortDir] = useState<string>('desc');
  const [showFilterOptions, setShowFilterOptions] = useState(false);

  const { alert, showSuccess, showError, showWarning, hideAlert } = useCustomAlert();

  const handleExitAdmin = () => {
    router.replace('/(tabs)/home' as any);
  };

  const loadRecipes = useCallback(async (page: number = 0, search: string = "", reset: boolean = true) => {
    try {
      if (reset) {
        setLoading(true);
        setError(null);
      }

      let response: AdminRecipeListResponse;
      switch (filterStatus) {
        case 'pending':
          response = await adminRecipeService.getPendingRecipes(search, page, 20, sortBy, sortDir);
          break;
        case 'approved':
          response = await adminRecipeService.getApprovedRecipes(search, page, 20, sortBy, sortDir);
          break;
        case 'rejected':
          response = await adminRecipeService.getRejectedRecipes(search, page, 20, sortBy, sortDir);
          break;
        default:
          response = await adminRecipeService.getAllRecipes(search, filterPublished || undefined, filterFeatured || undefined, page, 20, sortBy, sortDir);
      }

      if (reset) {
        setRecipes(response.content);
      } else {
        setRecipes(prev => [...prev, ...response.content]);
      }

      setCurrentPage(page);
      setHasMore(!response.last);
      setTotalElements(response.totalElements);
    } catch (err: any) {
      showError('Lỗi', err.message || 'Không thể tải danh sách công thức');
      setError(err.message || 'Không thể tải danh sách công thức');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [filterStatus, filterPublished, filterFeatured, sortBy, sortDir, showError]);

  useEffect(() => {
    setRecipes([]);
    setCurrentPage(0);
    setHasMore(true);
    setTotalElements(0);
    setError(null);
    setLoading(true);
  }, [filterStatus, sortBy, sortDir]);

  useEffect(() => {
    loadRecipes();
  }, [loadRecipes]);

  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    loadRecipes(0, searchQuery, true);
  }, [loadRecipes, searchQuery]);

  const handleSearch = useCallback(() => {
    loadRecipes(0, searchQuery, true);
  }, [loadRecipes, searchQuery]);

  const handleLoadMore = useCallback(() => {
    if (!loading && hasMore && !refreshing) {
      loadRecipes(currentPage + 1, searchQuery, false);
    }
  }, [loadRecipes, currentPage, searchQuery, loading, hasMore, refreshing]);



  // Cập nhật handleViewRecipe
  const handleViewRecipe = async (recipe: AdminRecipe) => {
    try {
      setShowRecipeDetailModal(true);

      // Load chi tiết công thức
      const recipeDetail = await adminRecipeService.getRecipeDetail(recipe.recipeId);
      setSelectedRecipeDetail(recipeDetail);
    } catch (error: any) {
      console.log('Error loading recipe detail:', error);

      let errorMessage = 'Không thể tải chi tiết công thức';
      try {
        const errorData = JSON.parse(error.message);
        if (errorData.message) {
          errorMessage = errorData.message;
        }
      } catch (parseError) {
        errorMessage = error.message || errorMessage;
      }

      showError('Lỗi', errorMessage);
      setSelectedRecipeDetail(null);
    }
  };

  // Cập nhật các handlers khác để nhận recipeId thay vì recipe object
  const handleEditRecipe = (recipeId: string) => {
    // Đóng modal nếu đang mở
    if (showRecipeDetailModal) {
      setShowRecipeDetailModal(false);
    }
    
    // Chuyển hướng đến trang chỉnh sửa công thức
    router.push(`/(tabs)/_recipe-edit/${recipeId}` as any);
  };

  const handleApproveRecipe = (recipeId: string) => {
    // Tìm recipe từ danh sách hoặc dùng selectedRecipeDetail nếu có
    const recipe = recipes.find(r => r.recipeId === recipeId) || selectedRecipeDetail;
    if (!recipe) return;

    showWarning(
      'Phê duyệt công thức',
      `Bạn có chắc chắn muốn phê duyệt công thức "${recipe.title}"?`,
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Phê duyệt',
          style: 'default',
          onPress: async () => {
            try {
              setLoading(true);
              await adminRecipeService.approveRecipe(recipeId, true);
              await loadRecipes(0, searchQuery, true);
              if (showRecipeDetailModal) {
                setShowRecipeDetailModal(false);
              }
              showSuccess('Thành công', 'Đã phê duyệt công thức thành công');
            } catch (err: any) {
              showError('Lỗi', err.message || 'Không thể phê duyệt công thức');
            } finally {
              setLoading(false);
            }
          }
        }
      ]
    );
  };

  const handleRejectRecipe = (recipeId: string) => {
    // Tìm recipe từ danh sách hoặc dùng selectedRecipeDetail nếu có
    const recipe = recipes.find(r => r.recipeId === recipeId) || selectedRecipeDetail;
    if (!recipe) return;

    showWarning(
      'Từ chối công thức',
      `Bạn có chắc chắn muốn từ chối công thức "${recipe.title}"?`,
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Từ chối',
          style: 'destructive',
          onPress: async () => {
            try {
              setLoading(true);
              await adminRecipeService.approveRecipe(recipeId, false);
              await loadRecipes(0, searchQuery, true);
              if (showRecipeDetailModal) {
                setShowRecipeDetailModal(false);
              }
              showSuccess('Thành công', 'Đã từ chối công thức');
            } catch (error: any) {
              showError('Lỗi', error.message || 'Không thể từ chối công thức');
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  const handleDeleteRecipe = (recipeId: string) => {
    // Tìm recipe từ danh sách hoặc dùng selectedRecipeDetail nếu có
    const recipe = recipes.find(r => r.recipeId === recipeId) || selectedRecipeDetail;
    if (!recipe) return;

    showError(
      'Xóa công thức',
      `Bạn có chắc chắn muốn xóa công thức "${recipe.title}"? Hành động này không thể hoàn tác.`,
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Xóa',
          style: 'destructive',
          onPress: async () => {
            try {
              setLoading(true);
              await adminRecipeService.deleteRecipe(recipeId);
              await loadRecipes(0, searchQuery, true);
              if (showRecipeDetailModal) {
                setShowRecipeDetailModal(false);
              }
              showSuccess('Thành công', 'Đã xóa công thức thành công');
            } catch (err: any) {
              showError('Lỗi', err.message || 'Không thể xóa công thức');
            } finally {
              setLoading(false);
            }
          }
        }
      ]
    );
  };

  const handleToggleFeatured = async (recipeId: string) => {
    // Tìm recipe từ danh sách hoặc dùng selectedRecipeDetail nếu có
    const recipe = recipes.find(r => r.recipeId === recipeId) || selectedRecipeDetail;
    if (!recipe) return;

    try {
      setLoading(true);
      await adminRecipeService.setFeaturedRecipe(recipeId, !recipe.isFeatured);

      // Nếu đang mở modal, reload recipe detail
      if (showRecipeDetailModal && selectedRecipeDetail) {
        const updatedRecipe = await adminRecipeService.getRecipeDetail(recipeId);
        setSelectedRecipeDetail(updatedRecipe);
      }

      await loadRecipes(0, searchQuery, true);
      showSuccess('Thành công', recipe.isFeatured ? 'Đã bỏ nổi bật công thức' : 'Đã đặt nổi bật công thức');
    } catch (err: any) {
      showError('Lỗi', err.message || 'Không thể thay đổi trạng thái nổi bật');
    } finally {
      setLoading(false);
    }
  };

  const handleTogglePublished = async (recipeId: string) => {
    // Tìm recipe từ danh sách hoặc dùng selectedRecipeDetail nếu có
    const recipe = recipes.find(r => r.recipeId === recipeId) || selectedRecipeDetail;
    if (!recipe) return;

    try {
      setLoading(true);
      await adminRecipeService.setPublishedRecipe(recipeId, !recipe.isPublished);

      // Nếu đang mở modal, reload recipe detail
      if (showRecipeDetailModal && selectedRecipeDetail) {
        const updatedRecipe = await adminRecipeService.getRecipeDetail(recipeId);
        setSelectedRecipeDetail(updatedRecipe);
      }

      await loadRecipes(0, searchQuery, true);
      showSuccess('Thành công', recipe.isPublished ? 'Đã ẩn công thức' : 'Đã xuất bản công thức');
    } catch (err: any) {
      showError('Lỗi', err.message || 'Không thể thay đổi trạng thái xuất bản');
    } finally {
      setLoading(false);
    }
  };
  const handleSortChange = (newSortBy: string, newSortDir: string) => {
    setSortBy(newSortBy);
    setSortDir(newSortDir);
    setCurrentPage(0);
    setHasMore(true);
    loadRecipes(0, searchQuery, true);
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <AdminHeader
        title="Công Thức"
        onBack={() => router.back()}
        onFilterPress={() => setShowFilterOptions(true)}
        onExitAdmin={handleExitAdmin}
      />

      <SearchBar
        value={searchQuery}
        onChangeText={setSearchQuery}
        onSearch={handleSearch}
      />

      <FilterTabs
        activeFilter={filterStatus}
        onFilterChange={setFilterStatus}
      />

      <View style={styles.listSection}>
        <RecipeList
          recipes={recipes}
          loading={loading}
          refreshing={refreshing}
          error={error}
          totalElements={totalElements}
          hasMore={hasMore}
          onRefresh={handleRefresh}
          onLoadMore={handleLoadMore}
          onViewRecipe={handleViewRecipe}
          onEditRecipe={handleEditRecipe}
          onDeleteRecipe={handleDeleteRecipe}
          onApproveRecipe={handleApproveRecipe}
          onRejectRecipe={handleRejectRecipe}
          onToggleFeatured={handleToggleFeatured}
          onTogglePublished={handleTogglePublished}
        />
      </View>

      <RecipeDetailModal
        visible={showRecipeDetailModal}
        recipeDetail={selectedRecipeDetail}
        onClose={() => {
          setShowRecipeDetailModal(false);
          setSelectedRecipeDetail(null);
        }}
        onEdit={handleEditRecipe}
        onApprove={handleApproveRecipe}
        onReject={handleRejectRecipe}
        onDelete={handleDeleteRecipe}
        onToggleFeatured={handleToggleFeatured}
        onTogglePublished={handleTogglePublished}
      />

      <FilterOptions
        visible={showFilterOptions}
        onClose={() => setShowFilterOptions(false)}
        sortBy={sortBy}
        sortDir={sortDir}
        onSortChange={handleSortChange}
      />

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
    backgroundColor: "#10b981",
  },
  listSection: {
    flex: 1,
    backgroundColor: "#d1f4e0",
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    paddingTop: 24,
  },
});