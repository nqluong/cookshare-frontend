import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Colors } from "../../../styles/colors";

interface AdminHeaderProps {
  title: string;
  onBack?: () => void;
  onFilterPress?: () => void;
  onExitAdmin?: () => void;
  showNotification?: boolean;
}

export default function AdminHeader({ 
  title, 
  onBack, 
  onFilterPress, 
  onExitAdmin,
  showNotification = true 
}: AdminHeaderProps) {
  return (
    <View style={styles.header}>
      {onBack && (
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={Colors.text.primary} />
        </TouchableOpacity>
      )}
      
      <Text style={styles.headerTitle}>{title}</Text>
      
      <View style={styles.headerActions}>
        {onFilterPress && (
          <TouchableOpacity 
            style={styles.filterButton}
            onPress={onFilterPress}
          >
            <Ionicons name="options-outline" size={20} color={Colors.text.primary} />
          </TouchableOpacity>
        )}
        
        {showNotification && (
          <TouchableOpacity style={styles.notificationButton}>
            <Ionicons name="notifications-outline" size={24} color={Colors.text.primary} />
          </TouchableOpacity>
        )}
        
        {onExitAdmin && (
          <TouchableOpacity style={styles.exitButton} onPress={onExitAdmin}>
            <Ionicons name="exit-outline" size={24} color={Colors.text.primary} />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#10b981",
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: Colors.text.primary,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  filterButton: {
    padding: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 8,
  },
  notificationButton: {
    padding: 4,
  },
  exitButton: {
    padding: 4,
  },
});