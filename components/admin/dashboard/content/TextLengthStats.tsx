// components/admin/dashboard/content/TextLengthStats.tsx
import { RecipeContentAnalysisDTO } from "@/types/admin/report.types";
import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, Text, View } from "react-native";

interface TextLengthStatsProps {
  contentAnalysis: RecipeContentAnalysisDTO;
}

const textLengthConfig = [
  {
    icon: "document-text",
    label: "Mô tả trung bình",
    key: "avgDescriptionLength" as keyof RecipeContentAnalysisDTO,
    color: "#10b981",
  },
  {
    icon: "list",
    label: "Hướng dẫn trung bình",
    key: "avgInstructionLength" as keyof RecipeContentAnalysisDTO,
    color: "#3b82f6",
  },
];

export default function TextLengthStats({ contentAnalysis }: TextLengthStatsProps) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>📏 Độ Dài Nội Dung</Text>
      <View style={styles.textLengthContainer}>
        {textLengthConfig.map((config) => (
          <View key={config.key} style={styles.textLengthItem}>
            <Ionicons name={config.icon as any} size={20} color={config.color} />
            <Text style={styles.textLengthLabel}>{config.label}</Text>
            <Text style={styles.textLengthValue}>
              {contentAnalysis[config.key]} ký tự
            </Text>
          </View>
        ))}
      </View>
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
  textLengthContainer: {
    gap: 12,
  },
  textLengthItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f9fafb",
    borderRadius: 12,
    padding: 12,
    gap: 12,
  },
  textLengthLabel: {
    flex: 1,
    fontSize: 14,
    color: "#374151",
    fontWeight: "500",
  },
  textLengthValue: {
    fontSize: 14,
    fontWeight: "700",
    color: "#10b981",
  },
});