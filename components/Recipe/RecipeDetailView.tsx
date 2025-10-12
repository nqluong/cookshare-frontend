import { MaterialIcons } from '@expo/vector-icons';
import React from 'react';
import { Image, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import styles from './RecipeDetailView.styles';

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
  prepTime: number;   // phút
  cookTime: number;   // phút
  ingredients: string[];
  steps: string[];
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

export default function RecipeDetailView({ recipe, onBack, onSearch }: Props) {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={onBack}>
          <MaterialIcons name="arrow-back-ios" size={32} color="#222" />
        </TouchableOpacity>
        <View style={{ flex: 1 }} />
        <TouchableOpacity style={styles.headerBtn} onPress={onSearch}>
          <MaterialIcons name="search" size={38} color="#222" />
        </TouchableOpacity>
      </View>

      {/* Scroll content */}
      <ScrollView
        style={styles.container}
        contentContainerStyle={{ paddingBottom: 120 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Ảnh món ăn */}
        <Image source={{ uri: recipe.image }} style={styles.image} />

        {/* Hàng thông tin like - comment - view */}
        <View style={styles.infoRow}>
          <Text style={styles.icon}>❤️ {recipe.likes ?? 0}</Text>
          <Text style={styles.icon}>💬 {recipe.comments?.length ?? 0}</Text>
          <Text style={styles.icon}>👁️ {recipe.views ?? 0}</Text>
          <Text style={styles.menuIcon}>⋮</Text>
        </View>

        {/* Thông tin tác giả và thời gian */}
        <View style={styles.authorRow}>
          <Image source={{ uri: recipe.image }} style={styles.avatar} />
          <View style={{ flex: 1 }}>
            <Text style={styles.author}>{recipe.author}</Text>
            <Text style={styles.type}>Món ăn khó</Text>
            <Text style={styles.time}>
              ⏱️ Chuẩn bị: {recipe.prepTime} phút | Nấu: {recipe.cookTime} phút | Tổng: {recipe.prepTime + recipe.cookTime} phút
            </Text>
          </View>
        </View>

        {/* Tiêu đề & mô tả */}
        <Text style={styles.title}>{recipe.title}</Text>
        <View style={styles.card}>
          <Text style={styles.cardDesc}>{recipe.description}</Text>
        </View>

        {/* Nguyên liệu */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Nguyên liệu:</Text>
          {recipe.ingredients.map((item, idx) => (
            <Text key={idx}>• {item}</Text>
          ))}
        </View>

        {/* Các bước nấu */}
        <Text style={styles.section}>Các bước nấu:</Text>
        <View style={styles.cardLarge}>
          {recipe.steps.map((step, idx) => (
            <Text key={idx} style={{ marginBottom: 4 }}>
              {idx + 1}. {step}
            </Text>
          ))}
        </View>

        {/* Video nấu ăn (nếu có) */}
        {recipe.video && (
          <TouchableOpacity style={styles.videoCard}>
            <Text style={styles.videoIcon}>🎥</Text>
            <Text>Video nấu ăn</Text>
          </TouchableOpacity>
        )}

        {/* Bình luận */}
        <View style={styles.commentSection}>
          <Text style={styles.cardTitle}>Bình luận:</Text>
          {recipe.comments.length > 0 ? (
            recipe.comments.map((cmt, idx) => (
              <View key={idx} style={styles.commentRow}>
                <Text style={styles.commentIcon}>{cmt.icon ?? '💬'}</Text>
                <Text style={styles.commentUser}>{cmt.user}</Text>
                <Text style={styles.commentTime}>{cmt.time}</Text>
                <Text style={styles.commentText}>{cmt.text}</Text>
              </View>
            ))
          ) : (
            <Text style={{ color: '#888', marginTop: 4 }}>Chưa có bình luận</Text>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}