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
    Image,
    Modal,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

interface IngredientDetail {
  ingredientId: string;
  quantity: number;
  unit: string;
}

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
  modalContainer: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    padding: 20,
  },
  modalContent: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 20,
    maxHeight: "80%",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 15,
    textAlign: "center",
  },
  ingredientSelector: {
    maxHeight: 150,
    marginBottom: 15,
  },
  ingredientOption: {
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
  },
  modalButton: {
    flex: 1,
    marginHorizontal: 5,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  cancelButton: {
    backgroundColor: "#eee",
  },
  modalButtonText: {
    fontSize: 16,
    fontWeight: "600",
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
  const [categoryIds, setCategoryIds] = useState<string[]>([]);
  const [tagIds, setTagIds] = useState<string[]>([]);
  const [ingredientDetails, setIngredientDetails] = useState<IngredientDetail[]>([]);
  const [selectedIngredient, setSelectedIngredient] = useState<string | null>(null);
  const [quantity, setQuantity] = useState("");
  const [unit, setUnit] = useState("");
  const [showIngredientModal, setShowIngredientModal] = useState(false);
  const [servings, setServings] = useState("");
  const [prepTime, setPrepTime] = useState("");
  const [cookTime, setCookTime] = useState("");

  const [categories, setCategories] = useState<any[]>([]);
  const [ingredients, setIngredients] = useState<any[]>([]);
  const [tags, setTags] = useState<any[]>([]);

  useEffect(() => {
    fetchRecipe();
    fetchMetaData();
  }, [recipeId]);

  const fetchRecipe = async () => {
    try {
      const data = await RecipeService.getRecipeById(recipeId!);
      setTitle(data.title);
      setDescription(data.description);
      setFeaturedImage(data.featuredImage);
      // Normalize steps: backend returns objects with 'instruction' and 'imageUrl'
      setSteps((data.steps || []).map((s: any) => ({
        instruction: s.instruction ?? s.description ?? '',
        image: s.imageUrl ?? s.image ?? null,
        stepNumber: s.stepNumber ?? null,
      })));
      setCategoryIds(data.categories.map((c: any) => c.categoryId));
      setIngredientDetails(
        data.ingredients.map((i: any) => ({
          ingredientId: i.ingredientId,
          quantity: i.quantity || 0,
          unit: i.unit || '',
        }))
      );
      setTagIds(data.tags.map((t: any) => t.tagId));
      setServings(data.servings ? String(data.servings) : "");
      setPrepTime(data.prepTime ? String(data.prepTime) : "");
      setCookTime(data.cookTime ? String(data.cookTime) : "");
    } catch (err: any) {
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
      setCategories(catRes || []);
      setIngredients(ingRes || []);
      setTags(tagRes || []);
    } catch (err) {
      console.error("Error loading metadata:", err);
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
      console.error('Error picking step image', err);
      Alert.alert('Lỗi', 'Không thể chọn ảnh bước');
    }
  };

  const addStepLocal = () => {
    setSteps(prev => [...prev, { instruction: '', image: null, stepNumber: prev.length + 1 }]);
  };

  const removeStepLocal = (idx: number) => {
    setSteps(prev => {
      const copy = [...prev];
      copy.splice(idx, 1);
      // Re-number steps
      return copy.map((s, i) => ({ ...s, stepNumber: i + 1 }));
    });
  };

  const handleSave = async () => {
    if (!title.trim()) return Alert.alert("Vui lòng nhập tiêu đề");
    if (!description || !description.trim()) return Alert.alert("Vui lòng nhập mô tả (không được để trống)");
    if (!user?.userId) return Alert.alert("Bạn cần đăng nhập để cập nhật công thức");

    try {
      setUpdating(true);

      // Tạo FormData với toàn bộ thông tin công thức
      const formData = new FormData();
      
      // Thêm ảnh nếu có
      if (featuredImage?.startsWith('file://')) {
        formData.append('image', {
          uri: featuredImage,
          type: 'image/jpeg',
          name: 'recipe_image.jpg'
        } as any);
      }

      // Chuẩn bị dữ liệu theo đúng format API mong đợi
      const recipeData = {
        title,
        description: description.trim(),
        steps: steps.map((step, index) => ({
          instruction: step.instruction ?? '',
          stepNumber: index + 1,
          imageUrl: step.image && typeof step.image === 'string' && step.image.startsWith('file://') ? null : step.image
        })).filter(step => step.instruction.trim() !== ''),
        categoryIds: categoryIds.filter(Boolean), // Lọc bỏ giá trị null/undefined
        ingredientDetails: ingredientDetails
          .filter(i => i.ingredientId && i.quantity > 0) // Chỉ gửi các nguyên liệu hợp lệ
          .map(i => ({
            ingredientId: i.ingredientId,
            quantity: parseFloat(String(i.quantity)),
            unit: i.unit
          })),
        tagIds: tagIds.filter(Boolean), // Lọc bỏ giá trị null/undefined
        featuredImage: featuredImage?.startsWith('file://') ? null : featuredImage,
        servings: servings ? parseInt(servings) : null,
        prepTime: prepTime ? parseInt(prepTime) : null,
        cookTime: cookTime ? parseInt(cookTime) : null,
        userId: user.userId
      };

      // Append recipe data
      formData.append('data', JSON.stringify(recipeData));

      // Append main image if it's a new local file
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

      // Append step images for any new local files
      const stepImages: any[] = [];
      steps.forEach((step, index) => {
        if (typeof step.image === 'string' && step.image.startsWith('file://')) {
          const filename = step.image.split("/").pop()!;
          const ext = filename.split(".").pop()!.toLowerCase();
          stepImages.push({
            uri: step.image,
            type: `image/${ext}`,
            name: `step-${index + 1}.${ext}`,
          });
        }
      });
      
      if (stepImages.length > 0) {
        stepImages.forEach((img) => {
          formData.append("stepImages", img);
        });
      }

      const response = await RecipeService.updateRecipe(recipeId!, formData);
      
      // Cập nhật lại state với dữ liệu mới từ server
      if (response) {
        setTitle(response.title);
        setDescription(response.description);
        setFeaturedImage(response.featuredImage);  // Lấy URL ảnh từ server
        // Normalize steps from response
        setSteps((response.steps || []).map((s: any) => ({
          instruction: s.instruction ?? s.description ?? '',
          image: s.imageUrl ?? s.image ?? null,
          stepNumber: s.stepNumber ?? null,
        })));
        setCategoryIds(response.categories.map((c: any) => c.categoryId));
        setIngredientDetails(
          response.ingredients.map((i: any) => ({
            ingredientId: i.ingredientId,
            quantity: i.quantity || 0,
            unit: i.unit || '',
          }))
        );
        setTagIds(response.tags.map((t: any) => t.tagId));
        setServings(response.servings ? String(response.servings) : "");
        setPrepTime(response.prepTime ? String(response.prepTime) : "");
        setCookTime(response.cookTime ? String(response.cookTime) : "");
      }

      Alert.alert("✅ Cập nhật thành công!", "", [
        {
          text: "OK",
          onPress: () => {
            // Navigate về profile với param reload=true để trigger reload data
            router.replace({
              pathname: '/(tabs)/profile' as any,
              params: { reload: 'true' }
            });
          }
        }
      ]);
    } catch (err: any) {
      Alert.alert("❌ Lỗi khi cập nhật", err.message);
    } finally {
      setUpdating(false);
    }
  };

  const addIngredientDetail = () => {
    if (!selectedIngredient || !quantity || !unit) {
      Alert.alert("Vui lòng nhập đầy đủ thông tin nguyên liệu");
      return;
    }

    setIngredientDetails(prev => [
      ...prev,
      {
        ingredientId: selectedIngredient,
        quantity: parseFloat(quantity),
        unit
      }
    ]);

    setSelectedIngredient(null);
    setQuantity("");
    setUnit("");
    setShowIngredientModal(false);
  };

  const removeIngredientDetail = (ingredientId: string) => {
    setIngredientDetails(prev => 
      prev.filter(item => item.ingredientId !== ingredientId)
    );
  };

  const toggleSelect = (list: string[], id: string, setList: Function) => {
    if (list.includes(id)) {
      setList(list.filter((x) => x !== id));
    } else {
      setList([...list, id]);
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#FF385C" />
      </View>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => router.back()}
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
              Alert.alert("Không tải được ảnh", "Đường dẫn ảnh không hợp lệ hoặc server không phản hồi.");
            }}
          />
        ) : (
          <View style={styles.imagePlaceholder}>
            <Text>Chọn ảnh</Text>
          </View>
        )}
      </TouchableOpacity>

      <Text style={styles.label}>Tên công thức</Text>
      <TextInput
        style={styles.input}
        value={title}
        onChangeText={setTitle}
        placeholder="Nhập tên công thức..."
      />

      <Text style={styles.label}>Mô tả</Text>
      <TextInput
        style={[styles.input, { height: 100 }]}
        value={description}
        onChangeText={setDescription}
        multiline
        placeholder="Nhập mô tả..."
      />

      <Text style={styles.label}>Khẩu phần</Text>
      <TextInput
        style={styles.input}
        value={servings}
        onChangeText={setServings}
        keyboardType="numeric"
        placeholder="Nhập số khẩu phần..."
      />

      <Text style={styles.label}>Thời gian chuẩn bị (phút)</Text>
      <TextInput
        style={styles.input}
        value={prepTime}
        onChangeText={setPrepTime}
        keyboardType="numeric"
        placeholder="Nhập thời gian chuẩn bị..."
      />

      <Text style={styles.label}>Thời gian nấu (phút)</Text>
      <TextInput
        style={styles.input}
        value={cookTime}
        onChangeText={setCookTime}
        keyboardType="numeric"
        placeholder="Nhập thời gian nấu..."
      />

      <Text style={styles.label}>Danh mục</Text>
      <View style={styles.multiContainer}>
        {categories.map((cat) => (
          <TouchableOpacity
            key={cat.categoryId}
            style={[
              styles.option,
              categoryIds.includes(cat.categoryId) && styles.optionSelected,
            ]}
            onPress={() =>
              toggleSelect(categoryIds, cat.categoryId, setCategoryIds)
            }
          >
            <Text>{cat.name}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.label}>Nguyên liệu</Text>
      <View style={styles.multiContainer}>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => setShowIngredientModal(true)}
        >
          <Text style={styles.addButtonText}>+ Thêm nguyên liệu</Text>
        </TouchableOpacity>
      </View>
      
      <View style={styles.ingredientList}>
        {ingredientDetails.map((detail) => {
          const ingredient = ingredients.find(i => i.ingredientId === detail.ingredientId);
          return (
            <View key={detail.ingredientId} style={styles.ingredientItem}>
              <Text style={styles.ingredientName}>
                {ingredient?.name} - {detail.quantity} {detail.unit}
              </Text>
              <TouchableOpacity
                onPress={() => removeIngredientDetail(detail.ingredientId)}
                style={styles.removeButton}
              >
                <Text style={styles.removeButtonText}>×</Text>
              </TouchableOpacity>
            </View>
          );
        })}
      </View>

      <Modal
        visible={showIngredientModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowIngredientModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Thêm nguyên liệu</Text>
            
            <Text style={styles.label}>Chọn nguyên liệu</Text>
            <ScrollView style={styles.ingredientSelector}>
              {ingredients.map((ing) => (
                <TouchableOpacity
                  key={ing.ingredientId}
                  style={[
                    styles.ingredientOption,
                    selectedIngredient === ing.ingredientId && styles.optionSelected
                  ]}
                  onPress={() => setSelectedIngredient(ing.ingredientId)}
                >
                  <Text>{ing.name}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <Text style={styles.label}>Số lượng</Text>
            <TextInput
              style={styles.input}
              value={quantity}
              onChangeText={setQuantity}
              keyboardType="decimal-pad"
              placeholder="Nhập số lượng..."
            />

            <Text style={styles.label}>Đơn vị</Text>
            <TextInput
              style={styles.input}
              value={unit}
              onChangeText={setUnit}
              placeholder="Nhập đơn vị (g, ml, muỗng,...)..."
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setShowIngredientModal(false)}
              >
                <Text style={styles.modalButtonText}>Hủy</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.addButton]}
                onPress={addIngredientDetail}
              >
                <Text style={styles.modalButtonText}>Thêm</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <Text style={styles.label}>Các bước thực hiện</Text>
      {steps.map((step, index) => (
        <View key={index} style={[styles.ingredientItem, { flexDirection: 'column', gap: 10 }]}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <Text style={{ fontWeight: 'bold' }}>Bước {index + 1}</Text>
            <TouchableOpacity
              onPress={() => removeStepLocal(index)}
              style={styles.removeButton}
            >
              <Text style={styles.removeButtonText}>×</Text>
            </TouchableOpacity>
          </View>
          
          <TextInput
            style={[styles.input, { marginVertical: 0 }]}
            value={step.instruction}
            onChangeText={(text) => {
              const newSteps = [...steps];
              newSteps[index] = { ...step, instruction: text };
              setSteps(newSteps);
            }}
            multiline
            placeholder="Nhập hướng dẫn cho bước này..."
          />

          <TouchableOpacity 
            onPress={() => pickStepImage(index)}
            style={{ alignItems: 'center', marginTop: 5 }}
          >
            {step.image ? (
              <Image
                source={{ 
                  uri: step.image.startsWith('file://') 
                    ? step.image 
                    : `${getImageUrl(step.image)}`
                }}
                style={{ width: '100%', height: 150, borderRadius: 8 }}
                resizeMode="cover"
              />
            ) : (
              <View style={[styles.imagePlaceholder, { height: 80, marginVertical: 0 }]}>
                <Text>+ Thêm ảnh cho bước này</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      ))}
      
      <TouchableOpacity
        style={[styles.addButton, { marginVertical: 15 }]}
        onPress={addStepLocal}
      >
        <Text style={styles.addButtonText}>+ Thêm bước</Text>
      </TouchableOpacity>

      <Text style={styles.label}>Tags</Text>
      <View style={styles.multiContainer}>
        {tags.map((tag) => (
          <TouchableOpacity
            key={tag.tagId}
            style={[
              styles.option,
              tagIds.includes(tag.tagId) && styles.optionSelected,
            ]}
            onPress={() => toggleSelect(tagIds, tag.tagId, setTagIds)}
          >
            <Text>{tag.name}</Text>
          </TouchableOpacity>
        ))}
      </View>

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
    </SafeAreaView>
  );
}


