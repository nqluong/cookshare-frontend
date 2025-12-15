import { TimeSeriesStatDTO } from "@/types/admin/report.types";
import { Dimensions, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { LineChart } from "react-native-chart-kit";

const { width } = Dimensions.get("window");

interface TimeSeriesChartProps {
  timeSeries: TimeSeriesStatDTO[];
  timeRangeDays: number;
  onTimeRangeChange: (days: number) => void;
}

const timeRangeOptions = [
  { value: 7, label: "7 ngày" },
  { value: 30, label: "30 ngày" },
  { value: 90, label: "3 tháng" },
];

export default function TimeSeriesChart({
  timeSeries,
  timeRangeDays,
  onTimeRangeChange,
}: TimeSeriesChartProps) {
  const chartData = {
    labels: timeSeries.slice(0, 7).map((d) => {
      const date = new Date(d.timestamp);
      return `${date.getDate()}/${date.getMonth() + 1}`;
    }),
    datasets: [
      {
        data: timeSeries.slice(0, 7).map((d) => d.viewCount),
        color: (opacity = 1) => `rgba(16, 185, 129, ${opacity})`,
        strokeWidth: 2,
      },
    ],
  };

  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Xu Hướng Views</Text>
      
      <View style={styles.timeRangeButtons}>
        {timeRangeOptions.map((option) => (
          <TouchableOpacity
            key={option.value}
            style={[
              styles.timeRangeButton,
              timeRangeDays === option.value && styles.timeRangeButtonActive,
            ]}
            onPress={() => onTimeRangeChange(option.value)}
          >
            <Text
              style={[
                styles.timeRangeButtonText,
                timeRangeDays === option.value && styles.timeRangeButtonTextActive,
              ]}
            >
              {option.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {timeSeries.length > 0 && (
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <LineChart
            data={chartData}
            width={Math.max(width - 40, timeSeries.length * 60)}
            height={220}
            chartConfig={{
              backgroundColor: "#ffffff",
              backgroundGradientFrom: "#ffffff",
              backgroundGradientTo: "#ffffff",
              decimalPlaces: 0,
              color: (opacity = 1) => `rgba(16, 185, 129, ${opacity})`,
              labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
              style: { borderRadius: 16 },
              propsForDots: {
                r: "4",
                strokeWidth: "2",
                stroke: "#10b981",
              },
            }}
            bezier
            style={styles.chart}
          />
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    backgroundColor: "#fff",
    marginTop: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 16,
  },
  timeRangeButtons: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 16,
  },
  timeRangeButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: "#f3f4f6",
  },
  timeRangeButtonActive: {
    backgroundColor: "#10b981",
  },
  timeRangeButtonText: {
    fontSize: 13,
    fontWeight: "500",
    color: "#6b7280",
  },
  timeRangeButtonTextActive: {
    color: "#fff",
    fontWeight: "600",
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
});