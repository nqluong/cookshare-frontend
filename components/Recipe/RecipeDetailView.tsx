import { commentService } from "@/services/commentService";
import { useEffect, useState } from "react";
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

type Comment = {
  user: string;
  text: string;
  icon?: string;
  time?: string;
};

type Recipe = {
  id: string;
  title: string;
  description: string;
  image: string;
  author: string;
  prepTime: number;
  cookTime: number;
  ingredients: Ingredient[];
  steps: Step[];
  video?: string;
  likes?: number;
  views?: number;
};

type Props = {
  recipe: Recipe;
  currentUserId: string; 
  currentUserAvatar?: string;
  onBack: () => void;
  onSearch: () => void;
};

export default function RecipeDetailView({ recipe, currentUserId, currentUserAvatar }: Props) {
  const [commentModalVisible, setCommentModalVisible] = useState(false);
  const [commentCount, setCommentCount] = useState(0);

  useEffect(() => {
    if (!recipe?.id) return;
  
    const loadCommentCount = async () => {
      try {
        const data = await commentService.getCommentsByRecipe(recipe.id);
        const total = data.reduce((sum: number, c: any) => sum + 1 + (c.replies?.length || 0), 0);
        console.log('Tổng số bình luận đã tải:', total);
        setCommentCount(total);
      } catch (error) {
        console.error('Lỗi tải số bình luận:', error);
      }
    };
  
    loadCommentCount();
    console.log('Tổng số bình luận đã tải:', commentCount);
  }, [recipe?.id]);

  return (
    <View style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        {/* Ảnh chính */}
        <Image
          source={{ uri: getImageUrl(recipe.image) }}
          style={styles.image}
        />

        {/* Thông tin lượt thích / xem */}
        <View style={styles.infoRow}>
          <TouchableOpacity style={styles.infoButton}>
            <Text style={styles.infoText}>❤️ {recipe.likes ?? 0}</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.infoButton}
            onPress={() => setCommentModalVisible(true)}
          >
            <Text style={styles.infoText}>💬 {commentCount}</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.infoButton}>
            <Text style={styles.infoText}>👁️ {recipe.views ?? 0}</Text>
          </TouchableOpacity>
        </View>

        {/* Tác giả */}
        <View style={styles.authorRow}>
          <Image
            source={{ uri: getImageUrl(recipe.image) }}
            style={styles.avatar}
          />
          <View>
            <Text style={styles.author}>{recipe.author}</Text>
            <Text style={styles.time}>
              ⏱️ Chuẩn bị: {recipe.prepTime}p | Nấu: {recipe.cookTime}p
            </Text>
          </View>
        </View>

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
            recipe.ingredients.map((item, i) => (
              <Text key={i} style={{ marginVertical: 2 }}>
                • {item.name}
                {item.quantity ? ` - ${item.quantity}` : ""}
                {item.unit ? ` ${item.unit}` : ""}
                {item.notes ? ` (${item.notes})` : ""}
              </Text>
            ))
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

        {/* Comment button */}
        <TouchableOpacity
          style={styles.commentButton}
          onPress={() => setCommentModalVisible(true)}
        >
          <Text style={styles.commentButtonText}>
            💬 Xem tất cả {commentCount} bình luận
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