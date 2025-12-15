import { StyleSheet, Platform } from 'react-native';

export const authStyles = StyleSheet.create({
  // Container styles
  container: {
    backgroundColor: 'white',
    padding: Platform.OS === 'android' ? 20 : 32,
    marginHorizontal: 16,
    borderRadius: 24,
    shadowColor: '#FF6B35',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },

  // Header styles
  appTitle: {
    fontSize: Platform.OS === 'android' ? 30 : 36,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: Platform.OS === 'android' ? 4 : 8,
    color: '#FF6B35',
    letterSpacing: 1,
  },

  appSubtitle: {
    fontSize: 14,
    textAlign: 'center',
    color: '#FF8C42',
    marginBottom: 40,
    fontStyle: 'italic',
  },

  title: {
    fontSize: Platform.OS === 'android' ? 24 : 28,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: Platform.OS === 'android' ? 4 : 8,
    color: '#2D3436',
  },

  subtitle: {
    fontSize: Platform.OS === 'android' ? 14 : 16,
    textAlign: 'center',
    color: '#636E72',
    marginBottom: Platform.OS === 'android' ? 20 : 32,
    lineHeight: Platform.OS === 'android' ? 20 : 24,
  },

  // Form styles
  formContainer: {
    flex: 1,
  },

  inputContainer: {
    marginBottom: 16,
  },

  // Button styles
  primaryButton: {
    backgroundColor: '#FF6B35',
    height: Platform.OS === 'android' ? 46 : 56,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: Platform.OS === 'android' ? 8 : 16,
    marginBottom: Platform.OS === 'android' ? 16 : 24,
    shadowColor: '#FF6B35',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },

  primaryButtonText: {
    color: '#ffffff',
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: 0.5,
  },

  secondaryButton: {
    backgroundColor: 'transparent',
    height: 56,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FF6B35',
  },

  secondaryButtonText: {
    color: '#FF6B35',
    fontSize: 17,
    fontWeight: '700',
  },

  // Social login buttons
  googleButton: {
    backgroundColor: '#ffffff',
    height: Platform.OS === 'android' ? 46 : 56,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Platform.OS === 'android' ? 10 : 12,
    borderWidth: 2,
    borderColor: '#E8E8E8',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
  },

  googleButtonText: {
    color: '#2D3436',
    fontSize: 16,
    fontWeight: '600',
  },

  facebookButton: {
    backgroundColor: '#1877f2',
    height: Platform.OS === 'android' ? 46 : 56,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Platform.OS === 'android' ? 16 : 24,
    shadowColor: '#1877f2',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },

  facebookButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },

  // Navigation styles
  navigationContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: Platform.OS === 'android' ? 12 : 24,
  },

  navigationText: {
    color: '#636E72',
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 22,
  },

  navigationLink: {
    color: '#FF6B35',
    fontSize: 15,
    fontWeight: '700',
    textDecorationLine: 'underline',
  },

  // State styles
  disabledButton: {
    backgroundColor: '#FFB088',
    opacity: 0.6,
  },

  loadingButton: {
    opacity: 0.8,
  },

  // Divider styles
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: Platform.OS === 'android' ? 16 : 24,
  },

  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#DFE6E9',
  },

  dividerText: {
    marginHorizontal: 16,
    color: '#B2BEC3',
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: 1,
  },

  // Terms and conditions
  termsText: {
    fontSize: 12,
    textAlign: 'center',
    color: '#636E72',
    lineHeight: 18,
    marginBottom: 24,
  },

  linkText: {
    color: '#FF6B35',
    textDecorationLine: 'underline',
    fontWeight: '600',
  },

  // Error styles
  errorText: {
    color: '#D63031',
    fontSize: 12,
    marginTop: 4,
    fontWeight: '500',
  },

  // Success styles
  successText: {
    color: '#00B894',
    fontSize: 12,
    marginTop: 4,
    fontWeight: '500',
  },

  // Screen styles
  screenContainer: {
    flex: 1,
    backgroundColor: '#FFF5F0',
  },

  screenContent: {
    flex: 1,
    justifyContent: 'center',
  },

  // Decorative elements
  decorativeCircle: {
    position: 'absolute',
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#FF6B35',
    opacity: 0.1,
  },

  decorativeCircleTop: {
    top: -50,
    right: -30,
  },

  decorativeCircleBottom: {
    bottom: -50,
    left: -30,
  },
});

// Common spacing values
export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 40,
} as const;

// Common colors - Orange Theme
export const colors = {
  primary: '#FF6B35',
  primaryLight: '#FF8C42',
  primaryDark: '#E85D2D',
  secondary: '#636E72',
  background: '#FFF5F0',
  cardBackground: '#FFFFFF',
  border: '#DFE6E9',
  borderLight: '#E8E8E8',
  error: '#D63031',
  success: '#00B894',
  text: '#2D3436',
  textLight: '#636E72',
  textLighter: '#B2BEC3',
  google: '#FFFFFF',
  googleBorder: '#E8E8E8',
  googleText: '#2D3436',
  facebook: '#1877f2',
  shadow: '#FF6B35',
} as const;

// Typography
export const typography = {
  appTitle: {
    fontSize: 36,
    fontWeight: '700' as const,
    letterSpacing: 1,
  },
  title: {
    fontSize: 28,
    fontWeight: '700' as const,
  },
  subtitle: {
    fontSize: 24,
    fontWeight: '400' as const,
  },
  body: {
    fontSize: 15,
    fontWeight: '400' as const,
  },
  caption: {
    fontSize: 12,
    fontWeight: '400' as const,
  },
  button: {
    fontSize: 17,
    fontWeight: '700' as const,
  },
} as const;