// screens/Auth/Login.tsx -> ScreensAuthLogin
import React from 'react';
import { View, SafeAreaView } from 'react-native';
import AuthLoginForm from '../../components/auth/LoginForm';
import { authStyles } from '../../styles/AuthStyle';

export default function ScreensAuthLogin() {
  return (
    <SafeAreaView style={authStyles.screenContainer}>
      <View style={authStyles.screenContent}>
        <AuthLoginForm />
      </View>
    </SafeAreaView>
  );
}