import { Colors } from '@/styles/colors';
import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface CalendarGridProps {
  currentMonth: Date;
  tempStartDate: Date | null;
  tempEndDate: Date | null;
  onDateSelect: (day: number) => void;
  onPrevMonth: () => void;
  onNextMonth: () => void;
}

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

const isDateInRange = (
  date: Date,
  startDate: Date | null,
  endDate: Date | null
): boolean => {
  if (!startDate || !endDate) return false;
  return date >= startDate && date <= endDate;
};

const formatMonthYear = (date: Date): string => {
  return date.toLocaleDateString('vi-VN', {
    month: 'long',
    year: 'numeric',
  });
};

export default function CalendarGrid({
  currentMonth,
  tempStartDate,
  tempEndDate,
  onDateSelect,
  onPrevMonth,
  onNextMonth,
}: CalendarGridProps) {
  // Đảm bảo currentMonth luôn hợp lệ
  const safeCurrentMonth = currentMonth && !isNaN(currentMonth.getTime()) 
    ? currentMonth 
    : new Date();
    
  const daysInMonth = getDaysInMonth(safeCurrentMonth);
  const firstDay = getFirstDayOfMonth(safeCurrentMonth);
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
      {/* Header with month navigation */}
      <View style={styles.calendarHeader}>
        <TouchableOpacity onPress={onPrevMonth} style={styles.monthNavButton}>
          <Ionicons name="chevron-back" size={20} color={Colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.monthYearText}>{formatMonthYear(safeCurrentMonth)}</Text>
        <TouchableOpacity onPress={onNextMonth} style={styles.monthNavButton}>
          <Ionicons name="chevron-forward" size={20} color={Colors.text.primary} />
        </TouchableOpacity>
      </View>

      {/* Week days header */}
      <View style={styles.weekDaysRow}>
        {weekDays.map((day, index) => (
          <View key={index} style={styles.weekDayCell}>
            <Text style={styles.weekDayText}>{day}</Text>
          </View>
        ))}
      </View>

      {/* Calendar grid */}
      <View style={styles.calendarGrid}>
        {days.map((day, index) => {
          if (day === null) {
            return <View key={`empty-${index}`} style={styles.calendarDay} />;
          }

          const date = new Date(
            safeCurrentMonth.getFullYear(),
            safeCurrentMonth.getMonth(),
            day
          );
          date.setHours(0, 0, 0, 0);

          const isToday = isSameDay(date, today);
          const isStart = tempStartDate && isSameDay(date, tempStartDate);
          const isEnd = tempEndDate && isSameDay(date, tempEndDate);
          const isInRange = isDateInRange(date, tempStartDate, tempEndDate);
          const isBothSame = isStart && isEnd;

          return (
            <TouchableOpacity
              key={`day-${index}`}
              style={[
                styles.calendarDay,
                isInRange && !isBothSame && styles.calendarDayInRange,
                (isStart || isBothSame) && styles.calendarDayStart,
                (isEnd || isBothSame) && styles.calendarDayEnd,
                isBothSame && styles.calendarDaySingle,
              ]}
              onPress={() => onDateSelect(day)}
              activeOpacity={0.7}
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
}

const styles = StyleSheet.create({
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
  calendarDaySingle: {
    backgroundColor: '#10b981',
    borderRadius: 8,
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
});