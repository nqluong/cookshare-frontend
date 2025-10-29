import { Ionicons } from '@expo/vector-icons';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Colors } from '../../styles/colors';

interface TabBarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  onPress?: () => void;
}

const tabs = ['Đề xuất', 'Yêu thích', 'Lịch sử', 'Theo dõi'];

const getTabIcon = (tab: string) => {
  switch (tab) {
    case 'Yêu thích':
      return 'heart-outline';
    case 'Lịch sử':
      return 'time-outline';
    case 'Theo dõi':
      return 'people-outline';
    case 'Đề xuất':
      return 'menu-outline';
    default:
      return 'menu-outline';
  }
};

export default function TabBar({ activeTab, onTabChange, onPress }: TabBarProps) {
  return (
    <View style={styles.container}>
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {tabs.map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[
              styles.tab,
              activeTab === tab && styles.activeTab,
            ]}
            onPress={() => {
              onTabChange(tab);
              onPress?.(); // gọi callback từ cha (nếu có)
            }}
          >
            <Ionicons
              name={getTabIcon(tab) as any}
              size={16}
              color={activeTab === tab ? Colors.primary : Colors.text.secondary}
            />
            <Text
              style={[
                styles.tabText,
                activeTab === tab && styles.activeTabText,
              ]}
            >
              {tab}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
  },
  activeTab: {
    backgroundColor: '#FEE2E2',
  },
  tabText: {
    fontSize: 14,
    color: Colors.text.secondary,
  },
  activeTabText: {
    color: Colors.primary,
    fontWeight: '600',
  },
});
