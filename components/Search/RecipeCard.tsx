import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Image, Text, TouchableOpacity, View } from 'react-native';
import { getImageUrl } from '../../config/api.config';
import { searchStyles } from '../../styles/SearchStyles';
import { Recipe } from '../../types/search';

interface RecipeCardProps {
  item: Recipe;
}

export default function RecipeCard({ item }: RecipeCardProps) {
  const router = useRouter();

  const handlePress = () => {
    // 🎯 Dynamic route: /_recipe-detail/[id] (trong tabs layout)
    router.push(`/_recipe-detail/${item.recipeId}` as any);
  };

  return (
    <TouchableOpacity style={searchStyles.recipeCard} onPress={handlePress} activeOpacity={0.7}>   
      <Image
        source={{ uri: getImageUrl(item.featuredImage) }}
        style={searchStyles.recipeImage}
        resizeMode="cover"
      />
      <View style={searchStyles.recipeInfo}>
        {item.fullName ? (
          <Text style={searchStyles.authorName} numberOfLines={1}>
            {item.fullName}
          </Text>
        ) : null}
        <Text style={searchStyles.recipeTitle} numberOfLines={2}>
          {item.title}
        </Text>
        <View style={searchStyles.recipeStats}>
          <View style={searchStyles.statItem}>
            <Ionicons name="time-outline" size={16} color="#666" />
            <Text style={searchStyles.statText}>{item.cookTime} phút</Text>
          </View>
          <View style={searchStyles.statItem}>
            <Ionicons name="heart-outline" size={16} color="#666" />
            <Text style={searchStyles.statText}>{item.likeCount}</Text>
          </View>
          <View style={searchStyles.statItem}>
            <Ionicons name="bookmark-outline" size={16} color="#666" />
            <Text style={searchStyles.statText}>{item.saveCount}</Text>
          </View>
        </View>
        
      </View>
    </TouchableOpacity>
  );
}