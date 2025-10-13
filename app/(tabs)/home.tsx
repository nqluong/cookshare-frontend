import { useRouter } from 'expo-router'; // ✅ dùng router để điều hướng
import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import FeaturedDish from '../../components/home/FeaturedDish';
import PostCard from '../../components/home/PostCard';
import SearchBar from '../../components/home/SearchBar';
import TabBar from '../../components/home/TabBar';
import TopDishes from '../../components/home/TopDishes';
import { posts, topDishes } from '../../data/mockData';
import { Colors } from '../../styles/colors';

export default function HomeScreen() {
  const [activeTab, setActiveTab] = useState('Yêu thích');
  const router = useRouter(); // ✅ khởi tạo router

  const handleOpenDetail = () => {
    router.push('/recipe-detail'); // ✅ chuyển sang màn hình chi tiết
  };

  return (
    <SafeAreaView style={styles.container}>
      <SearchBar />
      <TabBar activeTab={activeTab} onTabChange={setActiveTab} />

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <FeaturedDish />
        <TopDishes dishes={topDishes} />

        <View style={styles.postsContainer}>
          <Text style={styles.postsTitle}>Nổi bật</Text>
          {posts.map((post) => (
            <PostCard 
              key={post.id} 
              post={post}
              onPress={handleOpenDetail} // ✅ gắn sự kiện chuyển giao diện
            />
          ))}
        </View>
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
  postsContainer: {
    paddingHorizontal: 16,
    paddingBottom: 80,
  },
  postsTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: Colors.text.primary,
    marginBottom: 16,
  },
});
