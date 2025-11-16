import { commentService } from "@/services/commentService";
import { CommentResponse } from "@/types/comment";
import { useEffect, useMemo, useState } from "react";
import { Image, ScrollView, Text, TouchableOpacity, View } from "react-native";
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

export default function RecipeDetailView({
  recipe,
  authorInfo,
  currentUserId,
  currentUserAvatar,
  router,
}: Props) {
  const [commentModalVisible, setCommentModalVisible] = useState(false);
  const [comments, setComments] = useState<CommentWithExpandedReplies[]>([]);

  // Debug
  useEffect(() => {
    console.log('RecipeDetailView - authorInfo:', authorInfo);
    console.log('RecipeDetailView - recipe.image:', recipe.image);
  }, [authorInfo, recipe.image]);

  const totalComments = useMemo(
    () => countAllCommentsRecursive(comments),
    [comments]
  );
  const [commentCount, setCommentCount] = useState(totalComments);

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

  // Determine avatar source - use default if no avatar URL
  const getAvatarSource = () => {
    const avatarUrl = authorInfo?.avatarUrl?.trim();
    if (avatarUrl && avatarUrl !== "") {
      return { uri: getImageUrl(avatarUrl) };
    }
    return require('../../assets/images/default-avatar.png');
  };

  return (
    <View style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        {/* Ảnh chính */}
        <Image source={{ uri: getImageUrl(recipe.image) }} style={styles.image} />

        {/* Thông tin lượt thích / xem / bình luận */}
        <View style={styles.infoRow}>
          <TouchableOpacity style={styles.infoButton}>
            <Text style={styles.infoText}>❤️ {recipe.likes ?? 0}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.infoButton}
            onPress={() => setCommentModalVisible(true)}
          >
            <Text style={styles.infoText}>💬 {totalComments}</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.infoButton}>
            <Text style={styles.infoText}>👁️ {recipe.views ?? 0}</Text>
          </TouchableOpacity>
        </View>

        {/* Tác giả + thời gian + khẩu phần + độ khó */}
        <TouchableOpacity 
          style={styles.authorRow}
          onPress={() => {
            if (router && authorInfo?.userId) {
              router.push(`/profile/${authorInfo.userId}`);
            }
          }}
        >
          <Image 
            source={getAvatarSource()} 
            style={styles.avatar} 
          />
          <View style={{ flex: 1 }}>
            <Text style={styles.author}>{recipe.author}</Text>
            <Text style={styles.time}>
              ⏱️ Chuẩn bị: {recipe.prepTime}p | Nấu: {recipe.cookTime}p
              {recipe.servings ? ` | Khẩu phần: ${recipe.servings}` : ""}
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

        {/* Danh mục & Tag */}
        {(recipe.category || (recipe.tags && recipe.tags.length > 0)) && (
          <View style={styles.tagContainer}>
            {/* Hiển thị danh mục */}
            {recipe.category && recipe.category.length > 0 && (
              <View style={styles.tagGroup}>
                {recipe.category.map((cat, index) => (
                  <View key={index} style={[styles.tagItem, { backgroundColor: '#FFF4E6' }]}>
                    <Text style={[styles.tagText, { color: '#FF8C00' }]}>📂 {cat}</Text>
                  </View>
                ))}
              </View>
            )}

            {/* Hiển thị tag với màu từ database */}
            {recipe.tags && recipe.tags.length > 0 && (
              <View style={styles.tagGroup}>
                {recipe.tags.map((tag, index) => {
                  const tagName = typeof tag === 'string' ? tag : tag.name;
                  const tagColor = typeof tag === 'object' && tag.color ? tag.color : '#3A5BA0';
                  const bgColor = typeof tag === 'object' && tag.color ? `${tag.color}20` : '#EEF3FF';
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

        {/* Tiêu đề & mô tả */}
        <Text style={styles.title}>{recipe.title}</Text>
        {recipe.description ? (
          <View style={styles.card}>
            <Text style={styles.cardDesc}>{recipe.description}</Text>
          </View>
        ) : null}

        {/* Nguyên liệu */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>🧂 Nguyên liệu:</Text>
          {recipe.ingredients && recipe.ingredients.length > 0 ? (
            recipe.ingredients.map((item, i) => {
              const qtyNum = item.quantity !== undefined && item.quantity !== null ? Number(item.quantity) : NaN;
              const showQuantity = !isNaN(qtyNum) && qtyNum !== 0;
              const qtyText = showQuantity ? ` - ${qtyNum}` : "";
              const unitText = item.unit && item.unit.toString().trim() !== "" ? ` ${item.unit}` : "";
              const notesText = item.notes ? ` (${item.notes})` : "";

              return (
                <Text key={i} style={{ marginVertical: 2 }}>
                  • {item.name}{qtyText}{unitText}{notesText}
                </Text>
              );
            })
          ) : (
            <Text>Không có thông tin nguyên liệu</Text>
          )}
        </View>

        {/* Các bước nấu */}
        <Text style={styles.section}>👨‍🍳 Các bước nấu:</Text>
        <View style={styles.cardLarge}>
          {recipe.steps && recipe.steps.length > 0 ? (
            recipe.steps
              .sort((a, b) => a.stepNumber - b.stepNumber)
              .map((s) => (
                <Text key={s.stepId} style={{ marginBottom: 6 }}>
                  {s.stepNumber}. {s.instruction}
                </Text>
              ))
          ) : (
            <Text>Không có hướng dẫn nấu ăn</Text>
          )}
        </View>

        {/* Video hướng dẫn */}
        {recipe.video ? (
          <TouchableOpacity style={styles.videoCard}>
            <Text>🎥 Xem video hướng dẫn</Text>
          </TouchableOpacity>
        ) : null}

        {/* Nút bình luận */}
        <TouchableOpacity
          style={styles.commentButton}
          onPress={() => setCommentModalVisible(true)}
        >
          <Text style={styles.commentButtonText}>
            💬 Xem tất cả {totalComments} bình luận
          </Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Comment Modal */}
      <CommentModal
        visible={commentModalVisible}
        onClose={() => setCommentModalVisible(false)}
        recipeId={recipe.id}
        currentUserId={currentUserId}
        currentUserAvatar={currentUserAvatar}
        onCommentCountChange={setCommentCount}
      />
    </View>
  );
}

function normalizeCommentsRecursive(comments: any[]): any[] {
  return comments.map((c) => ({
    ...c,
    expandedRepliesCount: 0,
    replies: c.replies && c.replies.length ? normalizeCommentsRecursive(c.replies) : [],
  }));
}

function countAllCommentsRecursive(comments: any[]): number {
  if (!comments || comments.length === 0) return 0;
  return comments.reduce(
    (sum, c) => sum + 1 + countAllCommentsRecursive(c.replies || []),
    0
  );
}
