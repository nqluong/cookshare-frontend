// components/admin/management/UserItem.tsx
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { moderateScale, scale, verticalScale } from "react-native-size-matters";
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
      {/* Top Row: Avatar + Info */}
      <View style={styles.topRow}>
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
            <Text style={styles.userName} numberOfLines={1}>{user.fullName}</Text>
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
          <View style={styles.userStats}>
            <View style={styles.statItem}>
              <Ionicons name="people-outline" size={scale(14)} color={Colors.text.secondary} />
              <Text style={styles.statText}>{user.followerCount}</Text>
            </View>
            <View style={styles.statItem}>
              <Ionicons name="book-outline" size={scale(14)} color={Colors.text.secondary} />
              <Text style={styles.statText}>{user.recipeCount}</Text>
            </View>
          </View>
        </View>
      </View>

      {/* Bottom Row: Actions */}
      <View style={styles.userActions}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => onView(user)}
        >
          <Ionicons name="eye-outline" size={scale(18)} color={Colors.text.secondary} />
          <Text style={styles.actionLabel}>Xem</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => onEdit(user.userId)}
        >
          <Ionicons name="create-outline" size={scale(18)} color={Colors.text.secondary} />
          <Text style={styles.actionLabel}>Sửa</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: user.isActive ? '#fef2f2' : '#ecfdf5' }]}
          onPress={() => onBan(user)}
        >
          <Ionicons
            name={user.isActive ? "ban" : "checkmark-circle"}
            size={scale(18)}
            color={user.isActive ? "#ef4444" : "#10b981"}
          />
          <Text style={[styles.actionLabel, { color: user.isActive ? "#ef4444" : "#10b981" }]}>
            {user.isActive ? 'Cấm' : 'Mở'}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: '#fef2f2' }]}
          onPress={() => onDelete(user)}
        >
          <Ionicons name="trash-outline" size={scale(18)} color="#ef4444" />
          <Text style={[styles.actionLabel, { color: "#ef4444" }]}>Xóa</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  userItem: {
    backgroundColor: "#fff",
    borderRadius: scale(16),
    padding: scale(14),
    marginBottom: verticalScale(10),
    shadowColor: "#000",
    shadowOffset: { width: 0, height: verticalScale(1) },
    shadowOpacity: 0.05,
    shadowRadius: scale(3),
    elevation: 2,
  },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  userAvatar: {
    width: scale(44),
    height: scale(44),
    borderRadius: scale(22),
    backgroundColor: "#e0e7ff",
    alignItems: "center",
    justifyContent: "center",
    marginRight: scale(12),
  },
  avatar: {
    width: scale(44),
    height: scale(44),
    borderRadius: scale(22),
  },
  userInfo: {
    flex: 1,
  },
  userNameContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: scale(8),
    marginBottom: verticalScale(4),
  },
  userName: {
    fontSize: moderateScale(15),
    fontWeight: "600",
    color: Colors.text.primary,
    flex: 1,
  },
  userStats: {
    flexDirection: "row",
    gap: scale(12),
  },
  statItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: scale(4),
  },
  statText: {
    fontSize: moderateScale(12),
    color: Colors.text.secondary,
    fontWeight: "500",
  },
  statusBadge: {
    paddingHorizontal: scale(8),
    paddingVertical: verticalScale(2),
    borderRadius: scale(12),
  },
  statusText: {
    fontSize: moderateScale(10),
    color: "#fff",
    fontWeight: "600",
  },
  userActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: verticalScale(12),
    paddingTop: verticalScale(12),
    borderTopWidth: 1,
    borderTopColor: Colors.gray[100],
    gap: scale(8),
  },
  actionButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: verticalScale(8),
    borderRadius: scale(8),
    backgroundColor: Colors.gray[50],
    gap: scale(4),
  },
  actionLabel: {
    fontSize: moderateScale(11),
    fontWeight: "500",
    color: Colors.text.secondary,
  },
});
