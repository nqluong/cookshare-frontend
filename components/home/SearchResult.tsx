import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
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
  return (
    <FlatList
      data={recipes}
      renderItem={({ item }) => (
        <RecipeCard
          item={item}
          isUserResult={!!item.userId && !item.recipeId}
          fromRoute="/(tabs)/home"
        />
      )}
      keyExtractor={(item) => item.recipeId || item.userId}
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
  );
}

const styles = StyleSheet.create({
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