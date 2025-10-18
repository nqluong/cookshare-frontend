import { FollowUser } from "@/types/follow.types";
import { useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import FollowList from "../../components/follow/FollowList";

type FollowType = "followers" | "following";

export default function UserFollowsScreen() {
  const { userId, initialTab } = useLocalSearchParams<{
    userId: string;
    initialTab?: FollowType;
  }>();

  const [activeTab, setActiveTab] = useState<FollowType>(
    initialTab || "followers"
  );

  const [users, setUsers] = useState<FollowUser[]>([]);

  if (!userId) {
    return <Text style={styles.errorText}>Không tìm thấy ID người dùng.</Text>;
  }

  const handleProfileCountUpdate = (change: number) => {
    setUsers((prevProfile) => {
      if (!prevProfile) return prevProfile;

      // Cập nhật followerCount của người đang xem profile
      return {
        ...prevProfile,
        followerCount: (prevProfile.followerCount || 0) + change,
      };
    });
  };

  const TabSelector = () => (
    <View style={styles.tabContainer}>
      <TouchableOpacity
        style={[
          styles.tabButton,
          activeTab === "following" && styles.activeTabButton,
        ]}
        onPress={() => setActiveTab("following")}
      >
        <Text
          style={[
            styles.tabText,
            activeTab === "following" && styles.activeTabText,
          ]}
        >
          Đã follow
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[
          styles.tabButton,
          activeTab === "followers" && styles.activeTabButton,
        ]}
        onPress={() => setActiveTab("followers")}
      >
        <Text
          style={[
            styles.tabText,
            activeTab === "followers" && styles.activeTabText,
          ]}
        >
          Follower
        </Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.innerContainer}>
        <TabSelector />

        <FollowList
          userId={userId}
          type={activeTab}
          onCountUpdate={handleProfileCountUpdate}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  innerContainer: {
    flex: 1,
    marginTop: -40,
  },
  tabContainer: {
    flexDirection: "row",
    justifyContent: "center",
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
    paddingVertical: 6,
  },
  tabButton: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 12,
  },
  activeTabButton: {
    borderBottomWidth: 2,
    borderBottomColor: "#FF385C",
  },
  tabText: {
    fontSize: 18,
    color: "#999",
    fontWeight: "500",
  },
  activeTabText: {
    color: "#FF385C",
    fontWeight: "600",
    fontSize: 19,
  },
  errorText: {
    textAlign: "center",
    marginTop: 50,
    fontSize: 16,
    color: "#333",
  },
});
