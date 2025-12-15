// components/admin/dashboard/content/MediaStats.tsx
import { RecipeContentAnalysisDTO } from "@/types/admin/report.types";
import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, Text, View } from "react-native";

interface MediaStatsProps {
  contentAnalysis: RecipeContentAnalysisDTO;
}

const mediaConfig = [
  {
    icon: "image",
    title: "Hình Ảnh",
    countKey: "recipesWithImage" as keyof RecipeContentAnalysisDTO,
    percentKey: "imagePercentage" as keyof RecipeContentAnalysisDTO,
    color: "#3b82f6",
  },
  {
    icon: "videocam",
    title: "Video",
    countKey: "recipesWithVideo" as keyof RecipeContentAnalysisDTO,
    percentKey: "videoPercentage" as keyof RecipeContentAnalysisDTO,
    color: "#ef4444",
  },
];

export default function MediaStats({ contentAnalysis }: MediaStatsProps) {
  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Ionicons name="images-outline" size={20} color="#ec4899" />
        <Text style={styles.sectionTitle}>Thống Kê Media</Text>
      </View>
      <View style={styles.mediaStatsContainer}>
        {mediaConfig.map((media) => (
          <View key={media.icon} style={styles.mediaStatCard}>
            <View style={styles.mediaStatHeader}>
              <Ionicons name={media.icon as any} size={24} color={media.color} />
              <Text style={styles.mediaStatTitle}>{media.title}</Text>
            </View>
            <Text style={styles.mediaStatCount}>
              {contentAnalysis[media.countKey]}
            </Text>
            <View style={styles.mediaProgressBar}>
              <View
                style={[
                  styles.mediaProgressFill,
                  {
                    width: `${contentAnalysis[media.percentKey]}%`,
                    backgroundColor: media.color,
                  },
                ]}
              />
            </View>
            <Text style={styles.mediaStatPercentage}>
              {(contentAnalysis[media.percentKey] as number).toFixed(1)}%
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
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111827",
  },
  mediaStatsContainer: {
    flexDirection: "row",
    gap: 12,
  },
  mediaStatCard: {
    flex: 1,
    backgroundColor: "#f9fafb",
    borderRadius: 12,
    padding: 16,
    gap: 8,
  },
  mediaStatHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  mediaStatTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#111827",
  },
  mediaStatCount: {
    fontSize: 24,
    fontWeight: "700",
    color: "#111827",
  },
  mediaProgressBar: {
    height: 8,
    backgroundColor: "#e5e7eb",
    borderRadius: 4,
    overflow: "hidden",
  },
  mediaProgressFill: {
    height: "100%",
    borderRadius: 4,
  },
  mediaStatPercentage: {
    fontSize: 12,
    color: "#6b7280",
  },
});