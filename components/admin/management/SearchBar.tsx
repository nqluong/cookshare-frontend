import { Ionicons } from "@expo/vector-icons";
import { useEffect, useRef, useState } from "react";
import {
  FlatList,
  Keyboard,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { getRecipeSuggestions } from "../../../services/searchService";
import { Colors } from "../../../styles/colors";

interface SearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  onSearch: (queryOverride?: string) => void;
  placeholder?: string;
  showSuggestions?: boolean;
}

export default function SearchBar({ 
  value, 
  onChangeText, 
  onSearch, 
  placeholder = "Tìm kiếm công thức...",
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

    if (value.trim().length >= 2 && showSuggestions) {
      setIsLoadingSuggestions(true);
      debounceTimer.current = setTimeout(async () => {
        try {
          const results = await getRecipeSuggestions(value.trim(), 8);
          setSuggestions(results);
          setShowSuggestionList(true);
        } catch (error) {
          console.log('Error fetching suggestions:', error);
          setSuggestions([]);
        } finally {
          setIsLoadingSuggestions(false);
        }
      }, 400); // Đợi 400ms sau khi người dùng ngừng gõ
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
  }, [value, showSuggestions]);

  const handleSelectSuggestion = (suggestion: string) => {
    onChangeText(suggestion);
    setShowSuggestionList(false);
    setSuggestions([]);
    Keyboard.dismiss();
    // Gọi search với suggestion được chọn
    onSearch(suggestion);
  };

  const handleSearch = () => {
    setShowSuggestionList(false);
    setSuggestions([]);
    Keyboard.dismiss();
    onSearch();
  };

  const handleClear = () => {
    onChangeText('');
    setSuggestions([]);
    setShowSuggestionList(false);
  };

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={20} color={Colors.text.light} />
          <TextInput
            style={styles.searchInput}
            placeholder={placeholder}
            value={value}
            onChangeText={onChangeText}
            placeholderTextColor={Colors.text.light}
            onSubmitEditing={handleSearch}
            returnKeyType="search"
            autoCorrect={false}
            autoCapitalize="none"
          />
          {value.length > 0 && (
            <TouchableOpacity onPress={handleClear} style={styles.clearButton}>
              <Ionicons name="close-circle" size={20} color={Colors.text.light} />
            </TouchableOpacity>
          )}
        </View>
        <TouchableOpacity style={styles.searchButton} onPress={handleSearch}>
          <Ionicons name="search" size={24} color={Colors.text.primary} />
        </TouchableOpacity>
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
                <Ionicons name="search" size={16} color={Colors.text.light} style={styles.suggestionIcon} />
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

      {isLoadingSuggestions && value.trim().length >= 2 && (
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
  },
  searchContainer: {
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
    backgroundColor: "#10b981",
  },
  searchBar: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 25,
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: Colors.text.primary,
  },
  clearButton: {
    padding: 4,
  },
  searchButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  suggestionsContainer: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginTop: -8,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 5,
    maxHeight: 280,
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
    color: Colors.text.primary,
  },
  loadingText: {
    padding: 16,
    textAlign: 'center',
    color: Colors.text.light,
    fontSize: 14,
  },
});
