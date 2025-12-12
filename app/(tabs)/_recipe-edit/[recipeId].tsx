import { getImageUrl } from "@/config/api.config";
import { useAuth } from "@/context/AuthContext";
import { CategoryService } from "@/services/categoryService";
import { IngredientService } from "@/services/ingredientService";
import { RecipeService } from "@/services/recipeService";
import { TagService } from "@/services/tagService";
import styles from "@/styles/EditRecipeStyle";
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from "expo-image-picker";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { MaterialIcons } from "@expo/vector-icons";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  Modal,
  ScrollView,
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
  isLocal?: boolean;
}

interface SelectedIngredient {
  id: string;
  quantity: string;
  unit: string;
}

const defaultPlaceholderColor = "#999";

// Độ khó - phải khớp với backend enum (chữ HOA)
const DIFFICULTY_LEVELS = [
  { value: "EASY", label: "Dễ", color: "#4CAF50" },
  { value: "MEDIUM", label: "Trung bình", color: "#FF9800" },
  { value: "HARD", label: "Khó", color: "#F44336" },
];

// Local storage keys for temporary created items (theo user)
const getStorageKeys = (userId: string) => ({
  NEW_CATEGORIES: `@recipe_new_categories_${userId}`,
  NEW_TAGS: `@recipe_new_tags_${userId}`,
  NEW_INGREDIENTS: `@recipe_new_ingredients_${userId}`
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
  const [difficulty, setDifficulty] = useState<string>("MEDIUM");

  // Data from backend
  const [categories, setCategories] = useState<ListItem[]>([]);
  const [ingredients, setIngredients] = useState<ListItem[]>([]);
  const [tags, setTags] = useState<ListItem[]>([]);

  // Data from localStorage (chưa lưu vào DB)
  const [localCategories, setLocalCategories] = useState<ListItem[]>([]);
  const [localTags, setLocalTags] = useState<ListItem[]>([]);
  const [localIngredients, setLocalIngredients] = useState<ListItem[]>([]);

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

  // Combined data (server + local)
  const allCategories = [...localCategories, ...categories];
  const allTags = [...localTags, ...tags];
  const allIngredients = [...localIngredients, ...ingredients];

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
      Alert.alert("Lỗi tải công thức", err.message);
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
        isLocal: false
      })));

      setIngredients((ingRes || []).map((i: any) => ({
        id: i.ingredientId,
        name: i.name,
        description: i.description || undefined,
        isLocal: false
      })));

      setTags((tagRes || []).map((t: any) => ({
        id: t.tagId,
        name: t.name,
        color: t.color,
        isLocal: false
      })));

      await loadLocalStorageData();
    } catch (err) {
      console.error("Lỗi khi tải dữ liệu:", err);
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

  const handleDeleteLocalItem = async (item: ListItem) => {
    if (!user?.userId) return;

    const STORAGE_KEYS = getStorageKeys(user.userId);

    try {
      if (modalType === "category") {
        const updated = localCategories.filter(c => c.id !== item.id);
        setLocalCategories(updated);
        await AsyncStorage.setItem(STORAGE_KEYS.NEW_CATEGORIES, JSON.stringify(updated));
        setSelectedCategories(prev => prev.filter(id => id !== item.id));
        Alert.alert("Đã xóa", `Đã xóa danh mục "${item.name}"`);
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
        Alert.alert("Đã xóa", `Đã xóa nguyên liệu "${item.name}"`);
      } else if (modalType === "tag") {
        const updated = localTags.filter(t => t.id !== item.id);
        setLocalTags(updated);
        await AsyncStorage.setItem(STORAGE_KEYS.NEW_TAGS, JSON.stringify(updated));
        setSelectedTags(prev => prev.filter(id => id !== item.id));
        Alert.alert("Đã xóa", `Đã xóa tag "${item.name}"`);
      }
    } catch (err) {
      console.error("Error deleting local item:", err);
      Alert.alert("Lỗi", "Không thể xóa!");
    }
  };

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
          // If the ingredient exists on server, select it immediately (auto-select)
          Alert.alert("Đã tồn tại", `Nguyên liệu "${exists.name}" đã có và đã được chọn.`);
          setIngredientInputs(prev => ({
            ...prev,
            [exists.id]: { quantity: '', unit: '', selected: true }
          }));
          setSelectedIngredients(prev => {
            const existsEntry = prev.find(s => s.id === exists.id);
            if (existsEntry) return prev.map(s => s.id === exists.id ? { id: exists.id, quantity: existsEntry.quantity || '', unit: existsEntry.unit || '' } : s);
            return [...prev, { id: exists.id, quantity: '', unit: '' }];
          });
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

        // Auto-select the newly created local ingredient so user sees it in selection
        setIngredientInputs(prev => ({
          ...prev,
          [newItem.id]: { quantity: '', unit: '', selected: true }
        }));

        setSelectedIngredients(prev => [...prev, { id: newItem.id, quantity: '', unit: '' }]);

        Alert.alert("✅ Thành công", `Đã thêm nguyên liệu "${searchTerm}" và đã được chọn.`);
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

        const randomColor = `#${Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0')}`;
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

  const handleSave = async () => {
    if (!title.trim()) return Alert.alert("Lỗi", "Vui lòng nhập tiêu đề");
    if (!description || !description.trim()) return Alert.alert("Lỗi", "Vui lòng nhập mô tả");
    if (!user?.userId) return Alert.alert("Lỗi", "Bạn cần đăng nhập để cập nhật công thức");

    const validIngredients = selectedIngredients.filter(ingredient => {
      const ingredientExists = allIngredients.find((i: ListItem) => i.id === ingredient.id);
      return ingredientExists != null;
    });

    if (validIngredients.length === 0) {
      Alert.alert("Thiếu thông tin", "Vui lòng chọn ít nhất một nguyên liệu!");
      return;
    }

    try {
      setUpdating(true);

      const STORAGE_KEYS = getStorageKeys(user.userId);

      // Categories mới (chỉ local)
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
      const localToCreate = validIngredients
        .map(si => ({ si, item: localIngredients.find(i => i.id === si.id) }))
        .filter(x => x.item != null)
        .map(x => ({ localId: x.item!.id, name: x.item!.name, description: x.item!.description || '' }));

      const createdMap: Record<string, string> = {};

      if (localToCreate.length > 0) {
        for (const row of localToCreate) {
          try {
            const created = await IngredientService.createIngredient({
              name: row.name,
              description: row.description
            });
            createdMap[row.localId] = created.ingredientId || created.id;
          } catch (e) {
            console.error('Failed to create ingredient:', row.name, e);
            Alert.alert('Lỗi', `Không thể tạo nguyên liệu "${row.name}"`);
            setUpdating(false);
            return;
          }
        }
      }

      const finalIngredientDetails = validIngredients.map((ing: SelectedIngredient) => {
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

      const formData = new FormData();

      const recipeData = {
        title,
        description: description.trim(),
        difficulty: difficulty.toUpperCase(),
        steps: steps.map((step, index) => ({
          instruction: step.instruction ?? '',
          stepNumber: index + 1,
          imageUrl: step.image && typeof step.image === 'string' && step.image.startsWith('file://') ? null : step.image
        })).filter(step => step.instruction.trim() !== ''),
        categoryIds: existingCategoryIds,
        tagIds: existingTagIds,
        newCategories: newCategories.length > 0 ? newCategories : undefined,
        newTags: newTags.length > 0 ? newTags : undefined,
        ingredientDetails: finalIngredientDetails,
        featuredImage: featuredImage?.startsWith('file://') ? null : featuredImage,
        servings: servings ? parseInt(servings) : null,
        prepTime: prepTime ? parseInt(prepTime) : null,
        cookTime: cookTime ? parseInt(cookTime) : null,
        userId: user.userId
      };

      console.log('DEBUG recipeData payload:', JSON.stringify(recipeData, null, 2));

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
        // Xóa localStorage sau khi thành công
        await AsyncStorage.multiRemove([
          STORAGE_KEYS.NEW_CATEGORIES,
          STORAGE_KEYS.NEW_TAGS,
          STORAGE_KEYS.NEW_INGREDIENTS
        ]);

        // Clear in-memory local temp arrays and refresh metadata so UI shows server items
        try {
          setLocalCategories([]);
          setLocalTags([]);
          setLocalIngredients([]);
        } catch (e) {
          console.warn('Không thể xóa state temp items:', e);
        }

        console.log('🔄 Cập nhật dữ liệu metadata từ server...');
        await fetchMetaData();

        console.log('🔄 Đang tải lại công thức từ server...');
        await fetchRecipe();

        Alert.alert("Cập nhật thành công!", "", [
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
      Alert.alert("Lỗi khi cập nhật", err.message);
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
              if (originalData) {
                try {
                  setTitle(originalData.title || "");
                  setDescription(originalData.description || "");
                  setFeaturedImage(originalData.featuredImage || null);
                  setSteps(originalData.steps || [{ instruction: '', image: null, stepNumber: 1 }]);
                  setServings(originalData.servings || "");
                  setPrepTime(originalData.prepTime || "");
                  setCookTime(originalData.cookTime || "");
                  setDifficulty(originalData.difficulty || "MEDIUM");
                  setSelectedCategories(originalData.selectedCategories || []);
                  setSelectedIngredients(originalData.selectedIngredients || []);
                  setSelectedTags(originalData.selectedTags || []);
                  const inputs: Record<string, any> = {};
                  (originalData.selectedIngredients || []).forEach((it: any) => {
                    inputs[it.id] = { quantity: it.quantity || '', unit: it.unit || '', selected: true };
                  });
                  setIngredientInputs(inputs);
                  setHasChanges(false);
                } catch (e) {
                  console.error('Error restoring original data before exit:', e);
                }
              }
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
      modalType === "category" ? allCategories : modalType === "ingredient" ? allIngredients : allTags;

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
            <Text style={{ color: "white", fontWeight: "600" }}>✅ Tạo mới</Text>
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
                        <Text style={styles.addButtonText}>{inputs.selected ? 'Bỏ' : 'Chọn'}</Text>
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
              <MaterialIcons name="add-a-photo" size={40} color="#999" />
              <Text style={{ marginTop: 8, color: '#999' }}>Chọn ảnh món</Text>
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
              <MaterialCommunityIcons name="fire" size={24} color={level.color} />
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
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <MaterialIcons name="folder" size={20} color="#FF6B35" />
            <Text style={styles.label}>Danh mục đã chọn:</Text>
          </View>
          <View style={styles.selectedItems}>
            {selectedCategories.map((id: string, index: number) => {
              const category = allCategories.find((c: ListItem) => c.id === id);
              return category ? (
                <View key={`category-${id || index}`} style={styles.selectedItem}>
                  <Text style={styles.selectedItemText}>
                    {category.name}
                    {category.isLocal && " (mới)"}
                  </Text>
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
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <MaterialCommunityIcons name="food-variant" size={20} color="#FF6B35" />
              <Text style={styles.cardTitle}>Nguyên liệu</Text>
            </View>
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
                const ingredient = allIngredients.find((i: ListItem) => i.id === item.id);
                return ingredient ? (
                  <View key={`ingredient-${item.id || index}`} style={styles.ingredientRow}>
                    <Text style={styles.ingredientText}>
                      • {ingredient.name}
                      {ingredient.isLocal && " (mới)"}
                      {item.quantity && item.unit && ` - ${item.quantity} ${item.unit}`}
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
                      <MaterialIcons name="close" size={16} color="#dc3545" />
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
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <MaterialIcons name="local-offer" size={20} color="#4A90E2" />
            <Text style={styles.label}>Tag đã chọn:</Text>
          </View>
          <View style={styles.selectedItems}>
            {selectedTags.map((id: string, index: number) => {
              const tag = allTags.find((t: ListItem) => t.id === id);
              return tag ? (
                <View key={`tag-${id || index}`} style={[styles.selectedItem, { backgroundColor: tag.color || '#ccc' }]}>
                  <Text style={[styles.selectedItemText, { color: 'white' }]}>
                    {tag.name}
                    {tag.isLocal && " (mới)"}
                  </Text>
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
                <MaterialIcons name="close" size={20} color="#fff" />
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
                <View style={{ alignItems: 'center', justifyContent: 'center' }}>
                  <MaterialIcons name="add-photo-alternate" size={32} color="#999" />
                  <Text style={{ marginTop: 4, color: '#999', fontSize: 12 }}>Ảnh bước {index + 1}</Text>
                </View>
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
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <MaterialIcons name="save" size={20} color="#fff" />
              <Text style={styles.saveText}>Lưu thay đổi</Text>
            </View>
          )}
        </TouchableOpacity>
      </ScrollView>

      {renderModal()}
    </SafeAreaView>
  );
}