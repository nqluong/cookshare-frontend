import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { router } from 'expo-router';

export default function RegisterFormScreen() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();

  const handleContinue = () => {
    if (!email.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập email');
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Alert.alert('Lỗi', 'Email không đúng định dạng');
      return;
    }

    // Chuyển đến màn hình đăng ký với email
    router.push({
      pathname: '/auth/register',
      params: { email: email.trim() }
    } as any);
  };

  const handleGoogleLogin = () => {
    Alert.alert('Chưa hỗ trợ', 'Tính năng đăng nhập Google sẽ được phát triển trong tương lai');
  };

  const handleFacebookLogin = () => {
    Alert.alert('Chưa hỗ trợ', 'Tính năng đăng nhập Facebook sẽ được phát triển trong tương lai');
  };

  const navigateToLogin = () => {
    router.push('/auth/login' as any);
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.formContainer}>
          {/* Logo/Header */}
          <Text style={styles.appTitle}>Cookshare</Text>

          {/* Main Title */}
          <Text style={styles.title}>Tạo một tài khoản</Text>
          <Text style={styles.subtitle}>Nhập email của bạn để đăng ký ứng dụng này</Text>

          {/* Email Input */}
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="email@domain.com"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          {/* Continue Button (Black) */}
          <TouchableOpacity
            style={[styles.continueButton, loading && styles.disabledButton]}
            onPress={handleContinue}
            disabled={loading}
          >
            <Text style={styles.continueButtonText}>
              {loading ? 'Đang xử lý...' : 'Tiếp tục'}
            </Text>
          </TouchableOpacity>

          {/* Divider */}
          <View style={styles.dividerContainer}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>or</Text>
            <View style={styles.dividerLine} />
          </View>

          {/* Google Button (Gray) */}
          <TouchableOpacity
            style={styles.googleButton}
            onPress={handleGoogleLogin}
          >
            <Text style={styles.googleButtonText}>Tiếp tục với Google</Text>
          </TouchableOpacity>

          {/* Facebook Button (Blue) */}
          <TouchableOpacity
            style={styles.facebookButton}
            onPress={handleFacebookLogin}
          >
            <Text style={styles.facebookButtonText}>Tiếp tục với Facebook</Text>
          </TouchableOpacity>

          {/* Terms */}
          <Text style={styles.termsText}>
            Bằng cách nhấp vào tiếp tục, bạn đồng ý với{' '}
            <Text style={styles.linkText}>Điều khoản dịch vụ</Text> và{' '}
            <Text style={styles.linkText}>Chính sách bảo mật</Text> của chúng tôi
          </Text>

          {/* Already have account */}
          <View style={styles.loginContainer}>
            <Text style={styles.loginText}>Đã có tài khoản? </Text>
            <TouchableOpacity onPress={navigateToLogin}>
              <Text style={styles.loginLink}>Đăng nhập</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 24,
  },
  formContainer: {
    backgroundColor: 'white',
    padding: 32,
  },
  appTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 40,
    color: '#000',
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 8,
    color: '#000',
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    color: '#666',
    marginBottom: 32,
  },
  inputContainer: {
    marginBottom: 24,
  },
  input: {
    height: 52,
    borderWidth: 1,
    borderColor: '#e1e5e9',
    borderRadius: 8,
    paddingHorizontal: 16,
    fontSize: 16,
    backgroundColor: '#ffffff',
  },
  continueButton: {
    backgroundColor: '#000000',
    height: 52,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  continueButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#e1e5e9',
  },
  dividerText: {
    marginHorizontal: 16,
    color: '#666',
    fontSize: 14,
  },
  googleButton: {
    backgroundColor: '#f8f9fa',
    height: 52,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#dadce0',
  },
  googleButtonText: {
    color: '#3c4043',
    fontSize: 16,
    fontWeight: '500',
  },
  facebookButton: {
    backgroundColor: '#1877f2',
    height: 52,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  facebookButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  termsText: {
    fontSize: 12,
    textAlign: 'center',
    color: '#666',
    lineHeight: 18,
    marginBottom: 24,
  },
  linkText: {
    color: '#000000',
    textDecorationLine: 'underline',
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loginText: {
    color: '#666',
    fontSize: 14,
  },
  loginLink: {
    color: '#000000',
    fontSize: 14,
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
  disabledButton: {
    backgroundColor: '#ccc',
    opacity: 0.6,
  },
});