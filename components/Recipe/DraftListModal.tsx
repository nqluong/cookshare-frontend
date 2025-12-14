import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Modal, SafeAreaView, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { RecipeDraft } from '../../types/recipe';
import { deleteDraft, getDraft } from '../../utils/draftManager';

interface DraftListModalProps {
  visible: boolean;
  userId: string;
  reloadKey?: number;
  onClose: () => void;
  onLoadDraft: (draft: RecipeDraft) => void;
}

const DraftListModal: React.FC<DraftListModalProps> = ({ visible, userId, reloadKey, onClose, onLoadDraft }) => {
  const [drafts, setDrafts] = useState<RecipeDraft[]>([]);
  const [loadingDrafts, setLoadingDrafts] = useState(false);

  const fetchDrafts = async () => {
    if (!userId) return;
    setLoadingDrafts(true);
    try {
      const all = await AsyncStorage.getItem('@cookshare_recipe_drafts');
      const parsed = all ? JSON.parse(all) : {};
      const userDrafts = Object.values(parsed).filter((d: any) => d.userId === userId);
      userDrafts.sort((a: any, b: any) => new Date(b.lastModified).getTime() - new Date(a.lastModified).getTime());
      setDrafts(userDrafts as RecipeDraft[]);
    } catch (e) {
      setDrafts([]);
    } finally {
      setLoadingDrafts(false);
    }
  };

  useEffect(() => {
    if (visible) fetchDrafts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible, reloadKey]);

  const handleDeleteDraft = async (draftId: string) => {
    try {
      await deleteDraft(draftId);
      setDrafts((prev) => prev.filter((d) => d.draftId !== draftId));
    } catch { }
  };

  const handleLoadDraft = async (draftId: string) => {
    const loaded = await getDraft(draftId);
    if (loaded) {
      onLoadDraft(loaded);
      onClose();
      Alert.alert('Đã tải bản nháp', `Tiếp tục chỉnh sửa: ${loaded.title || 'Công thức'}`);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, borderBottomWidth: 1, borderColor: '#eee' }}>
          <Text style={{ fontWeight: 'bold', fontSize: 18 }}>Bản nháp của bạn</Text>
          <TouchableOpacity onPress={onClose}>
            <Text style={{ color: '#ff6600', fontWeight: 'bold', fontSize: 16 }}>Đóng</Text>
          </TouchableOpacity>
        </View>
        {loadingDrafts ? (
          <ActivityIndicator style={{ marginTop: 40 }} />
        ) : drafts.length === 0 ? (
          <Text style={{ textAlign: 'center', marginTop: 40, color: '#888' }}>Chưa có bản nháp nào</Text>
        ) : (
          <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 16 }}>
            {drafts.map((d) => (
              <View key={d.draftId} style={{ backgroundColor: '#f8f8f8', borderRadius: 8, padding: 14, marginBottom: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontWeight: 'bold', fontSize: 16 }}>{d.title || 'Không tên'}</Text>
                  <Text style={{ color: '#888', fontSize: 13, marginTop: 2 }}>Cập nhật: {new Date(d.lastModified).toLocaleString('vi-VN')}</Text>
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <TouchableOpacity
                    onPress={() => handleLoadDraft(d.draftId)}
                    style={{ padding: 8, marginRight: 4 }}
                  >
                    <Text style={{ color: '#007bff', fontWeight: '600' }}>Chỉnh sửa</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => handleDeleteDraft(d.draftId)}
                    style={{ padding: 8 }}
                  >
                    <Text style={{ color: '#d32f2f', fontWeight: '600' }}>Xóa</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </ScrollView>
        )}
      </SafeAreaView>
    </Modal>
  );
};

export default DraftListModal;
