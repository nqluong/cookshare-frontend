import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'google' | 'facebook';
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
}

export default function Button({ 
  title, 
  onPress, 
  variant = 'primary', 
  disabled = false,
  loading = false,
  style 
}: ButtonProps) {
  const getButtonStyle = () => {
    switch (variant) {
      case 'primary':
        return [styles.button, styles.primaryButton];
      case 'secondary':
        return [styles.button, styles.secondaryButton];
      case 'google':
        return [styles.button, styles.googleButton];
      case 'facebook':
        return [styles.button, styles.facebookButton];
      default:
        return [styles.button, styles.primaryButton];
    }
  };

  const getTextStyle = () => {
    switch (variant) {
      case 'primary':
        return styles.primaryText;
      case 'secondary':
        return styles.secondaryText;
      case 'google':
        return styles.googleText;
      case 'facebook':
        return styles.facebookText;
      default:
        return styles.primaryText;
    }
  };

  return (
    <TouchableOpacity
      style={[
        ...getButtonStyle(),
        disabled && styles.disabledButton,
        style
      ]}
      onPress={onPress}
      disabled={disabled || loading}
    >
      <Text style={getTextStyle()}>
        {loading ? 'Đang xử lý...' : title}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    height: 52,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  primaryButton: {
    backgroundColor: '#000000',
  },
  secondaryButton: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e1e5e9',
  },
  googleButton: {
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#dadce0',
  },
  facebookButton: {
    backgroundColor: '#1877f2',
  },
  primaryText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryText: {
    color: '#000000',
    fontSize: 16,
    fontWeight: '500',
  },
  googleText: {
    color: '#3c4043',
    fontSize: 16,
    fontWeight: '500',
  },
  facebookText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  disabledButton: {
    backgroundColor: '#ccc',
    opacity: 0.6,
  },
});