import { Ionicons } from "@expo/vector-icons";
import { router, useFocusEffect } from "expo-router";
import React, { useCallback, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Image,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import * as ImagePicker from 'expo-image-picker';
import { useAuth } from "../../context/AuthContext";
import { userService } from "../../services/userService";
import { imageUploadService } from "../../services/imageUploadService";
import { Colors } from "../../styles/colors";

export default function ProfileDetailsScreen() {
    const { user, updateAuthUser } = useAuth();
    const [isEditing, setIsEditing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [isUploadingImage, setIsUploadingImage] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [lastSyncedAvatarUrl, setLastSyncedAvatarUrl] = useState<string | null>(null);

    const [formData, setFormData] = useState({
        fullName: user?.fullName || "",
        username: user?.username || "",
        email: user?.email || "",
        bio: user?.bio || "",
        avatarUrl: user?.avatarUrl || "",
    });

    // Chỉ sync formData khi avatar thực sự thay đổi
    useFocusEffect(
        useCallback(() => {
            // Kiểm tra nếu avatar trong context khác với lần sync trước
            if (user?.avatarUrl !== lastSyncedAvatarUrl) {
                console.log('🔄 ProfileDetailsScreen - avatar changed, syncing data');
                console.log('👤 User avatar URL:', user?.avatarUrl);
                if (user) {
                    setFormData({
                        fullName: user.fullName || "",
                        username: user.username || "",
                        email: user.email || "",
                        bio: user.bio || "",
                        avatarUrl: user.avatarUrl || "",
                    });
                    setLastSyncedAvatarUrl(user.avatarUrl || null);
                }
            }
        }, [user?.avatarUrl, lastSyncedAvatarUrl])
    );

    const handleSave = async () => {
        if (!user?.userId) {
            Alert.alert("Lỗi", "Không tìm thấy thông tin người dùng");
            return;
        }

        // Log userId for debugging
        console.log("Current user ID:", user.userId);
        console.log("User object:", JSON.stringify(user, null, 2));

        // Validation
        if (!formData.fullName.trim()) {
            Alert.alert("Lỗi", "Tên đầy đủ không được để trống");
            return;
        }

        if (!formData.username.trim()) {
            Alert.alert("Lỗi", "Tên người dùng không được để trống");
            return;
        }

        if (!formData.email.trim()) {
            Alert.alert("Lỗi", "Email không được để trống");
            return;
        }

        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData.email)) {
            Alert.alert("Lỗi", "Email không hợp lệ");
            return;
        }

        try {
            setIsSaving(true);

            // Prepare update data (only send changed fields)
            const updateData: any = {};
            if (formData.fullName !== user.fullName) updateData.fullName = formData.fullName;
            if (formData.username !== user.username) updateData.username = formData.username;
            if (formData.email !== user.email) updateData.email = formData.email;
            if (formData.bio !== user.bio) updateData.bio = formData.bio || null;
            if (formData.avatarUrl !== user.avatarUrl) updateData.avatarUrl = formData.avatarUrl || null;

            // If nothing changed
            if (Object.keys(updateData).length === 0) {
                Alert.alert("Thông báo", "Không có thay đổi nào được thực hiện");
                setIsEditing(false);
                return;
            }

            // Check if username already exists (if username changed)
            if (updateData.username) {
                const usernameExists = await userService.checkUsernameExists(formData.username);
                if (usernameExists) {
                    Alert.alert("Lỗi", "Tên người dùng đã tồn tại. Vui lòng chọn tên khác.");
                    return;
                }
            }

            // Check if email already exists (if email changed)
            if (updateData.email) {
                const emailExists = await userService.checkEmailExists(formData.email);
                if (emailExists) {
                    Alert.alert("Lỗi", "Email đã được sử dụng. Vui lòng chọn email khác.");
                    return;
                }
            }

            // Call API to update profile using the new endpoint
            const updatedUser = await userService.updateUserProfile(user.userId, updateData);

            // Update local auth context
            updateAuthUser(updatedUser);

            Alert.alert("Thành công", "Cập nhật thông tin thành công", [
                {
                    text: "OK",
                    onPress: () => setIsEditing(false),
                },
            ]);
        } catch (error: any) {
            console.error("Update profile error:", error);
            Alert.alert("Lỗi", error.message || "Không thể cập nhật thông tin");
        } finally {
            setIsSaving(false);
        }
    };

    const handleCancel = () => {
        // Reset form về dữ liệu user ban đầu
        setFormData({
            fullName: user?.fullName || "",
            username: user?.username || "",
            email: user?.email || "",
            bio: user?.bio || "",
            avatarUrl: user?.avatarUrl || "",
        });
        setIsEditing(false);
    };

    const handleChangeAvatar = async () => {
        try {
            // Yêu cầu quyền truy cập
            const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

            if (status !== 'granted') {
                Alert.alert(
                    'Cần quyền truy cập',
                    'Vui lòng cấp quyền truy cập thư viện ảnh để chọn ảnh đại diện.'
                );
                return;
            }

            // Hiển thị tùy chọn
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
            console.error('❌ Lỗi yêu cầu quyền truy cập:', error);
            Alert.alert("Lỗi", "Không thể truy cập thư viện ảnh");
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
            console.error('❌ Lỗi chọn ảnh:', error);
            Alert.alert("Lỗi", "Không thể chọn ảnh");
        }
    };

    const pickImageFromCamera = async () => {
        try {
            // Yêu cầu quyền camera
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
            console.error('❌ Lỗi camera:', error);
            Alert.alert("Lỗi", "Không thể mở camera");
        }
    };

    const uploadAvatar = async (imageUri: string) => {
        if (!user?.userId) {
            Alert.alert("Lỗi", "Không tìm thấy thông tin người dùng");
            return;
        }

        try {
            setIsUploadingImage(true);
            setUploadProgress(0);

            // Bước 1: Tạo tên file duy nhất
            const fileName = imageUploadService.generateFileName(imageUri);
            const contentType = imageUploadService.getContentType(imageUri);

            console.log('📤 Bắt đầu quy trình upload...');
            console.log('📝 Tên file:', fileName);
            console.log('🎨 Content type:', contentType);

            // Bước 2: Yêu cầu signed URL từ backend
            console.log('🔐 Yêu cầu signed URL từ backend...');
            const { uploadUrl, publicUrl } = await userService.requestAvatarUploadUrl(
                user.userId,
                fileName,
                contentType
            );

            console.log('✅ Đã nhận signed URL');
            console.log('📤 URL upload:', uploadUrl.substring(0, 50) + '...');
            console.log('🌐 URL công khai:', publicUrl);

            // Bước 3: Upload ảnh lên Firebase sử dụng signed URL
            console.log('☁️ Đang upload lên Firebase...');
            await imageUploadService.uploadImage(
                uploadUrl,
                imageUri,
                contentType,
                (progress) => {
                    setUploadProgress(progress.percentage);
                }
            );

            console.log('✅ Upload hoàn tất');

            // Bước 4: Cập nhật form data với avatar URL mới
            setFormData({ ...formData, avatarUrl: publicUrl });

            // Bước 5: Tự động lưu nếu đang ở chế độ chỉnh sửa
            if (isEditing) {
                Alert.alert(
                    "Thành công",
                    "Ảnh đại diện đã được tải lên. Nhấn 'Lưu thay đổi' để hoàn tất."
                );
            } else {
                // Nếu không ở chế độ chỉnh sửa, lưu ngay lập tức
                await updateAvatarOnly(publicUrl);
            }

        } catch (error: any) {
            console.error('❌ Lỗi upload avatar:', error);
            Alert.alert("Lỗi", error.message || "Không thể upload ảnh");
        } finally {
            setIsUploadingImage(false);
            setUploadProgress(0);
        }
    };

    const updateAvatarOnly = async (avatarUrl: string) => {
        if (!user?.userId) return;

        try {
            setIsSaving(true);
            const updatedUser = await userService.updateUserProfile(user.userId, { avatarUrl });
            updateAuthUser(updatedUser);
            Alert.alert("Thành công", "Ảnh đại diện đã được cập nhật");
        } catch (error: any) {
            console.error('❌ Lỗi cập nhật avatar:', error);
            Alert.alert("Lỗi", error.message || "Không thể cập nhật ảnh đại diện");
        } finally {
            setIsSaving(false);
        }
    };

    // Đã xóa handleChangeAvatar cũ - giờ sử dụng full upload flow

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
                <Text style={styles.headerTitle}>Thông tin chi tiết</Text>
                <TouchableOpacity
                    style={styles.editButton}
                    onPress={() => {
                        if (isEditing) {
                            handleCancel();
                        } else {
                            setIsEditing(true);
                        }
                    }}
                    disabled={isSaving}
                >
                    <Text style={styles.editButtonText}>
                        {isEditing ? "Hủy" : "Sửa"}
                    </Text>
                </TouchableOpacity>
            </View>

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                {/* Avatar Section */}
                <View style={styles.avatarSection}>
                    <View style={styles.avatarContainer}>
                        {formData.avatarUrl ? (
                            <Image
                                source={{ uri: formData.avatarUrl }}
                                style={styles.avatar}
                                onError={(error) => {
                                    console.error('❌ Lỗi load avatar trong ProfileDetails:', error.nativeEvent.error);
                                    console.log('URL gây lỗi:', formData.avatarUrl);
                                }}
                                onLoad={() => {
                                    console.log('✅ Avatar loaded trong ProfileDetails');
                                }}
                            />
                        ) : (
                            <View style={[styles.avatar, styles.avatarPlaceholder]}>
                                <Ionicons name="person" size={60} color={Colors.text.light} />
                            </View>
                        )}
                        {isEditing && (
                            <TouchableOpacity
                                style={styles.avatarEditButton}
                                onPress={handleChangeAvatar}
                            >
                                <Ionicons name="camera" size={20} color="#fff" />
                            </TouchableOpacity>
                        )}
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
                            style={[styles.fieldInput, !isEditing && styles.fieldInputDisabled]}
                            value={formData.fullName}
                            onChangeText={(text) =>
                                setFormData({ ...formData, fullName: text })
                            }
                            placeholder="Nhập tên đầy đủ"
                            editable={isEditing}
                            placeholderTextColor={Colors.text.light}
                        />
                    </View>

                    {/* Username */}
                    <View style={styles.fieldContainer}>
                        <Text style={styles.fieldLabel}>Tên người dùng *</Text>
                        <TextInput
                            style={[styles.fieldInput, !isEditing && styles.fieldInputDisabled]}
                            value={formData.username}
                            onChangeText={(text) =>
                                setFormData({ ...formData, username: text })
                            }
                            placeholder="Nhập tên người dùng"
                            editable={isEditing}
                            autoCapitalize="none"
                            placeholderTextColor={Colors.text.light}
                        />
                    </View>

                    {/* Email */}
                    <View style={styles.fieldContainer}>
                        <Text style={styles.fieldLabel}>Email *</Text>
                        <TextInput
                            style={[styles.fieldInput, !isEditing && styles.fieldInputDisabled]}
                            value={formData.email}
                            onChangeText={(text) => setFormData({ ...formData, email: text })}
                            placeholder="Nhập email"
                            editable={isEditing}
                            keyboardType="email-address"
                            autoCapitalize="none"
                            placeholderTextColor={Colors.text.light}
                        />
                    </View>

                    {/* Bio */}
                    <View style={styles.fieldContainer}>
                        <Text style={styles.fieldLabel}>Giới thiệu</Text>
                        <TextInput
                            style={[
                                styles.fieldInput,
                                styles.bioInput,
                                !isEditing && styles.fieldInputDisabled,
                            ]}
                            value={formData.bio || ""}
                            onChangeText={(text) => setFormData({ ...formData, bio: text })}
                            placeholder="Viết vài dòng về bạn..."
                            editable={isEditing}
                            multiline
                            numberOfLines={4}
                            textAlignVertical="top"
                            placeholderTextColor={Colors.text.light}
                        />
                    </View>

                    {/* Account Info (Read-only) */}
                    <View style={styles.infoSection}>
                        <Text style={styles.infoSectionTitle}>Thông tin tài khoản</Text>

                        <View style={styles.infoRow}>
                            <Text style={styles.infoLabel}>Vai trò</Text>
                            <Text style={styles.infoValue}>
                                {user?.role === "ADMIN" ? "Quản trị viên" : "Người dùng"}
                            </Text>
                        </View>

                        <View style={styles.infoRow}>
                            <Text style={styles.infoLabel}>Trạng thái</Text>
                            <Text style={[styles.infoValue, user?.isActive && styles.activeText]}>
                                {user?.isActive ? "Đang hoạt động" : "Không hoạt động"}
                            </Text>
                        </View>

                        <View style={styles.infoRow}>
                            <Text style={styles.infoLabel}>Email đã xác thực</Text>
                            <Text style={[styles.infoValue, user?.emailVerified && styles.verifiedText]}>
                                {user?.emailVerified ? "Đã xác thực" : "Chưa xác thực"}
                            </Text>
                        </View>

                        {user?.createdAt && (
                            <View style={styles.infoRow}>
                                <Text style={styles.infoLabel}>Ngày tham gia</Text>
                                <Text style={styles.infoValue}>
                                    {new Date(user.createdAt).toLocaleDateString("vi-VN")}
                                </Text>
                            </View>
                        )}
                    </View>

                    {/* Statistics */}
                    {(user?.followerCount !== undefined ||
                        user?.followingCount !== undefined ||
                        user?.recipeCount !== undefined) && (
                            <View style={styles.statsSection}>
                                <Text style={styles.infoSectionTitle}>Thống kê</Text>
                                <View style={styles.statsGrid}>
                                    {user?.followerCount !== undefined && (
                                        <View style={styles.statItem}>
                                            <Text style={styles.statValue}>{user.followerCount}</Text>
                                            <Text style={styles.statLabel}>Người theo dõi</Text>
                                        </View>
                                    )}
                                    {user?.followingCount !== undefined && (
                                        <View style={styles.statItem}>
                                            <Text style={styles.statValue}>{user.followingCount}</Text>
                                            <Text style={styles.statLabel}>Đang theo dõi</Text>
                                        </View>
                                    )}
                                    {user?.recipeCount !== undefined && (
                                        <View style={styles.statItem}>
                                            <Text style={styles.statValue}>{user.recipeCount}</Text>
                                            <Text style={styles.statLabel}>Công thức</Text>
                                        </View>
                                    )}
                                </View>
                            </View>
                        )}
                </View>

                {/* Save Button */}
                {isEditing && (
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
                )}
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.background,
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
    editButton: {
        padding: 8,
    },
    editButtonText: {
        fontSize: 16,
        fontWeight: "600",
        color: Colors.primary,
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
    fieldInputDisabled: {
        backgroundColor: Colors.gray[50],
        color: Colors.text.secondary,
    },
    bioInput: {
        height: 100,
        paddingTop: 12,
    },
    infoSection: {
        backgroundColor: "#fff",
        borderRadius: 12,
        padding: 16,
        marginTop: 8,
        marginBottom: 16,
    },
    infoSectionTitle: {
        fontSize: 16,
        fontWeight: "600",
        color: Colors.text.primary,
        marginBottom: 16,
    },
    infoRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: Colors.gray[100],
    },
    infoLabel: {
        fontSize: 14,
        color: Colors.text.secondary,
    },
    infoValue: {
        fontSize: 14,
        fontWeight: "500",
        color: Colors.text.primary,
    },
    activeText: {
        color: "#10b981",
    },
    verifiedText: {
        color: "#10b981",
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
});
