import { AdminRecipe } from "@/types/admin/recipe.types";
import { Ionicons } from "@expo/vector-icons";
import { useCallback, useEffect, useRef, useState } from "react";
import { ActivityIndicator, Animated, RefreshControl, ScrollView, StyleSheet, Text, View } from "react-native";
import { Colors } from "../../../styles/colors";
import RecipeItem from "./RecipeItem";

interface RecipeListProps {
  recipes: AdminRecipe[];
  loading: boolean;
  refreshing: boolean;
  error: string | null;
  totalElements: number;
  hasMore: boolean;
  onRefresh: () => void;
  onLoadMore: () => void;
  onViewRecipe: (recipe: AdminRecipe) => void;
  onEditRecipe: (recipeId: string) => void;
  onDeleteRecipe: (recipe: AdminRecipe) => void;
  onApproveRecipe?: (recipe: AdminRecipe) => void;
  onRejectRecipe?: (recipe: AdminRecipe) => void;
  onToggleFeatured?: (recipe: AdminRecipe) => void;
  onTogglePublished?: (recipe: AdminRecipe) => void;
}

export default function RecipeList({
  recipes,
  loading,
  refreshing,
  error,
  totalElements,
  hasMore,
  onRefresh,
  onLoadMore,
  onViewRecipe,
  onEditRecipe,
  onDeleteRecipe,
  onApproveRecipe,
  onRejectRecipe,
  onToggleFeatured,
  onTogglePublished,
}: RecipeListProps) {
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const dot1Anim = useRef(new Animated.Value(0.4)).current;
  const dot2Anim = useRef(new Animated.Value(0.7)).current;
  const dot3Anim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (isLoadingMore || loading) {
      const animateDots = () => {
        Animated.sequence([
          Animated.timing(dot1Anim, {
            toValue: 1,
            duration: 300,
            useNativeDriver: false,
          }),
          Animated.timing(dot2Anim, {
            toValue: 1,
            duration: 300,
            useNativeDriver: false,
          }),
          Animated.timing(dot3Anim, {
            toValue: 1,
            duration: 300,
            useNativeDriver: false,
          }),
          Animated.timing(dot1Anim, {
            toValue: 0.4,
            duration: 300,
            useNativeDriver: false,
          }),
          Animated.timing(dot2Anim, {
            toValue: 0.7,
            duration: 300,
            useNativeDriver: false,
          }),
          Animated.timing(dot3Anim, {
            toValue: 1,
            duration: 300,
            useNativeDriver: false,
          }),
        ]).start(() => {
          if (isLoadingMore || loading) {
            animateDots();
          }
        });
      };
      animateDots();
    }
  }, [isLoadingMore, loading, dot1Anim, dot2Anim, dot3Anim]);

  const handleLoadMore = useCallback(() => {
    if (!isLoadingMore && hasMore && !loading && !refreshing) {
      setIsLoadingMore(true);
      onLoadMore();
      // Reset loading state after a short delay
      setTimeout(() => setIsLoadingMore(false), 1000);
    }
  }, [isLoadingMore, hasMore, loading, refreshing, onLoadMore]);
  if (loading && recipes.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={styles.loadingText}>Đang tải danh sách công thức...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="alert-circle-outline" size={48} color="#ef4444" />
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  if (recipes.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="restaurant-outline" size={48} color={Colors.text.light} />
        <Text style={styles.emptyText}>Không tìm thấy công thức nào</Text>
      </View>
    );
  }

  return (
    <ScrollView 
      style={styles.scrollView} 
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
      onScroll={({ nativeEvent }) => {
        const { layoutMeasurement, contentOffset, contentSize } = nativeEvent;
        const isCloseToBottom = layoutMeasurement.height + contentOffset.y >= contentSize.height - 100;
        if (isCloseToBottom) {
          handleLoadMore();
        }
      }}
      scrollEventThrottle={200}
    >
      <View style={styles.statsContainer}>
        <Text style={styles.statsText}>
          Tổng: {totalElements} công thức
        </Text>
      </View>
      
      {recipes.map((recipe) => (
        <RecipeItem
          key={recipe.recipeId}
          recipe={recipe}
          onView={onViewRecipe}
          onEdit={onEditRecipe}
          onDelete={onDeleteRecipe}
          onApprove={onApproveRecipe}
          onReject={onRejectRecipe}
          onToggleFeatured={onToggleFeatured}
          onTogglePublished={onTogglePublished}
        />
      ))}
      
      {(loading || isLoadingMore) && recipes.length > 0 && (
        <View style={styles.loadingMoreContainer}>
          <View style={styles.loadingAnimation}>
            <ActivityIndicator size="small" color={Colors.primary} />
            <View style={styles.loadingDots}>
              <Animated.View style={[styles.dot, { opacity: dot1Anim }]} />
              <Animated.View style={[styles.dot, { opacity: dot2Anim }]} />
              <Animated.View style={[styles.dot, { opacity: dot3Anim }]} />
            </View>
          </View>
          <Text style={styles.loadingMoreText}>Đang tải thêm công thức...</Text>
          
          {/* Skeleton loading for new items */}
          <View style={styles.skeletonContainer}>
            <View style={styles.skeletonItem}>
              <View style={styles.skeletonImage} />
              <View style={styles.skeletonContent}>
                <View style={styles.skeletonTitle} />
                <View style={styles.skeletonSubtitle} />
                <View style={styles.skeletonAuthor} />
              </View>
            </View>
          </View>
        </View>
      )}
      
      {!hasMore && recipes.length > 0 && (
        <View style={styles.endContainer}>
          <Text style={styles.endText}>Đã tải hết tất cả công thức</Text>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
    paddingHorizontal: 20,
  },
  statsContainer: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: "#f8fafc",
    borderRadius: 8,
    marginBottom: 16,
  },
  statsText: {
    fontSize: 14,
    color: Colors.text.secondary,
    fontWeight: "500",
  },
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 40,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: Colors.text.secondary,
  },
  errorContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  errorText: {
    marginTop: 12,
    fontSize: 16,
    color: Colors.text.secondary,
    textAlign: "center",
    marginBottom: 20,
  },
  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 40,
  },
  emptyText: {
    marginTop: 12,
    fontSize: 16,
    color: Colors.text.secondary,
  },
  loadingMoreContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 20,
    backgroundColor: "#f8fafc",
    marginHorizontal: 20,
    marginBottom: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  loadingAnimation: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  loadingDots: {
    flexDirection: "row",
    marginLeft: 8,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.primary,
    marginHorizontal: 2,
  },
  loadingMoreText: {
    fontSize: 14,
    color: Colors.text.secondary,
    fontWeight: "500",
  },
  endContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 20,
    backgroundColor: "#f0f9ff",
    marginHorizontal: 20,
    marginBottom: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#e0f2fe",
  },
  endText: {
    fontSize: 14,
    color: "#0369a1",
    fontWeight: "500",
  },
  skeletonContainer: {
    marginTop: 16,
    paddingHorizontal: 20,
  },
  skeletonItem: {
    flexDirection: "row",
    backgroundColor: "#f8fafc",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  skeletonImage: {
    width: 80,
    height: 80,
    backgroundColor: "#e2e8f0",
    borderRadius: 8,
    marginRight: 16,
  },
  skeletonContent: {
    flex: 1,
    justifyContent: "center",
  },
  skeletonTitle: {
    height: 16,
    backgroundColor: "#e2e8f0",
    borderRadius: 4,
    marginBottom: 8,
    width: "80%",
  },
  skeletonSubtitle: {
    height: 12,
    backgroundColor: "#e2e8f0",
    borderRadius: 4,
    marginBottom: 8,
    width: "60%",
  },
  skeletonAuthor: {
    height: 12,
    backgroundColor: "#e2e8f0",
    borderRadius: 4,
    width: "40%",
  },
});
