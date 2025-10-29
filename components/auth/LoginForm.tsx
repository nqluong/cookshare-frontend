import React, { useState } from 'react';
import { View, Text, Alert, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { router } from 'expo-router';
import { useSocialLogin } from '../../hooks/useSocialLogin';
import Button from '../ui/Button';
import Input from '../ui/Input';
import { authStyles } from '../../styles/AuthStyle';

export default function AuthLoginForm() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const { login } = useAuth();

    // Sử dụng custom hook cho social login
    const {
        googleLoading,
        facebookLoading,
        isLoading: socialLoading,
        loginWithGoogle,
        loginWithFacebook
    } = useSocialLogin();

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
        router.push('/auth/verifyMail' as any);
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

            {/* Divider */}
            <View style={authStyles.dividerContainer}>
                <View style={authStyles.dividerLine} />
                <Text style={authStyles.dividerText}>HOẶC</Text>
                <View style={authStyles.dividerLine} />
            </View>

            {/* Google Login Button */}
            <TouchableOpacity
                style={[
                    authStyles.googleButton,
                    { flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }
                ]}
                onPress={loginWithGoogle}
                disabled={loading || socialLoading}
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
                        <Text style={{ fontSize: 20, fontWeight: 'bold', color: '#4285F4', marginRight: 12 }}>
                            G
                        </Text>
                        <Text style={authStyles.googleButtonText}>
                            Đăng nhập với Google
                        </Text>
                    </>
                )}
            </TouchableOpacity>

            {/* Facebook Login Button */}
            <TouchableOpacity
                style={[
                    authStyles.facebookButton,
                    { flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }
                ]}
                onPress={loginWithFacebook}
                disabled={loading || socialLoading}
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
                        <Text style={{ fontSize: 20, fontWeight: 'bold', color: '#FFFFFF', marginRight: 12 }}>
                            f
                        </Text>
                        <Text style={authStyles.facebookButtonText}>
                            Đăng nhập với Facebook
                        </Text>
                    </>
                )}
            </TouchableOpacity>

            {/* Forgot Password */}
            <View style={authStyles.navigationContainer}>
                <Text style={authStyles.navigationText}>
                    <Text style={authStyles.navigationLink} onPress={navigateToForgotPassword}>
                        Quên mật khẩu?
                    </Text>
                </Text>
            </View>

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