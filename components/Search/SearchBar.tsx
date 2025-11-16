import { Ionicons } from '@expo/vector-icons';
import { useEffect, useRef, useState } from 'react';
import { FlatList, Keyboard, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { searchStyles } from '../../styles/SearchStyles';


interface SearchBarProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  onSearch: (reset?: boolean, requestedPage?: number, queryOverride?: string) => void;
  onToggleFilter: () => void;
  onGetSuggestions?: (query: string) => Promise<string[]>;
  showSuggestions?: boolean;
}

export default function SearchBar({
  searchQuery,
  setSearchQuery,
  onSearch,
  onToggleFilter,
  onGetSuggestions,
  showSuggestions = true,
}: SearchBarProps) {
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestionList, setShowSuggestionList] = useState(false);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    // Debounce để tránh gọi API quá nhiều lần
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    if (searchQuery.trim().length >= 2 && onGetSuggestions && showSuggestions) {
      setIsLoadingSuggestions(true);
      debounceTimer.current = setTimeout(async () => {
        try {
          const results = await onGetSuggestions(searchQuery.trim());
          setSuggestions(results);
          setShowSuggestionList(true);
        } catch (error) {
          console.log('Error fetching suggestions:', error);
          setSuggestions([]);
        } finally {
          setIsLoadingSuggestions(false);
        }
      }, 300); // Đợi 300ms sau khi người dùng ngừng gõ
    } else {
      setSuggestions([]);
      setShowSuggestionList(false);
      setIsLoadingSuggestions(false);
    }

    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, [searchQuery, onGetSuggestions, showSuggestions]);

  const handleSelectSuggestion = (suggestion: string) => {
    setSearchQuery(suggestion);
    setShowSuggestionList(false);
    setSuggestions([]);
    Keyboard.dismiss();

    // Truyền trực tiếp suggestion thay vì dựa vào state
    onSearch(true, undefined, suggestion);
  };

  const handleSearch = () => {
    setShowSuggestionList(false);
    setSuggestions([]);
    Keyboard.dismiss();
    onSearch(true);
  };

  const handleInputFocus = () => {
    // Khi focus vào input và có suggestions thì hiển thị lại
    if (suggestions.length > 0 && showSuggestions) {
      setShowSuggestionList(true);
    }
  };
  return (
    <View style={searchStyles.searchContainer}>
      <TouchableOpacity onPress={handleSearch}>
        <Ionicons name="search-outline" size={20} color="#666" style={searchStyles.icon} />
      </TouchableOpacity>
      <TextInput
        style={searchStyles.input}
        placeholder="Nhập tên món ăn"
        value={searchQuery}
        onChangeText={setSearchQuery}
        onSubmitEditing={handleSearch}
        returnKeyType="search"
      />
      <TouchableOpacity style={searchStyles.filterButton} onPress={onToggleFilter}>
        <Ionicons name="filter-outline" size={22} color="#666" />
      </TouchableOpacity>
      {searchQuery.length > 0 && (
        <TouchableOpacity
          onPress={() => {
            setSearchQuery('');
            setSuggestions([]);
            setShowSuggestionList(false);
          }}
          style={styles.clearButton}
        >
          <Ionicons name="close-circle" size={20} color="#999" />
        </TouchableOpacity>
      )}
      {/* Danh sách gợi ý */}
      {showSuggestionList && suggestions.length > 0 && (
        <View style={styles.suggestionsContainer}>
          <FlatList
            data={suggestions}
            keyExtractor={(item, index) => `suggestion-${index}`}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.suggestionItem}
                onPress={() => handleSelectSuggestion(item)}
              >
                <Ionicons name="search" size={16} color="#999" style={styles.suggestionIcon} />
                <Text style={styles.suggestionText} numberOfLines={1}>
                  {item}
                </Text>
              </TouchableOpacity>
            )}
            style={styles.suggestionsList}
            keyboardShouldPersistTaps="handled"
          />
        </View>
      )}

      {isLoadingSuggestions && (
        <View style={styles.suggestionsContainer}>
          <Text style={styles.loadingText}>Đang tải gợi ý...</Text>
        </View>
      )}
    </View>
  );

}
const styles = StyleSheet.create({
  // Container chính bao bọc toàn bộ SearchBar + Suggestions
  container: {
    position: 'relative',
    zIndex: 1000,
    width: '100%',
  },

  // Thanh tìm kiếm
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 4, // Giảm margin bottom để gợi ý sát hơn
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
  },

  icon: {
    marginRight: 8,
  },

  input: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    paddingVertical: 4,
    paddingRight: 8,
  },

  clearButton: {
    padding: 4,
    marginLeft: 4,
  },

  filterButton: {
    padding: 4,
    marginLeft: 8,
  },

  // Container gợi ý - ĐƯỢC ĐẶT TRONG container CHA
  suggestionsContainer: {
    position: 'absolute',
    top: '100%', // Dính sát dưới thanh search
    left: 16,
    right: 16,
    backgroundColor: '#fff',
    borderRadius: 12,
    marginTop: 4, // Khoảng cách nhẹ giữa search và gợi ý
    maxHeight: 280,
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    zIndex: 2000,
    overflow: 'hidden',
  },

  suggestionsList: {
    paddingVertical: 4,
  },

  suggestionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 13,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#eee',
  },

  suggestionIcon: {
    marginRight: 12,
    color: '#999',
  },

  suggestionText: {
    flex: 1,
    fontSize: 15,
    color: '#333',
    lineHeight: 20,
  },

  loadingText: {
    padding: 16,
    textAlign: 'center',
    color: '#999',
    fontSize: 14,
    fontStyle: 'italic',
  },
});