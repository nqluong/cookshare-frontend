import { MaterialIcons } from "@expo/vector-icons";
import React from "react";
import { Image, ScrollView, Text, TouchableOpacity, View, } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import styles from "../../styles/RecipeDetailView.styles";

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
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={onBack}>
          <MaterialIcons name="arrow-back-ios" size={32} color="#222" />
        </TouchableOpacity>
        <View style={{ flex: 1 }} />
        <TouchableOpacity style={styles.headerBtn} onPress={onSearch}>
          <MaterialIcons name="search" size={38} color="#222" />
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        <Image source={{ uri: recipe.image }} style={styles.image} />

        <View style={styles.infoRow}>
          <Text>❤️ {recipe.likes ?? 0}</Text>
          <Text>💬 {recipe.comments?.length ?? 0}</Text>
          <Text>👁️ {recipe.views ?? 0}</Text>
        </View>

        <View style={styles.authorRow}>
          <Image source={{ uri: recipe.image }} style={styles.avatar} />
          <View>
            <Text style={styles.author}>{recipe.author}</Text>
            <Text style={styles.time}>
              ⏱️ Chuẩn bị: {recipe.prepTime}p | Nấu: {recipe.cookTime}p
            </Text>
          </View>
        </View>

        <Text style={styles.title}>{recipe.title}</Text>
        <View style={styles.card}>
          <Text style={styles.cardDesc}>{recipe.description}</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Nguyên liệu:</Text>
          {recipe.ingredients.map((item, i) => (
            <Text key={i}>• {item}</Text>
          ))}
        </View>

        <Text style={styles.section}>Các bước nấu:</Text>
        <View style={styles.cardLarge}>
          {recipe.steps.map((s, i) => (
            <Text key={i}>
              {i + 1}. {s}
            </Text>
          ))}
        </View>

        {recipe.video && (
          <TouchableOpacity style={styles.videoCard}>
            <Text>🎥 Video nấu ăn</Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
