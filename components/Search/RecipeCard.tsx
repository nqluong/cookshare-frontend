import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { getImageUrl } from '../../config/api.config';
import { searchStyles } from '../../styles/SearchStyles';
import { Recipe } from '../../types/search';
import { CachedImage } from '../ui/CachedImage';

interface RecipeCardProps {
  item: Recipe;
  isUserResult?: boolean;
  fromRoute?: string;
}

export default function RecipeCard({ item, isUserResult = false, fromRoute }: RecipeCardProps) {
  const router = useRouter();

  const handlePress = () => {
    if (isUserResult) {
      // Navigate đến UserProfile nếu là kết quả user
      if (item.userId) {
        router.push(`/profile/${item.userId}` as any);
      }
    } else {
      // Navigate đến recipe detail nếu là kết quả recipe
      const from = fromRoute || '/(tabs)/search';
      router.push(`/_recipe-detail/${item.recipeId}?from=${from}` as any);
    }
  };

  const handleAuthorPress = (e: any) => {
    e.stopPropagation();
    if (item.userId) {
      router.push(`/profile/${item.userId}` as any);
    }
  };

  // Render user card
  if (isUserResult) {
    return (
      <TouchableOpacity style={styles.userCard} onPress={handlePress} activeOpacity={0.7} >
        <CachedImage
          source={{ uri: getImageUrl(item.avatarUrl || item.featuredImage) }}
          style={styles.userAvatar}
          resizeMode="cover"
        />
        <View style={styles.userInfo} >
          <Text style={styles.userFullName} numberOfLines={1}>
            {item.fullName}
          </Text>
          <Text style={styles.userLabel}>Người dùng</Text>
        </View>
        <Ionicons name="chevron-forward" size={24} color="#666" />
      </TouchableOpacity>
    );
  }

  // Render recipe card (như cũ)
  return (
    <TouchableOpacity style={searchStyles.recipeCard} onPress={handlePress} activeOpacity={0.7}>
      <CachedImage
        source={{ uri: getImageUrl(item.featuredImage) }}
        style={searchStyles.recipeImage}
        resizeMode="cover"
      />
      <View style={searchStyles.recipeInfo}>
        {item.fullName ? (
          <TouchableOpacity onPress={handleAuthorPress} activeOpacity={0.7}>
            <Text style={[searchStyles.authorName, { color: '#FF385C' }]} numberOfLines={1}>
              {item.fullName}
            </Text>
          </TouchableOpacity>
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

const styles = StyleSheet.create({
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 15,
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  userAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 15,
  },
  userInfo: {
    flex: 1,
  },
  userFullName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  userLabel: {
    fontSize: 12,
    color: '#999',
    marginBottom: 4,
  },
  userBio: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
});