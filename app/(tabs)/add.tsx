import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigationState } from '@react-navigation/native';
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, Alert, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { MaterialIcons } from '@expo/vector-icons';
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "../../context/AuthContext";

// Components
import CategoryModal from "../../components/addrecipe/CategoryModal";
import IngredientModal from "../../components/addrecipe/IngredientModal";
import RecipeForm from "../../components/addrecipe/RecipeForm";
import RecipeSteps from "../../components/addrecipe/RecipeSteps";
import SelectionDisplay from "../../components/addrecipe/SelectionDisplay";
import TagModal from "../../components/addrecipe/TagModal";
import DraftListModal from "../../components/Recipe/DraftListModal";

// Services
import { CategoryService } from "../../services/categoryService";
import { IngredientService } from "../../services/ingredientService";
import { RecipeService } from "../../services/recipeService";
import { TagService } from "../../services/tagService";

// Utils
import { useAutosave } from "../../hooks/useAutosave";
import { RecipeDraft } from "../../types/recipe";
import { deleteDraft, getDraft, saveDraft } from "../../utils/draftManager";

// Types
interface Step { description: string; image: string | null; }
interface ListItem { id: string; name: string; description?: string; color?: string; isLocal?: boolean; }
interface SelectedIngredient { id: string; quantity: string; unit: string; }

const getStorageKeys = (userId: string) => ({
  NEW_CATEGORIES: `@recipe_new_categories_${userId}`,
  NEW_TAGS: `@recipe_new_tags_${userId}`,
  NEW_INGREDIENTS: `@recipe_new_ingredients_${userId}`
});

export default function AddRecipeScreen({ navigation }: any) {
  const { user } = useAuth();
  const router = useRouter();

  // Form states
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState<string | null>(null);
  const [prepTime, setPrepTime] = useState("");
  const [cookTime, setCookTime] = useState("");
  const [difficulty, setDifficulty] = useState("EASY");
  const [servings, setServings] = useState("");
  const [steps, setSteps] = useState<Step[]>([{ description: "", image: null }]);

  // Data states
  const [categories, setCategories] = useState<ListItem[]>([]);
  const [ingredients, setIngredients] = useState<ListItem[]>([]);
  const [tags, setTags] = useState<ListItem[]>([]);
  const [localCategories, setLocalCategories] = useState<ListItem[]>([]);
  const [localTags, setLocalTags] = useState<ListItem[]>([]);
  const [localIngredients, setLocalIngredients] = useState<ListItem[]>([]);

  // Selection states
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedIngredients, setSelectedIngredients] = useState<SelectedIngredient[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [ingredientInputs, setIngredientInputs] = useState<Record<string, any>>({});

  // UI states
  const [loading, setLoading] = useState(false);
  const [categoryModalVisible, setCategoryModalVisible] = useState(false);
  const [ingredientModalVisible, setIngredientModalVisible] = useState(false);
  const [tagModalVisible, setTagModalVisible] = useState(false);
  const [draftListVisible, setDraftListVisible] = useState(false);
  const [draftListReloadKey, setDraftListReloadKey] = useState(0);
  const [currentDraftId, setCurrentDraftId] = useState<string | null>(null);
  const [autosaveEnabled, setAutosaveEnabled] = useState(true);

  // Combined data
  const allCategories = [...localCategories, ...categories];
  const allTags = [...localTags, ...tags];
  const allIngredients = [...localIngredients, ...ingredients];

  // Draft object
  const createDraftObject = (): RecipeDraft => ({
    draftId: currentDraftId || '', userId: user?.userId || '',
    title, description, image, prepTime, cookTime, difficulty, servings, steps,
    selectedCategories, selectedIngredients, selectedTags, ingredientInputs,
    localCategories, localTags, localIngredients,
    lastModified: new Date().toISOString(), version: 1
  });

  const { lastSaved, isSaving } = useAutosave(createDraftObject(), 3000, autosaveEnabled);

  // Load initial data
  useEffect(() => {
    loadInitialData();
    loadDraftIfExists();
  }, []);

  const loadInitialData = async () => {
    try {
      const [cat, ing, tag] = await Promise.all([
        CategoryService.getAllCategories(),
        IngredientService.getAllIngredients(),
        TagService.getAllTags(),
      ]);

      setCategories(cat.map((c: any) => ({ id: c.categoryId, name: c.name, description: c.description, isLocal: false })));
      setIngredients(ing.map((i: any) => ({ id: i.ingredientId, name: i.name, description: i.description, isLocal: false })));
      setTags(tag.map((t: any) => ({ id: t.tagId, name: t.name, color: t.color, isLocal: false })));

      await loadLocalStorageData();
    } catch (e) {
      Alert.alert("Lỗi", "Không thể tải dữ liệu!");
    }
  };

  const loadLocalStorageData = async () => {
    if (!user?.userId) return;
    const KEYS = getStorageKeys(user.userId);

    try {
      const [catData, tagData, ingData] = await Promise.all([
        AsyncStorage.getItem(KEYS.NEW_CATEGORIES),
        AsyncStorage.getItem(KEYS.NEW_TAGS),
        AsyncStorage.getItem(KEYS.NEW_INGREDIENTS)
      ]);

      if (catData) setLocalCategories(JSON.parse(catData).map((i: any) => ({ ...i, isLocal: true })));
      if (tagData) setLocalTags(JSON.parse(tagData).map((i: any) => ({ ...i, isLocal: true })));
      if (ingData) setLocalIngredients(JSON.parse(ingData).map((i: any) => ({ ...i, isLocal: true })));
    } catch (err) {
      console.error("Error loading localStorage:", err);
    }
  };

  const loadDraftIfExists = async () => {
    try {
      const urlParams = new URLSearchParams(window.location?.search || '');
      const draftId = urlParams.get('draftId');
      if (draftId) {
        const draft = await getDraft(draftId);
        if (draft) {
          loadDraftData(draft);
          Alert.alert('✅ Đã tải bản nháp', `Tiếp tục: ${draft.title || 'Công thức'}`);
        }
      }
    } catch (error) {
      console.error('Error loading draft:', error);
    }
  };

  const loadDraftData = (draft: RecipeDraft) => {
    setCurrentDraftId(draft.draftId); setTitle(draft.title); setDescription(draft.description);
    setImage(draft.image); setPrepTime(draft.prepTime); setCookTime(draft.cookTime);
    setDifficulty(draft.difficulty); setServings(draft.servings); setSteps(draft.steps);
    setSelectedCategories(draft.selectedCategories); setSelectedIngredients(draft.selectedIngredients);
    setSelectedTags(draft.selectedTags); setIngredientInputs(draft.ingredientInputs);
    setLocalCategories(draft.localCategories); setLocalTags(draft.localTags);
    setLocalIngredients(draft.localIngredients);
  };

  const resetForm = () => {
    setTitle(""); setDescription(""); setImage(null); setPrepTime(""); setCookTime("");
    setDifficulty("EASY"); setServings(""); setSteps([{ description: "", image: null }]);
    setSelectedCategories([]); setSelectedIngredients([]); setSelectedTags([]);
    setIngredientInputs({}); setLocalCategories([]); setLocalTags([]); setLocalIngredients([]);
    setCurrentDraftId(null);
  };

  const handleSaveDraft = async () => {
    try {
      const savedId = await saveDraft(createDraftObject());
      setCurrentDraftId(savedId);
      Alert.alert('💾 Đã lưu', 'Bản nháp đã lưu!');
      setDraftListReloadKey(k => k + 1);
      resetForm();
    } catch {
      Alert.alert('❌ Lỗi', 'Không thể lưu nháp');
    }
  };

  // Image picker
  const pickImage = async (index?: number) => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        allowsEditing: true, quality: 0.8, mediaTypes: ImagePicker.MediaTypeOptions.Images,
        aspect: [4, 3], base64: false
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

  // Steps management
  const addStep = () => setSteps([...steps, { description: "", image: null }]);
  const removeStep = (i: number) => {
    if (steps.length <= 1) setSteps([{ description: "", image: null }]);
    else { const copy = [...steps]; copy.splice(i, 1); setSteps(copy); }
  };
  const updateStep = (i: number, text: string) => {
    const copy = [...steps]; copy[i].description = text; setSteps(copy);
  };

  // Category handlers
  const handleSelectCategory = (item: ListItem) => {
    setSelectedCategories(prev => prev.includes(item.id) ? prev.filter(id => id !== item.id) : [...prev, item.id]);
  };

  const handleCreateCategory = async (name: string, desc: string) => {
    if (!user?.userId) return;
    const exists = allCategories.find(c => c.name.toLowerCase().trim() === name.toLowerCase().trim());
    if (exists) {
      Alert.alert("Đã tồn tại", `"${exists.name}" đã có`);
      setSelectedCategories(prev => prev.includes(exists.id) ? prev : [...prev, exists.id]);
      return;
    }

    const newItem: ListItem = {
      id: `local_cat_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name, description: desc, isLocal: true
    };

    const updated = [...localCategories, newItem];
    setLocalCategories(updated);
    await AsyncStorage.setItem(getStorageKeys(user.userId).NEW_CATEGORIES, JSON.stringify(updated));
    setSelectedCategories(prev => [...prev, newItem.id]);
    Alert.alert("✅", `Đã thêm "${name}"`);
  };

  const handleDeleteCategory = async (item: ListItem) => {
    if (!user?.userId) return;
    const updated = localCategories.filter(c => c.id !== item.id);
    setLocalCategories(updated);
    await AsyncStorage.setItem(getStorageKeys(user.userId).NEW_CATEGORIES, JSON.stringify(updated));
    setSelectedCategories(prev => prev.filter(id => id !== item.id));
  };

  // Tag handlers
  const handleSelectTag = (item: ListItem) => {
    setSelectedTags(prev => prev.includes(item.id) ? prev.filter(id => id !== item.id) : [...prev, item.id]);
  };

  const handleCreateTag = async (name: string) => {
    if (!user?.userId) return;
    const exists = allTags.find(t => t.name.toLowerCase().trim() === name.toLowerCase().trim());
    if (exists) {
      Alert.alert("Đã tồn tại", `"${exists.name}" đã có`);
      setSelectedTags(prev => prev.includes(exists.id) ? prev : [...prev, exists.id]);
      return;
    }

    const color = `#${Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0')}`;
    const newItem: ListItem = {
      id: `local_tag_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name, color, isLocal: true
    };

    const updated = [...localTags, newItem];
    setLocalTags(updated);
    await AsyncStorage.setItem(getStorageKeys(user.userId).NEW_TAGS, JSON.stringify(updated));
    setSelectedTags(prev => [...prev, newItem.id]);
    Alert.alert("✅", `Đã thêm "${name}"`);
  };

  const handleDeleteTag = async (item: ListItem) => {
    if (!user?.userId) return;
    const updated = localTags.filter(t => t.id !== item.id);
    setLocalTags(updated);
    await AsyncStorage.setItem(getStorageKeys(user.userId).NEW_TAGS, JSON.stringify(updated));
    setSelectedTags(prev => prev.filter(id => id !== item.id));
  };

  // Ingredient handlers
  const handleSelectIngredient = (item: ListItem) => {
    setIngredientInputs(prev => {
      const cur = prev[item.id] || { quantity: '', unit: '', selected: false };
      const nextSelected = !cur.selected;
      const next = { ...prev, [item.id]: { ...cur, selected: nextSelected } };

      if (nextSelected) {
        setSelectedIngredients(siPrev => {
          const exists = siPrev.find(s => s.id === item.id);
          const entry = { id: item.id, quantity: cur.quantity, unit: cur.unit };
          return exists ? siPrev.map(s => s.id === item.id ? entry : s) : [...siPrev, entry];
        });
      } else {
        setSelectedIngredients(siPrev => siPrev.filter(s => s.id !== item.id));
      }

      return next;
    });
  };

  const handleIngredientInputChange = (id: string, field: 'quantity' | 'unit', value: string) => {
    setIngredientInputs(prev => {
      const cur = prev[id] || { quantity: '', unit: '', selected: false };
      const next = { ...cur, [field]: value };

      if (next.selected) {
        setSelectedIngredients(siPrev => {
          const entry = { id, quantity: next.quantity || '', unit: next.unit || '' };
          const exists = siPrev.find(s => s.id === id);
          return exists ? siPrev.map(s => s.id === id ? entry : s) : [...siPrev, entry];
        });
      }

      return { ...prev, [id]: next };
    });
  };

  const handleCreateIngredient = async (name: string, desc: string) => {
    if (!user?.userId) return;
    const exists = allIngredients.find(i => i.name.toLowerCase().trim() === name.toLowerCase().trim());
    if (exists) {
      Alert.alert("Đã tồn tại", `"${exists.name}" đã có`);
      setIngredientInputs(prev => ({ ...prev, [exists.id]: { quantity: '', unit: '', selected: false } }));
      return;
    }

    const newItem: ListItem = {
      id: `local_ing_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name, description: desc, isLocal: true
    };

    const updated = [...localIngredients, newItem];
    setLocalIngredients(updated);
    await AsyncStorage.setItem(getStorageKeys(user.userId).NEW_INGREDIENTS, JSON.stringify(updated));
    setIngredientInputs(prev => ({ ...prev, [newItem.id]: { quantity: '', unit: '', selected: false } }));
    Alert.alert("✅", `Đã thêm "${name}"`);
  };

  const handleDeleteIngredient = async (item: ListItem) => {
    if (!user?.userId) return;
    const updated = localIngredients.filter(i => i.id !== item.id);
    setLocalIngredients(updated);
    await AsyncStorage.setItem(getStorageKeys(user.userId).NEW_INGREDIENTS, JSON.stringify(updated));
    setSelectedIngredients(prev => prev.filter(si => si.id !== item.id));
    setIngredientInputs(prev => {
      const copy = { ...prev };
      delete copy[item.id];
      return copy;
    });
  };

  const handleRemoveSelectedIngredient = (id: string) => {
    setSelectedIngredients(prev => prev.filter(i => i.id !== id));
    setIngredientInputs(prev => {
      const updated = { ...prev };
      if (updated[id]) updated[id].selected = false;
      return updated;
    });
  };

  // Submit
  const handleSubmit = async () => {
    if (!title.trim() || !description.trim() || !prepTime.trim() || !cookTime.trim() || !servings.trim()) {
      Alert.alert("Thiếu thông tin", "Vui lòng điền đầy đủ!");
      return;
    }

    const validSteps = steps.filter(s => s.description.trim());
    if (validSteps.length === 0) {
      Alert.alert("Thiếu thông tin", "Vui lòng nhập ít nhất một bước!");
      return;
    }

    for (let i = 0; i < steps.length; i++) {
      if (steps[i].image && !steps[i].description.trim()) {
        Alert.alert("Thiếu thông tin", `Bước ${i + 1} có ảnh nhưng chưa có mô tả!`);
        return;
      }
    }

    if (!image || selectedIngredients.length === 0) {
      Alert.alert("Thiếu thông tin", "Vui lòng chọn ảnh và nguyên liệu!");
      return;
    }

    if (!user?.userId) return;

    try {
      setLoading(true);
      const KEYS = getStorageKeys(user.userId);

      // Prepare data
      const newCategories = selectedCategories
        .map(id => localCategories.find(c => c.id === id))
        .filter(c => c).map(c => ({ name: c!.name, description: c!.description || "" }));

      const existingCategoryIds = selectedCategories.filter(id => categories.find(c => c.id === id));

      const newTags = selectedTags
        .map(id => localTags.find(t => t.id === id))
        .filter(t => t).map(t => ({ name: t!.name, color: t!.color || '#666666' }));

      const existingTagIds = selectedTags.filter(id => tags.find(t => t.id === id));

      // Create ingredients
      const localToCreate = selectedIngredients
        .map(si => ({ si, item: localIngredients.find(i => i.id === si.id) }))
        .filter(x => x.item)
        .map(x => ({ localId: x.item!.id, name: x.item!.name, description: x.item!.description || '' }));

      const createdMap: Record<string, string> = {};
      for (const row of localToCreate) {
        try {
          const created = await IngredientService.createIngredient({ name: row.name, description: row.description });
          createdMap[row.localId] = created.ingredientId || created.id;
        } catch (e) {
          Alert.alert('Lỗi', `Không thể tạo "${row.name}"`);
          setLoading(false);
          return;
        }
      }

      const finalIngredients = selectedIngredients.map(ing => {
        const qty = parseFloat(ing.quantity) || 0;
        const localItem = localIngredients.find(i => i.id === ing.id);
        const finalId = localItem ? createdMap[localItem.id] : ing.id;
        return { ingredientId: finalId, quantity: qty, unit: ing.unit || '' };
      }).filter(d => d.ingredientId);

      const stepsData = validSteps.map((s, i) => ({
        instruction: s.description,
        stepNumber: i + 1,
        imageUrl: s.image ? `PLACEHOLDER_${i + 1}` : null
      }));

      const recipeData = {
        title, description,
        prepTime: parseInt(prepTime), cookTime: parseInt(cookTime),
        difficulty, servings: parseInt(servings),
        userId: user.userId, status: "PENDING",
        categoryIds: existingCategoryIds, tagIds: existingTagIds,
        newCategories: newCategories.length ? newCategories : undefined,
        newTags: newTags.length ? newTags : undefined,
        ingredientDetails: finalIngredients, steps: stepsData
      };

      const form = new FormData();
      form.append('data', JSON.stringify(recipeData));

      if (image) {
        const fileType = image.split('.').pop() || 'jpg';
        form.append('image', { uri: image, name: `photo.${fileType}`, type: `image/${fileType}` } as any);
      }

      validSteps.forEach((s, i) => {
        if (s.image) {
          const fileType = s.image.split('.').pop() || 'jpg';
          form.append('stepImages', { uri: s.image, name: `step_${i + 1}.${fileType}`, type: `image/${fileType}` } as any);
        }
      });

      await RecipeService.createRecipe(form as any);

      if (currentDraftId) await deleteDraft(currentDraftId);
      await AsyncStorage.multiRemove([KEYS.NEW_CATEGORIES, KEYS.NEW_TAGS, KEYS.NEW_INGREDIENTS]);
      resetForm();

      Alert.alert("Thành công", "Công thức đã tạo và chờ duyệt!", [
        { text: "Tạo mới", style: "default" },
        { text: "Xem trang", onPress: () => router.push({ pathname: "/(tabs)/profile", params: { reload: Date.now().toString() } }) },
        { text: "Đóng", style: "cancel" }
      ]);
    } catch (err: any) {
      Alert.alert("Lỗi", err.message || "Không thể tạo công thức!");
    } finally {
      setLoading(false);
    }
  };

  // Tab change warning
  const navigationState = useNavigationState(state => state);
  const prevTabIndex = React.useRef(navigationState.index);
  const [skipNextTabWarning, setSkipNextTabWarning] = useState(false);

  useEffect(() => {
    if (navigationState.index !== prevTabIndex.current) {
      if (skipNextTabWarning) {
        setSkipNextTabWarning(false);
        prevTabIndex.current = navigationState.index;
        return;
      }
      const hasContent = !!(title.trim() || description.trim() || image || prepTime.trim() ||
        cookTime.trim() || servings.trim() || steps.some(s => s.description.trim() || s.image) ||
        selectedCategories.length || selectedIngredients.length || selectedTags.length);

      if (hasContent) {
        setTimeout(() => {
          Alert.alert('Lưu nháp?', 'Bạn muốn lưu nháp trước khi rời?', [
            { text: 'Tiếp tục', style: 'cancel', onPress: () => { setSkipNextTabWarning(true); router.replace('/(tabs)/add'); } },
            { text: 'Lưu', onPress: handleSaveDraft },
            { text: 'Không', style: 'destructive', onPress: resetForm }
          ]);
        }, 10);
      }
      prevTabIndex.current = navigationState.index;
    }
  }, [navigationState.index, skipNextTabWarning]);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "white" }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 8, paddingTop: 12, paddingBottom: 8 }}>
        <Text style={{ fontWeight: 'bold', fontSize: 20, color: '#ff6600' }}>Thêm công thức</Text>
        <TouchableOpacity onPress={() => setDraftListVisible(true)} style={{ paddingHorizontal: 16, paddingVertical: 6, backgroundColor: '#f0f0f0', borderRadius: 6 }}>
          <Text style={{ fontWeight: '600', color: '#333' }}>Bản nháp</Text>
        </TouchableOpacity>
      </View>

      <DraftListModal visible={draftListVisible} userId={user?.userId || ''} reloadKey={draftListReloadKey} onClose={() => setDraftListVisible(false)} onLoadDraft={loadDraftData} />

      <ScrollView contentContainerStyle={{ padding: 16 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 12, backgroundColor: '#f0f0f0', borderRadius: 8, marginBottom: 16 }}>
          <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            {isSaving && <><MaterialIcons name="save" size={18} color="#666" /><Text style={{ fontSize: 14, color: '#666' }}>Đang lưu...</Text></>}
            {lastSaved && !isSaving && <><MaterialIcons name="check-circle" size={18} color="#28a745" /><Text style={{ fontSize: 14, color: '#28a745' }}>Lưu lúc {lastSaved.toLocaleTimeString('vi-VN')}</Text></>}
            {!lastSaved && !isSaving && <><MaterialIcons name="info" size={18} color="#999" /><Text style={{ fontSize: 14, color: '#999' }}>Chưa lưu</Text></>}
          </View>
          <TouchableOpacity onPress={() => setAutosaveEnabled(!autosaveEnabled)} style={{ paddingHorizontal: 12, paddingVertical: 6, backgroundColor: 'white', borderRadius: 6, borderWidth: 1, borderColor: '#ddd', flexDirection: 'row', alignItems: 'center', gap: 4 }}>
            <MaterialIcons name={autosaveEnabled ? 'check-circle' : 'cancel'} size={16} color={autosaveEnabled ? '#28a745' : '#dc3545'} />
            <Text style={{ fontSize: 12, fontWeight: '600' }}>Tự động lưu</Text>
          </TouchableOpacity>
        </View>

        <RecipeForm
          title={title} description={description} prepTime={prepTime} cookTime={cookTime}
          difficulty={difficulty} servings={servings} image={image}
          onTitleChange={setTitle} onDescriptionChange={setDescription}
          onPrepTimeChange={setPrepTime} onCookTimeChange={setCookTime}
          onDifficultyChange={setDifficulty} onServingsChange={setServings}
          onImagePick={() => pickImage()}
        />

        {/* Thứ tự mới: Category → Tag → Ingredient → Steps */}
        <SelectionDisplay type="category" items={allCategories} selectedIds={selectedCategories} onOpen={() => setCategoryModalVisible(true)} />
        <SelectionDisplay type="tag" items={allTags} selectedIds={selectedTags} onOpen={() => setTagModalVisible(true)} />
        <SelectionDisplay type="ingredient" items={allIngredients} selectedIngredients={selectedIngredients} onOpen={() => setIngredientModalVisible(true)} onRemoveIngredient={handleRemoveSelectedIngredient} />

        {/* Các bước thực hiện - render cuối cùng */}
        <RecipeSteps
          steps={steps}
          onStepChange={updateStep}
          onStepImagePick={pickImage}
          onAddStep={addStep}
          onRemoveStep={removeStep}
        />

        <View style={{ flexDirection: 'row', gap: 12, marginTop: 20 }}>
          <TouchableOpacity onPress={handleSaveDraft} style={{ flex: 1, backgroundColor: '#6c757d', paddingVertical: 16, borderRadius: 8, alignItems: 'center', flexDirection: 'row', justifyContent: 'center', gap: 6 }}>
            <MaterialIcons name="save" size={20} color="white" />
            <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 16 }}>Lưu nháp</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={handleSubmit} disabled={loading} style={{ flex: 1, backgroundColor: '#ff6600', paddingVertical: 16, borderRadius: 8, alignItems: 'center', flexDirection: 'row', justifyContent: 'center', gap: 6, opacity: loading ? 0.6 : 1 }}>
            {loading ? <ActivityIndicator color="white" /> : <><MaterialIcons name="send" size={20} color="white" /><Text style={{ color: 'white', fontWeight: 'bold', fontSize: 16 }}>Đăng</Text></>}
          </TouchableOpacity>
        </View>
      </ScrollView>

      <CategoryModal visible={categoryModalVisible} categories={allCategories} selectedIds={selectedCategories} onClose={() => setCategoryModalVisible(false)} onSelect={handleSelectCategory} onCreate={handleCreateCategory} onDelete={handleDeleteCategory} />
      <IngredientModal visible={ingredientModalVisible} ingredients={allIngredients} ingredientInputs={ingredientInputs} onClose={() => setIngredientModalVisible(false)} onSelect={handleSelectIngredient} onInputChange={handleIngredientInputChange} onCreate={handleCreateIngredient} onDelete={handleDeleteIngredient} />
      <TagModal visible={tagModalVisible} tags={allTags} selectedIds={selectedTags} onClose={() => setTagModalVisible(false)} onSelect={handleSelectTag} onCreate={handleCreateTag} onDelete={handleDeleteTag} />
    </SafeAreaView>
  );
}