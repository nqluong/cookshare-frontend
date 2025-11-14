import { Ionicons } from "@expo/vector-icons";
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import CustomAlert from "../../components/ui/CustomAlert";
import { useCustomAlert } from "../../hooks/useCustomAlert";
import { AdminUser, adminUserService } from "../../services/adminUserService";
import { imageUploadService } from "../../services/imageUploadService";
import { userService } from "../../services/userService";
import { Colors } from "../../styles/colors";

export default function AdminEditUserScreen() {
  const { userId } = useLocalSearchParams<{ userId: string }>();
  const { alert, showSuccess, showError, showWarning, hideAlert } = useCustomAlert();

  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [user, setUser] = useState<AdminUser | null>(null);

  const [formData, setFormData] = useState({
    fullName: "",
    username: "",
    email: "",
    bio: "",
    avatarUrl: "",
    role: "USER",
    isActive: true,
    emailVerified: false,
  });

  useEffect(() => {
    loadUserData();
  }, [userId]);

  const loadUserData = async () => {
    try {
      setLoading(true);
      const userData = await adminUserService.getUserById(userId!);
      setUser(userData);
      setFormData({
        fullName: userData.fullName || "",
        username: userData.username || "",
        email: userData.email || "",
        bio: userData.bio || "",
        avatarUrl: userData.avatarUrl || "",
        role: userData.role || "USER",
        isActive: userData.isActive ?? true,
        emailVerified: userData.emailVerified ?? false,
      });
    } catch (error: any) {
      showError("Lỗi", error.message || "Không thể tải thông tin người dùng");
      router.back();
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    // Validation
    if (!formData.fullName.trim()) {
      showError("Lỗi", "Tên đầy đủ không được để trống");
      return;
    }

    if (!formData.username.trim()) {
      showError("Lỗi", "Tên người dùng không được để trống");
      return;
    }

    if (!formData.email.trim()) {
      showError("Lỗi", "Email không được để trống");
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      showError("Lỗi", "Email không hợp lệ");
      return;
    }

    try {
      setIsSaving(true);

      const updateData: any = {
        fullName: formData.fullName,
        username: formData.username,
        email: formData.email,
        bio: formData.bio || null,
        avatarUrl: formData.avatarUrl || null,
        role: formData.role,
        isActive: formData.isActive,
        emailVerified: formData.emailVerified,
      };

      // Check if username changed and exists
      if (formData.username !== user?.username) {
        const usernameExists = await userService.checkUsernameExists(formData.username);
        if (usernameExists) {
          showError("Lỗi", "Tên người dùng đã tồn tại. Vui lòng chọn tên khác.");
          return;
        }
      }

      if (formData.email !== user?.email) {
        const emailExists = await userService.checkEmailExists(formData.email);
        if (emailExists) {
          showError("Lỗi", "Email đã được sử dụng. Vui lòng chọn email khác.");
          return;
        }
      }

      await adminUserService.updateUser(userId!, updateData);

      showSuccess("Thành công", "Cập nhật thông tin người dùng thành công", [
        {
          text: "OK",
          onPress: () => router.back(),
        },
      ]);
    } catch (error: any) {
      showError("Lỗi", error.message || "Không thể cập nhật thông tin");
    } finally {
      setIsSaving(false);
    }
  };

  const handleChangeAvatar = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (status !== 'granted') {
        Alert.alert(
          'Cần quyền truy cập',
          'Vui lòng cấp quyền truy cập thư viện ảnh để chọn ảnh đại diện.'
        );
        return;
      }

      Alert.alert(
        "Thay đổi ảnh đại diện",
        "Chọn phương thức",
        [
          {
            text: "Chọn từ thư viện",
            onPress: () => pickImageFromLibrary(),
          },
          {
            text: "Chụp ảnh mới",
            onPress: () => pickImageFromCamera(),
          },
          {
            text: "Hủy",
            style: "cancel",
          },
        ]
      );
    } catch (error) {
      showError("Lỗi", "Không thể truy cập thư viện ảnh");
    }
  };

  const pickImageFromLibrary = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        await uploadAvatar(result.assets[0].uri);
      }
    } catch (error) {
      showError("Lỗi", "Không thể chọn ảnh");
    }
  };

  const pickImageFromCamera = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();

      if (status !== 'granted') {
        Alert.alert(
          'Cần quyền truy cập',
          'Vui lòng cấp quyền truy cập camera để chụp ảnh.'
        );
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        await uploadAvatar(result.assets[0].uri);
      }
    } catch (error) {
      showError("Lỗi", "Không thể mở camera");
    }
  };

  const uploadAvatar = async (imageUri: string) => {
    try {
      setIsUploadingImage(true);
      setUploadProgress(0);

      const fileName = imageUploadService.generateFileName(imageUri);
      const contentType = imageUploadService.getContentType(imageUri);

      const { uploadUrl, publicUrl } = await userService.requestAvatarUploadUrl(
        userId!,
        fileName,
        contentType
      );

      await imageUploadService.uploadImage(
        uploadUrl,
        imageUri,
        contentType,
        (progress) => {
          setUploadProgress(progress.percentage);
        }
      );

      setFormData({ ...formData, avatarUrl: publicUrl });
      showSuccess("Thành công", "Ảnh đại diện đã được tải lên. Nhấn 'Lưu thay đổi' để hoàn tất.");

    } catch (error: any) {
      showError("Lỗi", error.message || "Không thể upload ảnh");
    } finally {
      setIsUploadingImage(false);
      setUploadProgress(0);
    }
  };

  const handleToggleActive = () => {
    const newStatus = !formData.isActive;
    showWarning(
      newStatus ? "Kích hoạt người dùng" : "Vô hiệu hóa người dùng",
      `Bạn có chắc chắn muốn ${newStatus ? 'kích hoạt' : 'vô hiệu hóa'} người dùng này?`,
      [
        { text: "Hủy", style: "cancel" },
        {
          text: "Xác nhận",
          onPress: () => setFormData({ ...formData, isActive: newStatus })
        }
      ]
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>Đang tải thông tin...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color={Colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Chỉnh sửa người dùng</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Avatar Section */}
        <View style={styles.avatarSection}>
          <View style={styles.avatarContainer}>
            {formData.avatarUrl ? (
              <Image
                source={{ uri: formData.avatarUrl }}
                style={styles.avatar}
                contentFit="cover"
              />
            ) : (
              <View style={[styles.avatar, styles.avatarPlaceholder]}>
                <Ionicons name="person" size={60} color={Colors.text.light} />
              </View>
            )}
            <TouchableOpacity
              style={styles.avatarEditButton}
              onPress={handleChangeAvatar}
            >
              <Ionicons name="camera" size={20} color="#fff" />
            </TouchableOpacity>
          </View>
          {isUploadingImage && (
            <View style={styles.uploadProgressContainer}>
              <ActivityIndicator size="small" color={Colors.primary} />
              <Text style={styles.uploadProgressText}>
                Đang tải lên... {uploadProgress}%
              </Text>
            </View>
          )}
        </View>

        {/* Form Fields */}
        <View style={styles.formSection}>
          {/* Full Name */}
          <View style={styles.fieldContainer}>
            <Text style={styles.fieldLabel}>Tên đầy đủ *</Text>
            <TextInput
              style={styles.fieldInput}
              value={formData.fullName}
              onChangeText={(text) =>
                setFormData({ ...formData, fullName: text })
              }
              placeholder="Nhập tên đầy đủ"
              placeholderTextColor={Colors.text.light}
            />
          </View>

          {/* Username */}
          <View style={styles.fieldContainer}>
            <Text style={styles.fieldLabel}>Tên người dùng *</Text>
            <TextInput
              style={styles.fieldInput}
              value={formData.username}
              onChangeText={(text) =>
                setFormData({ ...formData, username: text })
              }
              placeholder="Nhập tên người dùng"
              autoCapitalize="none"
              placeholderTextColor={Colors.text.light}
            />
          </View>

          {/* Email */}
          <View style={styles.fieldContainer}>
            <Text style={styles.fieldLabel}>Email *</Text>
            <TextInput
              style={styles.fieldInput}
              value={formData.email}
              onChangeText={(text) => setFormData({ ...formData, email: text })}
              placeholder="Nhập email"
              keyboardType="email-address"
              autoCapitalize="none"
              placeholderTextColor={Colors.text.light}
            />
          </View>

          {/* Bio */}
          <View style={styles.fieldContainer}>
            <Text style={styles.fieldLabel}>Giới thiệu</Text>
            <TextInput
              style={[styles.fieldInput, styles.bioInput]}
              value={formData.bio || ""}
              onChangeText={(text) => setFormData({ ...formData, bio: text })}
              placeholder="Viết vài dòng về người dùng..."
              multiline
              numberOfLines={4}
              textAlignVertical="top"
              placeholderTextColor={Colors.text.light}
            />
          </View>

          {/* Admin Controls */}
          <View style={styles.adminSection}>
            <Text style={styles.adminSectionTitle}>Quyền quản trị</Text>

            {/* Role */}
            <View style={styles.fieldContainer}>
              <Text style={styles.fieldLabel}>Vai trò</Text>
              <View style={styles.roleContainer}>
                <TouchableOpacity
                  style={[
                    styles.roleButton,
                    formData.role === "USER" && styles.roleButtonActive
                  ]}
                  onPress={() => setFormData({ ...formData, role: "USER" })}
                >
                  <Text style={[
                    styles.roleButtonText,
                    formData.role === "USER" && styles.roleButtonTextActive
                  ]}>
                    Người dùng
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.roleButton,
                    formData.role === "ADMIN" && styles.roleButtonActive
                  ]}
                  onPress={() => setFormData({ ...formData, role: "ADMIN" })}
                >
                  <Text style={[
                    styles.roleButtonText,
                    formData.role === "ADMIN" && styles.roleButtonTextActive
                  ]}>
                    Quản trị viên
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Active Status */}
            <View style={styles.switchContainer}>
              <View style={styles.switchLabel}>
                <Ionicons
                  name={formData.isActive ? "checkmark-circle" : "close-circle"}
                  size={24}
                  color={formData.isActive ? "#10b981" : "#ef4444"}
                />
                <Text style={styles.switchLabelText}>
                  Trạng thái: {formData.isActive ? "Hoạt động" : "Bị cấm"}
                </Text>
              </View>
              <TouchableOpacity
                style={[
                  styles.switchButton,
                  formData.isActive ? styles.switchButtonActive : styles.switchButtonInactive
                ]}
                onPress={handleToggleActive}
              >
                <Text style={styles.switchButtonText}>
                  {formData.isActive ? "Vô hiệu hóa" : "Kích hoạt"}
                </Text>
              </TouchableOpacity>
            </View>

            {/* Email Verified */}
            <View style={styles.switchContainer}>
              <View style={styles.switchLabel}>
                <Ionicons
                  name={formData.emailVerified ? "shield-checkmark" : "shield-outline"}
                  size={24}
                  color={formData.emailVerified ? "#10b981" : "#6b7280"}
                />
                <Text style={styles.switchLabelText}>
                  Email: {formData.emailVerified ? "Đã xác thực" : "Chưa xác thực"}
                </Text>
              </View>
              <TouchableOpacity
                style={[
                  styles.switchButton,
                  formData.emailVerified ? styles.switchButtonInactive : styles.switchButtonActive
                ]}
                onPress={() => setFormData({ ...formData, emailVerified: !formData.emailVerified })}
              >
                <Text style={styles.switchButtonText}>
                  {formData.emailVerified ? "Hủy xác thực" : "Xác thực"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* User Stats (Read-only) */}
          {user && (
            <View style={styles.statsSection}>
              <Text style={styles.adminSectionTitle}>Thống kê</Text>
              <View style={styles.statsGrid}>
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>{user.followerCount || 0}</Text>
                  <Text style={styles.statLabel}>Người theo dõi</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>{user.followingCount || 0}</Text>
                  <Text style={styles.statLabel}>Đang theo dõi</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>{user.recipeCount || 0}</Text>
                  <Text style={styles.statLabel}>Công thức</Text>
                </View>
              </View>
            </View>
          )}
        </View>

        {/* Save Button */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.saveButton, isSaving && styles.saveButtonDisabled]}
            onPress={handleSave}
            disabled={isSaving}
          >
            {isSaving ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Ionicons name="checkmark-circle" size={20} color="#fff" />
                <Text style={styles.saveButtonText}>Lưu thay đổi</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>

      <CustomAlert
        visible={alert.visible}
        title={alert.title}
        message={alert.message}
        type={alert.type}
        buttons={alert.buttons}
        onClose={hideAlert}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: Colors.text.secondary,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray[200],
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: Colors.text.primary,
  },
  headerSpacer: {
    width: 40,
  },
  content: {
    flex: 1,
  },
  avatarSection: {
    alignItems: "center",
    paddingVertical: 24,
    backgroundColor: "#fff",
  },
  avatarContainer: {
    position: "relative",
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  avatarPlaceholder: {
    backgroundColor: Colors.gray[100],
    alignItems: "center",
    justifyContent: "center",
  },
  avatarEditButton: {
    position: "absolute",
    right: 0,
    bottom: 0,
    backgroundColor: Colors.primary,
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 3,
    borderColor: "#fff",
  },
  uploadProgressContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 12,
    gap: 8,
  },
  uploadProgressText: {
    fontSize: 14,
    color: Colors.text.secondary,
    fontWeight: "500",
  },
  formSection: {
    padding: 16,
  },
  fieldContainer: {
    marginBottom: 20,
  },
  fieldLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.text.primary,
    marginBottom: 8,
  },
  fieldInput: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: Colors.gray[300],
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: Colors.text.primary,
  },
  bioInput: {
    height: 100,
    paddingTop: 12,
  },
  adminSection: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginTop: 8,
    marginBottom: 16,
  },
  adminSectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.text.primary,
    marginBottom: 16,
  },
  roleContainer: {
    flexDirection: "row",
    gap: 12,
  },
  roleButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: Colors.gray[300],
    backgroundColor: "#fff",
    alignItems: "center",
  },
  roleButtonActive: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primary + "10",
  },
  roleButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.text.secondary,
  },
  roleButtonTextActive: {
    color: Colors.primary,
  },
  switchContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.gray[100],
    marginTop: 12,
  },
  switchLabel: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flex: 1,
  },
  switchLabelText: {
    fontSize: 14,
    fontWeight: "500",
    color: Colors.text.primary,
  },
  switchButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
  },
  switchButtonActive: {
    backgroundColor: Colors.primary,
  },
  switchButtonInactive: {
    backgroundColor: "#6b7280",
  },
  switchButtonText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
  },
  statsSection: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
  statItem: {
    alignItems: "center",
  },
  statValue: {
    fontSize: 24,
    fontWeight: "700",
    color: Colors.text.primary,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: Colors.text.secondary,
  },
  buttonContainer: {
    padding: 16,
    paddingBottom: 32,
  },
  saveButton: {
    backgroundColor: Colors.primary,
    borderRadius: 12,
    paddingVertical: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});
