import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { router } from 'expo-router';
import { useSocialLogin } from '../../hooks/useSocialLogin';
import Button from '../ui/Button';
import Input from '../ui/Input';
import { authStyles } from '../../styles/AuthStyle';

export default function AuthRegisterFormInitial() {
    const [email, setEmail] = useState('');
    const [emailError, setEmailError] = useState('');

    // Sử dụng custom hook cho social login
    const {
        googleLoading,
        facebookLoading,
        isLoading: socialLoading,
        loginWithGoogle,
        loginWithFacebook
    } = useSocialLogin();

    const handleContinue = () => {
        // Reset error
        setEmailError('');

        // Validation
        if (!email.trim()) {
            setEmailError('Vui lòng nhập email');
            return;
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email.trim())) {
            setEmailError('Email không hợp lệ');
            return;
        }

        router.push(`/auth/register?email=${encodeURIComponent(email.trim())}` as any);
    };

    const handleGoogleRegister = () => {
        // Dùng cùng flow login, vì backend tự động tạo account nếu chưa có
        loginWithGoogle();
    };

    const handleFacebookRegister = () => {
        // Dùng cùng flow login, vì backend tự động tạo account nếu chưa có
        loginWithFacebook();
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
                onChangeText={(text) => {
                    setEmail(text);
                    if (emailError) setEmailError('');
                }}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                editable={!socialLoading}
                error={emailError}
            />

            {/* Continue Button */}
            <Button
                title="Tiếp tục"
                onPress={handleContinue}
                variant="primary"
                style={authStyles.primaryButton}
                disabled={socialLoading}
            />

            {/* Divider */}
            <View style={authStyles.dividerContainer}>
                <View style={authStyles.dividerLine} />
                <Text style={authStyles.dividerText}>HOẶC</Text>
                <View style={authStyles.dividerLine} />
            </View>

            {/* Google Register Button */}
            <TouchableOpacity
                style={[
                    authStyles.googleButton,
                    {
                        flexDirection: 'row',
                        alignItems: 'center',
                        justifyContent: 'center',
                        opacity: socialLoading ? 0.6 : 1
                    }
                ]}
                onPress={handleGoogleRegister}
                disabled={socialLoading}
            >
                {googleLoading ? (
                    <>
                        <ActivityIndicator color="#4285F4" size="small" />
                        <Text style={[authStyles.googleButtonText, { marginLeft: 10 }]}>
                            Đang xử lý...
                        </Text>
                    </>
                ) : (
                    <>
                        <Text style={{
                            fontSize: 20,
                            fontWeight: 'bold',
                            color: '#4285F4',
                            marginRight: 12
                        }}>
                            G
                        </Text>
                        <Text style={authStyles.googleButtonText}>
                            Tiếp tục với Google
                        </Text>
                    </>
                )}
            </TouchableOpacity>

            {/* Facebook Register Button */}
            <TouchableOpacity
                style={[
                    authStyles.facebookButton,
                    {
                        flexDirection: 'row',
                        alignItems: 'center',
                        justifyContent: 'center',
                        opacity: socialLoading ? 0.6 : 1
                    }
                ]}
                onPress={handleFacebookRegister}
                disabled={socialLoading}
            >
                {facebookLoading ? (
                    <>
                        <ActivityIndicator color="#FFFFFF" size="small" />
                        <Text style={[authStyles.facebookButtonText, { marginLeft: 10 }]}>
                            Đang xử lý...
                        </Text>
                    </>
                ) : (
                    <>
                        <Text style={{
                            fontSize: 20,
                            fontWeight: 'bold',
                            color: '#FFFFFF',
                            marginRight: 12
                        }}>
                            f
                        </Text>
                        <Text style={authStyles.facebookButtonText}>
                            Tiếp tục với Facebook
                        </Text>
                    </>
                )}
            </TouchableOpacity>

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