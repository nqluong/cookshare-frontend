import { getImageUrl } from "@/config/api.config";
import { useAuth } from "@/context/AuthContext";
import { CategoryService } from "@/services/categoryService";
import { IngredientService } from "@/services/ingredientService";
import { RecipeService } from "@/services/recipeService";
import { TagService } from "@/services/tagService";
import * as ImagePicker from "expo-image-picker";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

interface IngredientDetail {
  ingredientId: string;
  quantity: number;
  unit: string;
}

interface ListItem {
  id: string;
  name: string;
  description?: string;
  color?: string;
}

interface SelectedIngredient {
  id: string;
  quantity: string;
  unit: string;
}

const defaultPlaceholderColor = "#999";

// Độ khó - phải khớp với backend enum (chữ HOA)
const DIFFICULTY_LEVELS = [
  { value: "EASY", label: "Dễ", emoji: "😊" },
  { value: "MEDIUM", label: "Trung bình", emoji: "🙂" },
  { value: "HARD", label: "Khó", emoji: "😰" },
];

const styles = StyleSheet.create({
  container: { 
    flex: 1,
    padding: 15, 
    backgroundColor: "#fff"
  },
  center: { 
    flex: 1, 
    justifyContent: "center", 
    alignItems: "center",
    backgroundColor: "#fff",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#fff",
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    flex: 1,
    textAlign: "center",
  },
  backButton: {
    padding: 5,
    width: 40,
  },
  backButtonText: {
    fontSize: 24,
    color: "#FF385C",
  },
  headerRight: {
    width: 40,
  },
  label: { fontSize: 16, fontWeight: "bold", marginTop: 15 },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 10,
    marginTop: 5,
    fontSize: 14,
  },
  image: {
    width: "100%",
    height: 200,
    borderRadius: 10,
    marginVertical: 10,
  },
  imagePlaceholder: {
    width: "100%",
    height: 200,
    backgroundColor: "#eee",
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    marginVertical: 10,
  },
  multiContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 5,
  },
  option: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#ccc",
  },
  optionSelected: {
    backgroundColor: "#FF385C20",
    borderColor: "#FF385C",
  },
  addButton: {
    backgroundColor: "#FF385C",
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
  },
  addButtonText: {
    color: "#fff",
    fontWeight: "600",
  },
  ingredientList: {
    marginTop: 10,
  },
  ingredientItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#f8f8f8",
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  ingredientName: {
    flex: 1,
    fontSize: 16,
  },
  removeButton: {
    padding: 5,
  },
  removeButtonText: {
    color: "#FF385C",
    fontSize: 20,
    fontWeight: "bold",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 15,
    textAlign: "center",
  },
  createBtn: {
    backgroundColor: "#4CAF50",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    marginVertical: 10,
  },
  closeBtn: {
    backgroundColor: "#FF385C",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 10,
  },
  listItem: {
    padding: 12,
    borderRadius: 8,
    marginVertical: 4,
    borderWidth: 1,
    borderColor: "#eee",
  },
  saveButton: {
    marginTop: 25,
    backgroundColor: "#FF385C",
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: "center",
    marginBottom: 20,
  },
  saveText: { 
    color: "#fff", 
    fontWeight: "bold", 
    fontSize: 16 
  },
  stepRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  removeStepBtn: {
    backgroundColor: "#ff4444",
    padding: 8,
    borderRadius: 8,
    marginLeft: 8,
  },
  removeStepText: {
    color: "white",
    fontWeight: "bold",
  },
  imagePickerSmall: {
    height: 120,
    backgroundColor: "#f0f0f0",
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  selectedItems: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 8,
  },
  selectedItem: {
    backgroundColor: "#FF385C20",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#FF385C",
  },
  selectedItemText: {
    color: "#FF385C",
    fontSize: 14,
    fontWeight: "600",
  },
  selectBtn: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 12,
    marginTop: 10,
  },
  card: {
    backgroundColor: "#f8f8f8",
    borderRadius: 12,
    padding: 15,
    marginVertical: 10,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "bold",
  },
  ingredientsList: {
    gap: 8,
  },
  ingredientRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "white",
    padding: 10,
    borderRadius: 8,
  },
  ingredientText: {
    flex: 1,
    fontSize: 14,
  },
  emptyText: {
    textAlign: "center",
    color: "#999",
    fontStyle: "italic",
    padding: 15,
  },
  // Styles cho độ khó
  difficultyContainer: {
    flexDirection: "row",
    gap: 10,
    marginTop: 8,
  },
  difficultyButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: "#ddd",
    backgroundColor: "#fff",
    alignItems: "center",
  },
  difficultyButtonSelected: {
    borderColor: "#FF385C",
    backgroundColor: "#FF385C10",
  },
  difficultyEmoji: {
    fontSize: 24,
    marginBottom: 4,
  },
  difficultyLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
  },
  difficultyLabelSelected: {
    color: "#FF385C",
  },
});

export default function EditRecipeScreen() {
  const router = useRouter();
  const { recipeId } = useLocalSearchParams<{ recipeId: string }>();
  const { user } = useAuth();

  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [featuredImage, setFeaturedImage] = useState<string | null>(null);
  const [steps, setSteps] = useState<any[]>([]);
  const [servings, setServings] = useState("");
  const [prepTime, setPrepTime] = useState("");
  const [cookTime, setCookTime] = useState("");
  const [difficulty, setDifficulty] = useState<string>("MEDIUM"); // Độ khó (chữ HOA)

  const [categories, setCategories] = useState<ListItem[]>([]);
  const [ingredients, setIngredients] = useState<ListItem[]>([]);
  const [tags, setTags] = useState<ListItem[]>([]);

  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedIngredients, setSelectedIngredients] = useState<SelectedIngredient[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  const [ingredientInputs, setIngredientInputs] = useState<Record<string, { 
    quantity: string; 
    unit: string; 
    selected: boolean;
  }>>({});

  const [modalVisible, setModalVisible] = useState(false);
  const [modalType, setModalType] = useState<"category" | "ingredient" | "tag" | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [extraField, setExtraField] = useState("");
  
  const [hasChanges, setHasChanges] = useState(false);
  const [originalData, setOriginalData] = useState<any>(null);

  useEffect(() => {
    fetchRecipe();
    fetchMetaData();
  }, [recipeId]);

  // Theo dõi thay đổi
  useEffect(() => {
    if (!originalData) return;
    
    const changed = 
      title !== originalData.title ||
      description !== originalData.description ||
      featuredImage !== originalData.featuredImage ||
      JSON.stringify(steps) !== JSON.stringify(originalData.steps) ||
      servings !== originalData.servings ||
      prepTime !== originalData.prepTime ||
      cookTime !== originalData.cookTime ||
      difficulty !== originalData.difficulty ||
      JSON.stringify(selectedCategories) !== JSON.stringify(originalData.selectedCategories) ||
      JSON.stringify(selectedIngredients) !== JSON.stringify(originalData.selectedIngredients) ||
      JSON.stringify(selectedTags) !== JSON.stringify(originalData.selectedTags);
    
    setHasChanges(changed);
  }, [title, description, featuredImage, steps, servings, prepTime, cookTime, difficulty, selectedCategories, selectedIngredients, selectedTags, originalData]);

  const fetchRecipe = async () => {
    try {
      console.log('🔄 Đang tải công thức:', recipeId);
      const data = await RecipeService.getRecipeById(recipeId!);
      
      console.log('📦 Đã tải công thức:', {
        title: data.title,
        difficulty: data.difficulty,
        stepsCount: data.steps?.length,
      });
      
      setTitle(data.title);
      setDescription(data.description);
      setFeaturedImage(data.featuredImage);
      // Đảm bảo difficulty luôn là chữ HOA
      setDifficulty(data.difficulty?.toUpperCase() || "MEDIUM");
      
      const normalizedSteps = (data.steps || []).map((s: any) => ({
        instruction: s.instruction ?? s.description ?? '',
        image: s.imageUrl ?? null,
        stepNumber: s.stepNumber ?? null,
      }));
      
      setSteps(normalizedSteps.length > 0 ? normalizedSteps : [{ instruction: '', image: null, stepNumber: 1 }]);
      
      setSelectedCategories(data.categories?.map((c: any) => c.categoryId) || []);
      
      const ingredientDetails = (data.ingredients || []).map((i: any) => ({
        id: i.ingredientId,
        quantity: String(i.quantity || 0),
        unit: i.unit || '',
      }));
      setSelectedIngredients(ingredientDetails);
      
      const inputs: Record<string, any> = {};
      ingredientDetails.forEach((item: any) => {
        inputs[item.id] = {
          quantity: item.quantity,
          unit: item.unit,
          selected: true,
        };
      });
      setIngredientInputs(inputs);
      
      setSelectedTags(data.tags?.map((t: any) => t.tagId) || []);
      
      setServings(data.servings ? String(data.servings) : "");
      setPrepTime(data.prepTime ? String(data.prepTime) : "");
      setCookTime(data.cookTime ? String(data.cookTime) : "");
      
      setOriginalData({
        title: data.title,
        description: data.description,
        featuredImage: data.featuredImage,
        steps: normalizedSteps,
        servings: data.servings ? String(data.servings) : "",
        prepTime: data.prepTime ? String(data.prepTime) : "",
        cookTime: data.cookTime ? String(data.cookTime) : "",
        difficulty: data.difficulty?.toUpperCase() || "MEDIUM",
        selectedCategories: data.categories?.map((c: any) => c.categoryId) || [],
        selectedIngredients: ingredientDetails,
        selectedTags: data.tags?.map((t: any) => t.tagId) || [],
      });
      
      console.log('✅ Tải công thức thành công');
    } catch (err: any) {
      console.error('❌ Lỗi khi tải công thức:', err);
      Alert.alert("❌ Lỗi tải công thức", err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchMetaData = async () => {
    try {
      const [catRes, ingRes, tagRes] = await Promise.all([
        CategoryService.getAllCategories(),
        IngredientService.getAllIngredients(),
        TagService.getAllTags(),
      ]);
      
      setCategories((catRes || []).map((c: any) => ({
        id: c.categoryId,
        name: c.name,
        description: c.description,
      })));
      
      setIngredients((ingRes || []).map((i: any) => ({
        id: i.ingredientId,
        name: i.name,
        description: i.description || undefined,
      })));
      
      setTags((tagRes || []).map((t: any) => ({
        id: t.tagId,
        name: t.name,
        color: t.color,
      })));
    } catch (err) {
      console.error("Lỗi khi tải dữ liệu:", err);
    }
  };

  const handlePickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.8,
    });
    if (!result.canceled) {
      setFeaturedImage(result.assets[0].uri);
    }
  };

  const pickStepImage = async (index: number) => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 0.8,
      });
      if (result.canceled) return;
      const uri = result.assets?.[0]?.uri;
      if (!uri) return;
      setSteps(prev => {
        const copy = [...prev];
        copy[index] = { ...(copy[index] || {}), image: uri };
        return copy;
      });
    } catch (err) {
      console.error('Lỗi khi chọn ảnh bước', err);
      Alert.alert('Lỗi', 'Không thể chọn ảnh bước');
    }
  };

  const addStepLocal = () => {
    setSteps(prev => [...prev, { instruction: '', image: null, stepNumber: prev.length + 1 }]);
  };

  const removeStepLocal = (idx: number) => {
    setSteps(prev => {
      if (prev.length <= 1) {
        return [{ instruction: '', image: null, stepNumber: 1 }];
      }
      const copy = [...prev];
      copy.splice(idx, 1);
      return copy.map((s, i) => ({ ...s, stepNumber: i + 1 }));
    });
  };

  const openModal = (type: "category" | "ingredient" | "tag") => {
    setModalType(type);
    setSearchTerm("");
    setExtraField("");
    setModalVisible(true);
  };

  const handleIngredientInputChange = (id: string, field: 'quantity' | 'unit', value: string) => {
    setIngredientInputs((prev) => {
      const cur = prev[id] || { quantity: '', unit: '', selected: false };
      const next = { ...cur, [field]: value };

      if (next.selected) {
        setSelectedIngredients((siPrev) => {
          const entry = {
            id,
            quantity: next.quantity || '',
            unit: next.unit || '',
          };
          const exists = siPrev.find((s) => s.id === id);
          if (exists) {
            return siPrev.map((s) => (s.id === id ? entry : s));
          }
          return [...siPrev, entry];
        });
      }

      return { ...prev, [id]: next };
    });
  };

  const handleSelectItem = (item: ListItem) => {
    if (!item?.id) {
      console.log('Item không hợp lệ:', item);
      return;
    }

    switch (modalType) {
      case "category":
        setSelectedCategories((prev) =>
          prev.includes(item.id) ? prev.filter((id) => id !== item.id) : [...prev, item.id]
        );
        break;

      case "ingredient":
        setIngredientInputs((prev) => {
          const cur = prev[item.id] || { quantity: "", unit: "", selected: false };
          const nextSelected = !cur.selected;
          const next = { ...prev, [item.id]: { ...cur, selected: nextSelected } };

          if (nextSelected) {
            setSelectedIngredients((siPrev) => {
              const exists = siPrev.find((s) => s.id === item.id);
              const newEntry = {
                id: item.id,
                quantity: cur.quantity,
                unit: cur.unit,
              };
              if (exists) {
                return siPrev.map((s) => (s.id === item.id ? newEntry : s));
              }
              return [...siPrev, newEntry];
            });
          } else {
            setSelectedIngredients((siPrev) => siPrev.filter((s) => s.id !== item.id));
          }

          return next;
        });
        break;

      case "tag":
        setSelectedTags((prev) => (prev.includes(item.id) ? prev.filter((id) => id !== item.id) : [...prev, item.id]));
        break;
    }
  };

  const handleCreateNew = async () => {
    if (!searchTerm.trim()) {
      Alert.alert("Lỗi", "Vui lòng nhập tên!");
      return;
    }
    
    try {
      let created = false;

      if (modalType === "category") {
        const categoryRes = await CategoryService.createCategory({
          name: searchTerm,
          description: extraField || "",
        });
        if (categoryRes && categoryRes.categoryId) {
          const newCategory: ListItem = {
            id: categoryRes.categoryId,
            name: categoryRes.name,
            description: categoryRes.description
          };
          setCategories(prev => [newCategory, ...prev]);
          setSelectedCategories(prev => [...prev, newCategory.id]);
          created = true;
        }
      } 
      else if (modalType === "ingredient") {
        const ingredientRes = await IngredientService.createIngredient({ name: searchTerm });
        if (ingredientRes && ingredientRes.ingredientId) {
          const newIngredient: ListItem = {
            id: ingredientRes.ingredientId,
            name: ingredientRes.name,
            description: ingredientRes.description || undefined
          };
          setIngredients(prev => [newIngredient, ...prev]);
          
          Alert.alert(
            "✅ Đã tạo nguyên liệu",
            `"${searchTerm}" đã được thêm vào danh sách. Vui lòng nhập số lượng và đơn vị, sau đó nhấn "Chọn".`,
            [{ text: "OK" }]
          );
          
          setIngredientInputs(prev => ({
            ...prev,
            [newIngredient.id]: { quantity: '', unit: '', selected: false }
          }));
          
          setSearchTerm("");
          created = true;
        }
      } 
      else if (modalType === "tag") {
        // Random màu cho tag
        const randomColor = `#${Math.floor(Math.random()*16777215).toString(16).padStart(6, '0')}`;
        const tagRes = await TagService.createTag({ name: searchTerm, color: randomColor });
        if (tagRes && tagRes.tagId) {
          const newTag: ListItem = {
            id: tagRes.tagId,
            name: tagRes.name,
            color: tagRes.color
          };
          setTags(prev => [newTag, ...prev]);
          setSelectedTags(prev => [...prev, newTag.id]);
          created = true;
        }
      }

      if (created && modalType !== "ingredient") {
        Alert.alert("✅ Thành công", `Đã thêm mới ${searchTerm}`);
        setSearchTerm("");
        setExtraField("");
      }
    } catch (err: any) {
      Alert.alert("Lỗi", err.message || "Không thể tạo mới!");
    }
  };

  const handleSave = async () => {
    if (!title.trim()) return Alert.alert("Lỗi", "Vui lòng nhập tiêu đề");
    if (!description || !description.trim()) return Alert.alert("Lỗi", "Vui lòng nhập mô tả");
    if (!user?.userId) return Alert.alert("Lỗi", "Bạn cần đăng nhập để cập nhật công thức");

    const validIngredients = selectedIngredients.filter(ingredient => {
      const ingredientExists = ingredients.find((i: ListItem) => i.id === ingredient.id);
      const hasQuantity = ingredient.quantity && ingredient.quantity.trim() !== '';
      const hasUnit = ingredient.unit && ingredient.unit.trim() !== '';
      
      if (ingredientExists && (!hasQuantity || !hasUnit)) {
        Alert.alert("Thiếu thông tin", `Vui lòng nhập đầy đủ số lượng và đơn vị cho nguyên liệu: ${ingredientExists.name}`);
        return false;
      }
      
      return ingredientExists != null && hasQuantity && hasUnit;
    });
    
    if (validIngredients.length === 0) {
      Alert.alert("Thiếu thông tin", "Vui lòng chọn ít nhất một nguyên liệu hợp lệ!");
      return;
    }

    try {
      setUpdating(true);

      const formData = new FormData();
      
      const recipeData = {
        title,
        description: description.trim(),
        difficulty: difficulty.toUpperCase(), // Đảm bảo luôn gửi chữ HOA
        steps: steps.map((step, index) => ({
          instruction: step.instruction ?? '',
          stepNumber: index + 1,
          imageUrl: step.image && typeof step.image === 'string' && step.image.startsWith('file://') ? null : step.image
        })).filter(step => step.instruction.trim() !== ''),
        categoryIds: selectedCategories.filter(Boolean),
        ingredientDetails: validIngredients.map((ing: SelectedIngredient) => ({
          ingredientId: ing.id,
          quantity: parseFloat(ing.quantity),
          unit: ing.unit
        })),
        tagIds: selectedTags.filter(Boolean),
        featuredImage: featuredImage?.startsWith('file://') ? null : featuredImage,
        servings: servings ? parseInt(servings) : null,
        prepTime: prepTime ? parseInt(prepTime) : null,
        cookTime: cookTime ? parseInt(cookTime) : null,
        userId: user.userId
      };

      formData.append('data', JSON.stringify(recipeData));

      if (featuredImage?.startsWith('file://')) {
        const filename = featuredImage.split("/").pop()!;
        const ext = filename.split(".").pop()!.toLowerCase();
        const fileObj = {
          uri: featuredImage,
          type: `image/${ext}`,
          name: `recipe.${ext}`,
        } as any;
        formData.append("image", fileObj);
      }

      steps.forEach((step, index) => {
        if (typeof step.image === 'string' && step.image.startsWith('file://')) {
          const filename = step.image.split("/").pop()!;
          const ext = filename.split(".").pop()!.toLowerCase();
          
          const fileObj = {
            uri: step.image,
            type: `image/${ext}`,
            name: `step_${index + 1}.${ext}`,
          } as any;
          formData.append("stepImages", fileObj);
        }
      });

      console.log('📤 Đang cập nhật công thức với độ khó:', difficulty);

      const response = await RecipeService.updateRecipe(recipeId!, formData);
      
      if (response) {
        console.log('🔄 Đang tải lại công thức từ server...');
        await fetchRecipe();
        
        Alert.alert("✅ Cập nhật thành công!", "", [
          {
            text: "OK",
            onPress: () => {
              router.replace({
                pathname: '/(tabs)/profile' as any,
                params: { reload: 'true' }
              });
            }
          }
        ]);
      }
    } catch (err: any) {
      console.error('❌ Cập nhật thất bại:', err);
      Alert.alert("❌ Lỗi khi cập nhật", err.message);
    } finally {
      setUpdating(false);
    }
  };

  const handleBackPress = () => {
    if (hasChanges) {
      Alert.alert(
        "Xác nhận thoát",
        "Bạn có thay đổi chưa lưu. Bạn có muốn tiếp tục chỉnh sửa không?",
        [
          {
            text: "Tiếp tục chỉnh sửa",
            style: "cancel"
          },
          {
            text: "Thoát (không lưu)",
            style: "destructive",
            onPress: () => {
              router.replace({
                pathname: '/(tabs)/profile' as any,
                params: { reload: 'true' }
              });
            }
          }
        ]
      );
    } else {
      router.replace({
        pathname: '/(tabs)/profile' as any,
        params: { reload: 'true' }
      });
    }
  };

  const renderModal = () => {
    const data =
      modalType === "category" ? categories : modalType === "ingredient" ? ingredients : tags;

    const filtered = data.filter((item) =>
      item.name?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
      <Modal visible={modalVisible} animationType="slide">
        <View style={{ flex: 1, padding: 16 }}>
          <Text style={styles.modalTitle}>
            {modalType === "category"
              ? "Chọn danh mục"
              : modalType === "ingredient"
              ? "Chọn nguyên liệu"
              : "Chọn tag"}
          </Text>

          <TextInput
            placeholder="Tên mới hoặc tìm kiếm..."
            placeholderTextColor={defaultPlaceholderColor}
            value={searchTerm}
            onChangeText={setSearchTerm}
            style={styles.input}
          />

          {modalType === "category" && (
            <TextInput
              placeholder="Mô tả danh mục"
              placeholderTextColor={defaultPlaceholderColor}
              value={extraField}
              onChangeText={setExtraField}
              style={styles.input}
            />
          )}

          <TouchableOpacity onPress={handleCreateNew} style={styles.createBtn}>
            <Text style={{ color: "white", fontWeight: "600" }}>➕ Tạo mới</Text>
          </TouchableOpacity>

          <FlatList
            data={filtered}
            keyExtractor={(item, index) => (item?.id ? item.id.toString() : index.toString())}
            renderItem={({ item }) => {
              if (modalType === 'ingredient') {
                const inputs = ingredientInputs[item.id] || { quantity: '', unit: '', selected: false };
                return (
                  <View
                    style={[
                      styles.listItem,
                      { backgroundColor: inputs.selected ? '#cce5ff' : 'white' },
                    ]}
                  >
                    <Text style={{ fontWeight: '600' }}>{item.name}</Text>

                    <View style={{ flexDirection: 'row', marginTop: 8, alignItems: 'center' }}>
                      <TextInput
                        placeholder="Số lượng"
                        placeholderTextColor={defaultPlaceholderColor}
                        value={inputs.quantity}
                        onChangeText={(text) => handleIngredientInputChange(item.id, 'quantity', text)}
                        keyboardType="numeric"
                        style={[styles.input, { flex: 1, marginRight: 8, marginTop: 0 }]}
                      />

                      <TextInput
                        placeholder="Đơn vị"
                        placeholderTextColor={defaultPlaceholderColor}
                        value={inputs.unit}
                        onChangeText={(text) => handleIngredientInputChange(item.id, 'unit', text)}
                        style={[styles.input, { flex: 1, marginRight: 8, marginTop: 0 }]}
                      />

                      <TouchableOpacity onPress={() => handleSelectItem(item)} style={styles.addButton}>
                        <Text style={styles.addButtonText}>{inputs.selected ? 'Bỏ chọn' : 'Chọn'}</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                );
              }

              return (
                <TouchableOpacity
                  onPress={() => handleSelectItem(item)}
                  style={[
                    styles.listItem,
                    {
                      backgroundColor: (() => {
                        switch (modalType) {
                          case 'category':
                            return selectedCategories.includes(item.id) ? '#cce5ff' : 'white';
                          case 'tag':
                            return selectedTags.includes(item.id) ? '#cce5ff' : 'white';
                          default:
                            return 'white';
                        }
                      })(),
                    },
                  ]}
                >
                  <Text style={{ fontWeight: '600' }}>{item.name}</Text>
                  {modalType === 'category' && !!item.description && (
                    <Text style={{ fontSize: 12, color: '#555' }}>{item.description}</Text>
                  )}
                  {modalType === 'tag' && !!item.color && (
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
                </TouchableOpacity>
              );
            }}
          />

          <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.closeBtn}>
            <Text style={{ color: "white", fontWeight: "700" }}>Xong</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    );
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#FF385C" />
        <Text style={{ marginTop: 10, color: "#999" }}>Đang tải công thức...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={handleBackPress}
        >
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Chỉnh sửa công thức</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView style={styles.container}>
        <Text style={styles.label}>Ảnh đại diện</Text>
        <TouchableOpacity onPress={handlePickImage}>
          {featuredImage ? (
            <Image
              source={{ uri: featuredImage.startsWith('file://') ? featuredImage : getImageUrl(featuredImage) }}
              style={styles.image}
              onError={() => {
                Alert.alert("Lỗi", "Không tải được ảnh. Đường dẫn không hợp lệ hoặc server không phản hồi.");
              }}
            />
          ) : (
            <View style={styles.imagePlaceholder}>
              <Text>📸 Chọn ảnh món</Text>
            </View>
          )}
        </TouchableOpacity>

        <Text style={styles.label}>Tên công thức</Text>
        <TextInput
          style={styles.input}
          value={title}
          onChangeText={setTitle}
          placeholder="Nhập tên công thức..."
          placeholderTextColor={defaultPlaceholderColor}
        />

        <Text style={styles.label}>Mô tả</Text>
        <TextInput
          style={[styles.input, { height: 100, textAlignVertical: 'top' }]}
          value={description}
          onChangeText={setDescription}
          multiline
          placeholder="Nhập mô tả..."
          placeholderTextColor={defaultPlaceholderColor}
        />

        {/* Độ khó */}
        <Text style={styles.label}>Độ khó</Text>
        <View style={styles.difficultyContainer}>
          {DIFFICULTY_LEVELS.map((level) => (
            <TouchableOpacity
              key={level.value}
              style={[
                styles.difficultyButton,
                difficulty === level.value && styles.difficultyButtonSelected,
              ]}
              onPress={() => setDifficulty(level.value)}
            >
              <Text style={styles.difficultyEmoji}>{level.emoji}</Text>
              <Text
                style={[
                  styles.difficultyLabel,
                  difficulty === level.value && styles.difficultyLabelSelected,
                ]}
              >
                {level.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.label}>Khẩu phần</Text>
        <TextInput
          style={styles.input}
          value={servings}
          onChangeText={setServings}
          keyboardType="numeric"
          placeholder="Nhập số khẩu phần..."
          placeholderTextColor={defaultPlaceholderColor}
        />

        <Text style={styles.label}>Thời gian chuẩn bị (phút)</Text>
        <TextInput
          style={styles.input}
          value={prepTime}
          onChangeText={setPrepTime}
          keyboardType="numeric"
          placeholder="Nhập thời gian chuẩn bị..."
          placeholderTextColor={defaultPlaceholderColor}
        />

        <Text style={styles.label}>Thời gian nấu (phút)</Text>
        <TextInput
          style={styles.input}
          value={cookTime}
          onChangeText={setCookTime}
          keyboardType="numeric"
          placeholder="Nhập thời gian nấu..."
          placeholderTextColor={defaultPlaceholderColor}
        />

        <TouchableOpacity onPress={() => openModal("category")} style={styles.selectBtn}>
          <Text style={styles.label}>Danh mục đã chọn:</Text>
          <View style={styles.selectedItems}>
            {selectedCategories.map((id: string, index: number) => {
              const category = categories.find((c: ListItem) => c.id === id);
              return category ? (
                <View key={`category-${id || index}`} style={styles.selectedItem}>
                  <Text style={styles.selectedItemText}>{category.name}</Text>
                </View>
              ) : null;
            })}
            {selectedCategories.length === 0 && (
              <Text style={styles.emptyText}>Chưa có danh mục nào</Text>
            )}
          </View>
        </TouchableOpacity>

        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>🧂 Nguyên liệu</Text>
            <TouchableOpacity 
              onPress={() => openModal("ingredient")} 
              style={styles.addButton}
            >
              <Text style={styles.addButtonText}>+ Thêm</Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.ingredientsList}>
            {selectedIngredients.length > 0 ? (
              selectedIngredients.map((item: SelectedIngredient, index: number) => {
                const ingredient = ingredients.find((i: ListItem) => i.id === item.id);
                return ingredient ? (
                  <View key={`ingredient-${item.id || index}`} style={styles.ingredientRow}>
                    <Text style={styles.ingredientText}>
                      • {ingredient.name} - {item.quantity} {item.unit}
                    </Text>
                    <TouchableOpacity 
                      onPress={() => {
                        setSelectedIngredients(prev => prev.filter(i => i.id !== item.id));
                        setIngredientInputs(prev => ({
                          ...prev,
                          [item.id]: { ...prev[item.id], selected: false }
                        }));
                      }}
                      style={styles.removeButton}
                    >
                      <Text style={styles.removeButtonText}>✕</Text>
                    </TouchableOpacity>
                  </View>
                ) : null;
              })
            ) : (
              <Text style={styles.emptyText}>Chưa có nguyên liệu nào được chọn</Text>
            )}
          </View>
        </View>

        <TouchableOpacity onPress={() => openModal("tag")} style={styles.selectBtn}>
          <Text style={styles.label}>Tag đã chọn:</Text>
          <View style={styles.selectedItems}>
            {selectedTags.map((id: string, index: number) => {
              const tag = tags.find((t: ListItem) => t.id === id);
              return tag ? (
                <View key={`tag-${id || index}`} style={[styles.selectedItem, { backgroundColor: tag.color || '#ccc' }]}>
                  <Text style={[styles.selectedItemText, { color: 'white' }]}>{tag.name}</Text>
                </View>
              ) : null;
            })}
            {selectedTags.length === 0 && (
              <Text style={styles.emptyText}>Chưa có tag nào</Text>
            )}
          </View>
        </TouchableOpacity>

        <Text style={styles.label}>Các bước thực hiện</Text>
        {steps.map((step, index) => (
          <View key={index} style={{ marginBottom: 10 }}>
            <View style={styles.stepRow}>
              <TextInput
                placeholder={`Bước ${index + 1}`}
                placeholderTextColor={defaultPlaceholderColor}
                value={step.instruction}
                onChangeText={(text) => {
                  const newSteps = [...steps];
                  newSteps[index] = { ...step, instruction: text };
                  setSteps(newSteps);
                }}
                multiline
                style={[styles.input, { flex: 1, marginRight: 8 }]}
              />

              <TouchableOpacity
                onPress={() => removeStepLocal(index)}
                style={styles.removeStepBtn}
                accessibilityLabel={`Xóa bước ${index + 1}`}
              >
                <Text style={styles.removeStepText}>✖</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity 
              onPress={() => pickStepImage(index)}
              style={styles.imagePickerSmall}
            >
              {step.image ? (
                <Image
                  source={{ 
                    uri: step.image.startsWith('file://') 
                      ? step.image 
                      : getImageUrl(step.image)
                  }}
                  style={{ width: '100%', height: '100%', borderRadius: 10 }}
                  resizeMode="cover"
                />
              ) : (
                <Text>🖼 Ảnh bước {index + 1}</Text>
              )}
            </TouchableOpacity>
          </View>
        ))}
        
        <TouchableOpacity
          style={[styles.addButton, { marginVertical: 15, alignSelf: 'flex-start' }]}
          onPress={addStepLocal}
        >
          <Text style={styles.addButtonText}>+ Thêm bước</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.saveButton}
          onPress={handleSave}
          disabled={updating}
        >
          {updating ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.saveText}>💾 Lưu thay đổi</Text>
          )}
        </TouchableOpacity>
      </ScrollView>

      {renderModal()}
    </SafeAreaView>
  );
}