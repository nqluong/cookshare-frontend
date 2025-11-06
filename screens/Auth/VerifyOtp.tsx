import React, { useState, useEffect } from 'react';
import { View, Text, Alert, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { authStyles } from '../../styles/AuthStyle';
import { authService } from '../../services/authService';

export default function VerifyOtpScreen() {
    const { email } = useLocalSearchParams();
    const [otp, setOtp] = useState('');
    const [otpError, setOtpError] = useState('');
    const [loading, setLoading] = useState(false);
    const [countdown, setCountdown] = useState(0);

    useEffect(() => {
        // Bắt đầu countdown 5 phút (300 giây)
        setCountdown(300);

        const timer = setInterval(() => {
            setCountdown((prev) => {
                if (prev <= 1) {
                    clearInterval(timer);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, []);

    const formatTime = (seconds: number) => {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
    };

    const handleVerifyOtp = async () => {
        if (!otp.trim()) {
            setOtpError('Vui lòng nhập mã OTP');
            return;
        }

        if (otp.trim().length !== 6) {
            setOtpError('Mã OTP phải có 6 chữ số');
            return;
        }

        if (!email) {
            setOtpError('Không tìm thấy thông tin email');
            return;
        }

        setLoading(true);
        try {
            const message = await authService.verifyOtp(email as string, parseInt(otp.trim()));

            Alert.alert(
                'Thành công',
                'Xác thực OTP thành công. Bây giờ bạn có thể đặt lại mật khẩu.',
                [
                    {
                        text: 'OK',
                        onPress: () => {
                            // Chuyển đến màn hình reset password
                            router.push({
                                pathname: '/auth/resetPassword',
                                params: { email: email as string }
                            } as any);
                        },
                    },
                ]
            );
        } catch (error) {
            setOtpError(error instanceof Error ? error.message : 'Đã có lỗi xảy ra');
        } finally {
            setLoading(false);
        }
    };

    const handleResendOtp = async () => {
        if (!email) {
            setOtpError('Không tìm thấy thông tin email');
            return;
        }

        setLoading(true);
        try {
            await authService.verifyEmail(email as string);
            Alert.alert('Thành công', 'Đã gửi lại mã OTP đến email của bạn');
            setCountdown(300); // Reset countdown
            setOtp(''); // Clear current OTP
            setOtpError(''); // Clear error
        } catch (error) {
            setOtpError(error instanceof Error ? error.message : 'Đã có lỗi xảy ra');
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
                        <Text style={authStyles.title}>Xác thực OTP</Text>
                        <Text style={authStyles.subtitle}>
                            Nhập mã OTP đã được gửi đến {email}
                        </Text>

                        {/* Countdown Timer */}
                        {countdown > 0 && (
                            <Text style={[authStyles.subtitle, { color: '#666', marginBottom: 10 }]}>
                                Mã OTP sẽ hết hạn sau: {formatTime(countdown)}
                            </Text>
                        )}

                        {/* OTP Input */}
                        <Input
                            placeholder="Nhập mã OTP (6 chữ số)"
                            value={otp}
                            onChangeText={(text) => {
                                setOtp(text);
                                if (otpError) setOtpError('');
                            }}
                            keyboardType="numeric"
                            maxLength={6}
                            autoCorrect={false}
                            error={otpError}
                        />

                        {/* Verify OTP Button */}
                        <Button
                            title="Xác thực OTP"
                            onPress={handleVerifyOtp}
                            variant="primary"
                            loading={loading}
                            style={authStyles.primaryButton}
                        />

                        {/* Resend OTP Button */}
                        <Button
                            title={countdown > 270 ? `Gửi lại sau ${formatTime(countdown - 300 + 30)}` : "Gửi lại mã OTP"}
                            onPress={handleResendOtp}
                            variant="secondary"
                            loading={loading}
                            style={authStyles.secondaryButton}
                            disabled={countdown > 300 - 30} // Vô hiệu hóa nút trong 30 giây đầu tiên
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