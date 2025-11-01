import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useState } from "react";
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
import { useAuth } from "../../context/AuthContext";
import { userService } from "../../services/userService";
import { Colors } from "../../styles/colors";

export default function ProfileDetailsScreen() {
    const { user, updateAuthUser } = useAuth();
    const [isEditing, setIsEditing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    const [formData, setFormData] = useState({
        fullName: user?.fullName || "",
        username: user?.username || "",
        email: user?.email || "",
        bio: user?.bio || "",
        avatarUrl: user?.avatarUrl || "",
    });

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
        // Reset form to original user data
        setFormData({
            fullName: user?.fullName || "",
            username: user?.username || "",
            email: user?.email || "",
            bio: user?.bio || "",
            avatarUrl: user?.avatarUrl || "",
        });
        setIsEditing(false);
    };

    const handleChangeAvatar = () => {
        Alert.alert(
            "Thay đổi ảnh đại diện",
            "Chọn phương thức",
            [
                {
                    text: "Chọn từ thư viện",
                    onPress: () => Alert.alert("Thông báo", "Tính năng đang phát triển"),
                },
                {
                    text: "Chụp ảnh mới",
                    onPress: () => Alert.alert("Thông báo", "Tính năng đang phát triển"),
                },
                {
                    text: "Hủy",
                    style: "cancel",
                },
            ]
        );
    };

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
});
