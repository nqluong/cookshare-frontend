import { formatDateForApi } from '@/services/adminStatisticsService';
import { Colors } from '@/styles/colors';
import { DateRangeParams } from '@/types/admin/interaction.types';
import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import {
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';

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

// Helper functions for calendar
const getDaysInMonth = (date: Date): number => {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
};

const getFirstDayOfMonth = (date: Date): number => {
  return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
};

const isSameDay = (date1: Date, date2: Date): boolean => {
  return (
    date1.getDate() === date2.getDate() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getFullYear() === date2.getFullYear()
  );
};

const isDateInRange = (date: Date, startDate: Date | null, endDate: Date | null): boolean => {
  if (!startDate || !endDate) return false;
  return date >= startDate && date <= endDate;
};

const formatMonthYear = (date: Date): string => {
  return date.toLocaleDateString('vi-VN', {
    month: 'long',
    year: 'numeric',
  });
};

export default function DateRangePicker({
  visible,
  onClose,
  onConfirm,
  currentDateRange,
}: DateRangePickerProps) {
  const [selectedRange, setSelectedRange] = useState<DateRangeParams>(currentDateRange);
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());
  const [tempStartDate, setTempStartDate] = useState<Date | null>(
    currentDateRange.startDate ? new Date(currentDateRange.startDate) : null
  );
  const [tempEndDate, setTempEndDate] = useState<Date | null>(
    currentDateRange.endDate ? new Date(currentDateRange.endDate) : null
  );
  const [selectingStart, setSelectingStart] = useState<boolean>(true);

  // Update when currentDateRange changes
  useEffect(() => {
    if (visible) {
      const start = currentDateRange.startDate ? new Date(currentDateRange.startDate) : null;
      const end = currentDateRange.endDate ? new Date(currentDateRange.endDate) : null;
      setSelectedRange(currentDateRange);
      setTempStartDate(start);
      setTempEndDate(end);
      setCurrentMonth(start || new Date());
      setSelectingStart(true);
    }
  }, [visible, currentDateRange]);

  const presetRanges = [
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

  const handlePresetSelect = (preset: typeof presetRanges[0]) => {
    const range = preset.getRange();
    const start = new Date(range.startDate);
    const end = new Date(range.endDate);
    setSelectedRange(range);
    setTempStartDate(start);
    setTempEndDate(end);
    setCurrentMonth(start);
    setSelectingStart(true);
  };

  const handleDateSelect = (day: number) => {
    const selectedDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    selectedDate.setHours(0, 0, 0, 0);
    
    if (selectingStart) {
      // Chọn ngày bắt đầu
      setTempStartDate(selectedDate);
      setTempEndDate(null);
      setSelectingStart(false);
    } else {
      // Chọn ngày kết thúc
      if (tempStartDate && selectedDate < tempStartDate) {
        // Nếu chọn ngày nhỏ hơn ngày bắt đầu, swap chúng
        setTempStartDate(selectedDate);
        setTempEndDate(tempStartDate);
      } else {
        setTempEndDate(selectedDate);
      }
      setSelectingStart(true);
      
      // Update selected range
      const start = selectedDate < tempStartDate! ? selectedDate : tempStartDate!;
      const end = selectedDate < tempStartDate! ? tempStartDate! : selectedDate;
      
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

  // Render calendar
  const renderCalendar = () => {
    const daysInMonth = getDaysInMonth(currentMonth);
    const firstDay = getFirstDayOfMonth(currentMonth);
    const days: (number | null)[] = [];
    
    // Add empty cells for days before the first day of month
    for (let i = 0; i < firstDay; i++) {
      days.push(null);
    }
    
    // Add all days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(day);
    }

    const weekDays = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return (
      <View style={styles.calendarContainer}>
        <View style={styles.calendarHeader}>
          <TouchableOpacity onPress={handlePrevMonth} style={styles.monthNavButton}>
            <Ionicons name="chevron-back" size={20} color={Colors.text.primary} />
          </TouchableOpacity>
          <Text style={styles.monthYearText}>{formatMonthYear(currentMonth)}</Text>
          <TouchableOpacity onPress={handleNextMonth} style={styles.monthNavButton}>
            <Ionicons name="chevron-forward" size={20} color={Colors.text.primary} />
          </TouchableOpacity>
        </View>

        <View style={styles.weekDaysRow}>
          {weekDays.map((day, index) => (
            <View key={index} style={styles.weekDayCell}>
              <Text style={styles.weekDayText}>{day}</Text>
            </View>
          ))}
        </View>

        <View style={styles.calendarGrid}>
          {days.map((day, index) => {
            if (day === null) {
              return <View key={index} style={styles.calendarDay} />;
            }

            const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
            date.setHours(0, 0, 0, 0);
            
            const isToday = isSameDay(date, today);
            const isStart = tempStartDate && isSameDay(date, tempStartDate);
            const isEnd = tempEndDate && isSameDay(date, tempEndDate);
            const isInRange = isDateInRange(date, tempStartDate, tempEndDate);

            return (
              <TouchableOpacity
                key={index}
                style={[
                  styles.calendarDay,
                  isInRange && styles.calendarDayInRange,
                  isStart && styles.calendarDayStart,
                  isEnd && styles.calendarDayEnd,
                ]}
                onPress={() => handleDateSelect(day)}
              >
                <Text
                  style={[
                    styles.calendarDayText,
                    isToday && styles.calendarDayToday,
                    (isStart || isEnd) && styles.calendarDaySelected,
                  ]}
                >
                  {day}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
    );
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Chọn Khoảng Thời Gian</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color={Colors.text.primary} />
            </TouchableOpacity>
          </View>

          <ScrollView 
            style={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContentContainer}
          >
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
                      onPress={() => handlePresetSelect(preset)}
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

            <View style={styles.customRangeContainer}>
              <Text style={styles.sectionTitle}>Chọn ngày trên lịch</Text>
              <View style={styles.calendarWrapper}>
                {renderCalendar()}
              </View>
              <View style={styles.dateSelectionHint}>
                <Text style={styles.hintText}>
                  {selectingStart
                    ? 'Chọn ngày bắt đầu'
                    : tempStartDate
                    ? `Đã chọn: ${formatDateForDisplay(formatDateForApi(tempStartDate))} - Chọn ngày kết thúc`
                    : 'Chọn ngày bắt đầu'}
                </Text>
              </View>
            </View>

            <View style={styles.selectedRangeContainer}>
              <Text style={styles.selectedRangeLabel}>Khoảng thời gian đã chọn:</Text>
              <Text style={styles.selectedRangeText}>
                {formatDateForDisplay(selectedRange.startDate)} -{' '}
                {formatDateForDisplay(selectedRange.endDate)}
              </Text>
            </View>
          </ScrollView>

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
                (!tempStartDate || !tempEndDate) && styles.confirmButtonDisabled
              ]}
              onPress={handleConfirm}
              disabled={!tempStartDate || !tempEndDate}
            >
              <Text style={styles.confirmButtonText}>Xác nhận</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '90%',
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
  presetContainer: {
    marginBottom: 24,
  },
  customRangeContainer: {
    marginBottom: 24,
  },
  calendarWrapper: {
    marginTop: 12,
  },
  calendarContainer: {
    backgroundColor: Colors.gray[50],
    borderRadius: 12,
    padding: 12,
  },
  calendarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  monthNavButton: {
    padding: 8,
  },
  monthYearText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text.primary,
    textTransform: 'capitalize',
  },
  weekDaysRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  weekDayCell: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
  },
  weekDayText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.text.secondary,
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  calendarDay: {
    width: '14.28%',
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  calendarDayInRange: {
    backgroundColor: '#d1fae5',
  },
  calendarDayStart: {
    backgroundColor: '#10b981',
    borderTopLeftRadius: 8,
    borderBottomLeftRadius: 8,
  },
  calendarDayEnd: {
    backgroundColor: '#10b981',
    borderTopRightRadius: 8,
    borderBottomRightRadius: 8,
  },
  calendarDayText: {
    fontSize: 14,
    color: Colors.text.primary,
  },
  calendarDayToday: {
    fontWeight: '700',
    color: '#10b981',
  },
  calendarDaySelected: {
    color: '#fff',
    fontWeight: '700',
  },
  dateSelectionHint: {
    marginTop: 12,
    padding: 12,
    backgroundColor: Colors.gray[100],
    borderRadius: 8,
  },
  hintText: {
    fontSize: 13,
    color: Colors.text.secondary,
    textAlign: 'center',
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