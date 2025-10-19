import React, { useState } from 'react';
import { View, Text, Alert, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { authStyles } from '../../styles/AuthStyle';
import { authService } from '../../services/authService';

export default function ResetPasswordScreen() {
    const { email } = useLocalSearchParams();
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const validateForm = () => {
        if (!newPassword.trim()) {
            Alert.alert('Lỗi', 'Vui lòng nhập mật khẩu mới');
            return false;
        }

        if (newPassword.length < 6) {
            Alert.alert('Lỗi', 'Mật khẩu mới phải có ít nhất 6 ký tự');
            return false;
        }

        if (!confirmPassword.trim()) {
            Alert.alert('Lỗi', 'Vui lòng xác nhận mật khẩu');
            return false;
        }

        if (newPassword !== confirmPassword) {
            Alert.alert('Lỗi', 'Xác nhận mật khẩu không khớp');
            return false;
        }

        return true;
    };

    const handleResetPassword = async () => {
        if (!validateForm()) return;

        if (!email) {
            Alert.alert('Lỗi', 'Không tìm thấy thông tin email');
            return;
        }

        setLoading(true);
        try {
            const message = await authService.resetPassword(
                email as string,
                newPassword,
                confirmPassword
            );

            Alert.alert(
                'Thành công',
                'Đặt lại mật khẩu thành công! Bạn có thể đăng nhập với mật khẩu mới.',
                [
                    {
                        text: 'OK',
                        onPress: () => {
                            // Chuyển về màn hình đăng nhập
                            router.replace('/auth/login' as any);
                        },
                    },
                ]
            );

            // Clear form
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
                        <Text style={authStyles.title}>Đặt lại mật khẩu</Text>
                        <Text style={authStyles.subtitle}>
                            Nhập mật khẩu mới cho tài khoản {email}
                        </Text>

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

                        {/* Reset Password Button */}
                        <Button
                            title="Đặt lại mật khẩu"
                            onPress={handleResetPassword}
                            variant="primary"
                            loading={loading}
                            style={authStyles.primaryButton}
                        />

                        {/* Back Button */}
                        <View style={authStyles.navigationContainer}>
                            <Text style={authStyles.navigationText}>
                                <Text
                                    style={authStyles.navigationLink}
                                    onPress={() => router.replace('/auth/login' as any)}
                                >
                                    ← Quay lại đăng nhập
                                </Text>
                            </Text>
                        </View>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}