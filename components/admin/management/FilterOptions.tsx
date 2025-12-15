import { moderateScale, scale, verticalScale } from "@/constants/layout";
import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Colors } from "../../../styles/colors";

interface FilterOptionsProps {
  visible: boolean;
  onClose: () => void;
  sortBy: string;
  sortDir: string;
  onSortChange: (sortBy: string, sortDir: string) => void;
}

const SORT_OPTIONS = [
  { value: 'createdAt', label: 'Ngày tạo', icon: 'calendar-outline' },
  { value: 'updatedAt', label: 'Ngày cập nhật', icon: 'refresh-outline' },
  { value: 'title', label: 'Tên công thức', icon: 'text-outline' },
  { value: 'viewCount', label: 'Lượt xem', icon: 'eye-outline' },
  { value: 'likeCount', label: 'Lượt thích', icon: 'heart-outline' },
  { value: 'saveCount', label: 'Lượt lưu', icon: 'bookmark-outline' },
  { value: 'averageRating', label: 'Đánh giá', icon: 'star-outline' },
  { value: 'ratingCount', label: 'Số đánh giá', icon: 'star-half-outline' },
];

const SORT_DIRECTIONS = [
  { value: 'desc', label: 'Giảm dần', icon: 'arrow-down' },
  { value: 'asc', label: 'Tăng dần', icon: 'arrow-up' },
];

export default function FilterOptions({
  visible,
  onClose,
  sortBy,
  sortDir,
  onSortChange,
}: FilterOptionsProps) {
  const [tempSortBy, setTempSortBy] = useState(sortBy);
  const [tempSortDir, setTempSortDir] = useState(sortDir);

  const handleApply = () => {
    onSortChange(tempSortBy, tempSortDir);
    onClose();
  };

  const handleReset = () => {
    setTempSortBy('createdAt');
    setTempSortDir('desc');
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.container} edges={['top']}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Ionicons name="close" size={scale(24)} color={Colors.text.primary} />
          </TouchableOpacity>
          <Text style={styles.title}>Bộ lọc và sắp xếp</Text>
          <View style={styles.headerSpacer} />
        </View>

        {/* Content - Scrollable */}
        <ScrollView 
          style={styles.content}
          contentContainerStyle={styles.contentContainer}
          showsVerticalScrollIndicator={false}
        >
          {/* Sort By Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Sắp xếp theo</Text>
            <View style={styles.optionsContainer}>
              {SORT_OPTIONS.map((option) => (
                <TouchableOpacity
                  key={option.value}
                  style={[
                    styles.optionItem,
                    tempSortBy === option.value && styles.selectedOption
                  ]}
                  onPress={() => setTempSortBy(option.value)}
                  activeOpacity={0.7}
                >
                  <Ionicons 
                    name={option.icon as any} 
                    size={scale(20)} 
                    color={tempSortBy === option.value ? '#fff' : Colors.text.secondary} 
                  />
                  <Text style={[
                    styles.optionText,
                    tempSortBy === option.value && styles.selectedOptionText
                  ]}>
                    {option.label}
                  </Text>
                  {tempSortBy === option.value && (
                    <Ionicons name="checkmark" size={scale(20)} color="#fff" />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Sort Direction Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Hướng sắp xếp</Text>
            <View style={styles.optionsContainer}>
              {SORT_DIRECTIONS.map((direction) => (
                <TouchableOpacity
                  key={direction.value}
                  style={[
                    styles.optionItem,
                    tempSortDir === direction.value && styles.selectedOption
                  ]}
                  onPress={() => setTempSortDir(direction.value)}
                  activeOpacity={0.7}
                >
                  <Ionicons 
                    name={direction.icon as any} 
                    size={scale(20)} 
                    color={tempSortDir === direction.value ? '#fff' : Colors.text.secondary} 
                  />
                  <Text style={[
                    styles.optionText,
                    tempSortDir === direction.value && styles.selectedOptionText
                  ]}>
                    {direction.label}
                  </Text>
                  {tempSortDir === direction.value && (
                    <Ionicons name="checkmark" size={scale(20)} color="#fff" />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </ScrollView>

        {/* Footer - Fixed at bottom */}
        <SafeAreaView edges={['bottom']} style={styles.footerSafeArea}>
          <View style={styles.footer}>
            <TouchableOpacity 
              style={styles.resetButton} 
              onPress={handleReset}
              activeOpacity={0.7}
            >
              <Ionicons name="refresh-outline" size={scale(20)} color={Colors.text.secondary} />
              <Text style={styles.resetButtonText}>Đặt lại</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.applyButton} 
              onPress={handleApply}
              activeOpacity={0.7}
            >
              <Ionicons name="checkmark" size={scale(20)} color="#fff" />
              <Text style={styles.applyButtonText}>Áp dụng</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: scale(16),
    paddingVertical: verticalScale(12),
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  closeButton: {
    padding: scale(4),
  },
  title: {
    fontSize: moderateScale(18),
    fontWeight: '600',
    color: Colors.text.primary,
  },
  headerSpacer: {
    width: scale(32),
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: scale(16),
    paddingBottom: verticalScale(20),
  },
  section: {
    paddingVertical: verticalScale(20),
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  sectionTitle: {
    fontSize: moderateScale(16),
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: verticalScale(16),
  },
  optionsContainer: {
    gap: verticalScale(8),
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: scale(16),
    paddingVertical: verticalScale(12),
    borderRadius: scale(12),
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    gap: scale(12),
  },
  selectedOption: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  optionText: {
    flex: 1,
    fontSize: moderateScale(14),
    color: Colors.text.primary,
    fontWeight: '500',
  },
  selectedOptionText: {
    color: '#fff',
  },
  footerSafeArea: {
    backgroundColor: '#fff',
  },
  footer: {
    flexDirection: 'row',
    paddingHorizontal: scale(16),
    paddingTop: verticalScale(16),
    paddingBottom: verticalScale(8),
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    gap: scale(12),
    backgroundColor: '#fff',
  },
  resetButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: verticalScale(12),
    borderRadius: scale(8),
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    gap: scale(8),
  },
  resetButtonText: {
    fontSize: moderateScale(14),
    color: Colors.text.secondary,
    fontWeight: '600',
  },
  applyButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: verticalScale(12),
    borderRadius: scale(8),
    backgroundColor: Colors.primary,
    gap: scale(8),
  },
  applyButtonText: {
    fontSize: moderateScale(14),
    color: '#fff',
    fontWeight: '600',
  },
});
