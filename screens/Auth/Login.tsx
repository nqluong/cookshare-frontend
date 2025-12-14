import { SafeAreaView, ScrollView } from 'react-native';
import AuthLoginForm from '../../components/auth/LoginForm';
import { authStyles } from '../../styles/AuthStyle';

export default function ScreensAuthLogin() {
  return (
    <SafeAreaView style={authStyles.screenContainer}>
      <ScrollView 
        contentContainerStyle={authStyles.screenContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <AuthLoginForm />
      </ScrollView>
    </SafeAreaView>
  );
}