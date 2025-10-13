// components/auth/RegisterFormInitial.tsx -> AuthRegisterFormInitial  
import React, { useState } from 'react';
import { View, Text } from 'react-native';
import { router } from 'expo-router';
import Button from '../ui/Button';
import Input from '../ui/Input';
import { authStyles } from '../../styles/AuthStyle';

export default function AuthRegisterFormInitial() {
    const [email, setEmail] = useState('');

    const handleContinue = () => {
        if (email.trim()) {
            router.push(`/auth/register?email=${encodeURIComponent(email)}` as any);
        }
    };

    const handleGoogleRegister = () => {
        // TODO: Implement Google OAuth integration
        console.log('Google register clicked');
    };

    const handleFacebookRegister = () => {
        // TODO: Implement Facebook OAuth integration  
        console.log('Facebook register clicked');
    };

    const navigateToLogin = () => {
        router.push('/auth/login' as any);
    };

    return (
        <View style={authStyles.container}>
            {/* Logo/Header */}
            <Text style={authStyles.appTitle}>Cookshare</Text>

            {/* Main Title */}
            <Text style={authStyles.title}>Tạo một tài khoản</Text>
            <Text style={authStyles.subtitle}>Bắt đầu hành trình ẩm thực của bạn</Text>

            {/* Email Input */}
            <Input
                placeholder="Email"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
            />

            {/* Continue Button - Black */}
            <Button
                title="Tiếp tục"
                onPress={handleContinue}
                variant="primary"
                style={authStyles.primaryButton}
            />

            {/* Social Login Buttons */}
            <Button
                title="Đăng ký với Google"
                onPress={handleGoogleRegister}
                variant="google"
                style={authStyles.googleButton}
            />

            <Button
                title="Đăng ký với Facebook"
                onPress={handleFacebookRegister}
                variant="facebook"
                style={authStyles.facebookButton}
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