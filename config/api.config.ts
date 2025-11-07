import { Platform } from 'react-native';

// 🌐 Configuration priorities (theo thứ tự ưu tiên):
// 1. EXPO_PUBLIC_API_HOST từ .env
// 2. Manual override trong DEV_CONFIG
// 3. Auto-detected IP (chỉ trong development)
// 4. Production URL

const DEV_CONFIG = {
  // Set manual IP nếu auto-detect không work
  MANUAL_IP: null as string | null, // Ví dụ: 'http://192.168.1.151:8080'

  // Fallback IP nếu auto-detect fail ( điền ip thật ở đây )

  FALLBACK_IP: 'http://172.19.232.92:8080',

  // Port của backend
  PORT: 8080,
};

const PROD_CONFIG = {
  API_URL: 'https://api.cookshare.com', // Thay bằng production URL
};

const getPlatformSpecificHost = (): string | null => {
  if (Platform.OS === 'web') {
    return 'http://localhost:8080';
  }

  if (Platform.OS === 'android') {
    return 'http://172.19.232.92:8080';
  }

  return null; // iOS/Physical devices sẽ dùng IP thật
};

// 🔍 Get API Host với priority order
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

  TIMEOUT: 3000, // 3 giây

  DEFAULT_HEADERS: {
    'Content-Type': 'application/json',
  },
};

// 🖼️ Helper function để tạo URL cho ảnh
export const getImageUrl = (imagePath: string | null | undefined): string => {
  if (!imagePath) {
    return 'https://via.placeholder.com/400';
  }

  const normalizedPath = imagePath.replace(/\\/g, '/');

  return `${API_CONFIG.BASE_URL}/${normalizedPath}`;
};

// 📊 Debug helper - log API config khi khởi động
if (__DEV__) {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('🔧 API Configuration');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`📱 Platform: ${Platform.OS}`);
  console.log(`🌐 API Host: ${API_HOST}`);
  console.log(`📍 API V1: ${API_CONFIG.API_V1_URL}`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
}


