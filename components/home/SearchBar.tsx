import { Ionicons } from '@expo/vector-icons';
import { useEffect, useRef, useState } from 'react';
import {
  FlatList,
  Keyboard,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Colors } from '../../styles/colors';

interface SearchBarProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  onSearch: (reset?: boolean, requestedPage?: number, queryOverride?: string) => void;
  placeholder?: string;
  onGetSuggestions?: (query: string) => Promise<string[]>;
  showSuggestions?: boolean;
}

export default function SearchBar({
  searchQuery,
  setSearchQuery,
  onSearch,
  placeholder = 'Tìm kiếm...',
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
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#666" style={styles.searchIcon} />
        <TextInput
          style={styles.input}
          placeholder={placeholder}
          value={searchQuery}
          onChangeText={setSearchQuery}
          onSubmitEditing={handleSearch}
          returnKeyType="search"
          autoCorrect={false}
          autoCapitalize="none"
        />
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
      </View>

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
  container: {
    position: 'relative',
    zIndex: 1000,
    backgroundColor: Colors.background,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginHorizontal: 16,
    marginVertical: 12,
  },
  searchIcon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    paddingVertical: 4,
  },
  clearButton: {
    padding: 4,
    marginRight: 8,
  },
  searchButton: {
    backgroundColor: '#fbbc05',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  searchButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
  suggestionsContainer: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginTop: -8,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    maxHeight: 250,
  },
  suggestionsList: {
    paddingVertical: 8,
  },
  suggestionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  suggestionIcon: {
    marginRight: 12,
  },
  suggestionText: {
    flex: 1,
    fontSize: 15,
    color: '#333',
  },
  loadingText: {
    padding: 16,
    textAlign: 'center',
    color: '#999',
    fontSize: 14,
  },
});