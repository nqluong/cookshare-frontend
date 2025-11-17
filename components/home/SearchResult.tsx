import {
    FlatList,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { searchStyles } from '../../styles/SearchStyles';
import { Recipe as SearchRecipe } from '../../types/search';
import RecipeCard from '../Search/RecipeCard';

interface SearchResultsProps {
  recipes: SearchRecipe[];
  searchPage: number;
  hasMoreSearch: boolean;
  loading: boolean;
  onPageChange: (page: number) => void;
  onReset: () => void;
}

export default function SearchResults({
  recipes,
  searchPage,
  hasMoreSearch,
  loading,
  onPageChange,
  onReset,
}: SearchResultsProps) {
  return (
    <FlatList
      data={recipes}
      renderItem={({ item }) => (
        <RecipeCard
          item={item}
          isUserResult={!!item.userId && !item.recipeId}
        />
      )}
      keyExtractor={(item) => item.recipeId || item.userId}
      contentContainerStyle={searchStyles.listContainer}
      showsVerticalScrollIndicator={false}
      ListFooterComponent={
        <View style={styles.footerContainer}>
          <View style={styles.paginationContainer}>
            {searchPage > 0 && (
              <TouchableOpacity
                style={[styles.paginationButton, loading && styles.buttonDisabled]}
                onPress={() => onPageChange(searchPage - 1)}
                disabled={loading}
              >
                <Text style={styles.paginationButtonText}>Trang trước</Text>
              </TouchableOpacity>
            )}
            <Text style={styles.pageIndicator}>Trang {searchPage + 1}</Text>
            {hasMoreSearch && (
              <TouchableOpacity
                style={[styles.paginationButton, loading && styles.buttonDisabled]}
                onPress={() => onPageChange(searchPage + 1)}
                disabled={loading}
              >
                <Text style={styles.paginationButtonText}>Trang sau</Text>
              </TouchableOpacity>
            )}
          </View>
          {recipes.length > 0 && (
            <TouchableOpacity style={styles.resetButton} onPress={onReset}>
              <Text style={styles.paginationButtonText}>Về trang đầu</Text>
            </TouchableOpacity>
          )}
        </View>
      }
    />
  );
}

const styles = StyleSheet.create({
  footerContainer: {
    alignItems: 'center',
    marginVertical: 20,
  },
  paginationContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  paginationButton: {
    backgroundColor: '#fbbc05',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 8,
    marginHorizontal: 5,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  paginationButtonText: {
    color: '#fff',
    fontWeight: '500',
  },
  pageIndicator: {
    marginHorizontal: 10,
    fontWeight: 'bold',
    color: '#333',
  },
  resetButton: {
    backgroundColor: '#666',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 8,
    marginTop: 10,
  },
});