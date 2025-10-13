import React, { useState, useEffect } from 'react';
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
import { router, useLocalSearchParams } from 'expo-router';

export default function RegisterScreen() {
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
            onPress: () => router.replace('/(tabs)'),
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
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.formContainer}>
          {/* Logo/Header */}
          <Text style={styles.appTitle}>Cookshare</Text>

          {/* Main Title */}
          <Text style={styles.title}>Tạo tài khoản mới</Text>
          <Text style={styles.subtitle}>Điền thông tin để tạo tài khoản</Text>

          {/* Full Name Input */}
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="Họ và tên"
              value={formData.fullname}
              onChangeText={(value) => updateFormData('fullname', value)}
              autoCapitalize="words"
              autoCorrect={false}
            />
          </View>

          {/* Username Input */}
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="Tên đăng nhập"
              value={formData.username}
              onChangeText={(value) => updateFormData('username', value)}
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          {/* Email Input */}
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="Email"
              value={formData.email}
              onChangeText={(value) => updateFormData('email', value)}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          {/* Password Input */}
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="Mật khẩu"
              value={formData.password}
              onChangeText={(value) => updateFormData('password', value)}
              secureTextEntry
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          {/* Confirm Password Input */}
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="Xác nhận mật khẩu"
              value={formData.confirmPassword}
              onChangeText={(value) => updateFormData('confirmPassword', value)}
              secureTextEntry
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          {/* Register Button */}
          <TouchableOpacity
            style={[styles.registerButton, loading && styles.disabledButton]}
            onPress={handleRegister}
            disabled={loading}
          >
            <Text style={styles.registerButtonText}>
              {loading ? 'Đang đăng ký...' : 'Đăng ký'}
            </Text>
          </TouchableOpacity>

          {/* Navigate to login */}
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
    marginBottom: 16,
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
  registerButton: {
    backgroundColor: '#000000',
    height: 52,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 24,
  },
  registerButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
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