import { useRouter } from 'expo-router'; // ✅ dùng router để điều hướng
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import FeaturedDish from '../../components/home/FeaturedDish';
import SearchBar from '../../components/home/SearchBar';
import TabBar from '../../components/home/TabBar';
import NewestRecipes from '../../components/home/sections/NewestRecipes';
import PopularRecipes from '../../components/home/sections/PopularRecipes';
import TopRatedRecipes from '../../components/home/sections/TopRatedRecipes';
import TrendingRecipes from '../../components/home/sections/TrendingRecipes';
import { getHomeSuggestions } from '../../services/homeService';
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

  useEffect(() => {
    fetchHomeSuggestions();
  }, []);


  const fetchHomeSuggestions = async () => {
    try {
      setLoading(true); 
      setError(null); 
      
      // Gọi API lấy tất cả gợi ý (featured, popular, newest, topRated, trending)
      const response = await getHomeSuggestions();
      
      if (response.success && response.data) {
        // 1️⃣ Lưu danh sách công thức nổi bật
        setFeaturedRecipes(response.data.featuredRecipes || []);
        
        // 2️⃣ Lưu danh sách công thức phổ biến
        setPopularRecipes(response.data.popularRecipes || []);
        
        // 3️⃣ Lưu danh sách công thức mới nhất
        setNewestRecipes(response.data.newestRecipes || []);
        
        // 4️⃣ Lưu danh sách công thức đánh giá cao nhất
        setTopRatedRecipes(response.data.topRatedRecipes || []);
        
        // 5️⃣ Lưu danh sách công thức đang thịnh hành
        setTrendingRecipes(response.data.trendingRecipes || []);
      }
    } catch (err: any) {
      console.error('Error fetching home suggestions:', err);
      setError(err.message || 'Không thể tải dữ liệu');
    } finally {
      setLoading(false); 
    }
  };

  const handleOpenDetail = () => {
    router.push('/recipe-detail'); // ✅ chuyển sang màn hình chi tiết
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

  // ❌ Hiển thị lỗi nếu có
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
        <FeaturedDish recipe={featuredRecipes[0]} />
        
        <TrendingRecipes 
          recipes={trendingRecipes} 
          onRecipePress={handleOpenDetail}
        />
        
        <PopularRecipes 
          recipes={popularRecipes} 
          onRecipePress={handleOpenDetail}
        />
        
        <TopRatedRecipes 
          recipes={topRatedRecipes} 
          onRecipePress={handleOpenDetail}
        />
        
        <NewestRecipes 
          recipes={newestRecipes} 
          onRecipePress={handleOpenDetail}
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
