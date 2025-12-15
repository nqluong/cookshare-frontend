import { Ionicons } from "@expo/vector-icons";
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { router, useFocusEffect } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import {
    ActivityIndicator,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import EmailVerificationModal from "../../components/profile/EmailVerificationModal";
import CustomAlert from "../../components/ui/CustomAlert";
import { useAuth } from "../../context/AuthContext";
import { imageUploadService } from "../../services/imageUploadService";
import { userService } from "../../services/userService";
import { Colors } from "../../styles/colors";

export default function ProfileDetailsScreen() {
    const { user, updateAuthUser } = useAuth();
    const [isEditing, setIsEditing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [isUploadingImage, setIsUploadingImage] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [lastSyncedAvatarUrl, setLastSyncedAvatarUrl] = useState<string | null>(null);
    const [showVerificationModal, setShowVerificationModal] = useState(false);
    
    // Custom Alert states
    const [alertConfig, setAlertConfig] = useState<{
        visible: boolean;
        title: string;
        message: string;
        type: 'success' | 'error' | 'warning' | 'info';
        buttons?: Array<{
            text: string;
            onPress?: () => void;
            style?: 'default' | 'cancel' | 'destructive';
        }>;
    }>({
        visible: false,
        title: '',
        message: '',
        type: 'info',
        buttons: []
    });

    const showAlert = (
        title: string,
        message: string,
        type: 'success' | 'error' | 'warning' | 'info' = 'info',
        buttons?: Array<{
            text: string;
            onPress?: () => void;
            style?: 'default' | 'cancel' | 'destructive';
        }>
    ) => {
        setAlertConfig({
            visible: true,
            title,
            message,
            type,
            buttons: buttons || [{ text: 'OK' }]
        });
    };

    const [formData, setFormData] = useState({
        fullName: user?.fullName || "",
        username: user?.username || "",
        email: user?.email || "",
        bio: user?.bio || "",
        avatarUrl: user?.avatarUrl || "",
    });

    // Memoize avatar URL để tránh re-render không cần thiết
    const avatarUrl = useMemo(() => formData.avatarUrl, [formData.avatarUrl]);

    // Chỉ sync formData khi avatar thực sự thay đổi
    useFocusEffect(
        useCallback(() => {
            // Kiểm tra nếu avatar trong context khác với lần sync trước
            if (user?.avatarUrl !== lastSyncedAvatarUrl) {
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
            } else {
                console.log('ProfileDetailsScreen - avatar unchanged, skipping sync');
            }
        }, [user?.avatarUrl, lastSyncedAvatarUrl])
    );

    const handleSave = async () => {
        if (!user?.userId) {
            showAlert("Lỗi", "Không tìm thấy thông tin người dùng", 'error');
            return;
        }

        // Log userId for debugging
        console.log("Current user ID:", user.userId);
        console.log("User object:", JSON.stringify(user, null, 2));

        // Validation
        if (!formData.fullName.trim()) {
            showAlert("Lỗi", "Tên đầy đủ không được để trống", 'error');
            return;
        }

        if (!formData.username.trim()) {
            showAlert("Lỗi", "Tên người dùng không được để trống", 'error');
            return;
        }

        if (!formData.email.trim()) {
            showAlert("Lỗi", "Email không được để trống", 'error');
            return;
        }

        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData.email)) {
            showAlert("Lỗi", "Email không hợp lệ", 'error');
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
                showAlert("Thông báo", "Không có thay đổi nào được thực hiện", 'info');
                setIsEditing(false);
                return;
            }

            // Check if username already exists (if username changed)
            if (updateData.username) {
                const usernameExists = await userService.checkUsernameExists(formData.username);
                if (usernameExists) {
                    showAlert("Lỗi", "Tên người dùng đã tồn tại. Vui lòng chọn tên khác.", 'error');
                    return;
                }
            }

            // Check if email already exists (if email changed)
            if (updateData.email) {
                const emailExists = await userService.checkEmailExists(formData.email);
                if (emailExists) {
                    showAlert("Lỗi", "Email đã được sử dụng. Vui lòng chọn email khác.", 'error');
                    return;
                }
            }

            // Call API to update profile using the new endpoint
            const updatedUser = await userService.updateUserProfile(user.userId, updateData);

            // Nếu có cập nhật avatar, đợi Firebase generate public URL
            if (updateData.avatarUrl) {
                console.log('⏳ Waiting for Firebase to process avatar URL...');
                await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1s
            }

            // Update local auth context
            updateAuthUser(updatedUser);

            showAlert("Thành công", "Cập nhật thông tin thành công", 'success', [
                {
                    text: "OK",
                    onPress: () => setIsEditing(false),
                },
            ]);
        } catch (error: any) {
            console.log("Update profile error:", error);
            showAlert("Lỗi", error.message || "Không thể cập nhật thông tin", 'error');
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
                showAlert(
                    'Cần quyền truy cập',
                    'Vui lòng cấp quyền truy cập thư viện ảnh để chọn ảnh đại diện.',
                    'warning'
                );
                return;
            }

            // Hiển thị tùy chọn
            showAlert(
                "Thay đổi ảnh đại diện",
                "Chọn phương thức",
                'info',
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
            console.log('❌ Lỗi yêu cầu quyền truy cập:', error);
            showAlert("Lỗi", "Không thể truy cập thư viện ảnh", 'error');
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
            console.log('❌ Lỗi chọn ảnh:', error);
            showAlert("Lỗi", "Không thể chọn ảnh", 'error');
        }
    };

    const pickImageFromCamera = async () => {
        try {
            // Yêu cầu quyền camera
            const { status } = await ImagePicker.requestCameraPermissionsAsync();

            if (status !== 'granted') {
                showAlert(
                    'Cần quyền truy cập',
                    'Vui lòng cấp quyền truy cập camera để chụp ảnh.',
                    'warning'
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
            console.log('❌ Lỗi camera:', error);
            showAlert("Lỗi", "Không thể mở camera", 'error');
        }
    };

    const uploadAvatar = async (imageUri: string) => {
        if (!user?.userId) {
            showAlert("Lỗi", "Không tìm thấy thông tin người dùng", 'error');
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
                showAlert(
                    "Thành công",
                    "Ảnh đại diện đã được tải lên. Nhấn 'Lưu thay đổi' để hoàn tất.",
                    'success'
                );
            } else {
                // Nếu không ở chế độ chỉnh sửa, lưu ngay lập tức
                await updateAvatarOnly(publicUrl);
            }

        } catch (error: any) {
            console.log('❌ Lỗi upload avatar:', error);
            showAlert("Lỗi", error.message || "Không thể upload ảnh", 'error');
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
            showAlert("Thành công", "Ảnh đại diện đã được cập nhật", 'success');
        } catch (error: any) {
            console.log('❌ Lỗi cập nhật avatar:', error);
            showAlert("Lỗi", error.message || "Không thể cập nhật ảnh đại diện", 'error');
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
                        {avatarUrl ? (
                            <Image
                                key={avatarUrl}
                                source={{ uri: avatarUrl }}
                                style={styles.avatar}
                                cachePolicy="memory-disk" // Cache aggressively
                                contentFit="cover"
                                transition={200}
                                onError={(error) => {
                                    console.log('❌ Lỗi load avatar trong ProfileDetails:', error);
                                    console.log('URL gây lỗi:', avatarUrl);
                                }}
                                onLoad={() => {
                                    console.log('✅ Avatar loaded trong ProfileDetails (from cache or network)');
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
                            <View style={styles.emailVerifiedContainer}>
                                <Text style={[styles.infoValue, user?.emailVerified && styles.verifiedText]}>
                                    {user?.emailVerified ? "Đã xác thực" : "Chưa xác thực"}
                                </Text>
                                {!user?.emailVerified && (
                                    <TouchableOpacity
                                        style={styles.verifyButton}
                                        onPress={() => setShowVerificationModal(true)}
                                    >
                                        <Ionicons name="shield-checkmark" size={16} color="#fff" />
                                        <Text style={styles.verifyButtonText}>Xác thực</Text>
                                    </TouchableOpacity>
                                )}
                            </View>
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

            {/* Email Verification Modal */}
            <EmailVerificationModal
                visible={showVerificationModal}
                onClose={() => setShowVerificationModal(false)}
                onSuccess={async () => {
                    // Refresh user data sau khi xác thực thành công
                    try {
                        const updatedUser = await userService.getUserByUsername(user?.username || '');
                        await updateAuthUser({
                            emailVerified: true,
                        });
                        showAlert('Thành công', 'Email đã được xác thực thành công!', 'success');
                    } catch (error) {
                        console.log('Error refreshing user data:', error);
                    }
                }}
                userEmail={user?.email || ''}
            />

            {/* Custom Alert */}
            <CustomAlert
                visible={alertConfig.visible}
                title={alertConfig.title}
                message={alertConfig.message}
                type={alertConfig.type}
                buttons={alertConfig.buttons}
                onClose={() => setAlertConfig({ ...alertConfig, visible: false })}
            />
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
    emailVerifiedContainer: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
    },
    verifyButton: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: Colors.primary,
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 6,
        gap: 4,
    },
    verifyButtonText: {
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
