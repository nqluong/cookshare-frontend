import { useRouter } from 'expo-router'; // ✅ dùng router để điều hướng
import { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import FeaturedDish from '../../components/home/FeaturedDish';
import SearchBar from '../../components/home/SearchBar';
import TabBar from '../../components/home/TabBar';
import NewestRecipes from '../../components/home/sections/NewestRecipes';
import PopularRecipes from '../../components/home/sections/PopularRecipes';
import TopRatedRecipes from '../../components/home/sections/TopRatedRecipes';
import TrendingRecipes from '../../components/home/sections/TrendingRecipes';
import {
  getHomeSuggestions,
  getNewestRecipes,
  getPopularRecipes,
  getTopRatedRecipes,
  getTrendingRecipes
} from '../../services/homeService';
import { Colors } from '../../styles/colors';
import { Recipe } from '../../types/dish';

export default function HomeScreen() {
  const [activeTab, setActiveTab] = useState('Đề xuất');
  const router = useRouter(); // ✅ khởi tạo router
  
  const [featuredRecipes, setFeaturedRecipes] = useState<Recipe[]>([]); // Công thức nổi bật (của admin chọn)
  const [popularRecipes, setPopularRecipes] = useState<Recipe[]>([]); // Công thức phổ biến
  const [newestRecipes, setNewestRecipes] = useState<Recipe[]>([]); // Công thức mới nhất
  const [topRatedRecipes, setTopRatedRecipes] = useState<Recipe[]>([]); // Công thức đánh giá cao
  const [trendingRecipes, setTrendingRecipes] = useState<Recipe[]>([]); // Công thức đang thịnh hành
  
  const [loading, setLoading] = useState(true); // Trạng thái đang tải
  const [error, setError] = useState<string | null>(null); // Lỗi nếu có


  // Pagination state cho Newest
  const [newestPage, setNewestPage] = useState(0); 
  const [hasMoreNewest, setHasMoreNewest] = useState(true); 
  const [isLoadingMoreNewest, setIsLoadingMoreNewest] = useState(false);

  // Pagination state cho Trending
  const [trendingPage, setTrendingPage] = useState(0);
  const [hasMoreTrending, setHasMoreTrending] = useState(true);
  const [isLoadingMoreTrending, setIsLoadingMoreTrending] = useState(false);

  // Pagination state cho Popular
  const [popularPage, setPopularPage] = useState(0);
  const [hasMorePopular, setHasMorePopular] = useState(true);
  const [isLoadingMorePopular, setIsLoadingMorePopular] = useState(false);

  // Pagination state cho TopRated
  const [topRatedPage, setTopRatedPage] = useState(0);
  const [hasMoreTopRated, setHasMoreTopRated] = useState(true);
  const [isLoadingMoreTopRated, setIsLoadingMoreTopRated] = useState(false);

  useEffect(() => {
    fetchHomeSuggestions();
  }, []);


  const fetchHomeSuggestions = async () => {
    try {
      setLoading(true); 
      setError(null); 
      
      const response = await getHomeSuggestions();
      
      if (response.success && response.data) {
        // Lưu danh sách công thức nổi bật
        setFeaturedRecipes(response.data.featuredRecipes || []);
        
        // Lưu danh sách công thức phổ biến
        setPopularRecipes(response.data.popularRecipes || []);
        
        // Lưu danh sách công thức mới nhất
        setNewestRecipes(response.data.newestRecipes || []);
        
        // Lưu danh sách công thức đánh giá cao nhất
        setTopRatedRecipes(response.data.topRatedRecipes || []);
        
        // Lưu danh sách công thức đang thịnh hành
        setTrendingRecipes(response.data.trendingRecipes || []);
      }
    } catch (err: any) {
      console.error('Error fetching home suggestions:', err);
      setError(err.message || 'Không thể tải dữ liệu');
    } finally {
      setLoading(false); 
    }
  };

  const handleOpenDetail = (recipe: Recipe) => {
    // 🎯 Dynamic route: /_recipe-detail/[id] (trong tabs layout)
    router.push(`/_recipe-detail/${recipe.recipeId}` as any);
  };

  // Load more Newest
  const handleLoadMoreNewest = async () => {
    if (isLoadingMoreNewest || !hasMoreNewest) return;

    try {
      setIsLoadingMoreNewest(true);
      const nextPage = newestPage + 1;
      const response = await getNewestRecipes(nextPage, 10);
      
      if (response.success && response.data) {
        const newRecipes = response.data.content || [];
        setNewestRecipes(prev => [...prev, ...newRecipes]);
        setNewestPage(nextPage);
        setHasMoreNewest(!response.data.last);
      }
    } catch (err: any) {
      console.error('Error loading more newest recipes:', err);
    } finally {
      setIsLoadingMoreNewest(false);
    }
  };

  // Load more Trending
  const handleLoadMoreTrending = async () => {
    if (isLoadingMoreTrending || !hasMoreTrending) return;

    try {
      setIsLoadingMoreTrending(true);
      const nextPage = trendingPage + 1;
      const response = await getTrendingRecipes(nextPage, 10);
      
      if (response.success && response.data) {
        const newRecipes = response.data.content || [];
        setTrendingRecipes(prev => [...prev, ...newRecipes]);
        setTrendingPage(nextPage);
        setHasMoreTrending(!response.data.last);
      }
    } catch (err: any) {
      console.error('Error loading more trending recipes:', err);
    } finally {
      setIsLoadingMoreTrending(false);
    }
  };

  // Load more Popular
  const handleLoadMorePopular = async () => {
    if (isLoadingMorePopular || !hasMorePopular) return;

    try {
      setIsLoadingMorePopular(true);
      const nextPage = popularPage + 1;
      const response = await getPopularRecipes(nextPage, 20); // 20 items mỗi lần
      
      if (response.success && response.data) {
        const newRecipes = response.data.content || [];
        setPopularRecipes(prev => [...prev, ...newRecipes]);
        setPopularPage(nextPage);
        setHasMorePopular(!response.data.last);
      }
    } catch (err: any) {
      console.error('Error loading more popular recipes:', err);
    } finally {
      setIsLoadingMorePopular(false);
    }
  };

  // Load more TopRated
  const handleLoadMoreTopRated = async () => {
    if (isLoadingMoreTopRated || !hasMoreTopRated) return;

    try {
      setIsLoadingMoreTopRated(true);
      const nextPage = topRatedPage + 1;
      const response = await getTopRatedRecipes(nextPage, 10);
      
      if (response.success && response.data) {
        const newRecipes = response.data.content || [];
        setTopRatedRecipes(prev => [...prev, ...newRecipes]);
        setTopRatedPage(nextPage);
        setHasMoreTopRated(!response.data.last);
      }
    } catch (err: any) {
      console.error('Error loading more topRated recipes:', err);
    } finally {
      setIsLoadingMoreTopRated(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>Đang tải...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Hiển thị lỗi nếu có
  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerContainer}>
          <Text style={styles.errorText}>❌ {error}</Text>
          <Text style={styles.retryText} onPress={fetchHomeSuggestions}>
            Thử lại
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <SearchBar />
      <TabBar activeTab={activeTab} onTabChange={setActiveTab} />

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <FeaturedDish recipe={featuredRecipes[0]} onRecipePress={handleOpenDetail} />
        
        <TrendingRecipes 
          recipes={trendingRecipes} 
          onRecipePress={handleOpenDetail}
          onLoadMore={handleLoadMoreTrending}
          hasMore={hasMoreTrending}
          isLoadingMore={isLoadingMoreTrending}
        />
        
        <PopularRecipes 
          recipes={popularRecipes} 
          onRecipePress={handleOpenDetail}
          onLoadMore={handleLoadMorePopular}
          hasMore={hasMorePopular}
          isLoadingMore={isLoadingMorePopular}
        />
        
        <TopRatedRecipes 
          recipes={topRatedRecipes} 
          onRecipePress={handleOpenDetail}
          onLoadMore={handleLoadMoreTopRated}
          hasMore={hasMoreTopRated}
          isLoadingMore={isLoadingMoreTopRated}
        />
        
        <NewestRecipes 
          recipes={newestRecipes} 
          onRecipePress={handleOpenDetail}
          onLoadMore={handleLoadMoreNewest}
          hasMore={hasMoreNewest}
          isLoadingMore={isLoadingMoreNewest}
        />
        
        <View style={styles.bottomPadding} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollView: {
    flex: 1,
  },
  bottomPadding: {
    height: 80, 
  },
  // Styles cho loading và error
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: Colors.text.secondary,
  },
  errorText: {
    fontSize: 16,
    color: '#FF3B30',
    textAlign: 'center',
    marginBottom: 16,
  },
  retryText: {
    fontSize: 16,
    color: Colors.primary,
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
});
