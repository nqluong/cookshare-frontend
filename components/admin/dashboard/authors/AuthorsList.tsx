// components/admin/dashboard/authors/AuthorsList.tsx
import { TopAuthorDTO } from "@/types/admin/report.types";
import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, Text, View } from "react-native";

interface AuthorsListProps {
  topAuthors: TopAuthorDTO[];
}

const authorStatsConfig = [
  { icon: "document-text", key: "recipeCount", label: "công thức", color: "#10b981" },
  { icon: "eye", key: "totalViews", label: "views", color: "#6b7280" },
  { icon: "heart", key: "totalLikes", label: "likes", color: "#ef4444" },
  { icon: "star", key: "avgRating", label: "⭐", color: "#f59e0b", isDecimal: true },
];

export default function AuthorsList({ topAuthors }: AuthorsListProps) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>👨‍🍳 Top Tác Giả</Text>
      {topAuthors.map((author, index) => (
        <View key={author.userId} style={styles.authorCard}>
          <View style={styles.authorRank}>
            <Text style={styles.authorRankText}>#{index + 1}</Text>
          </View>
          <View style={styles.authorContent}>
            <Text style={styles.authorName}>{author.authorName}</Text>
            <Text style={styles.authorUsername}>@{author.username}</Text>
            <View style={styles.authorStats}>
              {authorStatsConfig.map((stat) => {
                const value = author[stat.key as keyof TopAuthorDTO];
                const displayValue = stat.isDecimal && typeof value === 'number'
                  ? value.toFixed(1)
                  : value;

                return (
                  <View key={stat.key} style={styles.authorStat}>
                    <Ionicons name={stat.icon as any} size={14} color={stat.color} />
                    <Text style={styles.authorStatText}>
                      {displayValue} {stat.label}
                    </Text>
                  </View>
                );
              })}
            </View>
          </View>
        </View>
      ))}
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
  authorCard: {
    flexDirection: "row",
    backgroundColor: "#f9fafb",
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
  },
  authorRank: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#10b981",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  authorRankText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#fff",
  },
  authorContent: {
    flex: 1,
    gap: 6,
  },
  authorName: {
    fontSize: 15,
    fontWeight: "600",
    color: "#111827",
  },
  authorUsername: {
    fontSize: 13,
    color: "#6b7280",
  },
  authorStats: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginTop: 4,
  },
  authorStat: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  authorStatText: {
    fontSize: 12,
    color: "#6b7280",
  },
});