import { useState } from "react";
import {
  Alert,
  FlatList,
  Modal,
  Text, TextInput, TouchableOpacity,
  View
} from "react-native";
import { MaterialIcons } from '@expo/vector-icons';
import { defaultPlaceholderColor, styles } from "../../styles/RecipeStyle";

interface ListItem {
  id: string;
  name: string;
  color?: string;
  isLocal?: boolean;
}

interface Props {
  visible: boolean;
  tags: ListItem[];
  selectedIds: string[];
  onClose: () => void;
  onSelect: (item: ListItem) => void;
  onCreate: (name: string) => Promise<void>;
  onDelete: (item: ListItem) => Promise<void>;
}

export default function TagModal({
  visible, tags, selectedIds, onClose, onSelect, onCreate, onDelete
}: Props) {
  const [searchTerm, setSearchTerm] = useState("");

  const filtered = tags.filter((item) =>
    item.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreate = async () => {
    if (!searchTerm.trim()) {
      Alert.alert("Lỗi", "Vui lòng nhập tên!");
      return;
    }
    await onCreate(searchTerm);
    setSearchTerm("");
  };

  return (
    <Modal visible={visible} animationType="slide">
      <View style={{ flex: 1, padding: 16 }}>
        <Text style={styles.modalTitle}>Chọn tag</Text>

        <TextInput
          placeholder="Tên mới hoặc tìm kiếm..."
          placeholderTextColor={defaultPlaceholderColor}
          value={searchTerm}
          onChangeText={setSearchTerm}
          style={styles.input}
        />

        <TouchableOpacity onPress={handleCreate} style={styles.createBtn}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <MaterialIcons name="add-circle" size={18} color="white" />
            <Text style={{ color: "white", fontWeight: "600" }}>Tạo mới</Text>
          </View>
        </TouchableOpacity>

        <FlatList
          data={filtered}
          keyExtractor={(item, index) => item?.id || index.toString()}
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() => onSelect(item)}
              style={[
                styles.listItem,
                { backgroundColor: selectedIds.includes(item.id) ? '#cce5ff' : 'white' }
              ]}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontWeight: '600' }}>
                    {item.name}
                    {item.isLocal && <Text style={{ color: '#ff9800' }}> (mới)</Text>}
                  </Text>
                  {!!item.color && (
                    <View
                      style={{
                        width: 16,
                        height: 16,
                        backgroundColor: item.color,
                        borderRadius: 8,
                        marginTop: 4,
                      }}
                    />
                  )}
                </View>

                {item.isLocal && (
                  <TouchableOpacity
                    onPress={() => onDelete(item)}
                    style={{ padding: 4, marginLeft: 8 }}
                  >
                    <MaterialIcons name="delete" size={20} color="#d32f2f" />
                  </TouchableOpacity>
                )}
              </View>
            </TouchableOpacity>
          )}
        />

        <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
          <Text style={{ color: "white", fontWeight: "700" }}>Xong</Text>
        </TouchableOpacity>
      </View>
    </Modal>
  );
}