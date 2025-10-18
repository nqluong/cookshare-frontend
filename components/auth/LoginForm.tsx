// components/auth/LoginForm.tsx -> AuthLoginForm
import React, { useState } from 'react';
import { View, Text, Alert } from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { router } from 'expo-router';
import Button from '../ui/Button';
import Input from '../ui/Input';
import { authStyles } from '../../styles/AuthStyle';

export default function AuthLoginForm() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const { login } = useAuth();

    const handleLogin = async () => {
        if (!username.trim() || !password.trim()) {
            Alert.alert('Lỗi', 'Vui lòng nhập đầy đủ thông tin');
            return;
        }

        if (username.trim().length < 3) {
            Alert.alert('Lỗi', 'Tên đăng nhập phải có ít nhất 3 ký tự');
            return;
        }

        if (password.length < 6) {
            Alert.alert('Lỗi', 'Mật khẩu phải có ít nhất 6 ký tự');
            return;
        }

        setLoading(true);
        try {
            const success = await login({
                username: username.trim(),
                password,
            });

            if (success) {
                router.replace('/(tabs)/home' as any);
            } else {
                Alert.alert('Lỗi', 'Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin');
            }
        } catch (error) {
            Alert.alert('Lỗi', 'Đã có lỗi xảy ra. Vui lòng thử lại');
        } finally {
            setLoading(false);
        }
    };

    const navigateToRegisterForm = () => {
        router.push('/auth/registerForm' as any);
    };

    const navigateToForgotPassword = () => {
        Alert.alert(
            'Thông báo',
            'Tính năng quên mật khẩu đang được phát triển. Vui lòng liên hệ quản trị viên để được hỗ trợ.',
            [{ text: 'OK' }]
        );
        // router.push('/auth/forgotPassword' as any);
    };

    return (
        <View style={authStyles.container}>
            {/* Logo/Header */}
            <Text style={authStyles.appTitle}>Cookshare</Text>

            {/* Main Title */}
            <Text style={authStyles.title}>Đăng nhập</Text>
            <Text style={authStyles.subtitle}>Chào mừng bạn quay trở lại</Text>

            {/* Username Input */}
            <Input
                placeholder="Tên đăng nhập"
                value={username}
                onChangeText={setUsername}
                autoCapitalize="none"
                autoCorrect={false}
            />

            {/* Password Input */}
            <Input
                placeholder="Mật khẩu"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                showPasswordToggle
                autoCapitalize="none"
                autoCorrect={false}
            />

            {/* Login Button */}
            <Button
                title="Đăng nhập"
                onPress={handleLogin}
                variant="primary"
                loading={loading}
                style={authStyles.primaryButton}
            />

            {/* Forgot Password - Tạm thời ẩn khi backend chưa sẵn sàng */}
            {
                <View style={authStyles.navigationContainer}>
                    <Text style={authStyles.navigationText}>
                        <Text style={authStyles.navigationLink} onPress={navigateToForgotPassword}>
                            Quên mật khẩu?
                        </Text>
                    </Text>
                </View>
            }

            {/* Navigate to register */}
            <View style={authStyles.navigationContainer}>
                <Text style={authStyles.navigationText}>
                    Chưa có tài khoản?{' '}
                    <Text style={authStyles.navigationLink} onPress={navigateToRegisterForm}>
                        Tạo tài khoản mới
                    </Text>
                </Text>
            </View>
        </View>
    );
}