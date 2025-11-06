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

    // Error states
    const [errors, setErrors] = useState({
        username: '',
        email: '',
        password: '',
        fullname: '',
        confirmPassword: '',
    });

    const { register } = useAuth();

    // Pre-fill email from navigation params
    useEffect(() => {
        if (paramEmail && typeof paramEmail === 'string') {
            setFormData(prev => ({ ...prev, email: paramEmail }));
        }
    }, [paramEmail]);

    const updateFormData = (field: string, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        // Clear error when user types
        if (errors[field as keyof typeof errors]) {
            setErrors(prev => ({ ...prev, [field]: '' }));
        }
    };

    const validateForm = () => {
        const { username, email, password, fullname, confirmPassword } = formData;
        const newErrors = {
            username: '',
            email: '',
            password: '',
            fullname: '',
            confirmPassword: '',
        };
        let hasError = false;

        // Fullname validation
        if (!fullname.trim()) {
            newErrors.fullname = 'Vui lòng nhập họ và tên';
            hasError = true;
        }

        // Username validation
        if (!username.trim()) {
            newErrors.username = 'Vui lòng nhập tên đăng nhập';
            hasError = true;
        } else if (username.trim().length < 3) {
            newErrors.username = 'Tên đăng nhập phải có ít nhất 3 ký tự';
            hasError = true;
        }

        // Email validation
        if (!email.trim()) {
            newErrors.email = 'Vui lòng nhập email';
            hasError = true;
        } else {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                newErrors.email = 'Email không đúng định dạng';
                hasError = true;
            }
        }

        // Password validation
        if (!password.trim()) {
            newErrors.password = 'Vui lòng nhập mật khẩu';
            hasError = true;
        } else if (password.length < 6) {
            newErrors.password = 'Mật khẩu phải có ít nhất 6 ký tự';
            hasError = true;
        }

        // Confirm password validation
        if (!confirmPassword.trim()) {
            newErrors.confirmPassword = 'Vui lòng xác nhận mật khẩu';
            hasError = true;
        } else if (password !== confirmPassword) {
            newErrors.confirmPassword = 'Mật khẩu xác nhận không khớp';
            hasError = true;
        }

        setErrors(newErrors);
        return !hasError;
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
                error={errors.fullname}
            />

            {/* Username Input */}
            <Input
                placeholder="Tên đăng nhập"
                value={formData.username}
                onChangeText={(value) => updateFormData('username', value)}
                autoCapitalize="none"
                autoCorrect={false}
                error={errors.username}
            />

            {/* Email Input */}
            <Input
                placeholder="Email"
                value={formData.email}
                onChangeText={(value) => updateFormData('email', value)}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                error={errors.email}
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
                error={errors.password}
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
                error={errors.confirmPassword}
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