import React, { useState, useEffect } from 'react';
import {
    Modal,
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    Alert,
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    TouchableWithoutFeedback,
    Keyboard,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { authService } from '../../services/authService';
import { Colors } from '../../styles/colors';
import { colors } from '@/styles/AuthStyle';

interface EmailVerificationModalProps {
    visible: boolean;
    onClose: () => void;
    onSuccess: () => void;
    userEmail: string;
}

export default function EmailVerificationModal({
    visible,
    onClose,
    onSuccess,
    userEmail,
}: EmailVerificationModalProps) {
    const [otp, setOtp] = useState('');
    const [loading, setLoading] = useState(false);
    const [sendingOtp, setSendingOtp] = useState(false);
    const [countdown, setCountdown] = useState(0);

    useEffect(() => {
        if (visible) {
            // Tự động gửi OTP khi mở modal
            handleSendOtp();
        } else {
            // Reset state khi đóng modal
            setOtp('');
            setCountdown(0);
        }
    }, [visible]);

    useEffect(() => {
        if (countdown > 0) {
            const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
            return () => clearTimeout(timer);
        }
    }, [countdown]);

    const handleSendOtp = async () => {
        try {
            setSendingOtp(true);
            const message = await authService.sendEmailVerificationOtp();
            Alert.alert('Thành công', message);
            setCountdown(60); // 60 giây đếm ngược
        } catch (error: any) {
            Alert.alert('Lỗi', error.message || 'Không thể gửi mã OTP');
        } finally {
            setSendingOtp(false);
        }
    };

    const handleVerifyOtp = async () => {
        if (!otp.trim()) {
            Alert.alert('Lỗi', 'Vui lòng nhập mã OTP');
            return;
        }

        if (otp.length !== 6) {
            Alert.alert('Lỗi', 'Mã OTP phải có 6 chữ số');
            return;
        }

        try {
            setLoading(true);
            const message = await authService.verifyEmailOtp(otp);
            Alert.alert('Thành công', message, [
                {
                    text: 'OK',
                    onPress: () => {
                        onSuccess();
                        onClose();
                    },
                },
            ]);
        } catch (error: any) {
            Alert.alert('Lỗi', error.message || 'Mã OTP không hợp lệ');
        } finally {
            setLoading(false);
        }
    };

    const maskEmail = (email: string) => {
        const parts = email.split('@');
        if (parts.length !== 2) return email;
        const localPart = parts[0];
        const domain = parts[1];
        if (localPart.length <= 2) {
            return localPart.charAt(0) + '***@' + domain;
        }
        return localPart.charAt(0) + '***' + localPart.charAt(localPart.length - 1) + '@' + domain;
    };

    return (
        <Modal
            visible={visible}
            transparent
            animationType="fade"
            onRequestClose={onClose}
        >
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.overlay}
            >
                <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                    <View style={styles.overlay}>
                        <ScrollView
                            contentContainerStyle={styles.scrollContent}
                            keyboardShouldPersistTaps="handled"
                            showsVerticalScrollIndicator={false}
                        >
                            <View style={styles.modalContainer}>
                                {/* Header */}
                                <View style={styles.header}>
                                    <View style={styles.iconContainer}>
                                        <Ionicons name="mail-outline" size={40} color={Colors.primary} />
                                    </View>
                                    <Text style={styles.title}>Xác thực Email</Text>
                                    <Text style={styles.subtitle}>
                                        Mã OTP đã được gửi đến {maskEmail(userEmail)}
                                    </Text>
                                </View>

                                {/* OTP Input */}
                                <View style={styles.content}>
                                    <Text style={styles.label}>Nhập mã OTP (6 chữ số)</Text>
                                    <TextInput
                                        style={styles.otpInput}
                                        value={otp}
                                        onChangeText={setOtp}
                                        placeholder="000000"
                                        keyboardType="number-pad"
                                        maxLength={6}
                                        editable={!loading}
                                        placeholderTextColor={Colors.text.light}
                                    />

                                    {/* Resend OTP */}
                                    <View style={styles.resendContainer}>
                                        {countdown > 0 ? (
                                            <Text style={styles.countdownText}>
                                                Gửi lại mã sau {countdown}s
                                            </Text>
                                        ) : (
                                            <TouchableOpacity
                                                onPress={handleSendOtp}
                                                disabled={sendingOtp}
                                            >
                                                <Text style={styles.resendText}>
                                                    {sendingOtp ? 'Đang gửi...' : 'Gửi lại mã OTP'}
                                                </Text>
                                            </TouchableOpacity>
                                        )}
                                    </View>

                                    {/* Notice */}
                                    <View style={styles.noticeContainer}>
                                        <Ionicons name="time-outline" size={16} color={Colors.warning} />
                                        <Text style={styles.noticeText}>
                                            Mã OTP có hiệu lực trong 5 phút
                                        </Text>
                                    </View>
                                </View>

                                {/* Buttons */}
                                <View style={styles.buttonContainer}>
                                    <TouchableOpacity
                                        style={[styles.button, styles.cancelButton]}
                                        onPress={onClose}
                                        disabled={loading}
                                    >
                                        <Text style={styles.cancelButtonText}>Hủy</Text>
                                    </TouchableOpacity>

                                    <TouchableOpacity
                                        style={[
                                            styles.button,
                                            styles.verifyButton,
                                            loading && styles.buttonDisabled,
                                        ]}
                                        onPress={handleVerifyOtp}
                                        disabled={loading}
                                    >
                                        {loading ? (
                                            <ActivityIndicator color="#fff" />
                                        ) : (
                                            <Text style={styles.verifyButtonText}>Xác thực</Text>
                                        )}
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </ScrollView>
                    </View>
                </TouchableWithoutFeedback>
            </KeyboardAvoidingView>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(255, 255, 255, 0)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    scrollContent: {
        flexGrow: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 20,
    },
    modalContainer: {
        backgroundColor: '#fff',
        borderRadius: 16,
        width: '100%',
        maxWidth: 400,
        padding: 24,
        borderWidth: 2,
        borderColor: Colors.primary,
    },
    header: {
        alignItems: 'center',
        marginBottom: 24,
    },
    iconContainer: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: Colors.primary + '20',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: Colors.text.primary,
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 14,
        color: Colors.text.secondary,
        textAlign: 'center',
    },
    content: {
        marginBottom: 24,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: Colors.text.primary,
        marginBottom: 8,
    },
    otpInput: {
        borderWidth: 1,
        borderColor: Colors.border,
        borderRadius: 8,
        padding: 16,
        fontSize: 24,
        textAlign: 'center',
        letterSpacing: 8,
        fontWeight: 'bold',
        color: Colors.text.primary,
    },
    resendContainer: {
        alignItems: 'center',
        marginTop: 16,
    },
    resendText: {
        fontSize: 14,
        color: Colors.primary,
        fontWeight: '600',
    },
    countdownText: {
        fontSize: 14,
        color: Colors.text.secondary,
    },
    noticeContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.warning + '20',
        padding: 12,
        borderRadius: 8,
        marginTop: 16,
    },
    noticeText: {
        fontSize: 13,
        color: Colors.text.secondary,
        marginLeft: 8,
        flex: 1,
    },
    buttonContainer: {
        flexDirection: 'row',
        gap: 12,
    },
    button: {
        flex: 1,
        padding: 16,
        borderRadius: 8,
        alignItems: 'center',
    },
    cancelButton: {
        backgroundColor: Colors.gray[50],
        borderWidth: 1,
        borderColor: Colors.border,
    },
    cancelButtonText: {
        color: Colors.text.secondary,
        fontSize: 16,
        fontWeight: '600',
    },
    verifyButton: {
        backgroundColor: Colors.primary,
    },
    verifyButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    buttonDisabled: {
        opacity: 0.5,
    },
});
