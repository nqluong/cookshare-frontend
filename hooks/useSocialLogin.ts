import { useState, useCallback } from 'react';
import { Alert } from 'react-native';
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

    const { loginWithSocialTokens } = useAuth() as any;

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
                    try {
                        const errorData = await response.json();
                        console.log(`🚨 ${provider} auth error received:`, errorData);
                        
                        // Throw error để dừng polling và trigger catch block
                        const errorMessage = errorData.message || 'Xác thực thất bại';
                        throw new Error(errorMessage);
                    } catch (e: any) {
                        // Re-throw để dừng polling
                        throw e;
                    }
                }

                // Kiểm tra lỗi từ backend (ví dụ: tài khoản bị khóa)
                if (response.status === 400 || response.status === 403) {
                    try {
                        const errorData = await response.json();
                        // Nếu là lỗi USER_NOT_ACTIVE, throw ngay để dừng polling
                        if (errorData.code === 4002 || errorData.message?.includes('không hoạt động') || errorData.message?.includes('bị khóa')) {
                            throw new Error('Tài khoản này đã bị khóa');
                        }
                    } catch (e: any) {
                        // Nếu parse lỗi hoặc là lỗi tài khoản bị khóa, throw ra ngoài
                        if (e.message === 'Tài khoản này đã bị khóa') {
                            throw e;
                        }
                    }
                }

                // Wait 1 second before next attempt
                if (attempt < maxAttempts) {
                    await new Promise(resolve => setTimeout(resolve, 1000));
                }
            } catch (error: any) {
                if (error.name === 'AbortError') {
                    console.log(`⚠️ ${provider} polling aborted (fetch error)`);
                    return null;
                }

                // ✅ Nếu là lỗi xác thực (từ HTTP 401 hoặc logic khác), throw ngay ra ngoài
                if (error.message && (
                    error.message.includes('bị khóa') || 
                    error.message.includes('không hoạt động') ||
                    error.message.includes('Xác thực thất bại')
                )) {
                    console.log(`🚨 ${provider} auth error detected, stop polling:`, error.message);
                    throw error; // Throw ra ngoài để dừng hoàn toàn
                }

                console.error(`❌ ${provider} polling attempt ${attempt} failed:`, error);

                if (attempt < maxAttempts) {
                    await new Promise(resolve => setTimeout(resolve, 1000));
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
            
            // ✅ Track xem browser có bị đóng sớm không
            let browserDismissed = false;
            let authCompleted = false;

            // Mở browser (non-blocking)
            const browserPromise = WebBrowser.openBrowserAsync(authUrl).catch(e => {
                console.warn(`Could not open ${provider} browser:`, e);
                return null as any;
            });

            // Xử lý khi user đóng browser hoặc redirect về app
            browserPromise.then((result: any) => {
                console.log(`📱 Browser result:`, result);
                
                const type = result?.type ? String(result.type).toLowerCase() : '';
                
                // Browser bị đóng (có thể do user hoặc do error page tự đóng)
                if (!result || type === 'dismiss' || type === 'cancel' || type === 'closed') {
                    console.log(`✖️ ${provider} browser dismissed/closed`);
                    browserDismissed = true;
                    try { controller.abort(); } catch (e) { /* ignore */ }
                    setLoading(false);
                }
            }).catch(e => console.warn('Browser promise handler error:', e));

            console.log(`📊 ${provider} browser opened, start polling...`);

            // Poll kết quả
            const authResult = await pollAuthResult(state, provider, 60, controller.signal);

            if (authResult) {
                console.log(`🎉 ${provider} auth result received!`);
                console.log('👤 User:', authResult.user.username);
                
                // ✅ Đánh dấu auth đã hoàn thành
                authCompleted = true;

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
                
                // ✅ Nếu browser bị đóng sớm, có thể là lỗi backend (ví dụ: tài khoản bị ban)
                if (browserDismissed) {
                    console.log('🚫 Browser was dismissed early - checking for error...');
                    Alert.alert(
                        'Đăng nhập thất bại', 
                        'Tài khoản này có thể đã bị khóa hoặc có lỗi xảy ra. Vui lòng thử lại sau.'
                    );
                } else {
                    // Browser vẫn mở nhưng timeout
                    try { await WebBrowser.dismissBrowser(); } catch (e) { /* ignore */ }
                    Alert.alert('Lỗi', `Không nhận được thông tin đăng nhập từ ${provider}`);
                }
            }

        } catch (error: any) {
            console.error(`❌ Error in ${provider} login:`, error);

            // Đóng browser NGAY trước khi hiển thị alert
            try {
                await WebBrowser.dismissBrowser();
                console.log(`🚪 Browser dismissed for ${provider}`);
            } catch (e) {
                console.warn('Could not dismiss browser:', e);
            }

            // Xử lý message cụ thể cho lỗi tài khoản bị khóa
            const errorMessage = error.message || `Không thể đăng nhập với ${provider}`;

            if (errorMessage.includes('bị khóa')) {
                Alert.alert('Tài khoản bị khóa', errorMessage);
            } else {
                Alert.alert('Lỗi', errorMessage);
            }
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