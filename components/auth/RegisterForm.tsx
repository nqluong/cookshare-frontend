// components/auth/RegisterForm.tsx -> AuthRegisterForm
import React, { useState, useEffect } from 'react';
import { View, Text, Alert } from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { router, useLocalSearchParams } from 'expo-router';
import Button from '../ui/Button';
import Input from '../ui/Input';
import { authStyles } from '../../styles/AuthStyle';

export default function AuthRegisterForm() {
    const { email: paramEmail } = useLocalSearchParams();

    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        fullname: '',
        confirmPassword: '',
    });
    const [loading, setLoading] = useState(false);

    const { register } = useAuth();

    // Pre-fill email from navigation params
    useEffect(() => {
        if (paramEmail && typeof paramEmail === 'string') {
            setFormData(prev => ({ ...prev, email: paramEmail }));
        }
    }, [paramEmail]);

    const updateFormData = (field: string, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const validateForm = () => {
        const { username, email, password, fullname, confirmPassword } = formData;

        if (!username.trim() || !email.trim() || !password.trim() || !fullname.trim()) {
            Alert.alert('Lỗi', 'Vui lòng nhập đầy đủ thông tin');
            return false;
        }

        if (username.trim().length < 3) {
            Alert.alert('Lỗi', 'Tên đăng nhập phải có ít nhất 3 ký tự');
            return false;
        }

        if (password.length < 6) {
            Alert.alert('Lỗi', 'Mật khẩu phải có ít nhất 6 ký tự');
            return false;
        }

        if (password !== confirmPassword) {
            Alert.alert('Lỗi', 'Mật khẩu xác nhận không khớp');
            return false;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            Alert.alert('Lỗi', 'Email không đúng định dạng');
            return false;
        }

        return true;
    };

    const handleRegister = async () => {
        if (!validateForm()) return;

        setLoading(true);
        try {
            const { username, email, password, fullname } = formData;
            const success = await register({
                username: username.trim(),
                email: email.trim(),
                password,
                fullname: fullname.trim(),
            });

            if (success) {
                Alert.alert('Thành công', 'Đăng ký tài khoản thành công!', [
                    {
                        text: 'OK',
                        onPress: () => router.replace('/(tabs)/home' as any),
                    },
                ]);
            } else {
                Alert.alert('Lỗi', 'Đăng ký thất bại. Vui lòng thử lại');
            }
        } catch (error) {
            Alert.alert('Lỗi', 'Đã có lỗi xảy ra. Vui lòng thử lại');
        } finally {
            setLoading(false);
        }
    };

    const navigateToLogin = () => {
        router.push('/auth/login' as any);
    };

    return (
        <View style={authStyles.container}>
            {/* Logo/Header */}
            <Text style={authStyles.appTitle}>Cookshare</Text>

            {/* Main Title */}
            <Text style={authStyles.title}>Tạo tài khoản mới</Text>
            <Text style={authStyles.subtitle}>Điền thông tin để tạo tài khoản</Text>

            {/* Full Name Input */}
            <Input
                placeholder="Họ và tên"
                value={formData.fullname}
                onChangeText={(value) => updateFormData('fullname', value)}
                autoCapitalize="words"
                autoCorrect={false}
            />

            {/* Username Input */}
            <Input
                placeholder="Tên đăng nhập"
                value={formData.username}
                onChangeText={(value) => updateFormData('username', value)}
                autoCapitalize="none"
                autoCorrect={false}
            />

            {/* Email Input */}
            <Input
                placeholder="Email"
                value={formData.email}
                onChangeText={(value) => updateFormData('email', value)}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
            />

            {/* Password Input */}
            <Input
                placeholder="Mật khẩu"
                value={formData.password}
                onChangeText={(value) => updateFormData('password', value)}
                secureTextEntry
                showPasswordToggle
                autoCapitalize="none"
                autoCorrect={false}
            />

            {/* Confirm Password Input */}
            <Input
                placeholder="Xác nhận mật khẩu"
                value={formData.confirmPassword}
                onChangeText={(value) => updateFormData('confirmPassword', value)}
                secureTextEntry
                showPasswordToggle
                autoCapitalize="none"
                autoCorrect={false}
            />

            {/* Register Button */}
            <Button
                title="Đăng ký"
                onPress={handleRegister}
                variant="primary"
                loading={loading}
                style={authStyles.primaryButton}
            />

            {/* Navigate to login */}
            <View style={authStyles.navigationContainer}>
                <Text style={authStyles.navigationText}>
                    Đã có tài khoản?{' '}
                    <Text style={authStyles.navigationLink} onPress={navigateToLogin}>
                        Đăng nhập
                    </Text>
                </Text>
            </View>
        </View>
    );
}