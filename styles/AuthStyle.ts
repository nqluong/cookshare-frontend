import { StyleSheet } from 'react-native';

export const authStyles = StyleSheet.create({
  // Container styles
  container: {
    backgroundColor: 'white',
    padding: 32,
  },
  
  // Header styles
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
  
  // Form styles
  formContainer: {
    flex: 1,
  },
  
  inputContainer: {
    marginBottom: 16,
  },
  
  // Button styles
  primaryButton: {
    backgroundColor: '#000000',
    height: 52,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 24,
  },
  
  primaryButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  
  secondaryButton: {
    backgroundColor: 'transparent',
    height: 52,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e1e5e9',
  },
  
  secondaryButtonText: {
    color: '#000000',
    fontSize: 16,
    fontWeight: '600',
  },
  
  // Social login buttons
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
  
  // Navigation styles
  navigationContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 24,
  },
  
  navigationText: {
    color: '#666',
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  
  navigationLink: {
    color: '#000000',
    fontSize: 14,
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
  
  // State styles
  disabledButton: {
    backgroundColor: '#ccc',
    opacity: 0.6,
  },
  
  loadingButton: {
    opacity: 0.7,
  },
  
  // Divider styles
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 24,
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
  
  // Terms and conditions
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
  
  // Error styles
  errorText: {
    color: '#dc3545',
    fontSize: 12,
    marginTop: 4,
  },
  
  // Success styles
  successText: {
    color: '#28a745',
    fontSize: 12,
    marginTop: 4,
  },
  
  // Screen styles
  screenContainer: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  
  screenContent: {
    flex: 1,
    justifyContent: 'center',
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

// Common colors
export const colors = {
  primary: '#000000',
  secondary: '#666666',
  background: '#ffffff',
  border: '#e1e5e9',
  error: '#dc3545',
  success: '#28a745',
  google: '#f8f9fa',
  googleBorder: '#dadce0',
  googleText: '#3c4043',
  facebook: '#1877f2',
} as const;

// Typography
export const typography = {
  title: {
    fontSize: 24,
    fontWeight: '600' as const,
  },
  subtitle: {
    fontSize: 16,
    fontWeight: '400' as const,
  },
  body: {
    fontSize: 14,
    fontWeight: '400' as const,
  },
  caption: {
    fontSize: 12,
    fontWeight: '400' as const,
  },
  button: {
    fontSize: 16,
    fontWeight: '600' as const,
  },
} as const;