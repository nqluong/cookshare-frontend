import { StyleSheet } from 'react-native';
import { isSmallDevice, isTablet, Layout, moderateScale, scale, verticalScale } from '../constants/layout';

export const authStyles = StyleSheet.create({
  // Container styles
  container: {
    backgroundColor: 'white',
    padding: isSmallDevice ? Layout.spacing.xl : Layout.spacing.xxxl,
    marginHorizontal: isSmallDevice ? Layout.spacing.xl : scale(40),
    borderRadius: Layout.borderRadius.xxl,
    shadowColor: '#FF6B35',
    shadowOffset: {
      width: 0,
      height: verticalScale(4),
    },
    shadowOpacity: 0.15,
    shadowRadius: scale(12),
    elevation: 8,
    // Giới hạn maxWidth cho tất cả màn hình
    maxWidth: isTablet ? scale(400) : scale(360),
    alignSelf: 'center',
  },

  // Header styles
  appTitle: {
    fontSize: isSmallDevice ? moderateScale(28) : moderateScale(36),
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: Layout.spacing.sm,
    color: '#FF6B35',
    letterSpacing: 1,
  },

  appSubtitle: {
    fontSize: Layout.fontSize.md,
    textAlign: 'center',
    color: '#FF8C42',
    marginBottom: verticalScale(40),
    fontStyle: 'italic',
  },

  title: {
    fontSize: isSmallDevice ? moderateScale(22) : moderateScale(28),
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: Layout.spacing.sm,
    color: '#2D3436',
  },

  subtitle: {
    fontSize: Layout.fontSize.lg,
    textAlign: 'center',
    color: '#636E72',
    marginBottom: Layout.spacing.xxxl,
    lineHeight: verticalScale(24),
  },

  // Form styles
  formContainer: {
    flex: 1,
  },

  inputContainer: {
    marginBottom: Layout.spacing.lg,
  },

  // Button styles
  primaryButton: {
    backgroundColor: '#FF6B35',
    height: verticalScale(56),
    borderRadius: Layout.borderRadius.lg,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: Layout.spacing.lg,
    marginBottom: Layout.spacing.xxl,
    shadowColor: '#FF6B35',
    shadowOffset: {
      width: 0,
      height: verticalScale(4),
    },
    shadowOpacity: 0.3,
    shadowRadius: scale(8),
    elevation: 6,
  },

  primaryButtonText: {
    color: '#ffffff',
    fontSize: moderateScale(17),
    fontWeight: '700',
    letterSpacing: 0.5,
  },

  secondaryButton: {
    backgroundColor: 'transparent',
    height: verticalScale(56),
    borderRadius: Layout.borderRadius.lg,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FF6B35',
  },

  secondaryButtonText: {
    color: '#FF6B35',
    fontSize: moderateScale(17),
    fontWeight: '700',
  },

  // Social login buttons
  googleButton: {
    backgroundColor: '#ffffff',
    height: verticalScale(56),
    borderRadius: Layout.borderRadius.lg,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Layout.spacing.md,
    borderWidth: 2,
    borderColor: '#E8E8E8',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: verticalScale(2),
    },
    shadowOpacity: 0.08,
    shadowRadius: scale(4),
    elevation: 3,
  },

  googleButtonText: {
    color: '#2D3436',
    fontSize: Layout.fontSize.lg,
    fontWeight: '600',
  },

  facebookButton: {
    backgroundColor: '#1877f2',
    height: verticalScale(56),
    borderRadius: Layout.borderRadius.lg,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Layout.spacing.xxl,
    shadowColor: '#1877f2',
    shadowOffset: {
      width: 0,
      height: verticalScale(4),
    },
    shadowOpacity: 0.3,
    shadowRadius: scale(8),
    elevation: 6,
  },

  facebookButtonText: {
    color: '#ffffff',
    fontSize: Layout.fontSize.lg,
    fontWeight: '700',
  },

  // Navigation styles
  navigationContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: Layout.spacing.xxl,
  },

  navigationText: {
    color: '#636E72',
    fontSize: moderateScale(15),
    textAlign: 'center',
    lineHeight: verticalScale(22),
  },

  navigationLink: {
    color: '#FF6B35',
    fontSize: moderateScale(15),
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
    marginVertical: Layout.spacing.xxl,
  },

  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#DFE6E9',
  },

  dividerText: {
    marginHorizontal: Layout.spacing.lg,
    color: '#B2BEC3',
    fontSize: Layout.fontSize.sm,
    fontWeight: '600',
    letterSpacing: 1,
  },

  // Terms and conditions
  termsText: {
    fontSize: Layout.fontSize.xs,
    textAlign: 'center',
    color: '#636E72',
    lineHeight: verticalScale(18),
    marginBottom: Layout.spacing.xxl,
  },

  linkText: {
    color: '#FF6B35',
    textDecorationLine: 'underline',
    fontWeight: '600',
  },

  // Error styles
  errorText: {
    color: '#D63031',
    fontSize: Layout.fontSize.xs,
    marginTop: Layout.spacing.xs,
    fontWeight: '500',
  },

  // Success styles
  successText: {
    color: '#00B894',
    fontSize: Layout.fontSize.xs,
    marginTop: Layout.spacing.xs,
    fontWeight: '500',
  },

  // Screen styles
  screenContainer: {
    flex: 1,
    backgroundColor: '#FFF5F0',
  },

  screenContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: isTablet ? Layout.spacing.xxxl : Layout.spacing.sm,
    paddingVertical: verticalScale(40),
  },

  // Decorative elements
  decorativeCircle: {
    position: 'absolute',
    width: scale(100),
    height: scale(100),
    borderRadius: scale(50),
    backgroundColor: '#FF6B35',
    opacity: 0.1,
  },

  decorativeCircleTop: {
    top: scale(-50),
    right: scale(-30),
  },

  decorativeCircleBottom: {
    bottom: scale(-50),
    left: scale(-30),
  },
});

// Common spacing values - sử dụng Layout.spacing thay thế
export const spacing = {
  xs: Layout.spacing.xs,
  sm: Layout.spacing.sm,
  md: Layout.spacing.lg,
  lg: Layout.spacing.xxl,
  xl: Layout.spacing.xxxl,
  xxl: scale(40),
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

// Typography - sử dụng responsive font size
export const typography = {
  appTitle: {
    fontSize: isSmallDevice ? moderateScale(28) : moderateScale(36),
    fontWeight: '700' as const,
    letterSpacing: 1,
  },
  title: {
    fontSize: isSmallDevice ? moderateScale(22) : moderateScale(28),
    fontWeight: '700' as const,
  },
  subtitle: {
    fontSize: Layout.fontSize.lg,
    fontWeight: '400' as const,
  },
  body: {
    fontSize: moderateScale(15),
    fontWeight: '400' as const,
  },
  caption: {
    fontSize: Layout.fontSize.xs,
    fontWeight: '400' as const,
  },
  button: {
    fontSize: moderateScale(17),
    fontWeight: '700' as const,
  },
} as const;