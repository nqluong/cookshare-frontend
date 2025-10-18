import React, { useState } from 'react';
import { View, Text, Alert, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { authStyles } from '../../styles/AuthStyle';
import { authService } from '../../services/authService';

export default function ChangePasswordScreen() {
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const validateForm = () => {
        if (!currentPassword.trim()) {
            Alert.alert('Lỗi', 'Vui lòng nhập mật khẩu hiện tại');
            return false;
        }

        if (!newPassword.trim()) {
            Alert.alert('Lỗi', 'Vui lòng nhập mật khẩu mới');
            return false;
        }

        if (newPassword.length < 6) {
            Alert.alert('Lỗi', 'Mật khẩu mới phải có ít nhất 6 ký tự');
            return false;
        }

        if (newPassword !== confirmPassword) {
            Alert.alert('Lỗi', 'Xác nhận mật khẩu không khớp');
            return false;
        }

        if (currentPassword === newPassword) {
            Alert.alert('Lỗi', 'Mật khẩu mới phải khác mật khẩu hiện tại');
            return false;
        }

        return true;
    };

    const handleChangePassword = async () => {
        if (!validateForm()) return;

        setLoading(true);
        try {
            const message = await authService.changePassword({
                currentPassword,
                newPassword,
                confirmPassword,
            });

            Alert.alert(
                'Thành công',
                'Đổi mật khẩu thành công',
                [
                    {
                        text: 'OK',
                        onPress: () => router.back(),
                    },
                ]
            );

            // Clear form
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');
        } catch (error) {
            Alert.alert('Lỗi', error instanceof Error ? error.message : 'Đã có lỗi xảy ra');
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: '#f8f9fa' }}>
            <KeyboardAvoidingView
                style={{ flex: 1 }}
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            >
                <ScrollView
                    contentContainerStyle={{
                        flexGrow: 1,
                        justifyContent: 'center',
                        paddingVertical: 20
                    }}
                    keyboardShouldPersistTaps="handled"
                    showsVerticalScrollIndicator={false}
                >
                    <View style={authStyles.container}>
                        {/* Logo/Header */}
                        <Text style={authStyles.appTitle}>Cookshare</Text>

                        {/* Main Title */}
                        <Text style={authStyles.title}>Đổi mật khẩu</Text>
                        <Text style={authStyles.subtitle}>
                            Nhập thông tin để thay đổi mật khẩu của bạn
                        </Text>

                        {/* Current Password Input */}
                        <Input
                            placeholder="Mật khẩu hiện tại"
                            value={currentPassword}
                            onChangeText={setCurrentPassword}
                            secureTextEntry
                            showPasswordToggle
                            autoCapitalize="none"
                            autoCorrect={false}
                        />

                        {/* New Password Input */}
                        <Input
                            placeholder="Mật khẩu mới"
                            value={newPassword}
                            onChangeText={setNewPassword}
                            secureTextEntry
                            showPasswordToggle
                            autoCapitalize="none"
                            autoCorrect={false}
                        />

                        {/* Confirm Password Input */}
                        <Input
                            placeholder="Xác nhận mật khẩu mới"
                            value={confirmPassword}
                            onChangeText={setConfirmPassword}
                            secureTextEntry
                            showPasswordToggle
                            autoCapitalize="none"
                            autoCorrect={false}
                        />

                        {/* Change Password Button */}
                        <Button
                            title="Đổi mật khẩu"
                            onPress={handleChangePassword}
                            variant="primary"
                            loading={loading}
                            style={authStyles.primaryButton}
                        />

                        {/* Back Button */}
                        <View style={authStyles.navigationContainer}>
                            <Text style={authStyles.navigationText}>
                                <Text
                                    style={authStyles.navigationLink}
                                    onPress={() => router.back()}
                                >
                                    ← Quay lại
                                </Text>
                            </Text>
                        </View>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}