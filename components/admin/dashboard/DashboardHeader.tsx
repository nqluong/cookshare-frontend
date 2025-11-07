import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface DashboardHeaderProps {
  onExitAdmin: () => void;
}

export default function DashboardHeader({ onExitAdmin }: DashboardHeaderProps) {
  return (
    <View style={styles.header}>
      <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
        <Ionicons name="arrow-back" size={24} color="#fff" />
      </TouchableOpacity>
      <Text style={styles.headerTitle}>Admin Dashboard</Text>
      <View style={styles.headerActions}>
        <TouchableOpacity
          style={styles.menuButton}
          onPress={() => router.push("/admin/menu" as any)}
        >
          <Ionicons name="grid-outline" size={24} color="#fff" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.exitButton} onPress={onExitAdmin}>
          <Ionicons name="exit-outline" size={24} color="#fff" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: "#10b981",
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#fff",
  },
  headerActions: {
    flexDirection: "row",
    gap: 12,
  },
  menuButton: {
    padding: 4,
  },
  exitButton: {
    padding: 4,
  },
});