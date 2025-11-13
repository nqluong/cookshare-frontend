import { AdminRecipe } from "@/types/admin/recipe.types";
import { Ionicons } from "@expo/vector-icons";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { getImageUrl } from "../../../config/api.config";
import { Colors } from "../../../styles/colors";

interface RecipeItemProps {
  recipe: AdminRecipe;
  onView: (recipe: AdminRecipe) => void;
  onEdit: (recipeId: string) => void;
  onDelete: (recipeId: string) => void;
  onApprove?: (recipeId: string) => void;
  onReject?: (recipeId: string) => void;
  onToggleFeatured?: (recipeId: string) => void;
  onTogglePublished?: (recipeId: string) => void;
}

export default function RecipeItem({
  recipe,
  onView,
  onEdit,
  onDelete,
  onApprove,
  onReject,
  onToggleFeatured,
  onTogglePublished
}: RecipeItemProps) {
  return (
    <View style={styles.recipeItem}>
      <View style={styles.recipeMainRow}>
        <Image
          source={recipe.featuredImage ? { uri: getImageUrl(recipe.featuredImage) } : require("../../../assets/images/default-avatar.png")}
          style={styles.recipeImage}
        />

        <View style={styles.recipeContent}>
          <View style={styles.recipeMainInfo}>
            <Text style={styles.recipeName}>{recipe.title || 'Không có tiêu đề'}</Text>

            <View style={styles.statusContainer}>
              <View style={styles.statusRow}>
                {/* Badge trạng thái dựa trên status của công thức */}
                <View style={[
                  styles.statusBadge,
                  {
                    backgroundColor: recipe.status === 'APPROVED' ? '#10b981' :
                      recipe.status === 'REJECTED' ? '#ef4444' : '#f59e0b'
                  }
                ]}>
                  <Text style={styles.statusText}>
                    {recipe.status === 'APPROVED' ? 'Đã phê duyệt' :
                      recipe.status === 'REJECTED' ? 'Đã từ chối' : 'Chờ phê duyệt'}
                  </Text>
                </View>


                {/* Trạng thái nổi bật */}
                {recipe.isFeatured && (
                  <View style={[styles.statusBadge, { backgroundColor: '#f59e0b' }]}>
                    <Ionicons name="star" size={12} color="#fff" />
                    <Text style={styles.statusText}>Nổi bật</Text>
                  </View>
                )}
              </View>
            </View>

            <View style={styles.recipeStats}>
              <View style={styles.statItem}>
                <Ionicons name="heart" size={16} color="#ef4444" />
                <Text style={styles.statText}>{recipe.likeCount || 0}</Text>
              </View>
              <View style={styles.statItem}>
                <Ionicons name="time-outline" size={16} color="#ef4444" />
                <Text style={styles.statText}>{(recipe.prepTime || 0) + (recipe.cookTime || 0)}'</Text>
              </View>
            </View>

            <Text style={styles.recipeAuthor}>
              {recipe.userFullName || recipe.username || recipe.authorName || 'Không xác định'}
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.recipeActions}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => {
            onView(recipe);
          }}
        >
          <Ionicons name="eye-outline" size={18} color={Colors.text.secondary} />
        </TouchableOpacity>

        {onApprove && recipe.status === 'PENDING' && (
          <TouchableOpacity
            style={[styles.actionButton, styles.approveButton]}
            onPress={() => {
              onApprove(recipe.recipeId);
            }}
          >
            <Ionicons name="checkmark-outline" size={18} color="#10b981" />
          </TouchableOpacity>
        )}

        {onReject && recipe.status === 'PENDING' && (
          <TouchableOpacity
            style={[styles.actionButton, styles.rejectButton]}
            onPress={() => {
              onReject(recipe.recipeId);
            }}
          >
            <Ionicons name="close-outline" size={18} color="#ef4444" />
          </TouchableOpacity>
        )}

        {onToggleFeatured && (
          <TouchableOpacity
            style={[styles.actionButton, recipe.isFeatured ? styles.featuredButton : styles.actionButton]}
            onPress={() => {
              onToggleFeatured(recipe.recipeId);
            }}
          >
            <Ionicons
              name={recipe.isFeatured ? "star" : "star-outline"}
              size={18}
              color={recipe.isFeatured ? "#f59e0b" : Colors.text.secondary}
            />
          </TouchableOpacity>
        )}

        {/* {onTogglePublished && (
          <TouchableOpacity
            style={[styles.actionButton, styles.publishedButton]}
            onPress={() => {
              onTogglePublished(recipe.recipeId);
            }}
          >
            <Ionicons
              name={recipe.isPublished ? "eye-off-outline" : "eye-outline"}
              size={18}
              color="#10b981"
            />
          </TouchableOpacity>
        )} */}

        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => {
            onEdit(recipe.recipeId);
          }}
        >
          <Ionicons name="create-outline" size={18} color={Colors.text.secondary} />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => {
            onDelete(recipe.recipeId);
          }}
        >
          <Ionicons name="trash-outline" size={18} color="#ef4444" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  recipeItem: {
    flexDirection: "column",
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    minHeight: 140,
  },
  recipeImage: {
    width: 80,
    height: 80,
    borderRadius: 12,
    marginRight: 16,
  },
  recipeMainRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    flex: 1,
    marginBottom: 12,
  },
  recipeContent: {
    flex: 1,
    justifyContent: "flex-start",
  },
  recipeMainInfo: {
    flex: 1,
    justifyContent: "flex-start",
    paddingTop: 4,
    minHeight: 80,
  },
  recipeName: {
    fontSize: 18,
    fontWeight: "700",
    color: Colors.text.primary,
    marginBottom: 8,
  },
  statusContainer: {
    marginBottom: 8,
  },
  statusRow: {
    flexDirection: "row",
    gap: 8,
    flexWrap: "wrap",
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  statusText: {
    fontSize: 12,
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
    gap: 6,
    alignItems: "center",
    justifyContent: "flex-end",
    flexWrap: "wrap",
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
  },
  actionButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#f8fafc",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  approveButton: {
    backgroundColor: "#f0fdf4",
    borderColor: "#10b981",
  },
  rejectButton: {
    backgroundColor: "#fef2f2",
    borderColor: "#ef4444",
  },
  unapproveButton: {
    backgroundColor: "#fef3c7",
    borderColor: "#f59e0b",
  },
  featuredButton: {
    backgroundColor: "#fef3c7",
    borderColor: "#f59e0b",
  },
  publishedButton: {
    backgroundColor: "#f0fdf4",
    borderColor: "#10b981",
  },
});
