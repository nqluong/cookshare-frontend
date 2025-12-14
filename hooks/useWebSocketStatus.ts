import websocketService from '@/services/websocketService';
import { useEffect, useState } from 'react';

export function useWebSocketStatus() {
  const [isConnected, setIsConnected] = useState(() => 
    websocketService.isConnected()
  );

  useEffect(() => {
    console.log(' [useWebSocketStatus] Setup listener');

    const handleStatusChange = (connected: boolean) => {
      console.log(' [useWebSocketStatus] Status changed:', connected);
      setIsConnected(connected);
    };

    // ✅ Register listener
    websocketService.on('connectionStatusChange', handleStatusChange);

    // ✅ Sync initial state
    const currentStatus = websocketService.isConnected();
    if (currentStatus !== isConnected) {
      console.log(' [useWebSocketStatus] Syncing initial state:', currentStatus);
      setIsConnected(currentStatus);
    }

    // ✅ Cleanup
    return () => {
      console.log(' [useWebSocketStatus] Cleanup listener');
      websocketService.off('connectionStatusChange', handleStatusChange);
    };
  }, []);

  return isConnected;
}