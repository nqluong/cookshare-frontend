import { Platform } from 'react-native';

// Configuration priorities (theo thứ tự ưu tiên):
// 1. EXPO_PUBLIC_API_HOST từ .env
// 2. Manual override trong DEV_CONFIG
// 3. Auto-detected IP (chỉ trong development)
// 4. Production URL

const DEV_CONFIG = {
  MANUAL_IP: null as string | null, 


  FALLBACK_IP: 'https://cookshare-app.io.vn',

  // Port của backend
  PORT: 8080,
};

const PROD_CONFIG = {
  API_URL: 'https://cookshare-app.io.vn', // Thay bằng production URL
};

const getPlatformSpecificHost = (): string | null => {
  if (Platform.OS === 'web') {
    return 'https://cookshare-app.io.vn';
  }

  if (Platform.OS === 'android') {
    return 'https://cookshare-app.io.vn';
  }

  return null; // iOS/Physical devices sẽ dùng IP thật
};

// Get API Host với priority order
const getApiHost = (): string => {
  if (process.env.EXPO_PUBLIC_API_HOST) {
    return process.env.EXPO_PUBLIC_API_HOST;
  }

  // 2. Manual override trong development
  if (__DEV__ && DEV_CONFIG.MANUAL_IP) {
    return DEV_CONFIG.MANUAL_IP;
  }

  // 3. Platform-specific (Android Emulator, Web)
  const platformHost = getPlatformSpecificHost();
  if (platformHost) {
    return platformHost;
  }

  // 4. Development fallback
  if (__DEV__) {
    return DEV_CONFIG.FALLBACK_IP;
  }

  // 5. Production
  return PROD_CONFIG.API_URL;
};

const API_HOST = getApiHost();

// Các phiên bản API
const API_VERSION = {
  V1: '/api/v1',
  V2: '/api/v2',
};

export const API_CONFIG = {
  // Base URLs
  BASE_URL: API_HOST,
  API_V1_URL: `${API_HOST}${API_VERSION.V1}`,
  API_V2_URL: `${API_HOST}${API_VERSION.V2}`,

  TIMEOUT: 3000, 

  DEFAULT_HEADERS: {
    'Content-Type': 'application/json',
  },
};

export const getImageUrl = (imagePath: string | null | undefined): string => {
  if (!imagePath) {
    return 'https://via.placeholder.com/400';
  }

  const trimmed = imagePath.toString().trim();

  if (trimmed.startsWith('http://') || trimmed.startsWith('https://') || trimmed.startsWith('//')) {
    return trimmed;
  }

  if (trimmed.startsWith('file://')) {
    return trimmed;
  }

  const normalizedPath = trimmed.replace(/\\/g, '/').replace(/^\/+/, '');
  return `${API_CONFIG.BASE_URL}/${normalizedPath}?t=${Date.now()}`;
};

if (__DEV__) {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('🔧 API Configuration');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`📱 Platform: ${Platform.OS}`);
  console.log(`🌐 API Host: ${API_HOST}`);
  console.log(`📍 API V1: ${API_CONFIG.API_V1_URL}`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
}


// WebSocket URL sẽ tự động được tạo từ API_BASE_URL
export const WS_BASE_URL = API_CONFIG.BASE_URL.replace('http', 'ws').replace('/api', '');