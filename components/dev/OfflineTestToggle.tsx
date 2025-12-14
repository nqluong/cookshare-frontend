import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useEffect, useState } from 'react';
import { Alert, StyleSheet, Switch, Text, View } from 'react-native';

const DEV_OFFLINE_KEY = '__DEV_FORCE_OFFLINE__';

/**
 * Component dev-only để test offline mode
 * Chỉ hiển thị trong __DEV__
 */
export function OfflineTestToggle() {
  const [forceOffline, setForceOffline] = useState(false);

  useEffect(() => {
    loadSetting();
  }, []);

  const loadSetting = async () => {
    const value = await AsyncStorage.getItem(DEV_OFFLINE_KEY);
    setForceOffline(value === 'true');
  };

  const handleToggle = async (value: boolean) => {
    await AsyncStorage.setItem(DEV_OFFLINE_KEY, String(value));
    setForceOffline(value);
    
    Alert.alert(
      '🔄 Reload Required',
      'Vui lòng reload app (r trong Metro) để áp dụng thay đổi',
      [{ text: 'OK' }]
    );
  };

  if (!__DEV__) return null;

  return (
    <View style={styles.container}>
      <Text style={styles.label}>🧪 DEV: Giả lập Offline Mode</Text>
      <Switch
        value={forceOffline}
        onValueChange={handleToggle}
        trackColor={{ false: '#ccc', true: '#ff6b35' }}
        thumbColor={forceOffline ? '#fff' : '#f4f3f4'}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 50,
    right: 10,
    backgroundColor: 'rgba(0,0,0,0.8)',
    padding: 10,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    zIndex: 9999,
  },
  label: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
});

/**
 * Hàm helper để check dev offline mode
 */
export async function isDevOfflineMode(): Promise<boolean> {
  if (!__DEV__) return false;
  const value = await AsyncStorage.getItem(DEV_OFFLINE_KEY);
  return value === 'true';
}
