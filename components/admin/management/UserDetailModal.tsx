import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { AdminUser } from "../../../services/adminUserService";
import { Colors } from "../../../styles/colors";

interface UserDetailModalProps {
  visible: boolean;
  user: AdminUser | null;
  onClose: () => void;
  onEdit: (userId: string) => void;
  onBan: (user: AdminUser) => void;
  onDelete: (user: AdminUser) => void;
}

export default function UserDetailModal({
  visible,
  user,
  onClose,
  onEdit,
  onBan,
  onDelete,
}: UserDetailModalProps) {
  if (!user) return null;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <TouchableOpacity
            style={styles.modalCloseButton}
            onPress={onClose}
          >
            <Ionicons name="close" size={24} color={Colors.text.primary} />
          </TouchableOpacity>
          <Text style={styles.modalTitle}>Chi tiết người dùng</Text>
          <View style={styles.modalHeaderSpacer} />
        </View>

        <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
          {/* User Avatar and Basic Info */}
          <View style={styles.modalUserHeader}>
            <View style={styles.modalUserAvatar}>
              {user.avatarUrl ? (
                <Image
                  source={{ uri: user.avatarUrl }}
                  style={styles.modalAvatar}
                  contentFit="cover"
                />
              ) : (
                <Image
                  source={require("../../../assets/images/default-avatar.png")}
                  style={styles.modalAvatar}
                  contentFit="cover"
                />
              )}
            </View>
            <View style={styles.modalUserInfo}>
              <Text style={styles.modalUserName}>{user.fullName}</Text>
              <Text style={styles.modalUserEmail}>{user.email}</Text>
              <View
                style={[
                  styles.modalStatusBadge,
                  { backgroundColor: user.isActive ? '#10b981' : '#ef4444' }
                ]}
              >
                <Text style={styles.modalStatusText}>
                  {user.isActive ? 'Hoạt động' : 'Bị cấm'}
                </Text>
              </View>
            </View>
          </View>

          {/* User Details */}
          <View style={styles.modalDetailsSection}>
            <Text style={styles.modalSectionTitle}>Thông tin cơ bản</Text>

            <View style={styles.modalDetailRow}>
              <Text style={styles.modalDetailLabel}>Username:</Text>
              <Text style={styles.modalDetailValue}>{user.username}</Text>
            </View>

            <View style={styles.modalDetailRow}>
              <Text style={styles.modalDetailLabel}>Email:</Text>
              <Text style={styles.modalDetailValue}>{user.email}</Text>
            </View>

            <View style={styles.modalDetailRow}>
              <Text style={styles.modalDetailLabel}>Tên đầy đủ:</Text>
              <Text style={styles.modalDetailValue}>{user.fullName}</Text>
            </View>

            <View style={styles.modalDetailRow}>
              <Text style={styles.modalDetailLabel}>Vai trò:</Text>
              <Text style={styles.modalDetailValue}>{user.role}</Text>
            </View>

            <View style={styles.modalDetailRow}>
              <Text style={styles.modalDetailLabel}>Xác thực email:</Text>
              <View style={styles.verificationContainer}>
                <Ionicons
                  name={user.emailVerified ? "checkmark-circle" : "close-circle"}
                  size={20}
                  color={user.emailVerified ? "#10b981" : "#ef4444"}
                />
                <Text
                  style={[
                    styles.verificationText,
                    { color: user.emailVerified ? "#10b981" : "#ef4444" }
                  ]}
                >
                  {user.emailVerified ? "Đã xác thực" : "Chưa xác thực"}
                </Text>
              </View>
            </View>
          </View>

          {/* Statistics */}
          <View style={styles.modalDetailsSection}>
            <Text style={styles.modalSectionTitle}>Thống kê</Text>

            <View style={styles.modalStatsGrid}>
              <View style={styles.modalStatCard}>
                <Ionicons name="people-outline" size={24} color="#6366f1" />
                <Text style={styles.modalStatNumber}>{user.followerCount}</Text>
                <Text style={styles.modalStatLabel}>Người theo dõi</Text>
              </View>

              <View style={styles.modalStatCard}>
                <Ionicons name="person-add-outline" size={24} color="#10b981" />
                <Text style={styles.modalStatNumber}>{user.followingCount}</Text>
                <Text style={styles.modalStatLabel}>Đang theo dõi</Text>
              </View>

              <View style={styles.modalStatCard}>
                <Ionicons name="book-outline" size={24} color="#f59e0b" />
                <Text style={styles.modalStatNumber}>{user.recipeCount}</Text>
                <Text style={styles.modalStatLabel}>Công thức</Text>
              </View>
            </View>
          </View>

          {/* Activity Info */}
          <View style={styles.modalDetailsSection}>
            <Text style={styles.modalSectionTitle}>Hoạt động</Text>

            <View style={styles.modalDetailRow}>
              <Text style={styles.modalDetailLabel}>Tham gia:</Text>
              <Text style={styles.modalDetailValue}>
                {new Date(user.createdAt).toLocaleDateString('vi-VN', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </Text>
            </View>

            <View style={styles.modalDetailRow}>
              <Text style={styles.modalDetailLabel}>Hoạt động cuối:</Text>
              <Text style={styles.modalDetailValue}>
                {new Date(user.lastActive).toLocaleDateString('vi-VN', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </Text>
            </View>
          </View>

          {/* Action Buttons */}
          <View style={styles.modalActions}>
            <TouchableOpacity
              style={[styles.modalActionButton, styles.modalEditButton]}
              onPress={() => {
                onClose();
                onEdit(user.userId);
              }}
            >
              <Ionicons name="create-outline" size={20} color="#fff" />
              <Text style={styles.modalActionButtonText}>Chỉnh sửa</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.modalActionButton,
                user.isActive ? styles.modalBanButton : styles.modalUnbanButton
              ]}
              onPress={() => {
                onClose();
                onBan(user);
              }}
            >
              <Ionicons
                name={user.isActive ? "ban" : "checkmark-circle"}
                size={20}
                color="#fff"
              />
              <Text style={styles.modalActionButtonText}>
                {user.isActive ? 'Cấm' : 'Gỡ cấm'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.modalActionButton, styles.modalDeleteButton]}
              onPress={() => {
                onClose();
                onDelete(user);
              }}
            >
              <Ionicons name="trash-outline" size={20} color="#fff" />
              <Text style={styles.modalActionButtonText}>Xóa</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: "#fff",
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  modalCloseButton: {
    padding: 4,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: Colors.text.primary,
  },
  modalHeaderSpacer: {
    width: 32,
  },
  modalContent: {
    flex: 1,
    paddingHorizontal: 16,
  },
  modalUserHeader: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  modalUserAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#e0e7ff",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 16,
  },
  modalAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  modalUserInfo: {
    flex: 1,
  },
  modalUserName: {
    fontSize: 20,
    fontWeight: "600",
    color: Colors.text.primary,
    marginBottom: 4,
  },
  modalUserEmail: {
    fontSize: 14,
    color: Colors.text.secondary,
    marginBottom: 8,
  },
  modalStatusBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 16,
  },
  modalStatusText: {
    fontSize: 12,
    color: "#fff",
    fontWeight: "600",
  },
  modalDetailsSection: {
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
  },
  modalSectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.text.primary,
    marginBottom: 12,
  },
  modalDetailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
  },
  modalDetailLabel: {
    fontSize: 14,
    color: Colors.text.secondary,
    fontWeight: "500",
  },
  modalDetailValue: {
    fontSize: 14,
    color: Colors.text.primary,
    flex: 1,
    textAlign: "right",
  },
  verificationContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  verificationText: {
    fontSize: 14,
    fontWeight: "500",
  },
  modalStatsGrid: {
    flexDirection: "row",
    gap: 12,
  },
  modalStatCard: {
    flex: 1,
    backgroundColor: "#f8fafc",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  modalStatNumber: {
    fontSize: 20,
    fontWeight: "700",
    color: Colors.text.primary,
    marginTop: 8,
    marginBottom: 4,
  },
  modalStatLabel: {
    fontSize: 12,
    color: Colors.text.secondary,
    textAlign: "center",
  },
  modalActions: {
    flexDirection: "row",
    gap: 12,
    paddingVertical: 20,
  },
  modalActionButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  modalEditButton: {
    backgroundColor: "#3b82f6",
  },
  modalBanButton: {
    backgroundColor: "#ef4444",
  },
  modalUnbanButton: {
    backgroundColor: "#10b981",
  },
  modalDeleteButton: {
    backgroundColor: "#6b7280",
  },
  modalActionButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
});
