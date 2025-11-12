import { formatDateForApi } from '@/services/adminStatisticsService';
import { Colors } from '@/styles/colors';
import { DateRangeParams } from '@/types/admin/interaction.types';
import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import CalendarGrid from './CalendarGrid';
import PresetButtons from './PresetButtons';

interface DateRangePickerProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: (dateRange: DateRangeParams) => void;
  currentDateRange: DateRangeParams;
}

const formatDateForDisplay = (dateStr: string | undefined): string => {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  return date.toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
};

export default function DateRangePicker({
  visible,
  onClose,
  onConfirm,
  currentDateRange,
}: DateRangePickerProps) {
  const [selectedRange, setSelectedRange] =
    useState<DateRangeParams>(currentDateRange);
  const [currentMonth, setCurrentMonth] = useState<Date>(() => {
    if (currentDateRange.startDate) {
      return new Date(currentDateRange.startDate);
    }
    return new Date();
  });
  const [tempStartDate, setTempStartDate] = useState<Date | null>(() => {
    if (currentDateRange.startDate) {
      return new Date(currentDateRange.startDate);
    }
    return null;
  });
  const [tempEndDate, setTempEndDate] = useState<Date | null>(() => {
    if (currentDateRange.endDate) {
      return new Date(currentDateRange.endDate);
    }
    return null;
  });
  const [selectingStart, setSelectingStart] = useState<boolean>(true);

  // Update when currentDateRange changes
  useEffect(() => {
    if (visible) {
      const start = currentDateRange.startDate
        ? new Date(currentDateRange.startDate)
        : null;
      const end = currentDateRange.endDate
        ? new Date(currentDateRange.endDate)
        : null;
      
      setSelectedRange(currentDateRange);
      setTempStartDate(start);
      setTempEndDate(end);
      
      // Đảm bảo currentMonth luôn là Date hợp lệ
      if (start && !isNaN(start.getTime())) {
        setCurrentMonth(start);
      } else {
        setCurrentMonth(new Date());
      }
      
      setSelectingStart(true);
    }
  }, [visible, currentDateRange]);

  const handlePresetSelect = (range: DateRangeParams) => {
    const start = new Date(range.startDate || '');
    const end = new Date(range.endDate || '');
    setSelectedRange(range);
    setTempStartDate(start);
    setTempEndDate(end);
    setCurrentMonth(start);
    setSelectingStart(true);
    
    // Tự động xác nhận sau khi chọn preset
    setTimeout(() => {
      onConfirm(range);
      onClose();
    }, 300);
  };

  const handleDateSelect = (day: number) => {
    const selectedDate = new Date(
      currentMonth.getFullYear(),
      currentMonth.getMonth(),
      day
    );
    selectedDate.setHours(0, 0, 0, 0);

    // Nếu đã có cả start và end, reset và bắt đầu chọn lại
    if (tempStartDate && tempEndDate) {
      setTempStartDate(selectedDate);
      setTempEndDate(null);
      setSelectingStart(false);
      return;
    }

    if (!tempStartDate) {
      // Chọn ngày đầu tiên
      setTempStartDate(selectedDate);
      setSelectingStart(false);
    } else {
      // Chọn ngày thứ hai
      let start = tempStartDate;
      let end = selectedDate;

      // Auto swap nếu end < start
      if (end < start) {
        [start, end] = [end, start];
      }

      setTempStartDate(start);
      setTempEndDate(end);
      setSelectingStart(true);

      // Update selected range
      const newRange: DateRangeParams = {
        startDate: formatDateForApi(start),
        endDate: formatDateForApi(end),
      };
      setSelectedRange(newRange);
    }
  };

  const handlePrevMonth = () => {
    const newMonth = new Date(currentMonth);
    newMonth.setMonth(newMonth.getMonth() - 1);
    setCurrentMonth(newMonth);
  };

  const handleNextMonth = () => {
    const newMonth = new Date(currentMonth);
    newMonth.setMonth(newMonth.getMonth() + 1);
    setCurrentMonth(newMonth);
  };

  const handleConfirm = () => {
    if (!tempStartDate || !tempEndDate) {
      return;
    }
    if (tempStartDate > tempEndDate) {
      // Swap if needed
      const newRange: DateRangeParams = {
        startDate: formatDateForApi(tempEndDate),
        endDate: formatDateForApi(tempStartDate),
      };
      onConfirm(newRange);
    } else {
      onConfirm(selectedRange);
    }
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
      statusBarTranslucent={true}
    >
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={onClose}
        >
          <TouchableOpacity
            style={styles.modalContent}
            activeOpacity={1}
            onPress={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Chọn Khoảng Thời Gian</Text>
              <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                <Ionicons name="close" size={24} color={Colors.text.primary} />
              </TouchableOpacity>
            </View>

            {/* Content */}
            <ScrollView
              style={styles.scrollContent}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.scrollContentContainer}
              bounces={false}
            >
              {/* Preset buttons */}
              <PresetButtons
                selectedRange={selectedRange}
                onPresetSelect={handlePresetSelect}
              />

              {/* Calendar */}
              <View style={styles.customRangeContainer}>
                <Text style={styles.sectionTitle}>Chọn ngày trên lịch</Text>
                <View style={styles.calendarWrapper}>
                  <CalendarGrid
                    currentMonth={currentMonth}
                    tempStartDate={tempStartDate}
                    tempEndDate={tempEndDate}
                    onDateSelect={handleDateSelect}
                    onPrevMonth={handlePrevMonth}
                    onNextMonth={handleNextMonth}
                  />
                </View>
                {/* Hint với icon */}
                <View style={styles.dateSelectionHint}>
                  <View style={styles.hintIconContainer}>
                    <Ionicons 
                      name={!tempStartDate ? "calendar-outline" : tempEndDate ? "checkmark-circle" : "ellipse-outline"} 
                      size={16} 
                      color={tempEndDate ? "#10b981" : Colors.text.secondary} 
                    />
                  </View>
                  <Text style={[styles.hintText, tempEndDate && styles.hintTextSuccess]}>
                    {!tempStartDate
                      ? '👆 Chọn ngày bắt đầu'
                      : !tempEndDate
                      ? `Từ ${formatDateForDisplay(formatDateForApi(tempStartDate))} - Chọn ngày kết thúc`
                      : `✓ Đã chọn xong! Nhấn lại để chọn lại`}
                  </Text>
                </View>
              </View>

              {/* Selected range display */}
              <View style={styles.selectedRangeContainer}>
                <Text style={styles.selectedRangeLabel}>
                  Khoảng thời gian đã chọn:
                </Text>
                <Text style={styles.selectedRangeText}>
                  {formatDateForDisplay(selectedRange.startDate)} -{' '}
                  {formatDateForDisplay(selectedRange.endDate)}
                </Text>
              </View>
            </ScrollView>

            {/* Actions */}
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.actionButton, styles.cancelButton]}
                onPress={onClose}
              >
                <Text style={styles.cancelButtonText}>Hủy</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.actionButton,
                  styles.confirmButton,
                  (!tempStartDate || !tempEndDate) &&
                    styles.confirmButtonDisabled,
                ]}
                onPress={handleConfirm}
                disabled={!tempStartDate || !tempEndDate}
              >
                <Text style={styles.confirmButtonText}>Xác nhận</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </TouchableOpacity>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    height: '95%',
  },
  scrollContent: {
    flex: 1,
  },
  scrollContentContainer: {
    padding: 20,
    paddingBottom: 10,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray[200],
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text.primary,
  },
  closeButton: {
    padding: 4,
  },
  customRangeContainer: {
    marginBottom: 24,
  },
  calendarWrapper: {
    marginTop: 12,
  },
  dateSelectionHint: {
    marginTop: 12,
    padding: 12,
    backgroundColor: Colors.gray[100],
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  hintIconContainer: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  hintText: {
    flex: 1,
    fontSize: 13,
    color: Colors.text.secondary,
  },
  hintTextSuccess: {
    color: '#10b981',
    fontWeight: '500',
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: 12,
  },
  selectedRangeContainer: {
    marginTop: 16,
    padding: 16,
    backgroundColor: Colors.gray[50],
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.gray[200],
  },
  selectedRangeLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: Colors.text.secondary,
    marginBottom: 4,
  },
  selectedRangeText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text.primary,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
    padding: 20,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: Colors.gray[200],
    backgroundColor: '#fff',
  },
  actionButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: Colors.gray[100],
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text.primary,
  },
  confirmButton: {
    backgroundColor: '#10b981',
  },
  confirmButtonDisabled: {
    backgroundColor: Colors.gray[300],
    opacity: 0.6,
  },
  confirmButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
});