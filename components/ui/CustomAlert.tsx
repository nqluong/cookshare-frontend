import { Ionicons } from "@expo/vector-icons";
import { Modal, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Colors } from "../../styles/colors";

interface CustomAlertProps {
  visible: boolean;
  title: string;
  message: string;
  type?: 'success' | 'error' | 'warning' | 'info';
  buttons?: Array<{
    text: string;
    onPress?: () => void;
    style?: 'default' | 'cancel' | 'destructive';
  }>;
  onClose: () => void;
}

export default function CustomAlert({
  visible,
  title,
  message,
  type = 'info',
  buttons = [{ text: 'OK', onPress: () => {} }],
  onClose
}: CustomAlertProps) {
  const getIconAndColor = () => {
    switch (type) {
      case 'success':
        return { icon: 'checkmark-circle' as const, color: '#10b981', bgColor: '#f0fdf4' };
      case 'error':
        return { icon: 'close-circle' as const, color: '#ef4444', bgColor: '#fef2f2' };
      case 'warning':
        return { icon: 'warning' as const, color: '#f59e0b', bgColor: '#fef3c7' };
      default:
        return { icon: 'information-circle' as const, color: '#3b82f6', bgColor: '#f0f9ff' };
    }
  };

  const { icon, color, bgColor } = getIconAndColor();

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.alertContainer}>
          {/* Header với icon */}
          <View style={[styles.alertHeader, { backgroundColor: bgColor }]}>
            <Ionicons name={icon} size={32} color={color} />
            <Text style={[styles.alertTitle, { color }]}>{title}</Text>
          </View>
          
          {/* Message */}
          <View style={styles.alertBody}>
            <Text style={styles.alertMessage}>{message}</Text>
          </View>
          
          {/* Buttons */}
          <View style={styles.alertActions}>
            {buttons.map((button, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.alertButton,
                  button.style === 'destructive' && styles.destructiveButton,
                  button.style === 'cancel' && styles.cancelButton,
                  index === buttons.length - 1 && styles.lastButton
                ]}
                onPress={() => {
                  button.onPress?.();
                  onClose();
                }}
              >
                <Text style={[
                  styles.alertButtonText,
                  button.style === 'destructive' && styles.destructiveButtonText,
                  button.style === 'cancel' && styles.cancelButtonText
                ]}>
                  {button.text}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  alertContainer: {
    backgroundColor: '#fff',
    borderRadius: 16,
    minWidth: 280,
    maxWidth: 400,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 8,
  },
  alertHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    gap: 12,
  },
  alertTitle: {
    fontSize: 18,
    fontWeight: '600',
    flex: 1,
  },
  alertBody: {
    padding: 20,
    paddingTop: 16,
  },
  alertMessage: {
    fontSize: 16,
    color: Colors.text.primary,
    lineHeight: 22,
  },
  alertActions: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  alertButton: {
    flex: 1,
    paddingVertical: 16,
    paddingHorizontal: 20,
    alignItems: 'center',
    borderRightWidth: 1,
    borderRightColor: '#e5e7eb',
  },
  lastButton: {
    borderRightWidth: 0,
  },
  alertButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#3b82f6',
  },
  destructiveButton: {
    backgroundColor: '#fef2f2',
  },
  destructiveButtonText: {
    color: '#ef4444',
  },
  cancelButton: {
    backgroundColor: '#f8fafc',
  },
  cancelButtonText: {
    color: Colors.text.secondary,
  },
});
