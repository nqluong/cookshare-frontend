import { useState } from 'react';
import {
    ActivityIndicator,
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import Toast from 'react-native-toast-message';
import { ReportType, reportService } from '../../services/reportService';

interface ReportModalProps {
  visible: boolean;
  onClose: () => void;
  recipeId: string;
  recipeTitle: string;
}

export default function ReportModal({
  visible,
  onClose,
  recipeId,
  recipeTitle,
}: ReportModalProps) {
  const [selectedReason, setSelectedReason] = useState<ReportType | null>(null);
  const [description, setDescription] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const reasons = reportService.getReportReasons();

  const handleSubmit = async () => {
    if (!selectedReason) {
      Toast.show({
        type: 'error',
        text1: 'Vui lòng chọn lý do',
        text2: 'Bạn cần chọn một lý do báo cáo',
        position: 'bottom',
      });
      return;
    }

    if (selectedReason === ReportType.OTHER && !description.trim()) {
      Toast.show({
        type: 'error',
        text1: 'Vui lòng mô tả lý do',
        text2: 'Vui lòng cung cấp thêm thông tin chi tiết',
        position: 'bottom',
      });
      return;
    }

    setIsSubmitting(true);
    try {
      await reportService.createReport({
        reportType: selectedReason,
        recipeId: recipeId,
        reason: selectedReason,
        description: description.trim() || undefined,
      });

      Toast.show({
        type: 'success',
        text1: 'Báo cáo đã được gửi',
        text2: 'Cảm ơn bạn đã giúp cải thiện cộng đồng',
        position: 'bottom',
      });

      // Reset form
      setSelectedReason(null);
      setDescription('');
      onClose();
    } catch (error: any) {
      console.log('Lỗi khi gửi báo cáo:', error);
      console.log('Error code:', error.code);
      console.log('Error isAlreadyReported:', error.isAlreadyReported);
      
      // Xử lý trường hợp đã báo cáo trước đó
      if (error.isAlreadyReported || error.code === 7002) {
        console.log('Hiển thị toast đã báo cáo');
        Toast.show({
          type: 'success',
          text1: '✓ Đã ghi nhận',
          text2: error.message || 'Bạn đã báo cáo công thức này trước đó',
          position: 'bottom',
          visibilityTime: 3000,
        });
        // Đóng modal vì không cần báo cáo lại
        setSelectedReason(null);
        setDescription('');
        onClose();
      } else {
        // Các lỗi khác
        Toast.show({
          type: 'error',
          text1: 'Không thể gửi báo cáo',
          text2: error.message || error.response?.data?.message || 'Vui lòng thử lại sau',
          position: 'bottom',
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setSelectedReason(null);
      setDescription('');
      onClose();
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={handleClose}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Báo cáo công thức</Text>
            <TouchableOpacity
              onPress={handleClose}
              disabled={isSubmitting}
              style={styles.closeButton}
            >
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
          </View>

          {/* Recipe info */}
          <View style={styles.recipeInfo}>
            <Text style={styles.recipeTitle} numberOfLines={2}>
              {recipeTitle}
            </Text>
          </View>

          <ScrollView
            style={styles.content}
            showsVerticalScrollIndicator={false}
          >
            {/* Reasons */}
            <Text style={styles.label}>Chọn lý do báo cáo:</Text>
            {reasons.map((reason) => (
              <TouchableOpacity
                key={reason.type}
                style={[
                  styles.reasonItem,
                  selectedReason === reason.type && styles.reasonItemSelected,
                ]}
                onPress={() => setSelectedReason(reason.type)}
                disabled={isSubmitting}
              >
                <View style={styles.radio}>
                  {selectedReason === reason.type && (
                    <View style={styles.radioSelected} />
                  )}
                </View>
                <Text
                  style={[
                    styles.reasonText,
                    selectedReason === reason.type && styles.reasonTextSelected,
                  ]}
                >
                  {reason.label}
                </Text>
              </TouchableOpacity>
            ))}

            {/* Description */}
            <Text style={styles.label}>Mô tả chi tiết (tùy chọn):</Text>
            <TextInput
              style={styles.textInput}
              placeholder="Cung cấp thêm thông tin về báo cáo của bạn..."
              placeholderTextColor="#999"
              multiline
              numberOfLines={4}
              maxLength={5000}
              value={description}
              onChangeText={setDescription}
              editable={!isSubmitting}
              textAlignVertical="top"
            />
            <Text style={styles.characterCount}>
              {description.length}/5000 ký tự
            </Text>
          </ScrollView>

          {/* Actions */}
          <View style={styles.actions}>
            <TouchableOpacity
              style={[styles.button, styles.cancelButton]}
              onPress={handleClose}
              disabled={isSubmitting}
            >
              <Text style={styles.cancelButtonText}>Hủy</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.button,
                styles.submitButton,
                (isSubmitting || !selectedReason) && styles.submitButtonDisabled,
              ]}
              onPress={handleSubmit}
              disabled={isSubmitting || !selectedReason}
            >
              {isSubmitting ? (
                <ActivityIndicator color="#FFF" size="small" />
              ) : (
                <Text style={styles.submitButtonText}>Gửi báo cáo</Text>
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
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  container: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    width: '100%',
    maxWidth: 500,
    maxHeight: '85%',
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#EEE',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  closeButton: {
    padding: 4,
  },
  closeButtonText: {
    fontSize: 24,
    color: '#666',
    fontWeight: 'bold',
  },
  recipeInfo: {
    padding: 16,
    backgroundColor: '#F8F9FA',
    borderBottomWidth: 1,
    borderBottomColor: '#EEE',
  },
  recipeTitle: {
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
  },
  content: {
    padding: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
    marginTop: 8,
  },
  reasonItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
    marginBottom: 10,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  reasonItemSelected: {
    backgroundColor: '#FFF4E6',
    borderColor: '#FF6B35',
  },
  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#CCC',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  radioSelected: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#FF6B35',
  },
  reasonText: {
    fontSize: 15,
    color: '#333',
    flex: 1,
  },
  reasonTextSelected: {
    fontWeight: '600',
    color: '#FF6B35',
  },
  textInput: {
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
    padding: 12,
    fontSize: 15,
    color: '#333',
    minHeight: 100,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  characterCount: {
    fontSize: 12,
    color: '#999',
    textAlign: 'right',
    marginTop: 4,
    marginBottom: 12,
  },
  actions: {
    flexDirection: 'row',
    padding: 20,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: '#EEE',
  },
  button: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButton: {
    backgroundColor: '#F0F0F0',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
  },
  submitButton: {
    backgroundColor: '#FF6B35',
  },
  submitButtonDisabled: {
    backgroundColor: '#CCC',
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFF',
  },
});
