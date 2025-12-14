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
  description?: string;
  isLocal?: boolean;
}

interface IngredientInput {
  quantity: string;
  unit: string;
  selected: boolean;
}

interface Props {
  visible: boolean;
  ingredients: ListItem[];
  ingredientInputs: Record<string, IngredientInput>;
  onClose: () => void;
  onSelect: (item: ListItem) => void;
  onInputChange: (id: string, field: 'quantity' | 'unit', value: string) => void;
  onCreate: (name: string, description: string) => Promise<void>;
  onDelete: (item: ListItem) => Promise<void>;
}

export default function IngredientModal({
  visible, ingredients, ingredientInputs, onClose, onSelect,
  onInputChange, onCreate, onDelete
}: Props) {
  const [searchTerm, setSearchTerm] = useState("");
  const [description, setDescription] = useState("");

  const filtered = ingredients.filter((item) =>
    item.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreate = async () => {
    if (!searchTerm.trim()) {
      Alert.alert("Lỗi", "Vui lòng nhập tên!");
      return;
    }
    await onCreate(searchTerm, description);
    setSearchTerm("");
    setDescription("");
  };

  return (
    <Modal visible={visible} animationType="slide">
      <View style={{ flex: 1, padding: 16 }}>
        <Text style={styles.modalTitle}>Chọn nguyên liệu</Text>

        <TextInput
          placeholder="Tên mới hoặc tìm kiếm..."
          placeholderTextColor={defaultPlaceholderColor}
          value={searchTerm}
          onChangeText={setSearchTerm}
          style={styles.input}
        />

        <TextInput
          placeholder="Mô tả nguyên liệu (tùy chọn)"
          placeholderTextColor={defaultPlaceholderColor}
          value={description}
          onChangeText={setDescription}
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
          renderItem={({ item }) => {
            const inputs = ingredientInputs[item.id] || {
              quantity: '', unit: '', selected: false
            };

            return (
              <View
                style={[
                  styles.listItem,
                  { backgroundColor: inputs.selected ? '#cce5ff' : 'white' }
                ]}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                  <Text style={{ fontWeight: '600', flex: 1 }}>
                    {item.name}
                    {item.isLocal && <Text style={{ color: '#ff9800' }}> (mới)</Text>}
                  </Text>

                  {item.isLocal && (
                    <TouchableOpacity
                      onPress={() => onDelete(item)}
                      style={{ padding: 4 }}
                    >
                      <MaterialIcons name="delete" size={20} color="#d32f2f" />
                    </TouchableOpacity>
                  )}
                </View>

                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <TextInput
                    placeholder="Số lượng"
                    placeholderTextColor={defaultPlaceholderColor}
                    value={inputs.quantity}
                    onChangeText={(text) => onInputChange(item.id, 'quantity', text)}
                    keyboardType="numeric"
                    style={[styles.input, { flex: 1, marginRight: 8 }]}
                  />

                  <TextInput
                    placeholder="Đơn vị"
                    placeholderTextColor={defaultPlaceholderColor}
                    value={inputs.unit}
                    onChangeText={(text) => onInputChange(item.id, 'unit', text)}
                    style={[styles.input, { flex: 1, marginRight: 8 }]}
                  />

                  <TouchableOpacity
                    onPress={() => onSelect(item)}
                    style={styles.addButton}
                  >
                    <Text style={styles.addButtonText}>
                      {inputs.selected ? 'Bỏ' : 'Chọn'}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            );
          }}
        />

        <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
          <Text style={{ color: "white", fontWeight: "700" }}>Xong</Text>
        </TouchableOpacity>
      </View>
    </Modal>
  );
}