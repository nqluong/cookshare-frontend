import { SafeAreaView, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import AuthLoginForm from '../../components/auth/LoginForm';
import { authStyles } from '../../styles/AuthStyle';

export default function ScreensAuthLogin() {
  return (
    <SafeAreaView style={authStyles.screenContainer}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={{
            flexGrow: 1,
            justifyContent: 'center',
            paddingVertical: Platform.OS === 'android' ? 20 : 40
          }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          bounces={false}
        >
          <AuthLoginForm />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}