// components/admin/reports/ReportFilterModal.tsx
import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import {
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";
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
  'INAPPROPRIATE_CONTENT', 
  'MISLEADING', 
  'OTHER'
];

const STATUSES: ReportStatus[] = [
  'PENDING',
  'APPROVED',
  'UNDER_REVIEW',
  'REVIEWING',
  'RESOLVED',
  'REJECTED',
  'CLOSED'
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
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Bộ lọc báo cáo</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color={Colors.text.primary} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
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
            >
              <Text style={styles.clearButtonText}>Xóa bộ lọc</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.applyButton}
              onPress={handleApply}
            >
              <Text style={styles.applyButtonText}>Áp dụng</Text>
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
    maxHeight: '80%',
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
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text.primary,
  },
  closeButton: {
    padding: 4,
  },
  content: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text.secondary,
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  optionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.gray[50],
    gap: 6,
  },
  optionIcon: {
    fontSize: 12,
  },
  optionText: {
    fontSize: 13,
    fontWeight: '500',
    color: Colors.text.primary,
  },
  typeIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  footer: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  clearButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  clearButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.text.secondary,
  },
  applyButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: '#10B981',
  },
  applyButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
