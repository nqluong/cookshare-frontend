import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ScrollView,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { searchStyles } from '../../styles/SearchStyles';
import { Recipe as SearchRecipe } from '../../types/search';
import RecipeCard from '../Search/RecipeCard';

interface SearchResultsProps {
  recipes: SearchRecipe[];
  hasMoreSearch: boolean;
  loadingMore: boolean;
  onLoadMore: () => void;
}

export default function SearchResults({
  recipes,
  hasMoreSearch,
  loadingMore,
  onLoadMore,
}: SearchResultsProps) {
  console.log('📊 Total items from API:', recipes.length);

  // Group theo userId để tạo danh sách người dùng unique
  const userMap = new Map<string, SearchRecipe>();
  const recipeItems: SearchRecipe[] = [];

  recipes.forEach(item => {
    console.log('🔍 Item:', {
      userId: item.userId,
      fullName: item.fullName,
      recipeId: item.recipeId,
      title: item.title
    });

    // Thu thập thông tin user từ mọi item có userId
    if (item.userId && !userMap.has(item.userId)) {
      userMap.set(item.userId, {
        userId: item.userId,
        fullName: item.fullName || 'Unknown',
        avatarUrl: item.avatarUrl,
        featuredImage: item.featuredImage,
        title: '',
        slug: null,
        description: null,
        recipeId: '', // Để trống để đánh dấu đây là user item
        cookTime: 0,
        viewCount: 0,
        likeCount: 0,
        saveCount: 0,
      });
    }

    // Chỉ thêm vào recipes nếu có recipeId
    if (item.recipeId) {
      recipeItems.push(item);
    }
  });

  const users = Array.from(userMap.values());
  console.log('👥 Total unique users:', users.length);
  console.log('📝 Total recipes:', recipeItems.length);

  return (
    <View style={styles.container}>
      {/* Phần users ở trên - scroll ngang */}
      {users.length > 0 && (
        <View style={styles.usersSection}>
          <Text style={styles.sectionTitle}>Người dùng ({users.length})</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.usersScrollContent}
          >
            {users.map((user) => (
              <View key={user.userId} style={styles.userCardWrapper}>
                <RecipeCard
                  item={user}
                  isUserResult={true}
                  fromRoute="/(tabs)/home"
                />
              </View>
            ))}
          </ScrollView>
        </View>
      )}

      {/* Phần recipes ở dưới - scroll dọc */}
      {recipeItems.length > 0 && (
        <View style={styles.recipesSection}>
          <Text style={styles.sectionTitle}>Công thức ({recipeItems.length})</Text>
        </View>
      )}

      <FlatList
        data={recipeItems}
        renderItem={({ item }) => (
          <RecipeCard
            item={item}
            isUserResult={false}
            fromRoute="/(tabs)/home"
          />
        )}
        keyExtractor={(item) => item.recipeId}
        contentContainerStyle={searchStyles.listContainer}
        showsVerticalScrollIndicator={false}
        onEndReached={onLoadMore}
        onEndReachedThreshold={0.5}
        ListFooterComponent={
          loadingMore ? (
            <View style={styles.footerContainer}>
              <ActivityIndicator size="small" color="#fbbc05" />
              <Text style={styles.loadingText}>Đang tải thêm...</Text>
            </View>
          ) : null
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  usersSection: {
    backgroundColor: '#fff',
    paddingVertical: 12,
    marginBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginHorizontal: 16,
    marginBottom: 8,
  },
  usersScrollContent: {
    paddingHorizontal: 12,
  },
  userCardWrapper: {
    width: 280,
    marginHorizontal: 4,
  },
  recipesSection: {
    backgroundColor: '#fff',
    paddingTop: 12,
    paddingBottom: 4,
  },
  footerContainer: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 8,
    color: '#999',
    fontSize: 14,
  },
});