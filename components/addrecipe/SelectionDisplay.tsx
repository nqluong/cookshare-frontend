import { Text, TouchableOpacity, View } from "react-native";
import { MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';
import { styles } from "../../styles/RecipeStyle";

interface ListItem {
  id: string;
  name: string;
  description?: string;
  color?: string;
  isLocal?: boolean;
}

interface SelectedIngredient {
  id: string;
  quantity: string;
  unit: string;
}

interface Props {
  type: 'category' | 'ingredient' | 'tag';
  items: ListItem[];
  selectedIds?: string[];
  selectedIngredients?: SelectedIngredient[];
  onOpen: () => void;
  onRemoveIngredient?: (id: string) => void;
}

export default function SelectionDisplay({
  type, items, selectedIds, selectedIngredients, onOpen, onRemoveIngredient
}: Props) {
  const getTitle = () => {
    switch (type) {
      case 'category': return (
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
          <MaterialIcons name="folder" size={20} color="#FF6B35" />
          <Text style={styles.cardTitle}>Danh mục</Text>
        </View>
      );
      case 'ingredient': return (
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
          <MaterialCommunityIcons name="food-variant" size={20} color="#FF6B35" />
          <Text style={styles.cardTitle}>Nguyên liệu</Text>
        </View>
      );
      case 'tag': return (
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
          <MaterialIcons name="local-offer" size={20} color="#4A90E2" />
          <Text style={styles.cardTitle}>Tag</Text>
        </View>
      );
    }
  };

  const getEmptyText = () => {
    switch (type) {
      case 'category': return 'Chưa chọn danh mục';
      case 'ingredient': return 'Chưa có nguyên liệu nào được chọn';
      case 'tag': return 'Chưa chọn tag';
    }
  };

  if (type === 'ingredient' && selectedIngredients) {
    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          {getTitle()}
          <TouchableOpacity onPress={onOpen} style={styles.addButton}>
            <Text style={styles.addButtonText}>+ Thêm</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.ingredientsList}>
          {selectedIngredients.length > 0 ? (
            selectedIngredients.map((item) => {
              const ingredient = items.find((i) => i.id === item.id);
              return ingredient ? (
                <View key={item.id} style={styles.ingredientRow}>
                  <Text style={styles.ingredientText}>
                    • {ingredient.name}
                    {ingredient.isLocal && " (mới)"}
                    {item.quantity && item.unit && ` - ${item.quantity} ${item.unit}`}
                  </Text>
                  <TouchableOpacity
                    onPress={() => onRemoveIngredient?.(item.id)}
                    style={styles.removeButton}
                  >
                    <MaterialIcons name="close" size={16} color="#dc3545" />
                  </TouchableOpacity>
                </View>
              ) : null;
            })
          ) : (
            <Text style={styles.emptyText}>{getEmptyText()}</Text>
          )}
        </View>
      </View>
    );
  }

  // Category or Tag
  return (
    <TouchableOpacity onPress={onOpen} style={styles.selectBtn}>
      {getTitle()}
      <View style={styles.selectedItems}>
        {selectedIds && selectedIds.length > 0 ? (
          selectedIds.map((id) => {
            const item = items.find((i) => i.id === id);
            return item ? (
              <View
                key={id}
                style={[
                  styles.selectedItem,
                  type === 'tag' && { backgroundColor: item.color || '#ccc' }
                ]}
              >
                <Text style={styles.selectedItemText}>
                  {item.name}
                  {item.isLocal && " (mới)"}
                </Text>
              </View>
            ) : null;
          })
        ) : (
          <Text style={{ color: '#999', fontSize: 12 }}>{getEmptyText()}</Text>
        )}
      </View>
    </TouchableOpacity>
  );
}