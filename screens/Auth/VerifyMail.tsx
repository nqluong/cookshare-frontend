import React, { useState } from 'react';
import { View, Text, Alert, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { authStyles } from '../../styles/AuthStyle';
import { authService } from '../../services/authService';

export default function VerifyMailScreen() {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [emailError, setEmailError] = useState('');

    const validateEmail = (email: string) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    const handleVerifyEmail = async () => {
        // Reset error
        setEmailError('');

        if (!email.trim()) {
            setEmailError('Vui lòng nhập email');
            return;
        }

        if (!validateEmail(email.trim())) {
            setEmailError('Vui lòng nhập email hợp lệ');
            return;
        }

        setLoading(true);
        try {
            const message = await authService.verifyEmail(email.trim());

            Alert.alert(
                'Thành công',
                'OTP đã được gửi đến email của bạn. Vui lòng kiểm tra hộp thư.',
                [
                    {
                        text: 'OK',
                        onPress: () => {
                            // Chuyển đến màn hình nhập OTP và truyền email
                            router.push({
                                pathname: '/auth/verifyOtp',
                                params: { email: email.trim() }
                            } as any);
                        },
                    },
                ]
            );
        } catch (error) {
            setEmailError(error instanceof Error ? error.message : 'Đã có lỗi xảy ra');
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
                        <Text style={authStyles.title}>Quên mật khẩu</Text>
                        <Text style={authStyles.subtitle}>
                            Nhập email để nhận mã xác thực OTP
                        </Text>

                        {/* Email Input */}
                        <Input
                            placeholder="Email của bạn"
                            value={email}
                            onChangeText={(text) => {
                                setEmail(text);
                                if (emailError) setEmailError('');
                            }}
                            keyboardType="email-address"
                            autoCapitalize="none"
                            autoCorrect={false}
                            error={emailError}
                        />

                        {/* Send OTP Button */}
                        <Button
                            title="Gửi mã OTP"
                            onPress={handleVerifyEmail}
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