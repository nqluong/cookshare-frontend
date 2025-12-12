// components/admin/reports/ReportActionModal.tsx
import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import {
  ActivityIndicator,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";
import { Colors } from "../../../styles/colors";
import {
  ACTION_OPTIONS,
  ActionOption,
  GroupedReport,
  ReviewReportRequest
} from "../../../types/admin/groupedReport.types";

interface ReportActionModalProps {
  visible: boolean;
  report: GroupedReport | null;
  onClose: () => void;
  onAction: (recipeId: string, request: ReviewReportRequest) => Promise<void>;
}

export default function ReportActionModal({ 
  visible, 
  report, 
  onClose, 
  onAction 
}: ReportActionModalProps) {
  const [selectedAction, setSelectedAction] = useState<ActionOption | null>(null);
  const [actionDescription, setActionDescription] = useState('');
  const [adminNote, setAdminNote] = useState('');
  const [loading, setLoading] = useState(false);

  const handleConfirm = async () => {
    if (!report || !selectedAction) return;
    
    if (selectedAction.requiresDescription && !actionDescription.trim()) {
      return;
    }

    setLoading(true);
    try {
      const request: ReviewReportRequest = {
        status: selectedAction.status,
        actionType: selectedAction.actionType,
        actionDescription: actionDescription.trim() || undefined,
        adminNote: adminNote.trim() || undefined,
      };
      
      await onAction(report.recipeId, request);
      handleClose();
    } catch (error) {
      console.error('Action error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setSelectedAction(null);
    setActionDescription('');
    setAdminNote('');
    onClose();
  };

  if (!report) return null;

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

          <ScrollView 
            style={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {/* Action Options */}
            <View style={styles.actionsContainer}>
              <Text style={styles.sectionLabel}>Chọn hành động</Text>
              {ACTION_OPTIONS.map((action) => (
                <TouchableOpacity
                  key={action.actionType}
                  style={[
                    styles.actionOption,
                    selectedAction?.actionType === action.actionType && {
                      borderColor: action.color,
                      backgroundColor: action.color + '10',
                    }
                  ]}
                  onPress={() => setSelectedAction(action)}
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
                  {selectedAction?.actionType === action.actionType && (
                    <Ionicons name="checkmark-circle" size={22} color={action.color} />
                  )}
                </TouchableOpacity>
              ))}
            </View>

            {/* Action Description Input */}
            {selectedAction?.requiresDescription && (
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>
                  Lý do xử lý <Text style={styles.required}>*</Text>
                </Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="Nhập lý do xử lý (sẽ hiển thị cho người dùng)..."
                  value={actionDescription}
                  onChangeText={setActionDescription}
                  multiline
                  numberOfLines={3}
                  textAlignVertical="top"
                />
              </View>
            )}

            {/* Admin Note Input (Optional) */}
            {selectedAction && (
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Ghi chú nội bộ (tùy chọn)</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="Ghi chú dành cho admin..."
                  value={adminNote}
                  onChangeText={setAdminNote}
                  multiline
                  numberOfLines={2}
                  textAlignVertical="top"
                />
              </View>
            )}
          </ScrollView>

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
                (!selectedAction || (selectedAction.requiresDescription && !actionDescription.trim())) && 
                  styles.confirmButtonDisabled,
                selectedAction && { backgroundColor: selectedAction.color }
              ]}
              onPress={handleConfirm}
              disabled={loading || !selectedAction || (selectedAction.requiresDescription && !actionDescription.trim())}
            >
              {loading ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Text style={styles.confirmButtonText}>
                  {selectedAction?.label || 'Xác nhận'}
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
  scrollContent: {
    maxHeight: 450,
  },
  actionsContainer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    gap: 10,
  },
  sectionLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text.secondary,
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
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
  inputContainer: {
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.text.primary,
    marginBottom: 8,
  },
  required: {
    color: '#EF4444',
  },
  textInput: {
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
