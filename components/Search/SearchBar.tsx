import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { TextInput, TouchableOpacity, View } from 'react-native';
import { searchStyles } from '../../styles/SearchStyles';

interface SearchBarProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  onSearch: () => void;
  onToggleFilter: () => void;
}

export default function SearchBar({
  searchQuery,
  setSearchQuery,
  onSearch,
  onToggleFilter,
}: SearchBarProps) {
  return (
    <View style={searchStyles.searchContainer}>
      <TouchableOpacity onPress={onSearch}>
        <Ionicons name="search-outline" size={20} color="#666" style={searchStyles.icon} />
      </TouchableOpacity>
      <TextInput
        style={searchStyles.input}
        placeholder="Nhập tên món ăn"
        value={searchQuery}
        onChangeText={setSearchQuery}
        onSubmitEditing={onSearch}
        returnKeyType="search"
      />
      <TouchableOpacity style={searchStyles.filterButton} onPress={onToggleFilter}>
        <Ionicons name="filter-outline" size={22} color="#666" />
      </TouchableOpacity>
    </View>
  );
}