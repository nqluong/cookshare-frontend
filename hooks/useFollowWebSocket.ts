import websocketService from '@/services/websocketService';
import { useCallback, useEffect } from 'react';

interface FollowUpdate {
  action: 'FOLLOW' | 'UNFOLLOW';
  followerId: string;
  followingId: string;
  followerUsername: string;
  followerFullName: string;
  followerAvatarUrl: string;
  followerCount: number;
  followingCount: number;
  timestamp: string;
}

interface UseFollowWebSocketProps {
  userId?: string; // ID của user đang xem profile
  onFollowUpdate?: (data: FollowUpdate) => void;
}

export function useFollowWebSocket({ userId, onFollowUpdate }: UseFollowWebSocketProps) {
  const handleFollowUpdate = useCallback((data: FollowUpdate) => {
    console.log('[useFollowWebSocket] Follow update:', data);

    if (
      userId &&
      (data.followingId === userId || data.followerId === userId)
    ) {
      onFollowUpdate?.(data);
    }
  }, [userId, onFollowUpdate]);

  useEffect(() => {
    if (!userId) return;

    console.log('[useFollowWebSocket] Listen FOLLOW_UPDATE for:', userId);

    websocketService.on('FOLLOW_UPDATE', handleFollowUpdate);

    return () => {
      console.log('[useFollowWebSocket] Remove FOLLOW_UPDATE listener');
      websocketService.off('FOLLOW_UPDATE', handleFollowUpdate);
    };
  }, [userId, handleFollowUpdate]);
}
