import { Image, Text, TextInput, TouchableOpacity, View } from "react-native";
import { MaterialIcons } from '@expo/vector-icons';
import { defaultPlaceholderColor, styles } from "../../styles/RecipeStyle";

interface Step {
  description: string;
  image: string | null;
}

interface Props {
  steps: Step[];
  onStepChange: (index: number, text: string) => void;
  onStepImagePick: (index: number) => void;
  onAddStep: () => void;
  onRemoveStep: (index: number) => void;
}

export default function RecipeSteps({
  steps,
  onStepChange,
  onStepImagePick,
  onAddStep,
  onRemoveStep
}: Props) {
  return (
    <>
      <Text style={styles.stepTitle}>Các bước thực hiện</Text>
      {steps.map((s, i) => (
        <View key={i} style={{ marginBottom: 10 }}>
          <View style={styles.stepRow}>
            <TextInput
              placeholder={`Bước ${i + 1}`}
              placeholderTextColor={defaultPlaceholderColor}
              value={s.description}
              onChangeText={(text) => onStepChange(i, text)}
              multiline
              style={[styles.input, { flex: 1, marginRight: 8 }]}
            />

            <TouchableOpacity
              onPress={() => onRemoveStep(i)}
              style={styles.removeStepBtn}
              accessibilityLabel={`Xóa bước ${i + 1}`}
            >
              <MaterialIcons name="close" size={20} color="#fff" />
            </TouchableOpacity>
          </View>

          <TouchableOpacity onPress={() => onStepImagePick(i)} style={styles.imagePickerSmall}>
            {s.image ? (
              <Image
                source={{ uri: s.image }}
                style={{ width: "100%", height: "100%", borderRadius: 10 }}
                resizeMode="cover"
              />
            ) : (
              <View style={{ alignItems: 'center', justifyContent: 'center' }}>
                <MaterialIcons name="add-photo-alternate" size={32} color="#999" />
                <Text style={{ marginTop: 4, color: '#999', fontSize: 12 }}>Ảnh bước {i + 1}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      ))}
      <TouchableOpacity onPress={onAddStep} style={styles.addBtn}>
        <Text style={{ color: "white", fontWeight: "600" }}>+ Thêm bước</Text>
      </TouchableOpacity>
    </>
  );
}