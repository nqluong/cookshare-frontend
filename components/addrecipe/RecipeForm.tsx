import { Image, Text, TextInput, TouchableOpacity, View } from "react-native";
import { defaultPlaceholderColor, styles } from "../../styles/RecipeStyle";

interface Props {
  title: string;
  description: string;
  prepTime: string;
  cookTime: string;
  difficulty: string;
  servings: string;
  image: string | null;
  onTitleChange: (text: string) => void;
  onDescriptionChange: (text: string) => void;
  onPrepTimeChange: (text: string) => void;
  onCookTimeChange: (text: string) => void;
  onDifficultyChange: (value: string) => void;
  onServingsChange: (text: string) => void;
  onImagePick: () => void;
}

const difficultyOptions = [
  { value: "EASY", label: "Dễ" },
  { value: "MEDIUM", label: "Trung bình" },
  { value: "HARD", label: "Khó" }
];

export default function RecipeForm({
  title, description, prepTime, cookTime, difficulty, servings, image,
  onTitleChange, onDescriptionChange, onPrepTimeChange, onCookTimeChange,
  onDifficultyChange, onServingsChange, onImagePick
}: Props) {
  return (
    <>
      {/* Ảnh món ăn */}
      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>Ảnh món ăn <Text style={styles.required}>*</Text></Text>
        <TouchableOpacity onPress={onImagePick} style={styles.imagePicker}>
          {image ? (
            <Image 
              source={{ uri: image }} 
              style={{ width: "100%", height: "100%", borderRadius: 10 }}
              resizeMode="cover"
            />
          ) : (
            <Text>📸 Chọn ảnh món</Text>
          )}
        </TouchableOpacity>
      </View>

      {/* Tên món ăn */}
      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>Tên món ăn <Text style={styles.required}>*</Text></Text>
        <TextInput 
          placeholder="VD: Phở bò Hà Nội" 
          placeholderTextColor={defaultPlaceholderColor}
          value={title} 
          onChangeText={onTitleChange} 
          style={styles.input} 
        />
      </View>

      {/* Mô tả */}
      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>Mô tả <Text style={styles.required}>*</Text></Text>
        <TextInput
          placeholder="Mô tả về món ăn ..."
          placeholderTextColor={defaultPlaceholderColor}
          value={description}
          onChangeText={onDescriptionChange}
          multiline
          style={[styles.input, { height: 80, textAlignVertical: 'top' }]}
        />
        <Text style={styles.charCount}>{description.length}/200</Text>
      </View>

      {/* Thời gian chuẩn bị và nấu */}
      <View style={styles.row}>
        <TextInput
          placeholder="Chuẩn bị (phút)"
          placeholderTextColor={defaultPlaceholderColor}
          value={prepTime}
          onChangeText={onPrepTimeChange}
          keyboardType="numeric"
          style={[styles.input, { flex: 1, marginRight: 6 }]}
        />
        <TextInput
          placeholder="Nấu (phút)"
          placeholderTextColor={defaultPlaceholderColor}
          value={cookTime}
          onChangeText={onCookTimeChange}
          keyboardType="numeric"
          style={[styles.input, { flex: 1, marginLeft: 6 }]}
        />
      </View>

      {/* Độ khó */}
      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>Độ khó</Text>
        <View style={styles.difficultyContainer}>
          {difficultyOptions.map((option) => (
            <TouchableOpacity
              key={option.value}
              onPress={() => onDifficultyChange(option.value)}
              style={[
                styles.difficultyButton,
                difficulty === option.value && styles.difficultyButtonSelected
              ]}
            >
              <View style={styles.radioButton}>
                {difficulty === option.value && <View style={styles.radioButtonInner} />}
              </View>
              <Text 
                style={[
                  styles.difficultyButtonText,
                  difficulty === option.value && styles.difficultyButtonTextSelected
                ]}
              >
                {option.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Khẩu phần */}
      <View style={styles.row}>
        <TextInput
          placeholder="Khẩu phần"
          placeholderTextColor={defaultPlaceholderColor}
          value={servings}
          onChangeText={onServingsChange}
          keyboardType="numeric"
          style={[styles.input, { flex: 1 }]}
        />
      </View>
    </>
  );
}