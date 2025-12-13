import { commentService } from "@/services/commentService";
import { ratingService } from "@/services/ratingService";
import { useRecipeLikeContext } from "@/context/RecipeLikeContext";
import { CommentResponse } from "@/types/comment";
import { useLocalSearchParams } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import {
  Image,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Toast from "react-native-toast-message";
import { MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';
import { getImageUrl } from "../../config/api.config";
import styles from "../../styles/RecipeDetailView.styles";
import ReportModal from "../componentsModal/ReportModal";
import CommentModal from "./CommentSection";

type Ingredient = {
  ingredientId?: string;
  name: string;
  slug?: string;
  description?: string;
  quantity?: number | string;
  unit?: string;
  notes?: string;
  orderIndex?: number;
};

type Step = {
  stepId: string;
  stepNumber: number;
  instruction: string;
  imageUrl?: string;
};

type Tag = {
  name: string;
  color?: string;
};

type Recipe = {
  id: string;
  title: string;
  description: string;
  image: string;
  author: string;
  prepTime: number;
  cookTime: number;
  servings?: number;
  difficulty?: "easy" | "medium" | "hard";
  category?: string[];
  tags?: (string | Tag)[];
  ingredients: Ingredient[];
  steps: Step[];
  video?: string;
  likes?: number;
  views?: number;
  averageRating?: number;
  ratingCount?: number;
};

type AuthorInfo = {
  userId: string;
  username: string;
  fullName: string;
  avatarUrl?: string;
};

interface CommentWithExpandedReplies extends CommentResponse {
  expandedRepliesCount?: number;
}

type Props = {
  recipe: Recipe;
  authorInfo?: AuthorInfo;
  currentUserId: string;
  currentUserAvatar?: string;
  router?: any;
  onBack: () => void;
  onSearch: () => void;
  sourceRoute?: string;
};

type RecipeDetailParams = {
  openComments?: string;
  focusCommentId?: string;
};

export default function RecipeDetailView({
  recipe,
  authorInfo,
  currentUserId,
  currentUserAvatar,
  router,
  sourceRoute,
}: Props) {
  const params = useLocalSearchParams<RecipeDetailParams>();
  const [commentModalVisible, setCommentModalVisible] = useState(false);
  const [reportModalVisible, setReportModalVisible] = useState(false);
  const [comments, setComments] = useState<CommentWithExpandedReplies[]>([]);
  const [focusCommentId, setFocusCommentId] = useState<string | null>(null);

  // LIKE STATE
  const { likedRecipes, checkLikedStatus, toggleLike: toggleLikeService } = useRecipeLikeContext();
  const [localLikeCount, setLocalLikeCount] = useState(recipe.likes ?? 0);
  const isLiked = likedRecipes.has(recipe.id);

  // RATING STATE
  const [userRating, setUserRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [hasRated, setHasRated] = useState(false);
  const [isLoadingRating, setIsLoadingRating] = useState(false);
  const [currentAvgRating, setCurrentAvgRating] = useState(recipe.averageRating || 0);
  const [currentTotalRatings, setCurrentTotalRatings] = useState(recipe.ratingCount || 0);

  // Debug
  useEffect(() => {
    console.log("RecipeDetailView - authorInfo:", authorInfo);
    console.log("RecipeDetailView - recipe.image:", recipe.image);
  }, [authorInfo, recipe.image]);

  // Update local like count when recipe.likes changes
  useEffect(() => {
    setLocalLikeCount(recipe.likes ?? 0);
  }, [recipe.likes]);

  const totalComments = useMemo(
    () => countAllCommentsRecursive(comments),
    [comments]
  );

  // Load comments
  useEffect(() => {
    if (!recipe?.id) return;

    const loadCommentCount = async () => {
      try {
        const data = await commentService.getCommentsByRecipe(recipe.id);
        const normalized = normalizeCommentsRecursive(data);
        setComments(normalized);
      } catch (error) {
        console.log("Lỗi tải số bình luận:", error); // ← ĐÃ THAY console.error → console.log
      }
    };

    loadCommentCount();
  }, [recipe?.id]);

  // Kiểm tra user đã rating chưa
  useEffect(() => {
    if (!recipe?.id || !currentUserId) return;

    const loadUserRating = async () => {
      const myRating = await ratingService.getMyRating(recipe.id);

      if (myRating !== null && myRating >= 1 && myRating <= 5) {
        setUserRating(myRating);
        setHasRated(true);
      } else {
        setUserRating(0);
        setHasRated(false);
      }
    };

    loadUserRating();
  }, [recipe?.id, currentUserId]);

  // Mở modal bình luận nếu có param
  useEffect(() => {
    if (params.openComments === "true") {
      setCommentModalVisible(true);
      if (params.focusCommentId) {
        setFocusCommentId(params.focusCommentId as string);
      }
    }
  }, [params.openComments, params.focusCommentId]);

  const getDifficultyLabel = (difficulty?: string) => {
    switch (difficulty?.toLowerCase()) {
      case "easy":
        return { text: "Dễ", color: "#28a745" };
      case "medium":
        return { text: "Trung bình", color: "#ffc107" };
      case "hard":
        return { text: "Khó", color: "#dc3545" };
      default:
        return { text: "", color: "#000" };
    }
  };

  const difficulty = getDifficultyLabel(recipe.difficulty);

  const getAvatarSource = () => {
    const avatarUrl = authorInfo?.avatarUrl?.trim();
    if (avatarUrl && avatarUrl !== "") {
      return { uri: getImageUrl(avatarUrl) };
    }
    return require("../../assets/images/default-avatar.png");
  };

  // XỬ LÝ LIKE
  const handleToggleLike = async () => {
    if (!currentUserId) {
      Toast.show({
        type: "error",
        text1: "Vui lòng đăng nhập để thích công thức",
        position: "bottom",
      });
      return;
    }

    await toggleLikeService(
      recipe.id,
      (delta) => {
        setLocalLikeCount(prev => Math.max(0, prev + delta));
      }
    );
  };

  // XỬ LÝ GỬI ĐÁNH GIÁ
  const handleRatingPress = async (rating: number) => {
    if (isLoadingRating || !currentUserId) return;

    setIsLoadingRating(true);
    try {
      const response = await ratingService.submitRating(recipe.id, rating);

      setUserRating(rating);
      setHasRated(true);

      // CẬP NHẬT AVG VÀ TOTAL TỪ RESPONSE
      if (response.averageRating !== undefined) {
        setCurrentAvgRating(response.averageRating);
      }
      if (response.ratingCount !== undefined) {
        setCurrentTotalRatings(response.ratingCount);
      }
      router.setParams({ refetchTrigger: Date.now().toString() });

      Toast.show({
        type: "success",
        text1: hasRated ? "Đã cập nhật đánh giá!" : "Cảm ơn bạn!",
        text2: hasRated
          ? `Bạn đã đổi thành ${rating} sao`
          : `Bạn đã đánh giá ${rating} sao`,
        position: "bottom",
      });
    } catch (error: any) {
      console.log("Lỗi gửi đánh giá:", error); // ← ĐÃ THAY console.error → console.log
      Toast.show({
        type: "error",
        text1: "Lỗi",
        text2: error.response?.data?.message || "Không thể gửi đánh giá",
      });
    } finally {
      setIsLoadingRating(false);
    }
  };

  // Render sao trung bình
  const renderStarRating = (rating: number, size: number = 20) => {
    const fullStars = Math.floor(rating);
    const hasHalf = rating % 1 >= 0.5;
    const emptyStars = 5 - fullStars - (hasHalf ? 1 : 0);

    return (
      <View style={{ flexDirection: "row", alignItems: "center", gap: 2 }}>
        {/* Full stars */}
        {[...Array(fullStars)].map((_, i) => (
          <Text key={`full-${i}`} style={{ fontSize: size, color: "#FFD700" }}>★</Text>
        ))}

        {/* Half star giả lập */}
        {hasHalf && (
          <View style={{ position: 'relative' }}>
            <Text style={{ fontSize: size, color: "#E0E0E0" }}>★</Text>
            <Text style={{
              fontSize: size,
              color: "#FFD700",
              position: 'absolute',
              width: '50%',
              overflow: 'hidden'
            }}>★</Text>
          </View>
        )}

        {/* Empty stars */}
        {[...Array(emptyStars)].map((_, i) => (
          <Text key={`empty-${i}`} style={{ fontSize: size, color: "#E0E0E0" }}>★</Text>
        ))}
      </View>
    );
  };

  // Render sao tương tác
  const renderInteractiveStars = () => {
    const displayRating = hoverRating || userRating;

    return (
      <View style={styles.ratingContainer}>
        <Text style={styles.ratingLabel}>
          {hasRated ? "Thay đổi đánh giá của bạn:" : "Đánh giá công thức:"}
        </Text>

        <View style={styles.starsContainer}>
          {[1, 2, 3, 4, 5].map((star) => (
            <TouchableOpacity
              key={star}
              disabled={isLoadingRating}
              onPress={() => handleRatingPress(star)}
              onPressIn={() => setHoverRating(star)}
              onPressOut={() => setHoverRating(0)}
              style={{ marginHorizontal: 4 }}
            >
              <Text
                style={[
                  styles.starIcon,
                  {
                    color: star <= displayRating ? "#FFD700" : "#DDD",
                    opacity: isLoadingRating ? 0.5 : 1,
                  },
                ]}
              >
                ★
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Hiển thị thông báo */}
        {hasRated && userRating >= 1 && (
          <Text style={styles.ratingText}>
            Bạn đã đánh giá: {userRating} sao
          </Text>
        )}
        {isLoadingRating && (
          <Text style={{ fontSize: 12, color: "#666", marginTop: 4 }}>
            Đang cập nhật...
          </Text>
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        {/* Ảnh chính */}
        <Image source={{ uri: getImageUrl(recipe.image) }} style={styles.image} />

        {/* Info row */}
        <View style={styles.infoRow}>
          <TouchableOpacity
            style={styles.infoButton}
            onPress={handleToggleLike}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <MaterialIcons
                name={isLiked ? "favorite" : "favorite-border"}
                size={20}
                color="#FF6B6B"
              />
              <Text style={styles.infoText}>{localLikeCount}</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.infoButton}
            onPress={() => setCommentModalVisible(true)}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <MaterialIcons name="chat-bubble" size={20} color="#4A90E2" />
              <Text style={styles.infoText}>{totalComments}</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity style={styles.infoButton}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <MaterialIcons name="visibility" size={20} color="#9B59B6" />
              <Text style={styles.infoText}>{recipe.views ?? 0}</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Author row */}
        <TouchableOpacity
          style={styles.authorRow}
          onPress={() => {
            if (router && authorInfo?.userId) {
              if (currentUserId === authorInfo.userId) {
                router.push("/(tabs)/profile");
              } else {
                router.push(`/profile/${authorInfo.userId}`);
              }
            }
          }}
        >
          <Image source={getAvatarSource()} style={styles.avatar} />
          <View style={{ flex: 1 }}>
            <Text style={styles.author}>{recipe.author}</Text>
            <Text style={styles.time}>
              Chuẩn bị: {recipe.prepTime}p | Nấu: {recipe.cookTime}p
              {recipe.servings ? ` | Khẩu phần: ${recipe.servings}` : ""}
            </Text>
          </View>
          {difficulty.text && (
            <View style={[styles.difficultyBadge, { backgroundColor: difficulty.color + "33", flexDirection: 'row', alignItems: 'center', gap: 4 }]}>
              <MaterialCommunityIcons name="fire" size={16} color={difficulty.color} />
              <Text style={[styles.difficultyText, { color: difficulty.color }]}>
                {difficulty.text}
              </Text>
            </View>
          )}
        </TouchableOpacity>

        {/* Tags & Category */}
        {(recipe.category || (recipe.tags && recipe.tags.length > 0)) && (
          <View style={styles.tagContainer}>
            {recipe.category && recipe.category.length > 0 && (
              <View style={styles.tagGroup}>
                {recipe.category.map((cat, index) => (
                  <View key={index} style={[styles.tagItem, { backgroundColor: "#FFF4E6" }]}>
                    <Text style={[styles.tagText, { color: "#FF8C00" }]}>Danh mục {cat}</Text>
                  </View>
                ))}
              </View>
            )}

            {recipe.tags && recipe.tags.length > 0 && (
              <View style={styles.tagGroup}>
                {recipe.tags.map((tag, index) => {
                  const tagName = typeof tag === "string" ? tag : tag.name;
                  const tagColor = typeof tag === "object" && tag.color ? tag.color : "#3A5BA0";
                  const bgColor = typeof tag === "object" && tag.color ? `${tag.color}20` : "#EEF3FF";
                  return (
                    <View key={index} style={[styles.tagItem, { backgroundColor: bgColor }]}>
                      <Text style={[styles.tagText, { color: tagColor }]}> #{tagName} </Text>
                    </View>
                  );
                })}
              </View>
            )}
          </View>
        )}

        <Text style={styles.title}>{recipe.title}</Text>
        {recipe.description && (
          <View style={styles.card}>
            <Text style={styles.cardDesc}>{recipe.description}</Text>
          </View>
        )}

        {/* RATING SECTION */}
        <View style={styles.card}>
          {/* ĐIỂM TRUNG BÌNH - DÙNG STATE ĐÃ CẬP NHẬT */}
          <View style={styles.averageRatingContainer}>
            <View style={styles.averageRatingRow}>
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                {renderStarRating(currentAvgRating, 22)}
              </View>
              <Text style={styles.averageRatingText}>
                {currentAvgRating.toFixed(1)} ({currentTotalRatings} đánh giá)
              </Text>
            </View>
          </View>

          {/* Phần đánh giá của user */}
          {renderInteractiveStars()}
        </View>

        {/* Nguyên liệu */}
        <View style={styles.card}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 }}>
            <MaterialCommunityIcons name="food-variant" size={24} color="#FF6B35" />
            <Text style={styles.cardTitle}>Nguyên liệu:</Text>
          </View>
          {recipe.ingredients?.length > 0 ? (
            recipe.ingredients.map((item, i) => {
              const qtyNum = item.quantity ? Number(item.quantity) : NaN;
              const showQuantity = !isNaN(qtyNum) && qtyNum !== 0;
              const qtyText = showQuantity ? ` - ${qtyNum}` : "";
              const unitText = item.unit ? ` ${item.unit}` : "";
              const notesText = item.notes ? ` (${item.notes})` : "";

              return (
                <View key={i} style={{
                  flexDirection: "row",
                  alignItems: "center",
                  paddingVertical: 8,
                  paddingHorizontal: 4,
                  backgroundColor: i % 2 === 0 ? "#FAFAFA" : "transparent",
                  borderRadius: 6,
                  marginVertical: 2,
                }}>
                  <MaterialIcons name="check-circle" size={20} color="#4CAF50" style={{ marginRight: 10 }} />
                  <Text style={{
                    flex: 1,
                    fontSize: 15,
                    color: "#333",
                    lineHeight: 22,
                  }}>
                    <Text style={{ fontWeight: "600" }}>{item.name}</Text>
                    {qtyText && <Text style={{ color: "#FF6B35", fontWeight: "700" }}>{qtyText}</Text>}
                    {unitText}
                    {notesText && <Text style={{ color: "#666", fontSize: 13 }}>{notesText}</Text>}
                  </Text>
                </View>
              );
            })
          ) : (
            <Text style={{ color: "#999", fontStyle: "italic" }}>Không có thông tin nguyên liệu</Text>
          )}
        </View>

        {/* Các bước */}
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, margin: 12, marginTop: 16 }}>
          <MaterialCommunityIcons name="chef-hat" size={24} color="#FF6B35" />
          <Text style={styles.section}>Các bước thực hiện:</Text>
        </View>
        <View style={styles.cardLarge}>
          {recipe.steps?.length > 0 ? (
            recipe.steps
              .sort((a, b) => a.stepNumber - b.stepNumber)
              .map((s, idx) => (
                <View
                  key={s.stepId}
                  style={{
                    marginBottom: 20,
                    paddingBottom: 16,
                    borderBottomWidth: idx < recipe.steps.length - 1 ? 1 : 0,
                    borderBottomColor: "#F0F0F0",
                  }}
                >
                  <View style={{
                    flexDirection: "row",
                    alignItems: "flex-start",
                    marginBottom: 8,
                  }}>
                    <View style={{
                      width: 32,
                      height: 32,
                      borderRadius: 16,
                      backgroundColor: "#FF6B35",
                      justifyContent: "center",
                      alignItems: "center",
                      marginRight: 12,
                    }}>
                      <Text style={{
                        color: "#FFF",
                        fontWeight: "bold",
                        fontSize: 16,
                      }}>
                        {s.stepNumber}
                      </Text>
                    </View>
                    <Text style={{
                      flex: 1,
                      fontSize: 15,
                      lineHeight: 24,
                      color: "#333",
                    }}>
                      {s.instruction}
                    </Text>
                  </View>
                  {s.imageUrl && (
                    <Image
                      source={{ uri: getImageUrl(s.imageUrl) }}
                      style={{
                        width: "100%",
                        height: 200,
                        borderRadius: 8,
                        marginTop: 12,
                      }}
                      resizeMode="cover"
                    />
                  )}
                </View>
              ))
          ) : (
            <Text style={{ color: "#999", fontStyle: "italic" }}>Không có hướng dẫn nấu ăn</Text>
          )}
        </View>

        {/* Nút bình luận */}
        <TouchableOpacity
          style={styles.commentButton}
          onPress={() => setCommentModalVisible(true)}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <MaterialIcons name="comment" size={20} color="#FFF" />
            <Text style={styles.commentButtonText}>
              Xem tất cả {totalComments} bình luận
            </Text>
          </View>
        </TouchableOpacity>

        {/* Nút báo cáo */}
        <TouchableOpacity
          style={styles.reportButton}
          onPress={() => setReportModalVisible(true)}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <MaterialIcons name="report" size={20} color="#DC3545" />
            <Text style={styles.reportButtonText}>
              Báo cáo công thức này
            </Text>
          </View>
        </TouchableOpacity>
      </ScrollView>

      {/* Comment Modal */}
      <CommentModal
        visible={commentModalVisible}
        onClose={() => {
          setCommentModalVisible(false);
          setFocusCommentId(null);
        }}
        recipeId={recipe.id}
        currentUserId={currentUserId}
        currentUserAvatar={currentUserAvatar}
        onCommentCountChange={() => { }}
        focusCommentId={focusCommentId}
      />

      {/* Report Modal */}
      <ReportModal
        visible={reportModalVisible}
        onClose={() => setReportModalVisible(false)}
        recipeId={recipe.id}
        recipeTitle={recipe.title}
      />
    </View>
  );
}

// Helper functions
function normalizeCommentsRecursive(comments: any[]): any[] {
  return comments.map((c) => ({
    ...c,
    expandedRepliesCount: 0,
    replies: c.replies?.length ? normalizeCommentsRecursive(c.replies) : [],
  }));
}

function countAllCommentsRecursive(comments: any[]): number {
  if (!comments || comments.length === 0) return 0;
  return comments.reduce((sum, c) => sum + 1 + countAllCommentsRecursive(c.replies || []), 0);
}