import { AdminRecipe, AdminRecipeDetailResponse } from '@/types/admin/recipe.types';
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import FilterOptions from "../../components/admin/management/FilterOptions";
import FilterTabs from "../../components/admin/management/FilterTabs";
import RecipeDetailModal from "../../components/admin/management/RecipeDetailModal";
import RecipeList from "../../components/admin/management/RecipeList";
import SearchBar from "../../components/admin/management/SearchBar";
import CustomAlert from "../../components/ui/CustomAlert";
import { useCustomAlert } from "../../hooks/useCustomAlert";
import { adminRecipeService } from "../../services/adminRecipeService";
import { Colors } from "../../styles/colors";

export default function AdminRecipesScreen() {
  const [searchQuery, setSearchQuery] = useState("");

  const handleExitAdmin = () => {
    router.replace('/(tabs)/home' as any);
  };
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

  const loadRecipes = useCallback(async (page: number = 0, search: string = "", reset: boolean = true) => {
    try {
      if (reset) {
        setLoading(true);
        setError(null);
      }

      console.log('Loading recipes with params:', { page, search, filterStatus, filterPublished, filterFeatured, sortBy, sortDir });

      let response;
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
      console.error('Error loading recipes:', err);
      showError('Lỗi', err.message || 'Không thể tải danh sách công thức');
      setError(err.message || 'Không thể tải danh sách công thức');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [filterStatus, filterPublished, filterFeatured, sortBy, sortDir, showError]);

  // Clear dữ liệu cũ khi chuyển tab hoặc thay đổi sorting
  useEffect(() => {
    setRecipes([]);
    setCurrentPage(0);
    setHasMore(true);
    setTotalElements(0);
    setError(null);
    setLoading(true); // Hiển thị loading khi chuyển tab
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
      console.log('Loading more recipes, current page:', currentPage);
      loadRecipes(currentPage + 1, searchQuery, false);
    }
  }, [loadRecipes, currentPage, searchQuery, loading, hasMore, refreshing]);

  const handleViewRecipe = async (recipe: AdminRecipe) => {
    try {
      setSelectedRecipe(recipe);
      setShowRecipeDetailModal(true);
      
      // Load chi tiết công thức
      const recipeDetail = await adminRecipeService.getRecipeDetail(recipe.recipeId);
      setSelectedRecipeDetail(recipeDetail);
    } catch (error: any) {
      console.error('Error loading recipe detail:', error);
      
      // Parse error message if it's JSON
      let errorMessage = 'Không thể tải chi tiết công thức';
      try {
        const errorData = JSON.parse(error.message);
        if (errorData.message) {
          errorMessage = errorData.message;
        }
      } catch (parseError) {
        // If parsing fails, use the original error message
        errorMessage = error.message || errorMessage;
      }
      
      showError('Lỗi', errorMessage);
      
      // Still show the modal with basic info even if detail loading fails
      setSelectedRecipeDetail(null);
    }
  };

  const handleEditRecipe = (recipeId: string) => {
    showWarning('Chỉnh sửa', 'Chức năng chỉnh sửa sẽ được phát triển');
  };

  const handleApproveRecipe = (recipe: AdminRecipe) => {
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
              await adminRecipeService.approveRecipe(recipe.recipeId, true);
              await loadRecipes(0, searchQuery, true);
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

  const handleRejectRecipe = (recipe: AdminRecipe) => {
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
              await adminRecipeService.approveRecipe(recipe.recipeId, false);
              await loadRecipes(0, searchQuery, true);
              showSuccess('Thành công', 'Đã từ chối công thức');
            } catch (error: any) {
              console.error('Reject recipe error:', error);
              showError('Lỗi', error.message || 'Không thể từ chối công thức');
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  const handleDeleteRecipe = (recipe: AdminRecipe) => {
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
              await adminRecipeService.deleteRecipe(recipe.recipeId);
              await loadRecipes(0, searchQuery, true);
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

  const handleToggleFeatured = async (recipe: AdminRecipe) => {
    try {
      setLoading(true);
      await adminRecipeService.setFeaturedRecipe(recipe.recipeId, !recipe.isFeatured);
      await loadRecipes(0, searchQuery, true);
      showSuccess('Thành công', recipe.isFeatured ? 'Đã bỏ nổi bật công thức' : 'Đã đặt nổi bật công thức');
    } catch (err: any) {
      showError('Lỗi', err.message || 'Không thể thay đổi trạng thái nổi bật');
    } finally {
      setLoading(false);
    }
  };

  const handleTogglePublished = async (recipe: AdminRecipe) => {
    try {
      setLoading(true);
      await adminRecipeService.setPublishedRecipe(recipe.recipeId, !recipe.isPublished);
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
    // Reset về trang đầu và reload tất cả dữ liệu với sorting mới
    setCurrentPage(0);
    setHasMore(true);
    loadRecipes(0, searchQuery, true);
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={Colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Công Thức</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity 
            style={styles.filterButton}
            onPress={() => setShowFilterOptions(true)}
          >
            <Ionicons name="options-outline" size={20} color={Colors.text.primary} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.notificationButton}>
            <Ionicons name="notifications-outline" size={24} color={Colors.text.primary} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.exitButton} onPress={handleExitAdmin}>
            <Ionicons name="exit-outline" size={24} color={Colors.text.primary} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Search Bar */}
      <SearchBar
        value={searchQuery}
        onChangeText={setSearchQuery}
        onSearch={handleSearch}
      />

      {/* Filter Tabs */}
      <FilterTabs
        activeFilter={filterStatus}
        onFilterChange={setFilterStatus}
      />

      {/* Recipes List */}
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

      {/* Recipe Detail Modal */}
      <RecipeDetailModal
        visible={showRecipeDetailModal}
        recipe={selectedRecipe}
        recipeDetail={selectedRecipeDetail}
        onClose={() => {
          setShowRecipeDetailModal(false);
          setSelectedRecipeDetail(null);
        }}
        onEdit={handleEditRecipe}
        onApprove={handleApproveRecipe}
        onDelete={handleDeleteRecipe}
        onToggleFeatured={handleToggleFeatured}
        onTogglePublished={handleTogglePublished}
      />
      
      {/* Filter Options Modal */}
      <FilterOptions
        visible={showFilterOptions}
        onClose={() => setShowFilterOptions(false)}
        sortBy={sortBy}
        sortDir={sortDir}
        onSortChange={handleSortChange}
      />
      
      {/* Custom Alert */}
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
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#10b981",
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: Colors.text.primary,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  filterButton: {
    padding: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 8,
  },
  notificationButton: {
    padding: 4,
  },
  exitButton: {
    padding: 4,
  },
  searchContainer: {
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
    backgroundColor: "#10b981",
  },
  searchBar: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 25,
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: Colors.text.primary,
  },
  searchButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  listSection: {
    flex: 1,
    backgroundColor: "#d1f4e0",
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    paddingTop: 24,
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 20,
  },
  recipeItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  recipeImage: {
    width: 80,
    height: 80,
    borderRadius: 12,
    marginRight: 16,
  },
  recipeMainInfo: {
    flex: 1,
    justifyContent: "center",
  },
  recipeHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  recipeName: {
    fontSize: 18,
    fontWeight: "700",
    color: Colors.text.primary,
    flex: 1,
    marginRight: 8,
  },
  recipeBadges: {
    flexDirection: "row",
    gap: 8,
  },
  featuredBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fef3c7",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  featuredText: {
    fontSize: 10,
    color: "#f59e0b",
    fontWeight: "600",
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 10,
    color: "#fff",
    fontWeight: "600",
  },
  recipeStats: {
    flexDirection: "row",
    gap: 16,
    marginBottom: 8,
  },
  statItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  statText: {
    fontSize: 14,
    color: Colors.text.primary,
    fontWeight: "600",
  },
  recipeAuthor: {
    fontSize: 14,
    color: Colors.text.secondary,
    fontWeight: "500",
  },
  recipeActions: {
    flexDirection: "row",
    gap: 8,
  },
  actionButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#f8fafc",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  // Filter styles
  filterContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: "#10b981",
  },
  filterTab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
  },
  activeFilterTab: {
    backgroundColor: "#fff",
  },
  filterTabText: {
    fontSize: 14,
    color: "#fff",
    fontWeight: "500",
  },
  activeFilterTabText: {
    color: Colors.text.primary,
  },
  recipeMeta: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 4,
  },
  recipeCategory: {
    fontSize: 12,
    color: Colors.text.secondary,
  },
  recipeDifficulty: {
    fontSize: 12,
    color: Colors.text.secondary,
  },
  // Loading and error styles
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
  statsContainer: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: "#f8fafc",
    borderRadius: 8,
    marginBottom: 16,
  },
  statsText: {
    fontSize: 14,
    color: Colors.text.secondary,
    fontWeight: "500",
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
  // Modal styles
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
  modalContent: {
    flex: 1,
    paddingHorizontal: 16,
  },
  modalRecipeHeader: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  modalRecipeImage: {
    width: 80,
    height: 80,
    borderRadius: 12,
    marginRight: 16,
  },
  modalRecipeInfo: {
    flex: 1,
  },
  modalRecipeTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: Colors.text.primary,
    marginBottom: 4,
  },
  modalRecipeAuthor: {
    fontSize: 14,
    color: Colors.text.secondary,
    marginBottom: 8,
  },
  modalRecipeBadges: {
    flexDirection: "row",
    gap: 8,
  },
  modalFeaturedBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fef3c7",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  modalFeaturedText: {
    fontSize: 12,
    color: "#f59e0b",
    fontWeight: "600",
  },
  modalStatusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  modalStatusText: {
    fontSize: 12,
    color: "#fff",
    fontWeight: "600",
  },
  modalDetailsSection: {
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
  },
  modalSectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.text.primary,
    marginBottom: 12,
  },
  modalDetailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
  },
  modalDetailLabel: {
    fontSize: 14,
    color: Colors.text.secondary,
    fontWeight: "500",
  },
  modalDetailValue: {
    fontSize: 14,
    color: Colors.text.primary,
    flex: 1,
    textAlign: "right",
    flexDirection: "row",
    alignItems: "center",
  },
  modalStatsGrid: {
    flexDirection: "row",
    gap: 12,
  },
  modalStatCard: {
    flex: 1,
    backgroundColor: "#f8fafc",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  modalStatNumber: {
    fontSize: 20,
    fontWeight: "700",
    color: Colors.text.primary,
    marginTop: 8,
    marginBottom: 4,
  },
  modalStatLabel: {
    fontSize: 12,
    color: Colors.text.secondary,
    textAlign: "center",
  },
  modalActions: {
    flexDirection: "row",
    gap: 12,
    paddingVertical: 20,
  },
  modalActionButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  modalEditButton: {
    backgroundColor: "#3b82f6",
  },
  modalApproveButton: {
    backgroundColor: "#10b981",
  },
  modalRejectButton: {
    backgroundColor: "#ef4444",
  },
  modalDeleteButton: {
    backgroundColor: "#6b7280",
  },
  modalActionButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
  // Horizontal row layout styles
  recipeRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 12,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  recipeRowImage: {
    width: 80,
    height: 80,
    borderRadius: 12,
    marginRight: 12,
  },
  recipeRowContent: {
    flex: 1,
  },
  recipeRowHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  recipeRowTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.text.primary,
    flex: 1,
    marginRight: 8,
  },
  recipeRowBadges: {
    flexDirection: "row",
    gap: 8,
  },
  recipeRowAuthor: {
    fontSize: 13,
    color: Colors.text.secondary,
    marginBottom: 6,
  },
  recipeRowStats: {
    flexDirection: "row",
    gap: 16,
    marginBottom: 4,
  },
  recipeRowStatItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  recipeRowStatText: {
    fontSize: 12,
    color: Colors.text.secondary,
    fontWeight: "500",
  },
  recipeRowMeta: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  recipeRowCategory: {
    fontSize: 12,
    color: Colors.text.secondary,
  },
  recipeRowDifficulty: {
    fontSize: 12,
    color: Colors.text.secondary,
    fontWeight: "500",
  },
  recipeRowActions: {
    flexDirection: "row",
    gap: 8,
  },
});

