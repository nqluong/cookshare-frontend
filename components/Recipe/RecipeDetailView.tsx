import { Image, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { getImageUrl } from "../../config/api.config";
import styles from "../../styles/RecipeDetailView.styles";

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
  comments: Comment[];
  likes?: number;
  views?: number;
};

type Props = {
  recipe: Recipe;
  onBack: () => void;
  onSearch: () => void;
};

export default function RecipeDetailView({ recipe }: Props) {
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
          <Text>❤️ {recipe.likes ?? 0}</Text>
          <Text>💬 {recipe.comments?.length ?? 0}</Text>
          <Text>👁️ {recipe.views ?? 0}</Text>
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
      </ScrollView>
    </View>
  );
}
