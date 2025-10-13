// screens/Auth/RegisterForm.tsx -> ScreensAuthRegisterForm
import React from 'react';
import { View, SafeAreaView } from 'react-native';
import AuthRegisterFormInitial from '../../components/auth/RegisterFormInitial';
import { authStyles } from '../../styles/AuthStyle';

export default function ScreensAuthRegisterForm() {
  return (
    <SafeAreaView style={authStyles.screenContainer}>
      <View style={authStyles.screenContent}>
        <AuthRegisterFormInitial />
      </View>
    </SafeAreaView>
  );
}