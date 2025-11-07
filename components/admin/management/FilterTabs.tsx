import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Colors } from "../../../styles/colors";

interface FilterTabsProps {
  activeFilter: 'all' | 'pending' | 'approved' | 'rejected';
  onFilterChange: (filter: 'all' | 'pending' | 'approved' | 'rejected') => void;
}

export default function FilterTabs({ activeFilter, onFilterChange }: FilterTabsProps) {
  const filters = [
    { key: 'all', label: 'Tất cả' },
    { key: 'pending', label: 'Chờ duyệt' },
    { key: 'approved', label: 'Đã duyệt' },
    { key: 'rejected', label: 'Từ chối' },
  ] as const;

  return (
    <View style={styles.filterContainer}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {filters.map((filter) => (
          <TouchableOpacity 
            key={filter.key}
            style={[
              styles.filterTab, 
              activeFilter === filter.key && styles.activeFilterTab
            ]}
            onPress={() => onFilterChange(filter.key)}
          >
            <Text style={[
              styles.filterTabText, 
              activeFilter === filter.key && styles.activeFilterTabText
            ]}>
              {filter.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  filterContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: "#10b981",
  },
  filterTab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
  },
  activeFilterTab: {
    backgroundColor: "#fff",
  },
  filterTabText: {
    fontSize: 14,
    color: "#fff",
    fontWeight: "500",
  },
  activeFilterTabText: {
    color: Colors.text.primary,
  },
});
