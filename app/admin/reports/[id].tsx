import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";
import { adminReportService } from "../../../services/adminReportService";
import { ReportStatus, ReportType } from "../../../services/reportService";

interface ReportDetail {
  reportId: string;
  reportType: ReportType;
  reason: string;
  description?: string;
  status: ReportStatus;
  adminNote?: string;
  createdAt: string;
  reviewedAt?: string;
  reporter: {
    userId: string;
    username: string;
    fullName: string;
    email?: string;
  };
  reportedRecipe?: {
    recipeId: string;
    title: string;
    description?: string;
    author: string;
  };
  reportedUser?: {
    userId: string;
    username: string;
    fullName: string;
  };
  reviewer?: {
    userId: string;
    username: string;
    fullName: string;
  };
}

export default function ReportDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [report, setReport] = useState<ReportDetail | null>(null);
  const [adminNote, setAdminNote] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<ReportStatus | null>(null);

  useEffect(() => {
    fetchReportDetail();
  }, [id]);

  const fetchReportDetail = async () => {
    try {
      setLoading(true);
      const data = await adminReportService.getReportById(id as string);
      setReport(data);
      setAdminNote(data.adminNote || "");
      setSelectedStatus(data.status);
    } catch (error) {
      console.log("Lỗi tải chi tiết báo cáo:", error);
      Toast.show({
        type: "error",
        text1: "Lỗi",
        text2: "Không thể tải chi tiết báo cáo",
        position: "bottom",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async () => {
    if (!selectedStatus || selectedStatus === report?.status) {
      Toast.show({
        type: "info",
        text1: "Thông báo",
        text2: "Vui lòng chọn trạng thái mới",
        position: "bottom",
      });
      return;
    }

    try {
      setUpdating(true);
      await adminReportService.reviewReport(
        id as string,
        selectedStatus,
        adminNote.trim() || undefined
      );

      Toast.show({
        type: "success",
        text1: "Thành công",
        text2: "Đã cập nhật trạng thái báo cáo",
        position: "bottom",
      });

      setTimeout(() => {
        router.back();
      }, 500);
    } catch (error: any) {
      console.log("Lỗi cập nhật trạng thái:", error);
      Toast.show({
        type: "error",
        text1: "Lỗi",
        text2: error.message || "Không thể cập nhật trạng thái",
        position: "bottom",
      });
    } finally {
      setUpdating(false);
    }
  };

  const handleDelete = () => {
    Alert.alert(
      "Xóa báo cáo",
      "Bạn có chắc chắn muốn xóa báo cáo này?",
      [
        { text: "Hủy", style: "cancel" },
        {
          text: "Xóa",
          style: "destructive",
          onPress: async () => {
            try {
              await adminReportService.deleteReport(id as string);
              Toast.show({
                type: "success",
                text1: "Đã xóa báo cáo",
                position: "bottom",
              });
              router.back();
            } catch (error) {
              Toast.show({
                type: "error",
                text1: "Không thể xóa báo cáo",
                position: "bottom",
              });
            }
          },
        },
      ]
    );
  };

  const getStatusColor = (status: ReportStatus) => {
    switch (status) {
      case ReportStatus.PENDING:
        return "#ef4444";
      case ReportStatus.REVIEWED:
        return "#f59e0b";
      case ReportStatus.RESOLVED:
        return "#10b981";
      case ReportStatus.REJECTED:
        return "#6b7280";
      default:
        return "#6b7280";
    }
  };

  const getStatusLabel = (status: ReportStatus) => {
    switch (status) {
      case ReportStatus.PENDING:
        return "Chờ xử lý";
      case ReportStatus.REVIEWED:
        return "Đã xem";
      case ReportStatus.RESOLVED:
        return "Đã giải quyết";
      case ReportStatus.REJECTED:
        return "Từ chối";
      default:
        return status;
    }
  };

  const getReportTypeLabel = (type: ReportType) => {
    switch (type) {
      case ReportType.SPAM:
        return "Spam";
      case ReportType.INAPPROPRIATE:
        return "Không phù hợp";
      case ReportType.COPYRIGHT:
        return "Bản quyền";
      case ReportType.HARASSMENT:
        return "Quấy rối";
      case ReportType.FAKE:
        return "Giả mạo";
      case ReportType.MISLEADING:
        return "Sai lệch";
      case ReportType.OTHER:
        return "Khác";
      default:
        return type;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#10b981" />
          <Text style={styles.loadingText}>Đang tải...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!report) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={64} color="#ef4444" />
          <Text style={styles.errorText}>Không tìm thấy báo cáo</Text>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Text style={styles.backButtonText}>Quay lại</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.headerButton}>
          <Ionicons name="arrow-back" size={24} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Chi tiết báo cáo</Text>
        <TouchableOpacity onPress={handleDelete} style={styles.headerButton}>
          <Ionicons name="trash-outline" size={24} color="#ef4444" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        {/* Status & Type */}
        <View style={styles.section}>
          <View style={styles.badges}>
            <View
              style={[
                styles.statusBadge,
                { backgroundColor: getStatusColor(report.status) + "20" },
              ]}
            >
              <Text style={[styles.statusText, { color: getStatusColor(report.status) }]}>
                {getStatusLabel(report.status)}
              </Text>
            </View>
            <View style={styles.typeBadge}>
              <Text style={styles.typeText}>{getReportTypeLabel(report.reportType)}</Text>
            </View>
          </View>
          <Text style={styles.dateText}>Ngày tạo: {formatDate(report.createdAt)}</Text>
          {report.reviewedAt && (
            <Text style={styles.dateText}>Đã xem: {formatDate(report.reviewedAt)}</Text>
          )}
        </View>

        {/* Report Content */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Nội dung báo cáo</Text>
          <Text style={styles.reason}>{report.reason}</Text>
          {report.description && (
            <Text style={styles.description}>{report.description}</Text>
          )}
        </View>

        {/* Reporter Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Người báo cáo</Text>
          <View style={styles.infoRow}>
            <Ionicons name="person-outline" size={20} color="#6b7280" />
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>{report.reporter.fullName}</Text>
              <Text style={styles.infoValue}>@{report.reporter.username}</Text>
              {report.reporter.email && (
                <Text style={styles.infoValue}>{report.reporter.email}</Text>
              )}
            </View>
          </View>
        </View>

        {/* Reported Recipe */}
        {report.reportedRecipe && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Công thức bị báo cáo</Text>
            <TouchableOpacity
              style={styles.recipeCard}
              onPress={() =>
                router.push(`/admin/recipes/${report.reportedRecipe!.recipeId}` as any)
              }
            >
              <Text style={styles.recipeTitle}>{report.reportedRecipe.title}</Text>
              {report.reportedRecipe.description && (
                <Text style={styles.recipeDescription} numberOfLines={2}>
                  {report.reportedRecipe.description}
                </Text>
              )}
              <Text style={styles.recipeAuthor}>Tác giả: {report.reportedRecipe.author}</Text>
              <Ionicons
                name="chevron-forward"
                size={20}
                color="#10b981"
                style={styles.recipeChevron}
              />
            </TouchableOpacity>
          </View>
        )}

        {/* Reported User */}
        {report.reportedUser && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Người dùng bị báo cáo</Text>
            <View style={styles.infoRow}>
              <Ionicons name="person-circle-outline" size={20} color="#6b7280" />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>{report.reportedUser.fullName}</Text>
                <Text style={styles.infoValue}>@{report.reportedUser.username}</Text>
              </View>
            </View>
          </View>
        )}

        {/* Reviewer Info */}
        {report.reviewer && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Người xử lý</Text>
            <View style={styles.infoRow}>
              <Ionicons name="shield-checkmark-outline" size={20} color="#10b981" />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>{report.reviewer.fullName}</Text>
                <Text style={styles.infoValue}>@{report.reviewer.username}</Text>
              </View>
            </View>
          </View>
        )}

        {/* Admin Note */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Ghi chú của admin</Text>
          <TextInput
            style={styles.textInput}
            placeholder="Nhập ghi chú (tùy chọn)..."
            placeholderTextColor="#9ca3af"
            multiline
            numberOfLines={4}
            value={adminNote}
            onChangeText={setAdminNote}
            textAlignVertical="top"
          />
        </View>

        {/* Status Update */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Cập nhật trạng thái</Text>
          <View style={styles.statusOptions}>
            {Object.values(ReportStatus).map((status) => (
              <TouchableOpacity
                key={status}
                style={[
                  styles.statusOption,
                  selectedStatus === status && styles.statusOptionSelected,
                  selectedStatus === status && {
                    borderColor: getStatusColor(status),
                    backgroundColor: getStatusColor(status) + "10",
                  },
                ]}
                onPress={() => setSelectedStatus(status)}
              >
                <Text
                  style={[
                    styles.statusOptionText,
                    selectedStatus === status && {
                      color: getStatusColor(status),
                      fontWeight: "600",
                    },
                  ]}
                >
                  {getStatusLabel(status)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actions}>
          <TouchableOpacity
            style={[styles.actionButton, styles.updateButton]}
            onPress={handleUpdateStatus}
            disabled={updating || selectedStatus === report.status}
          >
            {updating ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Ionicons name="checkmark-circle" size={20} color="#fff" />
                <Text style={styles.actionButtonText}>Cập nhật trạng thái</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f9fafb",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  headerButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#111827",
  },
  content: {
    flex: 1,
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: "#6b7280",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  errorText: {
    marginTop: 12,
    fontSize: 16,
    color: "#6b7280",
  },
  backButton: {
    marginTop: 20,
    paddingVertical: 12,
    paddingHorizontal: 24,
    backgroundColor: "#10b981",
    borderRadius: 8,
  },
  backButtonText: {
    color: "#fff",
    fontWeight: "600",
  },
  section: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 12,
  },
  badges: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 8,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 14,
    fontWeight: "600",
  },
  typeBadge: {
    backgroundColor: "#f3f4f6",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  typeText: {
    fontSize: 14,
    color: "#6b7280",
    fontWeight: "500",
  },
  dateText: {
    fontSize: 13,
    color: "#9ca3af",
    marginTop: 4,
  },
  reason: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    color: "#6b7280",
    lineHeight: 20,
  },
  infoRow: {
    flexDirection: "row",
    gap: 12,
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 15,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 14,
    color: "#6b7280",
    marginTop: 2,
  },
  recipeCard: {
    backgroundColor: "#f9fafb",
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    position: "relative",
  },
  recipeTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 6,
    paddingRight: 24,
  },
  recipeDescription: {
    fontSize: 13,
    color: "#6b7280",
    lineHeight: 18,
    marginBottom: 6,
  },
  recipeAuthor: {
    fontSize: 12,
    color: "#9ca3af",
  },
  recipeChevron: {
    position: "absolute",
    right: 12,
    top: 12,
  },
  textInput: {
    backgroundColor: "#f9fafb",
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    color: "#111827",
    minHeight: 100,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  statusOptions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  statusOption: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: "#e5e7eb",
    backgroundColor: "#fff",
  },
  statusOptionSelected: {
    borderWidth: 2,
  },
  statusOptionText: {
    fontSize: 14,
    color: "#6b7280",
  },
  actions: {
    gap: 12,
    marginBottom: 20,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 14,
    borderRadius: 8,
  },
  updateButton: {
    backgroundColor: "#10b981",
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
  },
});
