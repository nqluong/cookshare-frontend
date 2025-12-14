// components/admin/management/RecipeDetailContent.tsx
import { AdminRecipeDetailResponse } from "@/types/admin/recipe.types";
import { Ionicons } from "@expo/vector-icons";
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { getImageUrl } from "../../../config/api.config";
import { Colors } from "../../../styles/colors";

interface RecipeDetailContentProps {
  recipeDetail: AdminRecipeDetailResponse | null;
  onEdit: (recipeId: string) => void;
  onDelete: (recipeId: string) => void;
  onApprove?: (recipeId: string) => void;
  onReject?: (recipeId: string) => void;
  onTogglePublished?: (recipeId: string) => void;
}

export default function RecipeDetailContent({
  recipeDetail,
  onEdit,
  onDelete,
  onApprove,
  onReject,
  onTogglePublished,
}: RecipeDetailContentProps) {
  if (!recipeDetail) {
    return (
      <View style={styles.loadingContainer}>
        <Ionicons name="information-circle-outline" size={64} color={Colors.text.secondary} />
        <Text style={styles.loadingText}>Đang tải chi tiết công thức...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
      {/* Recipe Header */}
      <View style={styles.recipeHeader}>
        <Image 
          source={recipeDetail.featuredImage ? { uri: getImageUrl(recipeDetail.featuredImage) } : require('../../../assets/images/default-avatar.png')}
          style={styles.recipeImage} 
        />
        <View style={styles.recipeInfo}>
          <Text style={styles.recipeTitle}>{recipeDetail.title}</Text>
          <Text style={styles.recipeAuthor}>
            Tác giả: {recipeDetail.userFullName || recipeDetail.username || 'Không xác định'}
          </Text>
          <View style={styles.recipeBadges}>
            {/* Status badge */}
            <View style={[
              styles.statusBadge,
              { 
                backgroundColor: recipeDetail.status === 'APPROVED' ? '#10b981' : 
                                recipeDetail.status === 'REJECTED' ? '#ef4444' : '#f59e0b'
              }
            ]}>
              <Text style={styles.statusText}>
                {recipeDetail.status === 'APPROVED' ? 'Đã phê duyệt' : 
                 recipeDetail.status === 'REJECTED' ? 'Đã từ chối' : 'Chờ phê duyệt'}
              </Text>
            </View>
            
            {/* Published status */}
            <View style={[
              styles.statusBadge,
              { backgroundColor: recipeDetail.isPublished ? '#10b981' : '#6b7280' }
            ]}>
              <Text style={styles.statusText}>
                {recipeDetail.isPublished ? 'Đã xuất bản' : 'Chưa xuất bản'}
              </Text>
            </View>
            
          </View>
        </View>
      </View>

      {/* Recipe Details */}
      <View style={styles.detailsSection}>
        <Text style={styles.sectionTitle}>Thông tin cơ bản</Text>
        
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Mô tả:</Text>
          <Text style={styles.detailValue}>{recipeDetail.description || 'Không có mô tả'}</Text>
        </View>
        
        {recipeDetail.prepTime && recipeDetail.prepTime > 0 && (
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Thời gian chuẩn bị:</Text>
            <Text style={styles.detailValue}>{recipeDetail.prepTime} phút</Text>
          </View>
        )}
        
        {recipeDetail.cookTime && recipeDetail.cookTime > 0 && (
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Thời gian nấu:</Text>
            <Text style={styles.detailValue}>{recipeDetail.cookTime} phút</Text>
          </View>
        )}
        
        {recipeDetail.servings && recipeDetail.servings > 0 && (
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Số khẩu phần:</Text>
            <Text style={styles.detailValue}>{recipeDetail.servings} người</Text>
          </View>
        )}
        
        {recipeDetail.difficulty && (
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Độ khó:</Text>
            <Text style={styles.detailValue}>{recipeDetail.difficulty}</Text>
          </View>
        )}
      </View>

      {/* Ingredients */}
      {recipeDetail.ingredients && recipeDetail.ingredients.length > 0 && (
        <View style={styles.detailsSection}>
          <Text style={styles.sectionTitle}>Nguyên liệu ({recipeDetail.ingredients.length})</Text>
          {recipeDetail.ingredients.map((ingredient, index) => (
            <View key={ingredient.ingredientId || index} style={styles.ingredientItem}>
              <View style={styles.ingredientInfo}>
                <Text style={styles.ingredientName}>{ingredient.name}</Text>
                <Text style={styles.ingredientQuantity}>
                  {ingredient.quantity} {ingredient.unit}
                </Text>
              </View>
              {ingredient.notes && (
                <Text style={styles.ingredientNotes}>{ingredient.notes}</Text>
              )}
            </View>
          ))}
        </View>
      )}

      {/* Steps */}
      {recipeDetail.steps && recipeDetail.steps.length > 0 && (
        <View style={styles.detailsSection}>
          <Text style={styles.sectionTitle}>Các bước thực hiện ({recipeDetail.steps.length})</Text>
          {recipeDetail.steps.map((step, index) => (
            <View key={step.stepNumber || index} style={styles.stepItem}>
              <View style={styles.stepHeader}>
                <Text style={styles.stepNumber}>Bước {step.stepNumber}</Text>
                {step.estimatedTime > 0 && (
                  <Text style={styles.stepTime}>{step.estimatedTime} phút</Text>
                )}
              </View>
              <Text style={styles.stepInstruction}>{step.instruction}</Text>
              {step.tips && (
                <View style={styles.stepTips}>
                  <Ionicons name="bulb-outline" size={16} color="#f59e0b" />
                  <Text style={styles.stepTipsText}>{step.tips}</Text>
                </View>
              )}
              {step.imageUrl && (
                <Image 
                  source={{ uri: getImageUrl(step.imageUrl) }} 
                  style={styles.stepImage}
                />
              )}
            </View>
          ))}
        </View>
      )}

      {/* Tags and Categories */}
      {((recipeDetail.tags && recipeDetail.tags.length > 0) || (recipeDetail.categories && recipeDetail.categories.length > 0)) && (
        <View style={styles.detailsSection}>
          <Text style={styles.sectionTitle}>Phân loại</Text>
          
          {recipeDetail.categories && recipeDetail.categories.length > 0 && (
            <View style={styles.tagSection}>
              <Text style={styles.tagSectionTitle}>Danh mục:</Text>
              <View style={styles.tagContainer}>
                {recipeDetail.categories.map((category, index) => (
                  <View key={category.categoryId || index} style={styles.tag}>
                    <Text style={styles.tagText}>{category.name}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}
          
          {recipeDetail.tags && recipeDetail.tags.length > 0 && (
            <View style={styles.tagSection}>
              <Text style={styles.tagSectionTitle}>Thẻ:</Text>
              <View style={styles.tagContainer}>
                {recipeDetail.tags.map((tag, index) => (
                  <View key={tag.tagId || index} style={styles.tag}>
                    <Text style={styles.tagText}>{tag.name}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}
        </View>
      )}

      {/* User Information */}
      <View style={styles.detailsSection}>
        <Text style={styles.sectionTitle}>Thông tin tác giả</Text>
        
        <View style={styles.userInfo}>
          {recipeDetail.userAvatarUrl && (
            <Image 
              source={{ uri: getImageUrl(recipeDetail.userAvatarUrl) }} 
              style={styles.userAvatar}
            />
          )}
          <View style={styles.userDetails}>
            <Text style={styles.userName}>{recipeDetail.userFullName}</Text>
            <Text style={styles.userEmail}>{recipeDetail.userEmail}</Text>
            <Text style={styles.userUsername}>@{recipeDetail.username}</Text>
          </View>
        </View>
      </View>

      {/* Statistics */}
      <View style={styles.detailsSection}>
        <Text style={styles.sectionTitle}>Thống kê</Text>
        
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Ionicons name="heart-outline" size={24} color="#ef4444" />
            <Text style={styles.statNumber}>{recipeDetail.likeCount || 0}</Text>
            <Text style={styles.statLabel}>Lượt thích</Text>
          </View>
          
          <View style={styles.statCard}>
            <Ionicons name="eye-outline" size={24} color="#6366f1" />
            <Text style={styles.statNumber}>{recipeDetail.viewCount || 0}</Text>
            <Text style={styles.statLabel}>Lượt xem</Text>
          </View>
        </View>
      </View>

      {/* Activity Info */}
      {(recipeDetail.createdAt || recipeDetail.updatedAt) && (
        <View style={styles.detailsSection}>
          <Text style={styles.sectionTitle}>Hoạt động</Text>
          
          {recipeDetail.createdAt && (
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Tạo lúc:</Text>
              <Text style={styles.detailValue}>
                {new Date(recipeDetail.createdAt).toLocaleDateString('vi-VN', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </Text>
            </View>
          )}
          
          {recipeDetail.updatedAt && (
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Cập nhật lúc:</Text>
              <Text style={styles.detailValue}>
                {new Date(recipeDetail.updatedAt).toLocaleDateString('vi-VN', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </Text>
            </View>
          )}
        </View>
      )}

      {/* Action Buttons */}
      <View style={styles.actions}>
        {/* Nút phê duyệt - hiện cho PENDING hoặc REJECTED */}
        {onApprove && (recipeDetail.status === 'PENDING' || recipeDetail.status === 'REJECTED') && (
          <TouchableOpacity 
            style={[styles.actionButton, styles.approveButton]}
            onPress={() => onApprove(recipeDetail.recipeId)}
          >
            <Ionicons name="checkmark-outline" size={16} color="#10b981" />
            <Text style={[styles.actionButtonText, { color: "#10b981" }]}>Phê duyệt</Text>
          </TouchableOpacity>
        )}
        
        {/* Nút từ chối - hiện cho PENDING hoặc APPROVED */}
        {onReject && (recipeDetail.status === 'PENDING' || recipeDetail.status === 'APPROVED') && (
          <TouchableOpacity 
            style={[styles.actionButton, styles.rejectButton]}
            onPress={() => onReject(recipeDetail.recipeId)}
          >
            <Ionicons name="close-outline" size={16} color="#ef4444" />
            <Text style={[styles.actionButtonText, { color: "#ef4444" }]}>Từ chối</Text>
          </TouchableOpacity>
        )}
      
        
        {/* Nút xuất bản/ẩn - chỉ hiện cho APPROVED */}
        {onTogglePublished && recipeDetail.status === 'APPROVED' && (
          <TouchableOpacity 
            style={[styles.actionButton, recipeDetail.isPublished ? styles.toggleButton : styles.publishedButton]}
            onPress={() => onTogglePublished(recipeDetail.recipeId)}
          >
            <Ionicons 
              name={recipeDetail.isPublished ? "eye-off-outline" : "eye-outline"} 
              size={16} 
              color={recipeDetail.isPublished ? "#6b7280" : "#10b981"} 
            />
            <Text style={[styles.actionButtonText, { color: recipeDetail.isPublished ? "#6b7280" : "#10b981" }]}>
              {recipeDetail.isPublished ? 'Ẩn' : 'Xuất bản'}
            </Text>
          </TouchableOpacity>
        )}
        
        <TouchableOpacity 
          style={[styles.actionButton, styles.editButton]}
          onPress={() => onEdit(recipeDetail.recipeId)}
        >
          <Ionicons name="create-outline" size={16} color="#3b82f6" />
          <Text style={[styles.actionButtonText, { color: "#3b82f6" }]}>Chỉnh sửa</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.actionButton, styles.deleteButton]}
          onPress={() => onDelete(recipeDetail.recipeId)}
        >
          <Ionicons name="trash-outline" size={16} color="#ef4444" />
          <Text style={[styles.actionButtonText, { color: "#ef4444" }]}>Xóa</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 40,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: Colors.text.secondary,
    textAlign: "center",
  },
  recipeHeader: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  recipeImage: {
    width: 80,
    height: 80,
    borderRadius: 12,
    marginRight: 16,
  },
  recipeInfo: {
    flex: 1,
  },
  recipeTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: Colors.text.primary,
    marginBottom: 4,
  },
  recipeAuthor: {
    fontSize: 14,
    color: Colors.text.secondary,
    marginBottom: 8,
  },
  recipeBadges: {
    flexDirection: "row",
    gap: 8,
    flexWrap: "wrap",
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
    fontSize: 12,
    color: "#f59e0b",
    fontWeight: "600",
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    color: "#fff",
    fontWeight: "600",
  },
  detailsSection: {
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.text.primary,
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    paddingVertical: 8,
  },
  detailLabel: {
    fontSize: 14,
    color: Colors.text.secondary,
    fontWeight: "500",
    marginRight: 12,
  },
  detailValue: {
    fontSize: 14,
    color: Colors.text.primary,
    flex: 1,
    textAlign: "right",
  },
  statsGrid: {
    flexDirection: "row",
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: "#f8fafc",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  statNumber: {
    fontSize: 20,
    fontWeight: "700",
    color: Colors.text.primary,
    marginTop: 8,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: Colors.text.secondary,
    textAlign: "center",
  },
  actions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    paddingVertical: 20,
  },
  actionButton: {
    flex: 1,
    minWidth: "45%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  editButton: {
    backgroundColor: "#f0f9ff",
    borderWidth: 1,
    borderColor: "#3b82f6",
  },
  deleteButton: {
    backgroundColor: "#fef2f2",
    borderWidth: 1,
    borderColor: "#ef4444",
  },
  approveButton: {
    backgroundColor: "#f0fdf4",
    borderWidth: 1,
    borderColor: "#10b981",
  },
  rejectButton: {
    backgroundColor: "#fef2f2",
    borderWidth: 1,
    borderColor: "#ef4444",
  },
  featuredButton: {
    backgroundColor: "#fef3c7",
    borderWidth: 1,
    borderColor: "#f59e0b",
  },
  publishedButton: {
    backgroundColor: "#f0fdf4",
    borderWidth: 1,
    borderColor: "#10b981",
  },
  toggleButton: {
    backgroundColor: "#f8fafc",
    borderWidth: 1,
    borderColor: "#6b7280",
  },
  actionButtonText: {
    fontSize: 12,
    fontWeight: "600",
  },
  // Ingredients
  ingredientItem: {
    backgroundColor: "#f8fafc",
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    borderLeftWidth: 3,
    borderLeftColor: "#3b82f6",
  },
  ingredientInfo: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  ingredientName: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.text.primary,
    flex: 1,
  },
  ingredientQuantity: {
    fontSize: 14,
    color: Colors.text.secondary,
    fontWeight: "500",
  },
  ingredientNotes: {
    fontSize: 12,
    color: Colors.text.secondary,
    fontStyle: "italic",
  },
  // Steps
  stepItem: {
    backgroundColor: "#f8fafc",
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  stepHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  stepNumber: {
    fontSize: 16,
    fontWeight: "700",
    color: "#3b82f6",
  },
  stepTime: {
    fontSize: 12,
    color: Colors.text.secondary,
    backgroundColor: "#e0f2fe",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  stepInstruction: {
    fontSize: 14,
    color: Colors.text.primary,
    lineHeight: 20,
    marginBottom: 8,
  },
  stepTips: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fef3c7",
    padding: 8,
    borderRadius: 8,
    marginBottom: 8,
    gap: 6,
  },
  stepTipsText: {
    fontSize: 12,
    color: "#f59e0b",
    flex: 1,
    fontWeight: "500",
  },
  stepImage: {
    width: "100%",
    height: 200,
    borderRadius: 8,
    marginTop: 8,
  },
  // Tags
  tagSection: {
    marginBottom: 16,
  },
  tagSectionTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.text.primary,
    marginBottom: 8,
  },
  tagContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  tag: {
    backgroundColor: "#e0f2fe",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#3b82f6",
  },
  tagText: {
    fontSize: 12,
    color: "#3b82f6",
    fontWeight: "500",
  },
  // User info
  userInfo: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f8fafc",
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  userAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 12,
  },
  userDetails: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.text.primary,
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: Colors.text.secondary,
    marginBottom: 2,
  },
  userUsername: {
    fontSize: 12,
    color: "#3b82f6",
    fontWeight: "500",
  },
});