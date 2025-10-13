// screens/Auth/Register.tsx -> ScreensAuthRegister
import React from 'react';
import { View, SafeAreaView } from 'react-native';
import AuthRegisterForm from '../../components/auth/RegisterForm';
import { authStyles } from '../../styles/AuthStyle';

export default function ScreensAuthRegister() {
  return (
    <SafeAreaView style={authStyles.screenContainer}>
      <View style={authStyles.screenContent}>
        <AuthRegisterForm />
      </View>
    </SafeAreaView>
  );
}