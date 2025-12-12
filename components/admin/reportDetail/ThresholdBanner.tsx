import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, Text, View } from "react-native";

interface ThresholdBannerProps {
  weightedScore: number;
  threshold: number;
}

export default function ThresholdBanner({ weightedScore, threshold }: ThresholdBannerProps) {
  return (
    <View style={styles.thresholdBanner}>
      <Ionicons name="warning" size={20} color="#FFFFFF" />
      <Text style={styles.thresholdText}>
        Vượt ngưỡng ({weightedScore.toFixed(1)} / {threshold})
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  thresholdBanner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 12,
    gap: 8,
    backgroundColor: "#DC2626",
  },
  thresholdText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#FFFFFF",
  },
});
