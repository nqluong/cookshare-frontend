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

    // Error states
    const [errors, setErrors] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
    });

    const validateForm = () => {
        const newErrors = {
            currentPassword: '',
            newPassword: '',
            confirmPassword: '',
        };
        let hasError = false;

        if (!currentPassword.trim()) {
            newErrors.currentPassword = 'Vui lòng nhập mật khẩu hiện tại';
            hasError = true;
        }

        if (!newPassword.trim()) {
            newErrors.newPassword = 'Vui lòng nhập mật khẩu mới';
            hasError = true;
        } else if (newPassword.length < 6) {
            newErrors.newPassword = 'Mật khẩu mới phải có ít nhất 6 ký tự';
            hasError = true;
        } else if (currentPassword === newPassword) {
            newErrors.newPassword = 'Mật khẩu mới phải khác mật khẩu hiện tại';
            hasError = true;
        }

        if (!confirmPassword.trim()) {
            newErrors.confirmPassword = 'Vui lòng xác nhận mật khẩu mới';
            hasError = true;
        } else if (newPassword !== confirmPassword) {
            newErrors.confirmPassword = 'Xác nhận mật khẩu không khớp';
            hasError = true;
        }

        setErrors(newErrors);
        return !hasError;
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
                            onChangeText={(text) => {
                                setCurrentPassword(text);
                                if (errors.currentPassword) setErrors(prev => ({ ...prev, currentPassword: '' }));
                            }}
                            secureTextEntry
                            showPasswordToggle
                            autoCapitalize="none"
                            autoCorrect={false}
                            error={errors.currentPassword}
                        />

                        {/* New Password Input */}
                        <Input
                            placeholder="Mật khẩu mới"
                            value={newPassword}
                            onChangeText={(text) => {
                                setNewPassword(text);
                                if (errors.newPassword) setErrors(prev => ({ ...prev, newPassword: '' }));
                            }}
                            secureTextEntry
                            showPasswordToggle
                            autoCapitalize="none"
                            autoCorrect={false}
                            error={errors.newPassword}
                        />

                        {/* Confirm Password Input */}
                        <Input
                            placeholder="Xác nhận mật khẩu mới"
                            value={confirmPassword}
                            onChangeText={(text) => {
                                setConfirmPassword(text);
                                if (errors.confirmPassword) setErrors(prev => ({ ...prev, confirmPassword: '' }));
                            }}
                            secureTextEntry
                            showPasswordToggle
                            autoCapitalize="none"
                            autoCorrect={false}
                            error={errors.confirmPassword}
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