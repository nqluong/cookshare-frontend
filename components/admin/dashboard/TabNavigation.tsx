import { Ionicons } from "@expo/vector-icons";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";

type TabType = "overview" | "performance" | "content" | "authors";

interface TabNavigationProps {
  selectedTab: TabType;
  onTabChange: (tab: TabType) => void;
}

const tabs = [
  { id: "overview" as TabType, icon: "bar-chart", label: "Tổng Quan" },
  { id: "performance" as TabType, icon: "trending-up", label: "Hiệu Suất" },
  { id: "content" as TabType, icon: "document-text", label: "Nội Dung" },
  { id: "authors" as TabType, icon: "people", label: "Tác Giả" },
];

export default function TabNavigation({ selectedTab, onTabChange }: TabNavigationProps) {
  return (
    <View style={styles.tabNavigation}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {tabs.map((tab) => (
          <TouchableOpacity
            key={tab.id}
            style={[styles.navTab, selectedTab === tab.id && styles.navTabActive]}
            onPress={() => onTabChange(tab.id)}
          >
            <Ionicons
              name={tab.icon as any}
              size={20}
              color={selectedTab === tab.id ? "#10b981" : "#6b7280"}
            />
            <Text
              style={[
                styles.navTabText,
                selectedTab === tab.id && styles.navTabTextActive,
              ]}
            >
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  tabNavigation: {
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
    paddingVertical: 8,
  },
  navTab: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginHorizontal: 4,
    borderRadius: 8,
  },
  navTabActive: {
    backgroundColor: "#ecfdf5",
  },
  navTabText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#6b7280",
  },
  navTabTextActive: {
    color: "#10b981",
    fontWeight: "600",
  },
});