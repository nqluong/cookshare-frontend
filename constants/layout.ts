import { Dimensions } from 'react-native';
import { moderateScale, scale, verticalScale } from 'react-native-size-matters';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export const Layout = {
  window: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
  },
  
  spacing: {
    xs: scale(4),
    sm: scale(8),
    md: scale(12),
    lg: scale(16),
    xl: scale(20),
    xxl: scale(24),
    xxxl: scale(32),
  },
  
  grid: {
    containerPadding: scale(16),
    cardGap: scale(12),
    numColumns: 3,
  },
  
  borderRadius: {
    sm: scale(8),
    md: scale(12),
    lg: scale(16),
    xl: scale(20),
    xxl: scale(24),
    round: 999,
  },
  
  fontSize: {
    xs: moderateScale(10),
    sm: moderateScale(12),
    md: moderateScale(14),
    lg: moderateScale(16),
    xl: moderateScale(18),
    xxl: moderateScale(20),
    xxxl: moderateScale(24),
  },
  
  iconSize: {
    xs: scale(16),
    sm: scale(20),
    md: scale(24),
    lg: scale(28),
    xl: scale(32),
  },
  
  shadow: {
    small: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: verticalScale(1) },
      shadowOpacity: 0.05,
      shadowRadius: scale(3),
      elevation: 2,
    },
    medium: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: verticalScale(2) },
      shadowOpacity: 0.1,
      shadowRadius: scale(4),
      elevation: 3,
    },
    large: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: verticalScale(4) },
      shadowOpacity: 0.15,
      shadowRadius: scale(8),
      elevation: 5,
    },
  },
};

export const calculateCardWidth = (
  numColumns: number = 3,
  gap: number = Layout.grid.cardGap,
  padding: number = Layout.grid.containerPadding
): number => {
  return (SCREEN_WIDTH - (padding * 2) - (gap * (numColumns - 1))) / numColumns;
};

export const getGridLayout = (numColumns: number = 3) => {
  const gap = Layout.grid.cardGap;
  const padding = Layout.grid.containerPadding;
  const cardWidth = calculateCardWidth(numColumns, gap, padding);
  
  return {
    cardWidth,
    gap,
    padding,
    numColumns,
  };
};

/**
 * Kiểm tra xem màn hình có phải là tablet không
 */
export const isTablet = SCREEN_WIDTH >= 768;

/**
 * Kiểm tra xem màn hình có phải là small device không
 */
export const isSmallDevice = SCREEN_WIDTH < 375;

// Export các functions từ react-native-size-matters để dùng trực tiếp
export { moderateScale, moderateScale as ms, scale as s, scale, verticalScale, verticalScale as vs };

export default Layout;
