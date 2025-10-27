import { useState } from 'react';

interface AlertButton {
  text: string;
  onPress?: () => void;
  style?: 'default' | 'cancel' | 'destructive';
}

interface AlertOptions {
  title: string;
  message: string;
  type?: 'success' | 'error' | 'warning' | 'info';
  buttons?: AlertButton[];
}

export function useCustomAlert() {
  const [alert, setAlert] = useState<AlertOptions & { visible: boolean }>({
    visible: false,
    title: '',
    message: '',
    type: 'info',
    buttons: [{ text: 'OK', onPress: () => {} }]
  });

  const showAlert = (options: AlertOptions) => {
    setAlert({
      visible: true,
      ...options,
      buttons: options.buttons || [{ text: 'OK', onPress: () => {} }]
    });
  };

  const hideAlert = () => {
    setAlert(prev => ({ ...prev, visible: false }));
  };

  const showSuccess = (title: string, message: string, buttons?: AlertButton[]) => {
    showAlert({ title, message, type: 'success', buttons });
  };

  const showError = (title: string, message: string, buttons?: AlertButton[]) => {
    showAlert({ title, message, type: 'error', buttons });
  };

  const showWarning = (title: string, message: string, buttons?: AlertButton[]) => {
    showAlert({ title, message, type: 'warning', buttons });
  };

  const showInfo = (title: string, message: string, buttons?: AlertButton[]) => {
    showAlert({ title, message, type: 'info', buttons });
  };

  return {
    alert,
    showAlert,
    hideAlert,
    showSuccess,
    showError,
    showWarning,
    showInfo
  };
}
