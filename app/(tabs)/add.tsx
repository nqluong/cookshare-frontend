import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator, Alert, FlatList, Image, Modal, ScrollView,
  Text, TextInput, TouchableOpacity, View
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "../../context/AuthContext";

import { CategoryService } from "../../services/categoryService";
import { IngredientService } from "../../services/ingredientService";
import { RecipeService } from "../../services/recipeService";
import { TagService } from "../../services/tagService";
import { defaultPlaceholderColor, styles } from "../../styles/RecipeStyle";

// ========== INTERFACES ==========

interface Step {
  description: string;
  image: string | null;
  stepNumber?: number;
  instruction?: string;
}

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

// LocalStorage keys - theo user
const getStorageKeys = (userId: string) => ({
  NEW_CATEGORIES: `@recipe_new_categories_${userId}`,
  NEW_TAGS: `@recipe_new_tags_${userId}`,
  NEW_INGREDIENTS: `@recipe_new_ingredients_${userId}`
});

// ========== COMPONENT ==========

export default function AddRecipeScreen({ navigation }: any) {
  const { user } = useAuth();
  const router = useRouter();
  
  // Recipe form states
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState<string | null>(null);
  const [prepTime, setPrepTime] = useState("");
  const [cookTime, setCookTime] = useState("");
  const [difficulty, setDifficulty] = useState("EASY");
  const [servings, setServings] = useState("");
  const [steps, setSteps] = useState<Step[]>([{ description: "", image: null }]);

  // Data from backend
  const [categories, setCategories] = useState<ListItem[]>([]);
  const [ingredients, setIngredients] = useState<ListItem[]>([]);
  const [tags, setTags] = useState<ListItem[]>([]);

  // Data from localStorage (chưa lưu vào DB)
  const [localCategories, setLocalCategories] = useState<ListItem[]>([]);
  const [localTags, setLocalTags] = useState<ListItem[]>([]);
  const [localIngredients, setLocalIngredients] = useState<ListItem[]>([]);

  // Selected items
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedIngredients, setSelectedIngredients] = useState<SelectedIngredient[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  
  const [ingredientInputs, setIngredientInputs] = useState<Record<string, { 
    quantity: string; 
    unit: string; 
    selected: boolean;
  }>>({});

  // UI states
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalType, setModalType] = useState<"category" | "ingredient" | "tag" | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [extraField, setExtraField] = useState("");

  const difficultyOptions = [
    { value: "EASY", label: "Dễ" },
    { value: "MEDIUM", label: "Trung bình" },
    { value: "HARD", label: "Khó" }
  ];

  // ========== LOAD DATA ==========

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      const [cat, ing, tag] = await Promise.all([
        CategoryService.getAllCategories(),
        IngredientService.getAllIngredients(),
        TagService.getAllTags(),
      ]);
      
      setCategories(cat.map((c: any) => ({
        id: c.categoryId,
        name: c.name,
        description: c.description,
        isLocal: false
      })));

      setIngredients(ing.map((i: any) => ({
        id: i.ingredientId,
        name: i.name,
        description: i.description || undefined,
        isLocal: false
      })));

      setTags(tag.map((t: any) => ({
        id: t.tagId,
        name: t.name,
        color: t.color,
        isLocal: false
      })));

      await loadLocalStorageData();
    } catch (e) {
      Alert.alert("Lỗi", "Không thể tải dữ liệu ban đầu!");
    }
  };

  const loadLocalStorageData = async () => {
    if (!user?.userId) return;
    
    const STORAGE_KEYS = getStorageKeys(user.userId);
    
    try {
      const [catData, tagData, ingData] = await Promise.all([
        AsyncStorage.getItem(STORAGE_KEYS.NEW_CATEGORIES),
        AsyncStorage.getItem(STORAGE_KEYS.NEW_TAGS),
        AsyncStorage.getItem(STORAGE_KEYS.NEW_INGREDIENTS)
      ]);

      if (catData) {
        const parsed = JSON.parse(catData);
        setLocalCategories(parsed.map((item: any) => ({ ...item, isLocal: true })));
      }

      if (tagData) {
        const parsed = JSON.parse(tagData);
        setLocalTags(parsed.map((item: any) => ({ ...item, isLocal: true })));
      }

      if (ingData) {
        const parsed = JSON.parse(ingData);
        setLocalIngredients(parsed.map((item: any) => ({ ...item, isLocal: true })));
      }
    } catch (err) {
      console.error("Error loading localStorage:", err);
    }
  };

  // ========== COMBINED DATA (DB + LOCAL) ==========

  const allCategories = [...localCategories, ...categories];
  const allTags = [...localTags, ...tags];
  const allIngredients = [...localIngredients, ...ingredients];

  // ========== IMAGE PICKER ==========

  const pickImage = async (index?: number) => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        allowsEditing: true,
        quality: 0.8,
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        aspect: [4, 3],
        base64: false
      });
      
      if (result.canceled) return;
      
      const uri = result.assets?.[0]?.uri;
      if (!uri) return;

      if (index !== undefined) {
        const updated = [...steps];
        updated[index].image = uri;
        setSteps(updated);
      } else {
        setImage(uri);
      }
    } catch {
      Alert.alert("Lỗi", "Không thể chọn ảnh!");
    }
  };

  // ========== STEPS MANAGEMENT ==========

  const addStep = () => setSteps([...steps, { description: "", image: null }]);

  const removeStep = (index: number) => {
    if (steps.length <= 1) {
      setSteps([{ description: "", image: null }]);
    } else {
      const copy = [...steps];
      copy.splice(index, 1);
      setSteps(copy);
    }
  };

  // ========== DELETE LOCAL ITEMS ==========

  const handleDeleteLocalItem = async (item: ListItem) => {
    if (!user?.userId) return;
    
    const STORAGE_KEYS = getStorageKeys(user.userId);

    try {
      if (modalType === "category") {
        const updated = localCategories.filter(c => c.id !== item.id);
        setLocalCategories(updated);
        await AsyncStorage.setItem(STORAGE_KEYS.NEW_CATEGORIES, JSON.stringify(updated));
        setSelectedCategories(prev => prev.filter(id => id !== item.id));
      } else if (modalType === "ingredient") {
        const updated = localIngredients.filter(i => i.id !== item.id);
        setLocalIngredients(updated);
        await AsyncStorage.setItem(STORAGE_KEYS.NEW_INGREDIENTS, JSON.stringify(updated));
        setSelectedIngredients(prev => prev.filter(si => si.id !== item.id));
        setIngredientInputs(prev => {
          const copy = { ...prev };
          delete copy[item.id];
          return copy;
        });
      } else if (modalType === "tag") {
        const updated = localTags.filter(t => t.id !== item.id);
        setLocalTags(updated);
        await AsyncStorage.setItem(STORAGE_KEYS.NEW_TAGS, JSON.stringify(updated));
        setSelectedTags(prev => prev.filter(id => id !== item.id));
      }
    } catch (err) {
      console.error("Error deleting local item:", err);
      Alert.alert("Lỗi", "Không thể xóa!");
    }
  };

  // ========== MODAL ==========

  const openModal = (type: "category" | "ingredient" | "tag") => {
    setModalType(type);
    setSearchTerm("");
    setExtraField("");
    setModalVisible(true);
  };

  const handleSelectItem = (item: ListItem) => {
    if (!item?.id) return;

    switch (modalType) {
      case "category":
        setSelectedCategories((prev) =>
          prev.includes(item.id) 
            ? prev.filter((id) => id !== item.id) 
            : [...prev, item.id]
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
              return exists 
                ? siPrev.map((s) => (s.id === item.id ? newEntry : s))
                : [...siPrev, newEntry];
            });
          } else {
            setSelectedIngredients((siPrev) => siPrev.filter((s) => s.id !== item.id));
          }

          return next;
        });
        break;

      case "tag":
        setSelectedTags((prev) => 
          prev.includes(item.id) 
            ? prev.filter((id) => id !== item.id) 
            : [...prev, item.id]
        );
        break;
    }
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
          return exists 
            ? siPrev.map((s) => (s.id === id ? entry : s))
            : [...siPrev, entry];
        });
      }

      return { ...prev, [id]: next };
    });
  };

  // ========== CREATE NEW (LƯU VÀO LOCALSTORAGE) ==========

  const handleCreateNew = async () => {
    if (!searchTerm.trim()) {
      Alert.alert("Lỗi", "Vui lòng nhập tên!");
      return;
    }

    if (!user?.userId) {
      Alert.alert("Lỗi", "Không tìm thấy thông tin người dùng!");
      return;
    }

    const STORAGE_KEYS = getStorageKeys(user.userId);

    try {
      if (modalType === "category") {
        const exists = allCategories.find(
          c => c.name.toLowerCase().trim() === searchTerm.toLowerCase().trim()
        );
        
        if (exists) {
          Alert.alert("Đã tồn tại", `Danh mục "${exists.name}" đã có. Bạn có thể chọn nó.`);
          setSelectedCategories(prev => prev.includes(exists.id) ? prev : [...prev, exists.id]);
          setSearchTerm("");
          return;
        }

        const newItem: ListItem = {
          id: `local_cat_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          name: searchTerm,
          description: extraField || "",
          isLocal: true
        };

        const updated = [...localCategories, newItem];
        setLocalCategories(updated);
        await AsyncStorage.setItem(STORAGE_KEYS.NEW_CATEGORIES, JSON.stringify(updated));
        
        setSelectedCategories(prev => [...prev, newItem.id]);
        Alert.alert("✅ Thành công", `Đã thêm danh mục "${searchTerm}"`);
        setSearchTerm("");
        setExtraField("");
      }
      else if (modalType === "ingredient") {
        const exists = allIngredients.find(
          i => i.name.toLowerCase().trim() === searchTerm.toLowerCase().trim()
        );
        
        if (exists) {
          Alert.alert("Đã tồn tại", `Nguyên liệu "${exists.name}" đã có. Bạn có thể chọn nó.`);
          setIngredientInputs(prev => ({
            ...prev,
            [exists.id]: { quantity: '', unit: '', selected: false }
          }));
          setSearchTerm("");
          return;
        }

        const newId = `local_ing_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const newItem: ListItem = {
          id: newId,
          name: searchTerm,
          description: extraField || "",
          isLocal: true
        };

        const updated = [...localIngredients, newItem];
        setLocalIngredients(updated);
        await AsyncStorage.setItem(STORAGE_KEYS.NEW_INGREDIENTS, JSON.stringify(updated));
        
        setIngredientInputs(prev => ({
          ...prev,
          [newItem.id]: { quantity: '', unit: '', selected: false }
        }));
        
        Alert.alert("✅ Thành công", `Đã thêm nguyên liệu "${searchTerm}"`);
        setSearchTerm("");
        setExtraField("");
      }
      else if (modalType === "tag") {
        const exists = allTags.find(
          t => t.name.toLowerCase().trim() === searchTerm.toLowerCase().trim()
        );
        
        if (exists) {
          Alert.alert("Đã tồn tại", `Tag "${exists.name}" đã có. Bạn có thể chọn nó.`);
          setSelectedTags(prev => prev.includes(exists.id) ? prev : [...prev, exists.id]);
          setSearchTerm("");
          return;
        }

        const randomColor = `#${Math.floor(Math.random()*16777215).toString(16).padStart(6, '0')}`;
        const newItem: ListItem = {
          id: `local_tag_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          name: searchTerm,
          color: randomColor,
          isLocal: true
        };

        const updated = [...localTags, newItem];
        setLocalTags(updated);
        await AsyncStorage.setItem(STORAGE_KEYS.NEW_TAGS, JSON.stringify(updated));
        
        setSelectedTags(prev => [...prev, newItem.id]);
        Alert.alert("✅ Thành công", `Đã thêm tag "${searchTerm}"`);
        setSearchTerm("");
      }
    } catch (err: any) {
      Alert.alert("Lỗi", err.message || "Không thể lưu!");
    }
  };

  // ========== SUBMIT (GỬI TẤT CẢ) ==========

  const handleSubmit = async () => {
    if (!title.trim()) {
      Alert.alert("Thiếu thông tin", "Vui lòng nhập tên món!");
      return;
    }
    if (!description.trim()) {
      Alert.alert("Thiếu thông tin", "Vui lòng nhập mô tả món!");
      return;
    }
    if (!prepTime.trim() || !cookTime.trim() || !servings.trim()) {
      Alert.alert("Thiếu thông tin", "Vui lòng điền đầy đủ thời gian và khẩu phần!");
      return;
    }

    const validSteps = steps.filter(s => s.description.trim());
    if (validSteps.length === 0) {
      Alert.alert("Thiếu thông tin", "Vui lòng nhập ít nhất một bước thực hiện!");
      return;
    }

    for (let i = 0; i < steps.length; i++) {
      const step = steps[i];
      if (step.image && !step.description.trim()) {
        Alert.alert("Thiếu thông tin", `Bước ${i + 1} đã có ảnh nhưng chưa có mô tả!`);
        return;
      }
    }

    if (!image) {
      Alert.alert("Thiếu thông tin", "Vui lòng chọn ảnh cho món ăn!");
      return;
    }

    if (selectedIngredients.length === 0) {
      Alert.alert("Thiếu thông tin", "Vui lòng chọn ít nhất một nguyên liệu!");
      return;
    }

    if (!user?.userId) {
      Alert.alert("Lỗi", "Không tìm thấy thông tin người dùng!");
      return;
    }

    try {
      setLoading(true);

      const STORAGE_KEYS = getStorageKeys(user.userId);

      // Categories mới
      const newCategories = selectedCategories
        .map(id => localCategories.find(c => c.id === id))
        .filter(c => c != null)
        .map(c => ({
          name: c!.name,
          description: c!.description || ""
        }));

      const existingCategoryIds = selectedCategories.filter(id => 
        categories.find(c => c.id === id)
      );

      // Tags mới
      const newTags = selectedTags
        .map(id => localTags.find(t => t.id === id))
        .filter(t => t != null)
        .map(t => ({
          name: t!.name,
          color: t!.color || '#666666'
        }));

      const existingTagIds = selectedTags.filter(id => 
        tags.find(t => t.id === id)
      );

      // Ingredients: tạo trên server trước
      const localToCreate = selectedIngredients
        .map(si => ({ si, item: localIngredients.find(i => i.id === si.id) }))
        .filter(x => x.item != null)
        .map(x => ({ localId: x.item!.id, name: x.item!.name, description: x.item!.description || '' }));

      const createdMap: Record<string, string> = {};

      if (localToCreate.length > 0) {
        for (const row of localToCreate) {
          try {
            const created = await IngredientService.createIngredient({ name: row.name, description: row.description });
            createdMap[row.localId] = created.ingredientId || created.id;
          } catch (e) {
            console.error('Failed to create ingredient:', row.name, e);
            Alert.alert('Lỗi', `Không thể tạo nguyên liệu "${row.name}"`);
            setLoading(false);
            return;
          }
        }
      }

      const finalIngredientDetails = selectedIngredients.map((ing: SelectedIngredient) => {
        const quantity = ing.quantity && ing.quantity.trim() !== '' ? parseFloat(ing.quantity) : 0;
        const unit = ing.unit && ing.unit.trim() !== '' ? ing.unit : '';
        const localItem = localIngredients.find(i => i.id === ing.id);
        const finalId = localItem ? createdMap[localItem.id] : ing.id;

        return {
          ingredientId: finalId,
          quantity: isNaN(quantity) ? 0 : quantity,
          unit: unit
        };
      }).filter(d => d.ingredientId);

      const stepsWithImages = validSteps.map((step, index) => ({
        instruction: step.description,
        stepNumber: index + 1,
        imageUrl: step.image ? `PLACEHOLDER_${index + 1}` : null
      }));

      const recipeData = {
        title,
        description,
        prepTime: parseInt(prepTime),
        cookTime: parseInt(cookTime),
        difficulty,
        servings: parseInt(servings),
        userId: user.userId,
        status: "PENDING",
        categoryIds: existingCategoryIds,
        tagIds: existingTagIds,
        newCategories: newCategories.length > 0 ? newCategories : undefined,
        newTags: newTags.length > 0 ? newTags : undefined,
        ingredientDetails: finalIngredientDetails,
        steps: stepsWithImages
      };

      try {
        const form = new FormData();
        form.append('data', JSON.stringify(recipeData));

        if (image) {
          const uriParts = image.split('.');
          const fileType = uriParts[uriParts.length - 1] || 'jpg';
          form.append('image', {
            uri: image,
            name: `photo.${fileType}`,
            type: `image/${fileType}`
          } as any);
        }

        validSteps.forEach((step) => {
          if (step.image) {
            const uriParts = (step.image as string).split('.');
            const fileType = uriParts[uriParts.length - 1] || 'jpg';
            form.append('stepImages', {
              uri: step.image,
              name: `step.${fileType}`,
              type: `image/${fileType}`
            } as any);
          }
        });

        const res = await RecipeService.createRecipe(form as any);
        console.log('Recipe created:', res);

        // Xóa localStorage sau khi thành công
        await AsyncStorage.multiRemove([
          STORAGE_KEYS.NEW_CATEGORIES,
          STORAGE_KEYS.NEW_TAGS,
          STORAGE_KEYS.NEW_INGREDIENTS
        ]);

        // Reset form
        setTitle("");
        setDescription("");
        setImage(null);
        setPrepTime("");
        setCookTime("");
        setDifficulty("EASY");
        setServings("");
        setSteps([{ description: "", image: null }]);
        setSelectedCategories([]);
        setSelectedIngredients([]);
        setSelectedTags([]);
        setIngredientInputs({});
        setLocalCategories([]);
        setLocalTags([]);
        setLocalIngredients([]);

        Alert.alert(
          "🎉 Thành công",
          "Công thức của bạn đã được tạo và đang chờ phê duyệt.",
          [
            { text: "Tạo công thức mới", onPress: () => {}, style: "default" },
            {
              text: "Xem trang của tôi",
              onPress: () => {
                try {
                  router.push({
                    pathname: "/(tabs)/profile",
                    params: { reload: Date.now().toString() }
                  });
                } catch (e) {
                  console.error("Error navigating:", e);
                }
              },
            },
            { text: "Đóng", style: "cancel" },
          ]
        );
      } catch (e: any) {
        console.error('Failed to create recipe:', e);
        Alert.alert('Lỗi', e.message || 'Không thể tạo công thức!');
        setLoading(false);
        return;
      }
    } catch (err: any) {
      Alert.alert("Lỗi", err.message || "Không thể tạo công thức!");
    } finally {
      setLoading(false);
    }
  };

  // ========== RENDER MODAL ==========

  const renderModal = () => {
    const data = modalType === "category" 
      ? allCategories 
      : modalType === "ingredient" 
        ? allIngredients 
        : allTags;

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

          {modalType === "ingredient" && (
            <TextInput
              placeholder="Mô tả nguyên liệu (tùy chọn)"
              placeholderTextColor={defaultPlaceholderColor}
              value={extraField}
              onChangeText={setExtraField}
              style={styles.input}
            />
          )}

          <TouchableOpacity onPress={handleCreateNew} style={styles.createBtn}>
            <Text style={{ color: "white", fontWeight: "600" }}>
              ✅ Tạo mới
            </Text>
          </TouchableOpacity>

          <FlatList
            data={filtered}
            keyExtractor={(item, index) => item?.id || index.toString()}
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
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                      <Text style={{ fontWeight: '600', flex: 1 }}>
                        {item.name}
                        {item.isLocal && <Text style={{ color: '#ff9800' }}> (mới)</Text>}
                      </Text>
                      
                      {item.isLocal && (
                        <TouchableOpacity 
                          onPress={() => handleDeleteLocalItem(item)}
                          style={{ padding: 4 }}
                        >
                          <Text style={{ fontSize: 18, color: '#d32f2f' }}>🗑️</Text>
                        </TouchableOpacity>
                      )}
                    </View>

                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                      <TextInput
                        placeholder="Số lượng"
                        placeholderTextColor={defaultPlaceholderColor}
                        value={inputs.quantity}
                        onChangeText={(text) => handleIngredientInputChange(item.id, 'quantity', text)}
                        keyboardType="numeric"
                        style={[styles.input, { flex: 1, marginRight: 8 }]}
                      />

                      <TextInput
                        placeholder="Đơn vị"
                        placeholderTextColor={defaultPlaceholderColor}
                        value={inputs.unit}
                        onChangeText={(text) => handleIngredientInputChange(item.id, 'unit', text)}
                        style={[styles.input, { flex: 1, marginRight: 8 }]}
                      />

                      <TouchableOpacity 
                        onPress={() => handleSelectItem(item)} 
                        style={styles.addButton}
                      >
                        <Text style={styles.addButtonText}>
                          {inputs.selected ? 'Bỏ' : 'Chọn'}
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                );
              }

              // Category or Tag
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
                  <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                    <View style={{ flex: 1 }}>
                      <Text style={{ fontWeight: '600' }}>
                        {item.name}
                        {item.isLocal && <Text style={{ color: '#ff9800' }}> (mới)</Text>}
                      </Text>
                      {modalType === 'category' && !!item.description && (
                        <Text style={{ fontSize: 12, color: '#555', marginTop: 2 }}>{item.description}</Text>
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
                    </View>
                    
                    {item.isLocal && (
                      <TouchableOpacity 
                        onPress={() => handleDeleteLocalItem(item)}
                        style={{ padding: 4, marginLeft: 8 }}
                      >
                        <Text style={{ fontSize: 18, color: '#d32f2f' }}>🗑️</Text>
                      </TouchableOpacity>
                    )}
                  </View>
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

  // ========== RENDER ==========

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "white" }}>
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        <Text style={styles.header}>🍳 Thêm công thức</Text>

        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>Tên món ăn <Text style={styles.required}>*</Text></Text>
          <TextInput 
            placeholder="VD: Phở bò Hà Nội" 
            placeholderTextColor={defaultPlaceholderColor}
            value={title} 
            onChangeText={setTitle} 
            style={styles.input} 
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>Mô tả <Text style={styles.required}>*</Text></Text>
          <TextInput
            placeholder="Mô tả về món ăn ..."
            placeholderTextColor={defaultPlaceholderColor}
            value={description}
            onChangeText={setDescription}
            multiline
            style={[styles.input, { height: 80, textAlignVertical: 'top' }]}
          />
          <Text style={styles.charCount}>{description.length}/200</Text>
        </View>

        <View style={styles.row}>
          <TextInput
            placeholder="Chuẩn bị (phút)"
            placeholderTextColor={defaultPlaceholderColor}
            value={prepTime}
            onChangeText={setPrepTime}
            keyboardType="numeric"
            style={[styles.input, { flex: 1, marginRight: 6 }]}
          />
          <TextInput
            placeholder="Nấu (phút)"
            placeholderTextColor={defaultPlaceholderColor}
            value={cookTime}
            onChangeText={setCookTime}
            keyboardType="numeric"
            style={[styles.input, { flex: 1, marginLeft: 6 }]}
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>Độ khó</Text>
          <View style={styles.difficultyContainer}>
            {difficultyOptions.map((option) => (
              <TouchableOpacity
                key={option.value}
                onPress={() => setDifficulty(option.value)}
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

        <View style={styles.row}>
          <TextInput
            placeholder="Khẩu phần"
            placeholderTextColor={defaultPlaceholderColor}
            value={servings}
            onChangeText={setServings}
            keyboardType="numeric"
            style={[styles.input, { flex: 1 }]}
          />
        </View>

        {/* ========== CATEGORIES ========== */}
        <TouchableOpacity onPress={() => openModal("category")} style={styles.selectBtn}>
          <Text style={{ fontWeight: '600', marginBottom: 8 }}>📁 Danh mục</Text>
          <View style={styles.selectedItems}>
            {selectedCategories.length > 0 ? (
              selectedCategories.map((id: string) => {
                const category = allCategories.find((c: ListItem) => c.id === id);
                return category ? (
                  <View key={id} style={styles.selectedItem}>
                    <Text style={styles.selectedItemText}>
                      {category.name}
                      {category.isLocal && " (mới)"}
                    </Text>
                  </View>
                ) : null;
              })
            ) : (
              <Text style={{ color: '#999', fontSize: 12 }}>Chưa chọn danh mục</Text>
            )}
          </View>
        </TouchableOpacity>

        {/* ========== INGREDIENTS ========== */}
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
              selectedIngredients.map((item: SelectedIngredient) => {
                const ingredient = allIngredients.find((i: ListItem) => i.id === item.id);
                return ingredient ? (
                  <View key={item.id} style={styles.ingredientRow}>
                    <Text style={styles.ingredientText}>
                      • {ingredient.name}
                      {ingredient.isLocal && " (mới)"}
                      {item.quantity && item.unit && ` - ${item.quantity} ${item.unit}`}
                    </Text>
                    <TouchableOpacity 
                      onPress={() => {
                        setSelectedIngredients(prev => prev.filter(i => i.id !== item.id));
                        setIngredientInputs(prev => {
                          const updated = { ...prev };
                          if (updated[item.id]) {
                            updated[item.id].selected = false;
                          }
                          return updated;
                        });
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

        {/* ========== TAGS ========== */}
        <TouchableOpacity onPress={() => openModal("tag")} style={styles.selectBtn}>
          <Text style={{ fontWeight: '600', marginBottom: 8 }}>🏷️ Tag</Text>
          <View style={styles.selectedItems}>
            {selectedTags.length > 0 ? (
              selectedTags.map((id: string) => {
                const tag = allTags.find((t: ListItem) => t.id === id);
                return tag ? (
                  <View 
                    key={id} 
                    style={[
                      styles.selectedItem, 
                      { backgroundColor: tag.color || '#ccc' }
                    ]}
                  >
                    <Text style={styles.selectedItemText}>
                      {tag.name}
                      {tag.isLocal && " (mới)"}
                    </Text>
                  </View>
                ) : null;
              })
            ) : (
              <Text style={{ color: '#999', fontSize: 12 }}>Chưa chọn tag</Text>
            )}
          </View>
        </TouchableOpacity>

        {/* ========== MAIN IMAGE ========== */}
        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>Ảnh món ăn <Text style={styles.required}>*</Text></Text>
          <TouchableOpacity onPress={() => pickImage()} style={styles.imagePicker}>
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

        {/* ========== STEPS ========== */}
        <Text style={styles.stepTitle}>Các bước thực hiện</Text>
        {steps.map((s, i) => (
          <View key={i} style={{ marginBottom: 10 }}>
            <View style={styles.stepRow}>
              <TextInput
                placeholder={`Bước ${i + 1}`}
                placeholderTextColor={defaultPlaceholderColor}
                value={s.description}
                onChangeText={(text) => {
                  const copy = [...steps];
                  copy[i].description = text;
                  setSteps(copy);
                }}
                multiline
                style={[styles.input, { flex: 1, marginRight: 8 }]}
              />

              <TouchableOpacity
                onPress={() => removeStep(i)}
                style={styles.removeStepBtn}
                accessibilityLabel={`Xóa bước ${i + 1}`}
              >
                <Text style={styles.removeStepText}>✖</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity onPress={() => pickImage(i)} style={styles.imagePickerSmall}>
              {s.image ? (
                <Image 
                  source={{ uri: s.image }} 
                  style={{ width: "100%", height: "100%", borderRadius: 10 }}
                  resizeMode="cover"
                />
              ) : (
                <Text>🖼 Ảnh bước {i + 1}</Text>
              )}
            </TouchableOpacity>
          </View>
        ))}
        
        <TouchableOpacity onPress={addStep} style={styles.addBtn}>
          <Text style={{ color: "white", fontWeight: "600" }}>+ Thêm bước</Text>
        </TouchableOpacity>

        {/* ========== SUBMIT ========== */}
        <TouchableOpacity
          onPress={handleSubmit}
          disabled={loading}
          style={[styles.submitBtn, { opacity: loading ? 0.6 : 1 }]}
        >
          {loading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text style={{ color: "white", fontWeight: "700" }}>
              ✅ Tạo công thức
            </Text>
          )}
        </TouchableOpacity>
      </ScrollView>

      {renderModal()}
    </SafeAreaView>
  );
}