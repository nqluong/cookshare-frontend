import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { FollowUser } from "../../types/follow.types";

interface FollowItemProps {
  user: FollowUser;
  onPress: () => void;
  onFollowPress: () => void;
  showFollowButton?: boolean;
  isFollowLoading: boolean;
}

export default function FollowItem({
  user,
  onPress,
  onFollowPress,
  showFollowButton = true,
  isFollowLoading,
}: FollowItemProps) {
  return (
    <TouchableOpacity style={styles.container} onPress={onPress}>
      <View style={styles.leftContent}>
        {user.avatarUrl ? (
          <Image source={{ uri: user.avatarUrl }} style={styles.avatar} />
        ) : (
          <View style={[styles.avatar, styles.avatarPlaceholder]}>
            <Ionicons name="person" size={24} color="#999" />
          </View>
        )}

        <View style={styles.userInfo}>
          <Text style={styles.fullName} numberOfLines={1}>
            {user.fullName}
          </Text>
          <Text style={styles.username} numberOfLines={1}>
            @{user.username}
          </Text>
        </View>
      </View>

      {showFollowButton && (
        <TouchableOpacity
          style={[styles.followButton, user.isFollowing && styles.followingButton]}
          onPress={onFollowPress}
          disabled={isFollowLoading}
        >
          <Text
            style={[
              styles.followButtonText,
              user.isFollowing && styles.followingButtonText,
            ]}
          >
            {user.isFollowing ? "Đã follow" : "Follow"}
          </Text>
        </TouchableOpacity>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 12,
    backgroundColor: "#fff",
  },
  leftContent: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    marginRight: 12,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#f0f0f0",
  },
  avatarPlaceholder: {
    justifyContent: "center",
    alignItems: "center",
  },
  userInfo: {
    flex: 1,
    marginLeft: 12,
  },
  fullName: {
    fontSize: 15,
    fontWeight: "600",
    color: "#000",
  },
  username: {
    fontSize: 13,
    color: "#666",
    marginTop: 2,
  },
  bio: {
    fontSize: 12,
    color: "#999",
    marginTop: 4,
  },
  followButton: {
    paddingHorizontal: 24,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: "#FF385C",
    // Thiết lập chiều rộng cố định để ActivityIndicator không làm nhảy nút
    minWidth: 90, 
    alignItems: 'center', 
    justifyContent: 'center',
  },
  followingButton: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  followButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#fff",
  },
  followingButtonText: {
    color: "#000",
  },
});
