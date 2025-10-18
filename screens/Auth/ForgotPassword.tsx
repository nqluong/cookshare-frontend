import React, { useState } from 'react';
import { View, Text, Alert } from 'react-native';
import { router } from 'expo-router';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { authStyles } from '../../styles/AuthStyle';
import { authService } from '../../services/authService';

export default function ForgotPasswordScreen() {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);

    const handleForgotPassword = async () => {
        // Tạm thời thông báo tính năng đang phát triển
        Alert.alert(
            'Thông báo',
            'Tính năng quên mật khẩu đang được phát triển. Vui lòng liên hệ quản trị viên để được hỗ trợ.',
            [{ text: 'OK' }]
        );
        return;

        // Code sẽ được sử dụng khi backend sẵn sàng
        /*
        if (!email.trim()) {
          Alert.alert('Lỗi', 'Vui lòng nhập địa chỉ email');
          return;
        }
    
        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email.trim())) {
          Alert.alert('Lỗi', 'Vui lòng nhập địa chỉ email hợp lệ');
          return;
        }
    
        setLoading(true);
        try {
          const message = await authService.forgotPassword({
            email: email.trim(),
          });
    
          Alert.alert(
            'Thành công',
            'Hướng dẫn đặt lại mật khẩu đã được gửi đến email của bạn',
            [
              {
                text: 'OK',
                onPress: () => router.back(),
              },
            ]
          );
        } catch (error) {
          Alert.alert('Lỗi', error instanceof Error ? error.message : 'Đã có lỗi xảy ra');
        } finally {
          setLoading(false);
        }
        */
    };

    const navigateToLogin = () => {
        router.push('/auth/login' as any);
    };

    return (
        <View style={authStyles.container}>
            {/* Logo/Header */}
            <Text style={authStyles.appTitle}>Cookshare</Text>

            {/* Main Title */}
            <Text style={authStyles.title}>Quên mật khẩu</Text>
            <Text style={authStyles.subtitle}>
                Nhập email để nhận hướng dẫn đặt lại mật khẩu
            </Text>

            {/* Email Input */}
            <Input
                placeholder="Địa chỉ email"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
            />

            {/* Send Button */}
            <Button
                title="Gửi yêu cầu"
                onPress={handleForgotPassword}
                variant="primary"
                loading={loading}
                style={authStyles.primaryButton}
            />

            {/* Back to Login */}
            <View style={authStyles.navigationContainer}>
                <Text style={authStyles.navigationText}>
                    Nhớ mật khẩu?{' '}
                    <Text style={authStyles.navigationLink} onPress={navigateToLogin}>
                        Đăng nhập ngay
                    </Text>
                </Text>
            </View>
        </View>
    );
}