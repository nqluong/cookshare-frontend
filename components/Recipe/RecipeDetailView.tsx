import { commentService } from "@/services/commentService";
import { ratingService } from "@/services/ratingService"; // ← ĐÃ THÊM
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
import { getImageUrl } from "../../config/api.config";
import styles from "../../styles/RecipeDetailView.styles";
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
}: Props) {
  const params = useLocalSearchParams<RecipeDetailParams>();
  const [commentModalVisible, setCommentModalVisible] = useState(false);
  const [comments, setComments] = useState<CommentWithExpandedReplies[]>([]);
  const [focusCommentId, setFocusCommentId] = useState<string | null>(null);

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
        console.error("Lỗi tải số bình luận:", error);
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

  // XỬ LÝ GỬI ĐÁNH GIÁ
const handleRatingPress = async (rating: number) => {
  if (isLoadingRating || !currentUserId) return;

  setIsLoadingRating(true);
  try {
    const response = await ratingService.submitRating(recipe.id, rating);

    setUserRating(rating);
    setHasRated(true);

    // ✅ CẬP NHẬT AVG VÀ TOTAL TỪ RESPONSE
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
          <TouchableOpacity style={styles.infoButton}>
            <Text style={styles.infoText}>❤️ {recipe.likes ?? 0}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.infoButton}
            onPress={() => setCommentModalVisible(true)}
          >
            <Text style={styles.infoText}>💬{totalComments}</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.infoButton}>
            <Text style={styles.infoText}>👁️ {recipe.views ?? 0}</Text>
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
              Time Prep: {recipe.prepTime}p | Cook: {recipe.cookTime}p
              {recipe.servings ? ` | Serves: ${recipe.servings}` : ""}
            </Text>
          </View>
          {difficulty.text && (
            <View style={[styles.difficultyBadge, { backgroundColor: difficulty.color + "33" }]}>
              <Text style={[styles.difficultyText, { color: difficulty.color }]}>
                🔥 {difficulty.text}
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
                    <Text style={[styles.tagText, { color: "#FF8C00" }]}>Folder {cat}</Text>
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
          <Text style={styles.cardTitle}>Ingredients:</Text>
          {recipe.ingredients?.length > 0 ? (
            recipe.ingredients.map((item, i) => {
              const qtyNum = item.quantity ? Number(item.quantity) : NaN;
              const showQuantity = !isNaN(qtyNum) && qtyNum !== 0;
              const qtyText = showQuantity ? ` - ${qtyNum}` : "";
              const unitText = item.unit ? ` ${item.unit}` : "";
              const notesText = item.notes ? ` (${item.notes})` : "";

              return (
                <Text key={i} style={{ marginVertical: 2 }}>
                  • {item.name}
                  {qtyText}
                  {unitText}
                  {notesText}
                </Text>
              );
            })
          ) : (
            <Text>Không có thông tin nguyên liệu</Text>
          )}
        </View>

        {/* Các bước */}
        <Text style={styles.section}>Steps:</Text>
        <View style={styles.cardLarge}>
          {recipe.steps?.length > 0 ? (
            recipe.steps
              .sort((a, b) => a.stepNumber - b.stepNumber)
              .map((s) => (
                <Text key={s.stepId} style={{ marginBottom: 12, lineHeight: 22 }}>
                  <Text style={{ fontWeight: "bold" }}>{s.stepNumber}. </Text>
                  {s.instruction}
                </Text>
              ))
          ) : (
            <Text>Không có hướng dẫn nấu ăn</Text>
          )}
        </View>

        {/* Video */}
        {recipe.video && (
          <TouchableOpacity style={styles.videoCard}>
            <Text>Video hướng dẫn</Text>
          </TouchableOpacity>
        )}

        {/* Nút bình luận */}
        <TouchableOpacity
          style={styles.commentButton}
          onPress={() => setCommentModalVisible(true)}
        >
          <Text style={styles.commentButtonText}>
            Xem tất cả {totalComments} bình luận
          </Text>
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
        onCommentCountChange={() => {}}
        focusCommentId={focusCommentId}
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