// 📁 screens/DraftListScreen.tsx
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  Alert,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { DraftMetadata } from '../types/recipe';
import {
  clearAllDrafts,
  deleteDraft,
  getDraftList
} from '../utils/draftManager';

export default function DraftListScreen() {
  const router = useRouter();
  const [drafts, setDrafts] = useState<DraftMetadata[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  // Load danh sách draft
  const loadDrafts = async () => {
    try {
      const draftList = await getDraftList();
      setDrafts(draftList);
    } catch (error) {
      console.error('Error loading drafts:', error);
    }
  };

  useEffect(() => {
    loadDrafts();
  }, []);

  // Pull to refresh
  const onRefresh = async () => {
    setRefreshing(true);
    await loadDrafts();
    setRefreshing(false);
  };

  // Xóa một draft
  const handleDeleteDraft = (draftId: string) => {
    Alert.alert(
      '⚠️ Xác nhận xóa',
      'Bạn có chắc muốn xóa bản nháp này?',
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Xóa',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteDraft(draftId);
              await loadDrafts();
              Alert.alert('Thành công', 'Đã xóa bản nháp');
            } catch (error) {
              Alert.alert('Lỗi', 'Không thể xóa bản nháp');
            }
          }
        }
      ]
    );
  };

  // Xóa tất cả draft
  const handleClearAll = () => {
    Alert.alert(
      '⚠️ Xác nhận',
      'Bạn có chắc muốn xóa TẤT CẢ bản nháp?',
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Xóa tất cả',
          style: 'destructive',
          onPress: async () => {
            try {
              await clearAllDrafts();
              await loadDrafts();
              Alert.alert('Thành công', 'Đã xóa tất cả bản nháp');
            } catch (error) {
              Alert.alert('Lỗi', 'Không thể xóa');
            }
          }
        }
      ]
    );
  };

  // Tiếp tục chỉnh sửa draft
  const handleEditDraft = (draftId: string) => {
    router.push(`/addRecipe?draftId=${draftId}` as any);
  };

  // Format thời gian
  const formatTime = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Vừa xong';
    if (diffMins < 60) return `${diffMins} phút trước`;
    if (diffHours < 24) return `${diffHours} giờ trước`;
    if (diffDays < 7) return `${diffDays} ngày trước`;

    return date.toLocaleDateString('vi-VN');
  };

  // Render empty state
  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyIcon}>📭</Text>
      <Text style={styles.emptyText}>Chưa có bản nháp nào</Text>
      <TouchableOpacity
        onPress={() => router.push('/addRecipe' as any)}
        style={styles.createButton}
      >
        <Text style={styles.createButtonText}>➕ Tạo công thức mới</Text>
      </TouchableOpacity>
    </View>
  );

  // Render draft item
  const renderDraftItem = ({ item }: { item: DraftMetadata }) => (
    <TouchableOpacity
      onPress={() => handleEditDraft(item.draftId)}
      style={styles.draftCard}
    >
      <View style={styles.draftContent}>
        <Text style={styles.draftTitle} numberOfLines={2}>
          {item.title}
        </Text>

        <View style={styles.draftMeta}>
          <Text style={styles.metaText}>
            🕒 {formatTime(item.lastModified)}
          </Text>
          {item.stepsCount > 0 && (
            <Text style={styles.metaText}>📝 {item.stepsCount} bước</Text>
          )}
          {item.ingredientsCount > 0 && (
            <Text style={styles.metaText}>🥕 {item.ingredientsCount} nguyên liệu</Text>
          )}
        </View>
      </View>

      <TouchableOpacity
        onPress={() => handleDeleteDraft(item.draftId)}
        style={styles.deleteButton}
      >
        <Text style={styles.deleteButtonText}>🗑️</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>📝 Bản nháp ({drafts.length})</Text>
        {drafts.length > 0 && (
          <TouchableOpacity onPress={handleClearAll} style={styles.clearButton}>
            <Text style={styles.clearButtonText}>🗑️ Xóa tất cả</Text>
          </TouchableOpacity>
        )}
      </View>

      <FlatList
        data={drafts}
        keyExtractor={(item) => item.draftId}
        renderItem={renderDraftItem}
        ListEmptyComponent={renderEmpty}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5'
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0'
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold'
  },
  clearButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#dc3545',
    borderRadius: 6
  },
  clearButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600'
  },
  listContent: {
    padding: 16,
    flexGrow: 1
  },
  draftCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2
  },
  draftContent: {
    flex: 1,
    marginRight: 12
  },
  draftTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: '#333'
  },
  draftMeta: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12
  },
  metaText: {
    fontSize: 12,
    color: '#666'
  },
  deleteButton: {
    padding: 8
  },
  deleteButtonText: {
    fontSize: 20
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    marginBottom: 24
  },
  createButton: {
    backgroundColor: '#28a745',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8
  },
  createButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600'
  }
});