import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, Alert, FlatList, Image, Modal, ScrollView, Text, TextInput, TouchableOpacity, View, } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "../../context/AuthContext";

import { CategoryService } from "../../services/categoryService";
import { IngredientService } from "../../services/ingredientService";
import { RecipeService } from "../../services/recipeService";
import { TagService } from "../../services/tagService";
import { defaultPlaceholderColor, styles } from "../../styles/RecipeStyle";

interface Step {
  description: string;  // Frontend state
  image: string | null;  // Frontend state
  stepNumber?: number;
  instruction?: string;  // Backend field
}

interface ListItem {
  id: string;
  name: string;
  description?: string;
  color?: string;
}

interface SelectedIngredient {
  id: string;
  quantity: number;
  unit: string;
}

interface IngredientWithDetails extends ListItem {
  quantity: number;
  unit: string;
}

interface CategoryResponse {
  categoryId: string;
  name: string;
  description: string;
  iconUrl: string | null;
  isActive: boolean;
  parentId: string | null;
  slug: string;
  createdAt: string;
}

interface IngredientResponse {
  ingredientId: string;
  name: string;
  description: string | null;
  category: string | null;
  unit: string | null;
  quantity: number | null;
  notes: string | null;
  orderIndex: number | null;
  slug: string;
  createdAt: string;
}

interface TagResponse {
  tagId: string;
  name: string;
  color: string;
  isTrending: boolean;
  usageCount: number;
  slug: string;
  createdAt: string;
}

export default function AddRecipeScreen({ navigation }: any) {
  const { user } = useAuth();
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState<string | null>(null);
  const [prepTime, setPrepTime] = useState("");
  const [cookTime, setCookTime] = useState("");
  const [difficulty, setDifficulty] = useState("EASY");

  const difficultyOptions = [
    { value: "EASY", label: "Dễ" },
    { value: "MEDIUM", label: "Trung bình" },
    { value: "HARD", label: "Khó" }
  ];
  const [servings, setServings] = useState("");
  const [steps, setSteps] = useState<Step[]>([{ description: "", image: null }]);

  const [categories, setCategories] = useState<ListItem[]>([]);
  const [ingredients, setIngredients] = useState<ListItem[]>([]);
  const [tags, setTags] = useState<ListItem[]>([]);

  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedIngredients, setSelectedIngredients] = useState<SelectedIngredient[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  
  const [tempIngredient, setTempIngredient] = useState<SelectedIngredient>({
    id: '',
    quantity: 0,
    unit: ''
  });
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalType, setModalType] = useState<"category" | "ingredient" | "tag" | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [extraField, setExtraField] = useState(""); // cho description hoặc color

  useEffect(() => {
    (async () => {
      try {
        const [cat, ing, tag] = await Promise.all([
          CategoryService.getAllCategories(),
          IngredientService.getAllIngredients(),
          TagService.getAllTags(),
        ]);
        
        // Map dữ liệu từ API để khớp với interface ListItem
        const mappedCategories = ((cat as CategoryResponse[]) || []).map((c) => ({
          id: c.categoryId,
          name: c.name,
          description: c.description,
        }));

        const mappedIngredients = ((ing as IngredientResponse[]) || []).map((i) => ({
          id: i.ingredientId,
          name: i.name,
          description: i.description || undefined,
        }));

        const mappedTags = ((tag as TagResponse[]) || []).map((t) => ({
          id: t.tagId,
          name: t.name,
          color: t.color,
        }));

        setCategories(mappedCategories);
        setIngredients(mappedIngredients);
        setTags(mappedTags);
      } catch (e) {
        Alert.alert("Lỗi", "Không thể tải dữ liệu ban đầu!");
      }
    })();
  }, []);

  const pickImage = async (index?: number) => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        allowsEditing: true,
        quality: 0.8,
        mediaTypes: ImagePicker.MediaTypeOptions.Images
      });
      if (result.canceled) return;
      const uri = result.assets?.[0]?.uri;
      if (!uri) return;

      if (index !== undefined) {
        const updated: Step[] = [...steps];
        updated[index].image = uri;
        setSteps(updated);
      } else {
        setImage(uri);
      }
    } catch {
      Alert.alert("Lỗi", "Không thể chọn ảnh!");
    }
  };

  const addStep = () => setSteps([...steps, { description: "", image: null }]);

  const removeStep = (index: number) => {
    setSteps((prev) => {
      if (prev.length <= 1) {
        // keep one empty step (clear it) to avoid empty list
        return [{ description: "", image: null }];
      }
      const copy = [...prev];
      copy.splice(index, 1);
      return copy;
    });
  };

  const openModal = (type: "category" | "ingredient" | "tag") => {
    setModalType(type);
    setSearchTerm("");
    setExtraField("");
    setModalVisible(true);
  };

  const handleSelectItem = (item: ListItem) => {
    if (!item?.id) {
      console.log('Invalid item:', item);
      return;
    }

    switch (modalType) {
      case "category":
        // Chỉ cho phép chọn 1 danh mục
        console.log('Selecting category:', item.id);
        setSelectedCategories(prev => (prev[0] === item.id ? [] : [item.id]));
        // close modal after single selection
        setModalVisible(false);
        break;

      case "ingredient":
        // Show modal for quantity and unit input with better validation
        Alert.prompt(
          "Thêm số lượng và đơn vị",
          "Nhập số lượng:",
          [
            {
              text: "Hủy",
              style: "cancel"
            },
            {
              text: "Tiếp",
              onPress: (quantityText: string | undefined) => {
                if (quantityText && !isNaN(Number(quantityText))) {
                  const quantity = Number(quantityText);
                  // After getting quantity, prompt for unit
                  Alert.prompt(
                    "Đơn vị",
                    "Nhập đơn vị (VD: g, ml, muỗng):",
                    [
                      {
                        text: "Hủy",
                        style: "cancel"
                      },
                      {
                        text: "Thêm",
                        onPress: (unit: string | undefined) => {
                          if (unit && unit.trim()) {
                            setSelectedIngredients(prev => [
                              ...prev.filter(i => i.id !== item.id),
                              {
                                id: item.id,
                                quantity: quantity,
                                unit: unit.trim()
                              }
                            ]);
                            setModalVisible(false); // Close the ingredient selection modal
                          } else {
                            Alert.alert("Lỗi", "Vui lòng nhập đơn vị");
                          }
                        }
                      }
                    ],
                    'plain-text'
                  );
                } else {
                  Alert.alert("Lỗi", "Vui lòng nhập số lượng hợp lệ");
                }
              }
            }
          ],
          'plain-text',
          '',
          'numeric'
        );
        break;

      case "tag":
        // Chỉ cho phép chọn 1 tag
        console.log('Selecting tag:', item.id);
        setSelectedTags(prev => (prev[0] === item.id ? [] : [item.id]));
        // close modal after single selection
        setModalVisible(false);
        break;

      default:
        console.log('Invalid modal type:', modalType);
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
          setCategories(prev => [...prev, newCategory]);
          setSelectedCategories([newCategory.id]);
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
          setIngredients(prev => [...prev, newIngredient]);
          // Hiển thị modal để nhập số lượng và đơn vị cho nguyên liệu mới
          Alert.prompt(
            "Thêm số lượng",
            "Nhập số lượng và đơn vị (VD: 100 gram)",
            [
              {
                text: "Hủy",
                style: "cancel"
              },
              {
                text: "OK",
                onPress: (text: string | undefined) => {
                  if (text) {
                    const [quantity, unit] = text.split(' ');
                    if (!isNaN(Number(quantity)) && unit) {
                      setSelectedIngredients(prev => [
                        ...prev,
                        {
                          id: newIngredient.id,
                          quantity: Number(quantity),
                          unit: unit
                        }
                      ]);
                    } else {
                      Alert.alert("Lỗi", "Vui lòng nhập đúng định dạng: số lượng đơn vị");
                    }
                  }
                }
              }
            ],
            'plain-text'
          );
          created = true;
        }
      } 
      else if (modalType === "tag") {
        const tagRes = await TagService.createTag({ name: searchTerm, color: extraField || "#ccc" });
        if (tagRes && tagRes.tagId) {
          const newTag: ListItem = {
            id: tagRes.tagId,
            name: tagRes.name,
            color: tagRes.color
          };
          setTags(prev => [...prev, newTag]);
          setSelectedTags([newTag.id]);
          created = true;
        }
      }

      if (created) {
        Alert.alert("✅ Thành công", `Đã thêm mới ${searchTerm}`);
        setSearchTerm("");
        setExtraField("");
        // Close modal so user sees the selection applied immediately
        setModalVisible(false);
      }
    } catch (err: any) {
      Alert.alert("Lỗi", err.message || "Không thể tạo mới!");
    }
  };

  const handleSubmit = async () => {
    // Validate all required fields
    if (!title.trim()) {
      Alert.alert("Thiếu thông tin", "Vui lòng nhập tên món!");
      return;
    }
    if (!description.trim()) {
      Alert.alert("Thiếu thông tin", "Vui lòng nhập mô tả món!");
      return;
    }
    if (!prepTime.trim()) {
      Alert.alert("Thiếu thông tin", "Vui lòng nhập thời gian chuẩn bị!");
      return;
    }
    if (!cookTime.trim()) {
      Alert.alert("Thiếu thông tin", "Vui lòng nhập thời gian nấu!");
      return;
    }
    if (!servings.trim()) {
      Alert.alert("Thiếu thông tin", "Vui lòng nhập số khẩu phần!");
      return;
    }
    if (!steps[0].description.trim()) {
      Alert.alert("Thiếu thông tin", "Vui lòng nhập ít nhất một bước thực hiện!");
      return;
    }
    if (!image) {
      Alert.alert("Thiếu thông tin", "Vui lòng chọn ảnh cho món ăn!");
      return;
    }

    // Validate categories
    const validCategories = selectedCategories.filter(id => {
      const category = categories.find(c => c.id === id);
      return category != null;
    });
    if (validCategories.length === 0) {
      Alert.alert("Thiếu thông tin", "Vui lòng chọn ít nhất một danh mục hợp lệ!");
      return;
    }

    // Validate ingredients
      const validIngredients = selectedIngredients.filter(ingredient => {
              const ingredientExists = ingredients.find((i: ListItem) => i.id === ingredient.id);
              return ingredientExists != null;
            });
            if (validIngredients.length === 0) {
              Alert.alert("Thiếu thông tin", "Vui lòng chọn ít nhất một nguyên liệu hợp lệ!");
              return;
            }    // Validate tags (optional)
    const validTags = selectedTags.filter(id => {
      const tag = tags.find(t => t.id === id);
      return tag != null;
    });

    try {
      setLoading(true);
      const formData = new FormData();

      // Kiểm tra user đã đăng nhập
      if (!user?.userId) {
        Alert.alert("Lỗi", "Bạn cần đăng nhập lại!");
        return;
      }

      const recipeData = {
        title,
        description,
        prepTime: parseInt(prepTime),
        cookTime: parseInt(cookTime),
        difficulty,
        servings: parseInt(servings),
        categoryIds: validCategories,
        // Send ingredients as an array of IDs (UUID strings) so the backend can
        // deserialize to List<UUID>. Quantities/units are sent separately below
        // in `ingredientDetails`.
        ingredients: validIngredients.map((ing: SelectedIngredient) => ing.id),
        tagIds: validTags,
        userId: user.userId,
        status: "PENDING", // Thêm trạng thái PENDING cho công thức mới
        ingredientDetails: validIngredients.map((ing: SelectedIngredient) => ({
          id: ing.id,
          quantity: ing.quantity,
          unit: ing.unit
        })),
        recipeIngredients: validIngredients.map((ing: SelectedIngredient) => ({
          ingredientId: ing.id,
          quantity: ing.quantity,
          unit: ing.unit
        })),
        steps: steps.map((step, index) => ({
          instruction: step.description,
          stepNumber: index + 1
        }))
      };
      
      // Append data dưới dạng string
      formData.append('data', JSON.stringify(recipeData));

      // Append main recipe image
      if (image) {
        const filename = image.split("/").pop()!;
        const ext = filename.split(".").pop()!.toLowerCase();
        formData.append("image", {
          uri: image,
          type: `image/${ext}`,
          name: `recipe.${ext}`
        } as any);
      }

      // Append step images
      steps.forEach((step: Step, i: number) => {
        if (step.image) {
          const filename = step.image.split("/").pop()!;
          const ext = filename.split(".").pop()!.toLowerCase();
          formData.append("stepImages", {
            uri: step.image,
            type: `image/${ext}`,
            name: `step_${i}.${ext}`
          } as any);
        }
      });

      await RecipeService.createRecipe(formData);
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

      // Show success message
      Alert.alert(
        "🎉 Đã gửi công thức",
        "Công thức của bạn đã được gửi thành công và đang chờ phê duyệt (PENDING). Bạn có thể tạo thêm công thức mới hoặc xem trang cá nhân để kiểm tra trạng thái.",
        [
          {
            text: "Tạo công thức mới",
            onPress: () => {
              // Form đã được reset ở trên
            },
            style: "default"
          },
          {
            text: "Xem trang của tôi",
            onPress: () => {
              try {
                if (router && typeof router.push === 'function' && user?.userId) {
                  router.push({
                    pathname: '/profile/[userId]',
                    params: { userId: user.userId }
                  });
                }
              } catch (e) {
                console.error("Error navigating to profile:", e);
              }
            },
          },
          { text: "Đóng", style: "cancel" },
        ]
      );
    } catch (err: any) {
      Alert.alert("Lỗi", err.message || "Không thể tạo công thức!");
    } finally {
      setLoading(false);
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

          {modalType === "tag" && (
            <TextInput
              placeholder="Màu sắc (vd: #ff0000)"
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
            renderItem={({ item }) => (
              <TouchableOpacity
                onPress={() => handleSelectItem(item)}
                style={[
                  styles.listItem,
                  {
                    backgroundColor: (() => {
                      switch (modalType) {
                        case "category":
                          return selectedCategories.includes(item.id) ? "#cce5ff" : "white";
                        case "ingredient":
                          return selectedIngredients.some((ing: SelectedIngredient) => ing.id === item.id) ? "#cce5ff" : "white";
                        case "tag":
                          return selectedTags.includes(item.id) ? "#cce5ff" : "white";
                        default:
                          return "white";
                      }
                    })(),
                  },
                ]}
              >
                <Text style={{ fontWeight: "600" }}>{item.name}</Text>
                {modalType === "category" && !!item.description && (
                  <Text style={{ fontSize: 12, color: "#555" }}>{item.description}</Text>
                )}
                {modalType === "tag" && !!item.color && (
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
            )}
          />

          <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.closeBtn}>
            <Text style={{ color: "white", fontWeight: "700" }}>Xong</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    );
  };

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
            style={[styles.input, { flex: 1, marginRight: 6 }]}
          />
          <TextInput
            placeholder="Nấu (phút)"
            placeholderTextColor={defaultPlaceholderColor}
            value={cookTime}
            onChangeText={setCookTime}
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
            style={[styles.input, { flex: 1, marginLeft: 6 }]}
          />
        </View>

        <TouchableOpacity onPress={() => openModal("category")} style={styles.selectBtn}>
          <Text>Danh mục đã chọn:</Text>
          <View style={styles.selectedItems}>
            {selectedCategories.map((id: string, index: number) => {
              const category = categories.find((c: ListItem) => c.id === id);
              return category ? (
                <View key={`category-${id || index}`} style={styles.selectedItem}>
                  <Text style={styles.selectedItemText}>{category.name}</Text>
                </View>
              ) : null;
            })}
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
          <Text>Tag đã chọn:</Text>
          <View style={styles.selectedItems}>
            {selectedTags.map((id: string, index: number) => {
              const tag = tags.find((t: ListItem) => t.id === id);
              return tag ? (
                <View key={`tag-${id || index}`} style={[styles.selectedItem, { backgroundColor: tag.color || '#ccc' }]}>
                  <Text style={styles.selectedItemText}>{tag.name}</Text>
                </View>
              ) : null;
            })}
          </View>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => pickImage()} style={styles.imagePicker}>
          {image ? (
            <Image source={{ uri: image }} style={{ width: "100%", height: "100%", borderRadius: 10 }} />
          ) : (
            <Text>📸 Chọn ảnh món</Text>
          )}
        </TouchableOpacity>

        <Text style={styles.stepTitle}>Các bước</Text>
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
                <Image source={{ uri: s.image }} style={{ width: "100%", height: "100%", borderRadius: 10 }} />
              ) : (
                <Text>🖼 Ảnh bước</Text>
              )}
            </TouchableOpacity>
          </View>
        ))}
        <TouchableOpacity onPress={addStep} style={styles.addBtn}>
          <Text style={{ color: "white", fontWeight: "600" }}>+ Thêm bước</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={handleSubmit}
          disabled={loading}
          style={[styles.submitBtn, { opacity: loading ? 0.6 : 1 }]}
        >
          {loading ? <ActivityIndicator color="white" /> : <Text style={{ color: "white", fontWeight: "700" }}>✅ Tạo công thức</Text>}
        </TouchableOpacity>
      </ScrollView>

      {renderModal()}
    </SafeAreaView>
  );
}

