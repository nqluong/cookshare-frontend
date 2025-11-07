import { StyleSheet, Text, View } from "react-native";
import { Colors } from "../../../styles/colors";

interface RecipeStatsSummaryProps {
  totalElements: number;
  currentCount: number;
  filterStatus?: string;
}

export default function RecipeStatsSummary({ 
  totalElements, 
  currentCount,
  filterStatus = 'all'
}: RecipeStatsSummaryProps) {
  const getFilterLabel = () => {
    switch (filterStatus) {
      case 'pending':
        return 'chờ duyệt';
      case 'approved':
        return 'đã duyệt';
      case 'rejected':
        return 'đã từ chối';
      default:
        return '';
    }
  };

  return (
    <View style={styles.statsContainer}>
      <Text style={styles.statsText}>
        Hiển thị {currentCount} / {totalElements} công thức {getFilterLabel()}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  statsContainer: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: "#f8fafc",
    borderRadius: 8,
    marginBottom: 16,
  },
  statsText: {
    fontSize: 14,
    color: Colors.text.secondary,
    fontWeight: "500",
  },
});