// components/admin/reports/ReportActionModal.tsx
import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import {
    ActivityIndicator,
    Modal,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from "react-native";
import { Colors } from "../../../styles/colors";
import { GroupedReport } from "../../../types/admin/groupedReport.types";

type ActionType = 'DISMISS' | 'WARN_USER' | 'HIDE_RECIPE' | 'DELETE_RECIPE' | 'BAN_USER';

interface ActionOption {
  type: ActionType;
  label: string;
  description: string;
  icon: string;
  color: string;
  requiresReason: boolean;
}

const ACTION_OPTIONS: ActionOption[] = [
  {
    type: 'DISMISS',
    label: 'Bỏ qua',
    description: 'Đánh dấu báo cáo không vi phạm',
    icon: 'checkmark-circle-outline',
    color: '#10B981',
    requiresReason: false,
  },
  {
    type: 'WARN_USER',
    label: 'Cảnh cáo',
    description: 'Gửi cảnh cáo đến tác giả',
    icon: 'warning-outline',
    color: '#F59E0B',
    requiresReason: true,
  },
  {
    type: 'HIDE_RECIPE',
    label: 'Ẩn công thức',
    description: 'Ẩn công thức khỏi tìm kiếm',
    icon: 'eye-off-outline',
    color: '#3B82F6',
    requiresReason: true,
  },
  {
    type: 'DELETE_RECIPE',
    label: 'Xóa công thức',
    description: 'Xóa vĩnh viễn công thức này',
    icon: 'trash-outline',
    color: '#EF4444',
    requiresReason: true,
  },
  {
    type: 'BAN_USER',
    label: 'Cấm tài khoản',
    description: 'Cấm tài khoản tác giả',
    icon: 'ban-outline',
    color: '#DC2626',
    requiresReason: true,
  },
];

interface ReportActionModalProps {
  visible: boolean;
  report: GroupedReport | null;
  onClose: () => void;
  onAction: (recipeId: string, action: ActionType, reason?: string) => Promise<void>;
}

export default function ReportActionModal({ 
  visible, 
  report, 
  onClose, 
  onAction 
}: ReportActionModalProps) {
  const [selectedAction, setSelectedAction] = useState<ActionType | null>(null);
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);

  const handleConfirm = async () => {
    if (!report || !selectedAction) return;
    
    const actionConfig = ACTION_OPTIONS.find(a => a.type === selectedAction);
    if (actionConfig?.requiresReason && !reason.trim()) {
      return;
    }

    setLoading(true);
    try {
      await onAction(report.recipeId, selectedAction, reason.trim() || undefined);
      handleClose();
    } catch (error) {
      console.error('Action error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setSelectedAction(null);
    setReason('');
    onClose();
  };

  if (!report) return null;

  const selectedActionConfig = selectedAction 
    ? ACTION_OPTIONS.find(a => a.type === selectedAction) 
    : null;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={handleClose}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerContent}>
              <Ionicons name="hammer" size={24} color="#10B981" />
              <Text style={styles.title}>Xử lý báo cáo</Text>
            </View>
            <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color={Colors.text.primary} />
            </TouchableOpacity>
          </View>

          {/* Recipe Info */}
          <View style={styles.recipeInfo}>
            <Text style={styles.recipeName} numberOfLines={1}>
              {report.recipeTitle}
            </Text>
            <Text style={styles.authorInfo}>
              bởi @{report.authorUsername} • {report.reportCount} báo cáo
            </Text>
          </View>

          {/* Action Options */}
          <View style={styles.actionsContainer}>
            {ACTION_OPTIONS.map((action) => (
              <TouchableOpacity
                key={action.type}
                style={[
                  styles.actionOption,
                  selectedAction === action.type && {
                    borderColor: action.color,
                    backgroundColor: action.color + '10',
                  }
                ]}
                onPress={() => setSelectedAction(action.type)}
              >
                <View 
                  style={[
                    styles.actionIcon,
                    { backgroundColor: action.color + '20' }
                  ]}
                >
                  <Ionicons 
                    name={action.icon as any} 
                    size={20} 
                    color={action.color} 
                  />
                </View>
                <View style={styles.actionContent}>
                  <Text style={styles.actionLabel}>{action.label}</Text>
                  <Text style={styles.actionDescription}>{action.description}</Text>
                </View>
                {selectedAction === action.type && (
                  <Ionicons name="checkmark-circle" size={22} color={action.color} />
                )}
              </TouchableOpacity>
            ))}
          </View>

          {/* Reason Input */}
          {selectedActionConfig?.requiresReason && (
            <View style={styles.reasonContainer}>
              <Text style={styles.reasonLabel}>
                Lý do <Text style={styles.required}>*</Text>
              </Text>
              <TextInput
                style={styles.reasonInput}
                placeholder="Nhập lý do xử lý..."
                value={reason}
                onChangeText={setReason}
                multiline
                numberOfLines={3}
                textAlignVertical="top"
              />
            </View>
          )}

          {/* Footer */}
          <View style={styles.footer}>
            <TouchableOpacity 
              style={styles.cancelButton}
              onPress={handleClose}
              disabled={loading}
            >
              <Text style={styles.cancelButtonText}>Hủy</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[
                styles.confirmButton,
                (!selectedAction || (selectedActionConfig?.requiresReason && !reason.trim())) && 
                  styles.confirmButtonDisabled,
                selectedActionConfig && { backgroundColor: selectedActionConfig.color }
              ]}
              onPress={handleConfirm}
              disabled={loading || !selectedAction || (selectedActionConfig?.requiresReason && !reason.trim())}
            >
              {loading ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Text style={styles.confirmButtonText}>
                  {selectedActionConfig?.label || 'Xác nhận'}
                </Text>
              )}
            </TouchableOpacity>
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
    justifyContent: 'flex-end',
  },
  container: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '90%',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text.primary,
  },
  closeButton: {
    padding: 4,
  },
  recipeInfo: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: Colors.gray[50],
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  recipeName: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text.primary,
  },
  authorInfo: {
    fontSize: 13,
    color: Colors.text.secondary,
    marginTop: 2,
  },
  actionsContainer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    gap: 10,
  },
  actionOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: Colors.border,
    gap: 12,
  },
  actionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionContent: {
    flex: 1,
  },
  actionLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.text.primary,
  },
  actionDescription: {
    fontSize: 12,
    color: Colors.text.secondary,
    marginTop: 2,
  },
  reasonContainer: {
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  reasonLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.text.primary,
    marginBottom: 8,
  },
  required: {
    color: '#EF4444',
  },
  reasonInput: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    color: Colors.text.primary,
    minHeight: 80,
    backgroundColor: Colors.gray[50],
  },
  footer: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  cancelButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  cancelButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.text.secondary,
  },
  confirmButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: '#10B981',
  },
  confirmButtonDisabled: {
    backgroundColor: Colors.gray[300],
  },
  confirmButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
