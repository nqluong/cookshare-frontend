import React from 'react';
import {
    KeyboardAvoidingView,
    Modal,
    Platform,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { searchStyles } from '../../styles/SearchStyles';

interface CustomIngredientModalProps {
  visible: boolean;
  customIngredient: string;
  setCustomIngredient: (value: string) => void;
  onAdd: () => void;
  onClose: () => void;
}

export default function CustomIngredientModal({
  visible,
  customIngredient,
  setCustomIngredient,
  onAdd,
  onClose,
}: CustomIngredientModalProps) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <TouchableOpacity style={searchStyles.modalOverlay} activeOpacity={1} onPress={onClose}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={searchStyles.modalContainer}
        >
          <TouchableOpacity activeOpacity={1} onPress={(e) => e.stopPropagation()}>
            <View style={searchStyles.modalContent}>
              <Text style={searchStyles.modalTitle}>Nhập nguyên liệu</Text>
              <TextInput
                style={searchStyles.modalInput}
                placeholder="VD: Thịt bò, Cà chua..."
                value={customIngredient}
                onChangeText={setCustomIngredient}
                autoFocus
                onSubmitEditing={onAdd}
                returnKeyType="done"
              />
              <View style={searchStyles.modalButtons}>
                <TouchableOpacity style={[searchStyles.modalButton, searchStyles.cancelButton]} onPress={onClose}>
                  <Text style={searchStyles.cancelButtonText}>Hủy</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[searchStyles.modalButton, searchStyles.addButton]} onPress={onAdd}>
                  <Text style={searchStyles.addButtonText}>Thêm</Text>
                </TouchableOpacity>
              </View>
            </View>
          </TouchableOpacity>
        </KeyboardAvoidingView>
      </TouchableOpacity>
    </Modal>
  );
}