import { useAuth } from "@/context/AuthContext";
import { collectionService } from "@/services/collectionService";
import { userService } from "@/services/userService";
import { CollectionUserDto } from "@/types/collection.types";
import { useCallback, useEffect, useState } from "react";
import { Alert } from "react-native";

interface UseCollectionManagerReturn {
  savedRecipes: Set<string>;
  recipeToCollectionMap: Map<string, string>;
  collections: CollectionUserDto[];
  isLoadingSaved: boolean;
  userUUID: string;
  isSaved: (recipeId: string) => boolean;
  handleSaveRecipe: (recipeId: string, collectionId: string) => void;
  handleUnsaveRecipe: (recipeId: string, currentSaveCount: number, onSuccess?: (newSaveCount: number) => void) => Promise<void>;
  refreshCollections: () => Promise<void>;
  savedVersion: number;
}

export function useCollectionManager(): UseCollectionManagerReturn {
  const { user } = useAuth();

  const [savedRecipes, setSavedRecipes] = useState<Set<string>>(new Set());
  const [recipeToCollectionMap, setRecipeToCollectionMap] = useState<Map<string, string>>(new Map());
  const [collections, setCollections] = useState<CollectionUserDto[]>([]);
  const [userUUID, setUserUUID] = useState<string>("");
  const [isLoadingSaved, setIsLoadingSaved] = useState(false);
  const [savedVersion, setSavedVersion] = useState(0);

  /**
   * Tải danh sách công thức đã lưu từ backend
   */
  const loadSavedRecipes = useCallback(
    async (uuid?: string, collectionsList?: CollectionUserDto[]) => {
      const userId = uuid || userUUID;
      const list = collectionsList || collections;

      if (!userId || list.length === 0) return;

      setIsLoadingSaved(true);
      const savedSet = new Set<string>();
      const map = new Map<string, string>();

      try {
        const promises = list.map(async (collection) => {
          const response = await collectionService.getCollectionRecipes(
            userId,
            collection.collectionId,
            0,
            100
          );
          const recipesInCollection = response.content || [];
          return recipesInCollection.map((r: any) => ({
            recipeId: r.recipeId,
            collectionId: collection.collectionId,
          }));
        });

        const results = await Promise.all(promises);
        const allSaved = results.flat();

        allSaved.forEach(({ recipeId, collectionId }) => {
          savedSet.add(recipeId);
          map.set(recipeId, collectionId);
        });

        setSavedRecipes(savedSet);
        setRecipeToCollectionMap(map);
      } catch (error) {
        console.log("Error loading saved recipes:", error);
      } finally {
        setIsLoadingSaved(false);
      }
    },
    [userUUID, collections]
  );

  /**
   * Khởi tạo: Load user, collections và saved recipes
   */
  const initLoad = async () => {
    if (!user?.username) return;

    try {
      const profile = await userService.getUserByUsername(user.username);
      const userId = profile.userId;
      setUserUUID(userId);

      const data = await collectionService.getUserCollections(userId);
      const newCollections = data.data.content || [];
      setCollections(newCollections);

      if (newCollections.length > 0) {
        await loadSavedRecipes(userId, newCollections);
      }
    } catch (error) {
      console.log("Error initializing:", error);
    }
  };

  useEffect(() => {
    if (user?.username) {
      initLoad();
    }
  }, [user?.username]);

  /**
   * Kiểm tra recipe đã được lưu chưa
   */
  const isSaved = (recipeId: string) => savedRecipes.has(recipeId);

  /**
   * Cập nhật cache khi save recipe thành công
   */
  const handleSaveRecipe = (recipeId: string, collectionId: string) => {
    // Cập nhật savedRecipes
    setSavedRecipes((prev) => new Set([...prev, recipeId]));

    // Cập nhật recipeToCollectionMap
    setRecipeToCollectionMap((prev) => new Map(prev).set(recipeId, collectionId));
    setSavedVersion(v => v + 1);
  };

  /**
   * Gỡ recipe khỏi bộ sưu tập
   */
  const handleUnsaveRecipe = async (
    recipeId: string,
    currentSaveCount: number,
    onSuccess?: (newSaveCount: number) => void
  ) => {
    const collectionId = recipeToCollectionMap.get(recipeId);

    if (!collectionId) {
      Alert.alert("Không tìm thấy", "Công thức không tồn tại trong bộ sưu tập nào.");
      return;
    }

    try {
      await collectionService.removeRecipeFromCollection(userUUID, collectionId, recipeId);

      // Cập nhật cache
      setSavedRecipes((prev) => {
        const newSet = new Set(prev);
        newSet.delete(recipeId);
        return newSet;
      });

      setRecipeToCollectionMap((prev) => {
        const newMap = new Map(prev);
        newMap.delete(recipeId);
        return newMap;
      });

      setSavedVersion(v => v + 1);

      onSuccess?.(currentSaveCount - 1);
    } catch (error: any) {
      console.log("Lỗi xóa công thức:", error);
      Alert.alert("Lỗi", error.message || "Không thể xóa công thức.");
    }
  };

  /**
   * Refresh collections (dùng sau khi tạo collection mới)
   */
  const refreshCollections = async () => {
    if (!userUUID) return;

    try {
      const data = await collectionService.getUserCollections(userUUID);
      const newCollections = data.data.content || [];
      setCollections(newCollections);

      if (newCollections.length > 0) {
        await loadSavedRecipes(userUUID, newCollections);
      }
    } catch (error) {
      console.log("Error refreshing collections:", error);
    }
  };

  return {
    savedRecipes,
    recipeToCollectionMap,
    collections,
    isLoadingSaved,
    userUUID,
    isSaved,
    handleSaveRecipe,
    handleUnsaveRecipe,
    refreshCollections,
    savedVersion
  };
}