import { useState, useCallback, useRef, useEffect } from 'react';
import { Alert, AppState, AppStateStatus } from 'react-native';
import { router } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import { useAuth } from '../context/AuthContext';
import { API_CONFIG } from '../config/api.config';

// Đảm bảo WebBrowser được cleanup sau khi auth
WebBrowser.maybeCompleteAuthSession();

type SocialProvider = 'google' | 'facebook';

interface SocialLoginResult {
    accessToken: string;
    refreshToken: string;
    user: {
        userId: string;
        username: string;
        email: string;
        fullName: string;
        avatarUrl?: string;
        role: string;
        isActive: boolean;
        emailVerified: boolean;
    };
}

export const useSocialLogin = () => {
    const [googleLoading, setGoogleLoading] = useState(false);
    const [facebookLoading, setFacebookLoading] = useState(false);

    // ✅ Ref để track OAuth flow đang diễn ra
    const oauthControllerRef = useRef<AbortController | null>(null);
    const isOAuthInProgressRef = useRef(false);

    const { loginWithSocialTokens } = useAuth() as any;

    // ✅ Lắng nghe AppState để detect khi user quay lại app từ browser
    useEffect(() => {
        const subscription = AppState.addEventListener('change', (nextAppState: AppStateStatus) => {
            // Khi app active lại và đang trong OAuth flow
            if (nextAppState === 'active' && isOAuthInProgressRef.current) {
                console.log('📱 App became active during OAuth - user likely dismissed browser');
                // Chờ một chút để xem có kết quả không
                setTimeout(() => {
                    if (isOAuthInProgressRef.current && oauthControllerRef.current) {
                        console.log('🚫 No result after app active - aborting OAuth polling');
                        oauthControllerRef.current.abort();
                        isOAuthInProgressRef.current = false;
                    }
                }, 2000); // Chờ 2s để backend có thể trả về kết quả nếu có
            }
        });

        return () => {
            subscription?.remove();
        };
    }, []);

    /**
     * Generate random state để tracking
     */
    const generateState = useCallback((): string => {
        return Math.random().toString(36).substring(2, 15) +
            Math.random().toString(36).substring(2, 15);
    }, []);

    /**
     * Poll kết quả auth từ backend
     */
    const pollAuthResult = useCallback(async (
        state: string,
        provider: SocialProvider,
        maxAttempts = 60,
        signal?: AbortSignal
    ): Promise<SocialLoginResult | null> => {
        console.log(`🔄 Starting to poll ${provider} auth result...`);

        for (let attempt = 1; attempt <= maxAttempts; attempt++) {
            // Check if aborted
            if (signal?.aborted) {
                console.log(`⚠️ ${provider} polling aborted`);
                return null;
            }

            try {
                // Log every 5 attempts
                if (attempt === 1 || attempt % 5 === 0) {
                    console.log(`🔡 ${provider} polling attempt ${attempt}/${maxAttempts}...`);
                }

                const response = await fetch(
                    `${API_CONFIG.BASE_URL}/auth/${provider}/result/${state}`,
                    {
                        method: 'GET',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        signal,
                    }
                );

                if (response.ok) {
                    const result = await response.json();
                    console.log(`✅ ${provider} auth result found!`);
                    return result;
                }

                // ✅ Kiểm tra HTTP 401 - backend trả về error result từ authErrors map
                if (response.status === 401) {
                    const errorData = await response.json();
                    console.log(`🚨 ${provider} auth error received:`, errorData);

                    // Throw error để dừng polling
                    throw new Error(errorData.message || 'Xác thực thất bại');
                }

                // Wait 1 second before next attempt
                if (attempt < maxAttempts) {
                    await new Promise((resolve, reject) => {
                        const timeout = setTimeout(resolve, 1000);
                        // ✅ Lắng nghe abort signal để dừng setTimeout ngay
                        signal?.addEventListener('abort', () => {
                            clearTimeout(timeout);
                            reject(new Error('AbortError'));
                        });
                    });
                }
            } catch (error: any) {
                if (error.name === 'AbortError' || error.message === 'AbortError') {
                    console.log(`⚠️ ${provider} polling aborted (fetch error)`);
                    return null;
                }

                // Nếu là lỗi xác thực, throw ra ngoài để dừng hoàn toàn
                if (error.message && error.message !== 'AbortError') {
                    console.log(`🚨 ${provider} auth error detected, stop polling:`, error.message);
                    throw error;
                }

                console.log(`❌ ${provider} polling attempt ${attempt} failed:`, error);

                if (attempt < maxAttempts) {
                    await new Promise((resolve, reject) => {
                        const timeout = setTimeout(resolve, 1000);
                        // ✅ Lắng nghe abort signal để dừng setTimeout ngay
                        signal?.addEventListener('abort', () => {
                            clearTimeout(timeout);
                            reject(new Error('AbortError'));
                        });
                    });
                }
            }
        }

        console.log(`⏱️ ${provider} polling timeout`);
        return null;
    }, []);

    /**
     * Xử lý login với social provider
     */
    const handleSocialLogin = useCallback(async (provider: SocialProvider) => {
        const setLoading = provider === 'google' ? setGoogleLoading : setFacebookLoading;

        try {
            console.log(`🚀 Initiating ${provider} login...`);
            setLoading(true);

            // Generate state
            const state = generateState();
            console.log(`🎲 Generated ${provider} state:`, state);

            // Tạo auth URL
            const authUrl = `${API_CONFIG.BASE_URL}/auth/${provider}/login?state=${state}`;
            console.log(`🌐 Opening ${provider} auth URL:`, authUrl);

            // Create AbortController để có thể hủy polling
            const controller = new AbortController();
            oauthControllerRef.current = controller;
            isOAuthInProgressRef.current = true;

            // Mở browser (non-blocking)
            const browserPromise = WebBrowser.openBrowserAsync(authUrl).catch(e => {
                console.log(`Could not open ${provider} browser:`, e.message || e);
                return null as any;
            });

            // Xử lý khi browser resolve (trên Android chỉ resolve khi mở, không phải khi đóng)
            browserPromise.then((result: any) => {
                console.log(`🔍 Browser result received:`, result);
                const type = result?.type ? String(result.type).toLowerCase() : '';
                // Chỉ handle khi browser dismissed/cancel/closed (iOS behavior)
                if (type === 'dismiss' || type === 'cancel' || type === 'closed') {
                    console.log(`✖️ ${provider} browser dismissed/closed by user`);
                    console.log(`🔧 Calling controller.abort()...`);
                    controller.abort();
                    isOAuthInProgressRef.current = false;
                }
            }).catch(e => console.log('Browser promise handler error:', e.message || e));

            console.log(`📊 ${provider} browser opened, start polling...`);

            // Poll kết quả
            const authResult = await pollAuthResult(state, provider, 60, controller.signal);

            // ✅ Clear OAuth state
            isOAuthInProgressRef.current = false;
            oauthControllerRef.current = null;

            console.log(`🔍 Polling finished. authResult:`, authResult ? 'SUCCESS' : 'NULL');
            console.log(`🔍 controller.signal.aborted:`, controller.signal.aborted);

            // ✅ Nếu polling bị abort (user đóng browser) → return ngay
            if (controller.signal.aborted && !authResult) {
                console.log(`🚫 User dismissed browser, cancelling login...`);
                return;
            }

            if (authResult) {
                console.log(`🎉 ${provider} auth result received!`);
                console.log('👤 User:', authResult.user.username);

                // Lưu tokens và user info
                const success = await loginWithSocialTokens(
                    authResult.accessToken,
                    authResult.refreshToken,
                    authResult.user
                );

                if (success) {
                    console.log('✅ Login successful, navigating to home...');

                    // Đóng browser
                    try { await WebBrowser.dismissBrowser(); } catch (e) { /* ignore */ }

                    // Show success alert và navigate
                    Alert.alert(
                        'Thành công!',
                        `Chào mừng ${authResult.user.fullName}!`,
                        [{
                            text: 'OK',
                            onPress: () => router.replace('/(tabs)/home' as any)
                        }]
                    );
                } else {
                    Alert.alert('Lỗi', 'Không thể lưu thông tin đăng nhập');
                }
            } else {
                console.log(`❌ No ${provider} auth result found`);
                try { await WebBrowser.dismissBrowser(); } catch (e) { /* ignore */ }
                Alert.alert('Lỗi', `Không nhận được thông tin đăng nhập từ ${provider}`);
            }

        } catch (error: any) {
            console.log(`❌ Error in ${provider} login:`, error.message || error);

            // Đóng browser
            try {
                await WebBrowser.dismissBrowser();
            } catch (e) {
                // Ignore dismiss errors
            }

            // Hiển thị lỗi
            Alert.alert('Đăng nhập thất bại', error.message || `Không thể đăng nhập với ${provider}`);
        } finally {
            setLoading(false);
        }
    }, [generateState, pollAuthResult, loginWithSocialTokens]);

    /**
     * Login với Google
     */
    const loginWithGoogle = useCallback(() => {
        return handleSocialLogin('google');
    }, [handleSocialLogin]);

    /**
     * Login với Facebook
     */
    const loginWithFacebook = useCallback(() => {
        return handleSocialLogin('facebook');
    }, [handleSocialLogin]);

    return {
        // States
        googleLoading,
        facebookLoading,
        isLoading: googleLoading || facebookLoading,

        // Actions
        loginWithGoogle,
        loginWithFacebook,
    };
};