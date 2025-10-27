import { Ionicons } from "@expo/vector-icons";
import { Image, Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { getImageUrl } from "../../config/api.config";
import { AdminRecipe, AdminRecipeDetailResponse } from "../../services/adminRecipeService";
import { Colors } from "../../styles/colors";

interface RecipeDetailModalProps {
  visible: boolean;
  recipe: AdminRecipe | null;
  recipeDetail?: AdminRecipeDetailResponse | null;
  onClose: () => void;
  onEdit: (recipeId: string) => void;
  onDelete: (recipe: AdminRecipe) => void;
  onApprove?: (recipe: AdminRecipe) => void;
  onReject?: (recipe: AdminRecipe) => void;
  onToggleFeatured?: (recipe: AdminRecipe) => void;
  onTogglePublished?: (recipe: AdminRecipe) => void;
}

export default function RecipeDetailModal({
  visible,
  recipe,
  recipeDetail,
  onClose,
  onEdit,
  onDelete,
  onApprove,
  onReject,
  onToggleFeatured,
  onTogglePublished,
}: RecipeDetailModalProps) {
  if (!recipe) return null;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.modalContainer}>
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

        <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
          {/* Recipe Header */}
          <View style={styles.modalRecipeHeader}>
            <Image 
              source={recipe.featuredImage ? { uri: getImageUrl(recipe.featuredImage) } : require("../../assets/images/default-avatar.png")} 
              style={styles.modalRecipeImage} 
            />
            <View style={styles.modalRecipeInfo}>
              <Text style={styles.modalRecipeTitle}>{recipe.title}</Text>
              <Text style={styles.modalRecipeAuthor}>
                Tác giả: {recipe.userFullName || recipe.username || 'Không xác định'}
              </Text>
              <View style={styles.modalRecipeBadges}>
                {/* Status badge based on recipe status */}
                <View style={[
                  styles.modalStatusBadge,
                  { 
                    backgroundColor: recipe.status === 'APPROVED' ? '#10b981' : 
                                    recipe.status === 'REJECTED' ? '#ef4444' : '#f59e0b'
                  }
                ]}>
                  <Text style={styles.modalStatusText}>
                    {recipe.status === 'APPROVED' ? 'Đã phê duyệt' : 
                     recipe.status === 'REJECTED' ? 'Đã từ chối' : 'Chờ phê duyệt'}
                  </Text>
                </View>
                
                {/* Published status */}
                <View style={[
                  styles.modalStatusBadge,
                  { backgroundColor: recipe.isPublished ? '#10b981' : '#6b7280' }
                ]}>
                  <Text style={styles.modalStatusText}>
                    {recipe.isPublished ? 'Đã xuất bản' : 'Chưa xuất bản'}
                  </Text>
                </View>
                
                {/* Featured status */}
                {recipe.isFeatured && (
                  <View style={styles.modalFeaturedBadge}>
                    <Ionicons name="star" size={14} color="#f59e0b" />
                    <Text style={styles.modalFeaturedText}>Nổi bật</Text>
                  </View>
                )}
              </View>
            </View>
          </View>

          {/* Recipe Details */}
          <View style={styles.modalDetailsSection}>
            <Text style={styles.modalSectionTitle}>Thông tin cơ bản</Text>
            
            <View style={styles.modalDetailRow}>
              <Text style={styles.modalDetailLabel}>Mô tả:</Text>
              <Text style={styles.modalDetailValue}>{recipe.description || 'Không có mô tả'}</Text>
            </View>
            
            {recipe.prepTime && (
              <View style={styles.modalDetailRow}>
                <Text style={styles.modalDetailLabel}>Thời gian chuẩn bị:</Text>
                <Text style={styles.modalDetailValue}>{recipe.prepTime} phút</Text>
              </View>
            )}
            
            {recipe.cookTime && (
              <View style={styles.modalDetailRow}>
                <Text style={styles.modalDetailLabel}>Thời gian nấu:</Text>
                <Text style={styles.modalDetailValue}>{recipe.cookTime} phút</Text>
              </View>
            )}
            
            {recipe.servings && (
              <View style={styles.modalDetailRow}>
                <Text style={styles.modalDetailLabel}>Số khẩu phần:</Text>
                <Text style={styles.modalDetailValue}>{recipe.servings} người</Text>
              </View>
            )}
            
            {recipe.difficulty && (
              <View style={styles.modalDetailRow}>
                <Text style={styles.modalDetailLabel}>Độ khó:</Text>
                <Text style={styles.modalDetailValue}>{recipe.difficulty}</Text>
              </View>
            )}
          </View>

          {/* Ingredients */}
          {recipeDetail?.ingredients && recipeDetail.ingredients.length > 0 ? (
            <View style={styles.modalDetailsSection}>
              <Text style={styles.modalSectionTitle}>Nguyên liệu</Text>
              {recipeDetail.ingredients.map((ingredient, index) => (
                <View key={ingredient.ingredientId || index} style={styles.modalIngredientItem}>
                  <View style={styles.modalIngredientInfo}>
                    <Text style={styles.modalIngredientName}>{ingredient.name}</Text>
                    <Text style={styles.modalIngredientQuantity}>
                      {ingredient.quantity} {ingredient.unit}
                    </Text>
                  </View>
                  {ingredient.notes && (
                    <Text style={styles.modalIngredientNotes}>{ingredient.notes}</Text>
                  )}
                </View>
              ))}
            </View>
          ) : !recipeDetail ? (
            <View style={styles.modalDetailsSection}>
              <View style={styles.modalLoadingContainer}>
                <Ionicons name="information-circle-outline" size={24} color={Colors.text.secondary} />
                <Text style={styles.modalLoadingText}>Đang tải chi tiết công thức...</Text>
              </View>
            </View>
          ) : null}

          {/* Steps */}
          {recipeDetail?.steps && recipeDetail.steps.length > 0 && (
            <View style={styles.modalDetailsSection}>
              <Text style={styles.modalSectionTitle}>Các bước thực hiện</Text>
              {recipeDetail.steps.map((step, index) => (
                <View key={step.stepNumber || index} style={styles.modalStepItem}>
                  <View style={styles.modalStepHeader}>
                    <Text style={styles.modalStepNumber}>Bước {step.stepNumber}</Text>
                    {step.estimatedTime > 0 && (
                      <Text style={styles.modalStepTime}>{step.estimatedTime} phút</Text>
                    )}
                  </View>
                  <Text style={styles.modalStepInstruction}>{step.instruction}</Text>
                  {step.tips && (
                    <View style={styles.modalStepTips}>
                      <Ionicons name="bulb-outline" size={16} color="#f59e0b" />
                      <Text style={styles.modalStepTipsText}>{step.tips}</Text>
                    </View>
                  )}
                  {step.imageUrl && (
                    <Image 
                      source={{ uri: getImageUrl(step.imageUrl) }} 
                      style={styles.modalStepImage}
                    />
                  )}
                </View>
              ))}
            </View>
          )}

          {/* Tags and Categories */}
          {recipeDetail && ((recipeDetail.tags && recipeDetail.tags.length > 0) || (recipeDetail.categories && recipeDetail.categories.length > 0)) && (
            <View style={styles.modalDetailsSection}>
              <Text style={styles.modalSectionTitle}>Phân loại</Text>
              
              {recipeDetail.categories && recipeDetail.categories.length > 0 && (
                <View style={styles.modalTagSection}>
                  <Text style={styles.modalTagSectionTitle}>Danh mục:</Text>
                  <View style={styles.modalTagContainer}>
                    {recipeDetail.categories.map((category, index) => (
                      <View key={category.categoryId || index} style={styles.modalTag}>
                        <Text style={styles.modalTagText}>{category.name}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              )}
              
              {recipeDetail.tags && recipeDetail.tags.length > 0 && (
                <View style={styles.modalTagSection}>
                  <Text style={styles.modalTagSectionTitle}>Thẻ:</Text>
                  <View style={styles.modalTagContainer}>
                    {recipeDetail.tags.map((tag, index) => (
                      <View key={tag.tagId || index} style={styles.modalTag}>
                        <Text style={styles.modalTagText}>{tag.name}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              )}
            </View>
          )}

          {/* User Information */}
          {recipeDetail && (
            <View style={styles.modalDetailsSection}>
              <Text style={styles.modalSectionTitle}>Thông tin tác giả</Text>
              
              <View style={styles.modalUserInfo}>
                {recipeDetail.userAvatarUrl && (
                  <Image 
                    source={{ uri: getImageUrl(recipeDetail.userAvatarUrl) }} 
                    style={styles.modalUserAvatar}
                  />
                )}
                <View style={styles.modalUserDetails}>
                  <Text style={styles.modalUserName}>{recipeDetail.userFullName}</Text>
                  <Text style={styles.modalUserEmail}>{recipeDetail.userEmail}</Text>
                  <Text style={styles.modalUserUsername}>@{recipeDetail.username}</Text>
                </View>
              </View>
            </View>
          )}

          {/* Statistics */}
          <View style={styles.modalDetailsSection}>
            <Text style={styles.modalSectionTitle}>Thống kê</Text>
            
            <View style={styles.modalStatsGrid}>
              <View style={styles.modalStatCard}>
                <Ionicons name="heart-outline" size={24} color="#ef4444" />
                <Text style={styles.modalStatNumber}>{recipe.likeCount}</Text>
                <Text style={styles.modalStatLabel}>Lượt thích</Text>
              </View>
              
              <View style={styles.modalStatCard}>
                <Ionicons name="eye-outline" size={24} color="#6366f1" />
                <Text style={styles.modalStatNumber}>{recipe.viewCount}</Text>
                <Text style={styles.modalStatLabel}>Lượt xem</Text>
              </View>
            </View>
          </View>

          {/* Activity Info */}
          <View style={styles.modalDetailsSection}>
            <Text style={styles.modalSectionTitle}>Hoạt động</Text>
            
            <View style={styles.modalDetailRow}>
              <Text style={styles.modalDetailLabel}>Tạo lúc:</Text>
              <Text style={styles.modalDetailValue}>
                {new Date(recipe.createdAt).toLocaleDateString('vi-VN', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </Text>
            </View>
            
            <View style={styles.modalDetailRow}>
              <Text style={styles.modalDetailLabel}>Cập nhật lúc:</Text>
              <Text style={styles.modalDetailValue}>
                {new Date(recipe.updatedAt).toLocaleDateString('vi-VN', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </Text>
            </View>
          </View>

          {/* Action Buttons */}
          <View style={styles.modalActions}>
            {/* Nút phê duyệt/từ chối - chỉ hiện khi status là PENDING */}
            {onApprove && recipe.status === 'PENDING' && (
              <TouchableOpacity 
                style={[styles.modalActionButton, styles.modalApproveButton]}
                onPress={() => {
                  onClose();
                  onApprove(recipe);
                }}
              >
                <Ionicons name="checkmark-outline" size={16} color="#10b981" />
                <Text style={[styles.modalActionButtonText, { color: "#10b981" }]}>Phê duyệt</Text>
              </TouchableOpacity>
            )}
            
            {onReject && recipe.status === 'PENDING' && (
              <TouchableOpacity 
                style={[styles.modalActionButton, styles.modalRejectButton]}
                onPress={() => {
                  onClose();
                  onReject(recipe);
                }}
              >
                <Ionicons name="close-outline" size={16} color="#ef4444" />
                <Text style={[styles.modalActionButtonText, { color: "#ef4444" }]}>Từ chối</Text>
              </TouchableOpacity>
            )}
            
            {/* Nút nổi bật - luôn hiện nếu có callback */}
            {onToggleFeatured && (
              <TouchableOpacity 
                style={[styles.modalActionButton, recipe.isFeatured ? styles.modalFeaturedButton : styles.modalToggleButton]}
                onPress={() => {
                  onClose();
                  onToggleFeatured(recipe);
                }}
              >
                <Ionicons 
                  name={recipe.isFeatured ? "star" : "star-outline"} 
                  size={16} 
                  color="#f59e0b" 
                />
                <Text style={[styles.modalActionButtonText, { color: "#f59e0b" }]}>
                  {recipe.isFeatured ? 'Bỏ nổi bật' : 'Đặt nổi bật'}
                </Text>
              </TouchableOpacity>
            )}
            
            {/* Nút xuất bản - chỉ hiện khi chưa xuất bản */}
            {onTogglePublished && !recipe.isPublished && (
              <TouchableOpacity 
                style={[styles.modalActionButton, styles.modalPublishedButton]}
                onPress={() => {
                  onClose();
                  onTogglePublished(recipe);
                }}
              >
                <Ionicons 
                  name="eye-outline" 
                  size={16} 
                  color="#10b981" 
                />
                <Text style={[styles.modalActionButtonText, { color: "#10b981" }]}>
                  Xuất bản
                </Text>
              </TouchableOpacity>
            )}
            
            <TouchableOpacity 
              style={[styles.modalActionButton, styles.modalEditButton]}
              onPress={() => {
                onClose();
                onEdit(recipe.recipeId);
              }}
            >
              <Ionicons name="create-outline" size={16} color="#3b82f6" />
              <Text style={[styles.modalActionButtonText, { color: "#3b82f6" }]}>Chỉnh sửa</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.modalActionButton, styles.modalDeleteButton]}
              onPress={() => {
                onClose();
                onDelete(recipe);
              }}
            >
              <Ionicons name="trash-outline" size={16} color="#ef4444" />
              <Text style={[styles.modalActionButtonText, { color: "#ef4444" }]}>Xóa</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
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
    backgroundColor: "#f0f9ff",
    borderWidth: 1,
    borderColor: "#3b82f6",
  },
  modalDeleteButton: {
    backgroundColor: "#fef2f2",
    borderWidth: 1,
    borderColor: "#ef4444",
  },
  modalApproveButton: {
    backgroundColor: "#f0fdf4",
    borderWidth: 1,
    borderColor: "#10b981",
  },
  modalRejectButton: {
    backgroundColor: "#fef2f2",
    borderWidth: 1,
    borderColor: "#ef4444",
  },
  modalUnapproveButton: {
    backgroundColor: "#fef3c7",
    borderWidth: 1,
    borderColor: "#f59e0b",
  },
  modalFeaturedButton: {
    backgroundColor: "#fef3c7",
    borderWidth: 1,
    borderColor: "#f59e0b",
  },
  modalPublishedButton: {
    backgroundColor: "#f0fdf4",
    borderWidth: 1,
    borderColor: "#10b981",
  },
  modalToggleButton: {
    backgroundColor: "#f8fafc",
    borderWidth: 1,
    borderColor: "#6b7280",
  },
  modalActionButtonText: {
    fontSize: 12,
    fontWeight: "600",
  },
  // Styles cho ingredients
  modalIngredientItem: {
    backgroundColor: "#f8fafc",
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    borderLeftWidth: 3,
    borderLeftColor: "#3b82f6",
  },
  modalIngredientInfo: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  modalIngredientName: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.text.primary,
    flex: 1,
  },
  modalIngredientQuantity: {
    fontSize: 14,
    color: Colors.text.secondary,
    fontWeight: "500",
  },
  modalIngredientNotes: {
    fontSize: 12,
    color: Colors.text.secondary,
    fontStyle: "italic",
  },
  // Styles cho steps
  modalStepItem: {
    backgroundColor: "#f8fafc",
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  modalStepHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  modalStepNumber: {
    fontSize: 16,
    fontWeight: "700",
    color: "#3b82f6",
  },
  modalStepTime: {
    fontSize: 12,
    color: Colors.text.secondary,
    backgroundColor: "#e0f2fe",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  modalStepInstruction: {
    fontSize: 14,
    color: Colors.text.primary,
    lineHeight: 20,
    marginBottom: 8,
  },
  modalStepTips: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fef3c7",
    padding: 8,
    borderRadius: 8,
    marginBottom: 8,
    gap: 6,
  },
  modalStepTipsText: {
    fontSize: 12,
    color: "#f59e0b",
    flex: 1,
    fontWeight: "500",
  },
  modalStepImage: {
    width: "100%",
    height: 200,
    borderRadius: 8,
    marginTop: 8,
  },
  // Styles cho tags và categories
  modalTagSection: {
    marginBottom: 16,
  },
  modalTagSectionTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.text.primary,
    marginBottom: 8,
  },
  modalTagContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  modalTag: {
    backgroundColor: "#e0f2fe",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#3b82f6",
  },
  modalTagText: {
    fontSize: 12,
    color: "#3b82f6",
    fontWeight: "500",
  },
  // Styles cho user info
  modalUserInfo: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f8fafc",
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  modalUserAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 12,
  },
  modalUserDetails: {
    flex: 1,
  },
  modalUserName: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.text.primary,
    marginBottom: 4,
  },
  modalUserEmail: {
    fontSize: 14,
    color: Colors.text.secondary,
    marginBottom: 2,
  },
  modalUserUsername: {
    fontSize: 12,
    color: "#3b82f6",
    fontWeight: "500",
  },
  // Styles cho loading state
  modalLoadingContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
    backgroundColor: "#f8fafc",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    gap: 8,
  },
  modalLoadingText: {
    fontSize: 14,
    color: Colors.text.secondary,
    fontWeight: "500",
  },
});
