// components/admin/reports/ReportFilterModal.tsx
import { moderateScale, scale, verticalScale } from "@/constants/layout";
import { Ionicons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import {
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Colors } from "../../../styles/colors";
import {
  REPORT_ACTION_TYPE_COLORS,
  REPORT_ACTION_TYPE_LABELS,
  REPORT_STATUS_COLORS,
  REPORT_STATUS_LABELS,
  REPORT_TYPE_COLORS,
  REPORT_TYPE_LABELS,
  ReportActionType,
  ReportStatus,
  ReportType
} from "../../../types/admin/groupedReport.types";

interface ReportFilterModalProps {
  visible: boolean;
  onClose: () => void;
  onApply: (filters: { 
    reportType?: ReportType;
    status?: ReportStatus;
    actionType?: ReportActionType;
  }) => void;
  currentFilters: { 
    reportType?: ReportType;
    status?: ReportStatus;
    actionType?: ReportActionType;
  };
}

const REPORT_TYPES: ReportType[] = [
  'HARASSMENT', 
  'COPYRIGHT', 
  'SPAM', 
  'INAPPROPRIATE', 
  'MISLEADING', 
  'OTHER'
];

const STATUSES: ReportStatus[] = [
  'PENDING',
  'RESOLVED',
  'REJECTED'
];

const ACTION_TYPES: ReportActionType[] = [
  'NO_ACTION',
  'USER_WARNED',
  'USER_SUSPENDED',
  'USER_BANNED',
  'RECIPE_UNPUBLISHED',
  'RECIPE_EDITED',
  'CONTENT_REMOVED',
  'OTHER'
];

export default function ReportFilterModal({ 
  visible, 
  onClose, 
  onApply,
  currentFilters 
}: ReportFilterModalProps) {
  const [selectedType, setSelectedType] = useState<ReportType | undefined>(
    currentFilters.reportType
  );
  const [selectedStatus, setSelectedStatus] = useState<ReportStatus | undefined>(
    currentFilters.status
  );
  const [selectedActionType, setSelectedActionType] = useState<ReportActionType | undefined>(
    currentFilters.actionType
  );

  // Sync state with currentFilters when modal opens
  useEffect(() => {
    if (visible) {
      setSelectedType(currentFilters.reportType);
      setSelectedStatus(currentFilters.status);
      setSelectedActionType(currentFilters.actionType);
    }
  }, [visible, currentFilters]);

  const handleApply = () => {
    onApply({ 
      reportType: selectedType,
      status: selectedStatus,
      actionType: selectedActionType
    });
    onClose();
  };

  const handleClear = () => {
    setSelectedType(undefined);
    setSelectedStatus(undefined);
    setSelectedActionType(undefined);
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <SafeAreaView style={styles.container} edges={['bottom']}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Bộ lọc báo cáo</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={scale(24)} color={Colors.text.primary} />
            </TouchableOpacity>
          </View>

          <ScrollView 
            style={styles.content} 
            contentContainerStyle={styles.contentContainer}
            showsVerticalScrollIndicator={false}
          >
            {/* Report Type Filter */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Loại báo cáo</Text>
              <View style={styles.optionsGrid}>
                {REPORT_TYPES.map((type) => {
                  const isSelected = selectedType === type;
                  const color = REPORT_TYPE_COLORS[type];
                  return (
                    <TouchableOpacity
                      key={type}
                      style={[
                        styles.optionButton,
                        isSelected && { 
                          backgroundColor: color,
                          borderColor: color,
                        }
                      ]}
                      onPress={() => setSelectedType(
                        isSelected ? undefined : type
                      )}
                    >
                      <View 
                        style={[
                          styles.typeIndicator,
                          { backgroundColor: isSelected ? '#FFFFFF' : color }
                        ]} 
                      />
                      <Text 
                        style={[
                          styles.optionText,
                          isSelected && { color: '#FFFFFF' }
                        ]}
                      >
                        {REPORT_TYPE_LABELS[type]}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* Status Filter */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Trạng thái</Text>
              <View style={styles.optionsGrid}>
                {STATUSES.map((status) => {
                  const isSelected = selectedStatus === status;
                  const color = REPORT_STATUS_COLORS[status];
                  return (
                    <TouchableOpacity
                      key={status}
                      style={[
                        styles.optionButton,
                        isSelected && { 
                          backgroundColor: color,
                          borderColor: color,
                        }
                      ]}
                      onPress={() => setSelectedStatus(
                        isSelected ? undefined : status
                      )}
                    >
                      <View 
                        style={[
                          styles.typeIndicator,
                          { backgroundColor: isSelected ? '#FFFFFF' : color }
                        ]} 
                      />
                      <Text 
                        style={[
                          styles.optionText,
                          isSelected && { color: '#FFFFFF' }
                        ]}
                      >
                        {REPORT_STATUS_LABELS[status]}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* Action Type Filter */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Loại hành động</Text>
              <View style={styles.optionsGrid}>
                {ACTION_TYPES.map((actionType) => {
                  const isSelected = selectedActionType === actionType;
                  const color = REPORT_ACTION_TYPE_COLORS[actionType];
                  return (
                    <TouchableOpacity
                      key={actionType}
                      style={[
                        styles.optionButton,
                        isSelected && { 
                          backgroundColor: color,
                          borderColor: color,
                        }
                      ]}
                      onPress={() => setSelectedActionType(
                        isSelected ? undefined : actionType
                      )}
                    >
                      <View 
                        style={[
                          styles.typeIndicator,
                          { backgroundColor: isSelected ? '#FFFFFF' : color }
                        ]} 
                      />
                      <Text 
                        style={[
                          styles.optionText,
                          isSelected && { color: '#FFFFFF' }
                        ]}
                      >
                        {REPORT_ACTION_TYPE_LABELS[actionType]}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          </ScrollView>

          <View style={styles.footer}>
            <TouchableOpacity 
              style={styles.clearButton}
              onPress={handleClear}
              activeOpacity={0.7}
            >
              <Text style={styles.clearButtonText}>Xóa bộ lọc</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.applyButton}
              onPress={handleApply}
              activeOpacity={0.7}
            >
              <Text style={styles.applyButtonText}>Áp dụng</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
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
    borderTopLeftRadius: scale(24),
    borderTopRightRadius: scale(24),
    maxHeight: '85%',
    minHeight: verticalScale(400),
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: scale(20),
    paddingVertical: verticalScale(16),
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  title: {
    fontSize: moderateScale(18),
    fontWeight: '600',
    color: Colors.text.primary,
  },
  closeButton: {
    padding: scale(4),
  },
  content: {
    flexGrow: 1,
    flexShrink: 1,
  },
  contentContainer: {
    paddingHorizontal: scale(20),
    paddingVertical: verticalScale(16),
    paddingBottom: verticalScale(20),
  },
  section: {
    marginBottom: verticalScale(24),
  },
  sectionTitle: {
    fontSize: moderateScale(14),
    fontWeight: '600',
    color: Colors.text.secondary,
    marginBottom: verticalScale(12),
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  optionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: scale(10),
  },
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: scale(14),
    paddingVertical: verticalScale(10),
    borderRadius: scale(20),
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.gray[50],
    gap: scale(6),
  },
  optionIcon: {
    fontSize: moderateScale(12),
  },
  optionText: {
    fontSize: moderateScale(13),
    fontWeight: '500',
    color: Colors.text.primary,
  },
  typeIndicator: {
    width: scale(8),
    height: scale(8),
    borderRadius: scale(4),
  },
  footer: {
    flexDirection: 'row',
    gap: scale(12),
    paddingHorizontal: scale(20),
    paddingVertical: verticalScale(16),
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    backgroundColor: '#FFFFFF',
  },
  clearButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: verticalScale(14),
    borderRadius: scale(12),
    borderWidth: 1,
    borderColor: Colors.border,
  },
  clearButtonText: {
    fontSize: moderateScale(15),
    fontWeight: '600',
    color: Colors.text.secondary,
  },
  applyButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: verticalScale(14),
    borderRadius: scale(12),
    backgroundColor: '#10B981',
  },
  applyButtonText: {
    fontSize: moderateScale(15),
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
