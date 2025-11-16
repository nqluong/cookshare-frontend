import { formatDateForApi } from '@/services/adminStatisticsService';
import { Colors } from '@/styles/colors';
import { DateRangeParams } from '@/types/admin/interaction.types';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface PresetButtonsProps {
  selectedRange: DateRangeParams;
  onPresetSelect: (range: DateRangeParams) => void;
}

interface PresetRange {
  label: string;
  getRange: () => DateRangeParams;
}

const presetRanges: PresetRange[] = [
  {
    label: '7 ngày qua',
    getRange: () => {
      const end = new Date();
      const start = new Date();
      start.setDate(end.getDate() - 6);
      return {
        startDate: formatDateForApi(start),
        endDate: formatDateForApi(end),
      };
    },
  },
  {
    label: '30 ngày qua',
    getRange: () => {
      const end = new Date();
      const start = new Date();
      start.setDate(end.getDate() - 29);
      return {
        startDate: formatDateForApi(start),
        endDate: formatDateForApi(end),
      };
    },
  },
  {
    label: '90 ngày qua',
    getRange: () => {
      const end = new Date();
      const start = new Date();
      start.setDate(end.getDate() - 89);
      return {
        startDate: formatDateForApi(start),
        endDate: formatDateForApi(end),
      };
    },
  },
  {
    label: 'Tháng này',
    getRange: () => {
      const end = new Date();
      const start = new Date(end.getFullYear(), end.getMonth(), 1);
      return {
        startDate: formatDateForApi(start),
        endDate: formatDateForApi(end),
      };
    },
  },
  {
    label: 'Tháng trước',
    getRange: () => {
      const end = new Date();
      const start = new Date(end.getFullYear(), end.getMonth() - 1, 1);
      const lastDay = new Date(end.getFullYear(), end.getMonth(), 0);
      return {
        startDate: formatDateForApi(start),
        endDate: formatDateForApi(lastDay),
      };
    },
  },
];

export default function PresetButtons({
  selectedRange,
  onPresetSelect,
}: PresetButtonsProps) {
  return (
    <View style={styles.presetContainer}>
      <Text style={styles.sectionTitle}>Khoảng thời gian nhanh</Text>
      <View style={styles.presetButtons}>
        {presetRanges.map((preset, index) => {
          const range = preset.getRange();
          const isSelected =
            selectedRange.startDate === range.startDate &&
            selectedRange.endDate === range.endDate;
          return (
            <TouchableOpacity
              key={index}
              style={[
                styles.presetButton,
                isSelected && styles.presetButtonSelected,
              ]}
              onPress={() => onPresetSelect(range)}
            >
              <Text
                style={[
                  styles.presetButtonText,
                  isSelected && styles.presetButtonTextSelected,
                ]}
              >
                {preset.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  presetContainer: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: 12,
  },
  presetButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  presetButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: Colors.gray[100],
    borderWidth: 1,
    borderColor: Colors.gray[200],
    marginBottom: 8,
  },
  presetButtonSelected: {
    backgroundColor: '#10b981',
    borderColor: '#10b981',
  },
  presetButtonText: {
    fontSize: 14,
    color: Colors.text.primary,
  },
  presetButtonTextSelected: {
    color: '#fff',
    fontWeight: '600',
  },
});