import { Ionicons } from '@expo/vector-icons';
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface SearchHistoryProps {
  history: string[];
  onSelect: (query: string) => void;
  onClearAll: () => void;
  onDeleteItem: (query: string) => void;
  onSearch: () => void;
}

export default function SearchHistory({
  history,
  onSelect,
  onClearAll,
  onDeleteItem,
  onSearch,
}: SearchHistoryProps) {
  if (history.length === 0) {
    return null;
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Lịch sử tìm kiếm</Text>
        <TouchableOpacity onPress={onClearAll}>
          <Text style={styles.clearText}>Xóa tất cả</Text>
        </TouchableOpacity>
      </View>

      {/* Danh sách lịch sử */}
      <FlatList
        data={history.slice().reverse()}
        keyExtractor={(item, index) => `${item}-${index}`}
        renderItem={({ item }) => (
          <View style={styles.itemContainer}>
            <TouchableOpacity
              style={styles.itemTextContainer}
              onPress={() => {
                onSelect(item);
                onSearch();
              }}
            >
              <Ionicons name="time-outline" size={18} color="#666" style={{ marginRight: 8 }} />
              <Text style={styles.itemText}>{item}</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => onDeleteItem(item)}>
              <Ionicons name="close-circle-outline" size={20} color="#aaa" />
            </TouchableOpacity>
          </View>
        )}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        scrollEnabled={true}
        nestedScrollEnabled={true}
        style={styles.listContainer}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  clearText: {
    fontSize: 14,
    color: '#fbbc05',
    fontWeight: '600',
  },
  itemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  itemTextContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  itemText: {
    fontSize: 15,
    color: '#333',
  },
  separator: {
    height: 1,
    backgroundColor: '#f0f0f0',
  },
  listContainer: {
    maxHeight: 200,
  },
});
