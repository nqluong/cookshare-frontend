// components/admin/management/UserItem.tsx
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { AdminUser } from "../../../services/adminUserService";
import { Colors } from "../../../styles/colors";

interface UserItemProps {
  user: AdminUser;
  onView: (user: AdminUser) => void;
  onEdit: (userId: string) => void;
  onBan: (user: AdminUser) => void;
  onDelete: (user: AdminUser) => void;
}

export default function UserItem({
  user,
  onView,
  onEdit,
  onBan,
  onDelete,
}: UserItemProps) {
  return (
    <View style={styles.userItem}>
      <View style={styles.userAvatar}>
        {user.avatarUrl ? (
          <Image
            source={{ uri: user.avatarUrl }}
            style={styles.avatar}
            contentFit="cover"
          />
        ) : (
          <Image
            source={require("../../../assets/images/default-avatar.png")}
            style={styles.avatar}
            contentFit="cover"
          />
        )}
      </View>

      <View style={styles.userInfo}>
        <View style={styles.userNameContainer}>
          <Text style={styles.userName}>{user.fullName}</Text>
        </View>
        <View style={styles.userStats}>
          <View style={styles.statItem}>
            <Ionicons name="people-outline" size={16} color={Colors.text.secondary} />
            <Text style={styles.statText}>{user.followerCount}</Text>
          </View>
          <View style={styles.statItem}>
            <Ionicons name="book-outline" size={16} color={Colors.text.secondary} />
            <Text style={styles.statText}>{user.recipeCount}</Text>
          </View>
        </View>
        <View
          style={[
            styles.statusBadge,
            { backgroundColor: user.isActive ? '#10b981' : '#ef4444' }
          ]}
        >
          <Text style={styles.statusText}>
            {user.isActive ? 'Hoạt động' : 'Bị cấm'}
          </Text>
        </View>
      </View>

      <View style={styles.userActions}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => onView(user)}
        >
          <Ionicons name="eye-outline" size={20} color={Colors.text.secondary} />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => onEdit(user.userId)}
        >
          <Ionicons name="create-outline" size={20} color={Colors.text.secondary} />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => onBan(user)}
        >
          <Ionicons
            name={user.isActive ? "ban" : "checkmark-circle"}
            size={20}
            color={user.isActive ? "#ef4444" : "#10b981"}
          />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => onDelete(user)}
        >
          <Ionicons name="trash-outline" size={20} color="#ef4444" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  userItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  userAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#e0e7ff",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  userInfo: {
    flex: 1,
  },
  userNameContainer: {
    marginBottom: 4,
  },
  userName: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.text.primary,
    marginBottom: 4,
  },
  userStats: {
    flexDirection: "row",
    gap: 16,
    marginTop: 4,
  },
  statItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  statText: {
    fontSize: 12,
    color: Colors.text.secondary,
    fontWeight: "500",
  },
  statusBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    marginTop: 4,
  },
  statusText: {
    fontSize: 12,
    color: "#fff",
    fontWeight: "600",
  },
  userActions: {
    flexDirection: "row",
    gap: 12,
  },
  actionButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.gray[100],
    alignItems: "center",
    justifyContent: "center",
  },
});
