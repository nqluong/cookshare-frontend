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
    REPORT_PRIORITY_CONFIG,
    REPORT_TYPE_COLORS,
    REPORT_TYPE_LABELS,
    ReportPriority,
    ReportType
} from "../../../types/admin/groupedReport.types";

interface ReportFilterModalProps {
  visible: boolean;
  onClose: () => void;
  onApply: (filters: { priority?: ReportPriority; reportType?: ReportType }) => void;
  currentFilters: { priority?: ReportPriority; reportType?: ReportType };
}

const PRIORITIES: ReportPriority[] = ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'];
const REPORT_TYPES: ReportType[] = [
  'HARASSMENT', 
  'COPYRIGHT', 
  'SPAM', 
  'INAPPROPRIATE_CONTENT', 
  'MISLEADING', 
  'OTHER'
];

export default function ReportFilterModal({ 
  visible, 
  onClose, 
  onApply,
  currentFilters 
}: ReportFilterModalProps) {
  const [selectedPriority, setSelectedPriority] = useState<ReportPriority | undefined>(
    currentFilters.priority
  );
  const [selectedType, setSelectedType] = useState<ReportType | undefined>(
    currentFilters.reportType
  );

  const handleApply = () => {
    onApply({ priority: selectedPriority, reportType: selectedType });
    onClose();
  };

  const handleClear = () => {
    setSelectedPriority(undefined);
    setSelectedType(undefined);
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
            {/* Priority Filter */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Mức độ ưu tiên</Text>
              <View style={styles.optionsGrid}>
                {PRIORITIES.map((priority) => {
                  const config = REPORT_PRIORITY_CONFIG[priority];
                  const isSelected = selectedPriority === priority;
                  return (
                    <TouchableOpacity
                      key={priority}
                      style={[
                        styles.optionButton,
                        isSelected && { 
                          backgroundColor: config.backgroundColor,
                          borderColor: config.backgroundColor,
                        }
                      ]}
                      onPress={() => setSelectedPriority(
                        isSelected ? undefined : priority
                      )}
                    >
                      <Text style={styles.optionIcon}>{config.icon}</Text>
                      <Text 
                        style={[
                          styles.optionText,
                          isSelected && { color: config.color }
                        ]}
                      >
                        {config.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

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
          </ScrollView>

          {/* Footer Actions */}
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
