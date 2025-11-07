import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Colors } from '../../../styles/colors';

export type StatisticsTabType = 'interaction' | 'search';

interface StatisticsTabsProps {
  activeTab: StatisticsTabType;
  onTabChange: (tab: StatisticsTabType) => void;
}

export default function StatisticsTabs({ activeTab, onTabChange }: StatisticsTabsProps) {
  const tabs: { key: StatisticsTabType; label: string }[] = [
    { key: 'interaction', label: 'Tương Tác' },
    { key: 'search', label: 'Tìm Kiếm' }
  ];

  return (
    <View style={styles.container}>
      {tabs.map((tab) => (
        <TouchableOpacity
          key={tab.key}
          style={[
            styles.tab,
            activeTab === tab.key && styles.tabActive,
          ]}
          onPress={() => onTabChange(tab.key)}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === tab.key && styles.tabTextActive,
            ]}
          >
            {tab.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 8,
    backgroundColor: '#f9fafb',
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: Colors.gray[200],
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabActive: {
    backgroundColor: '#10b981',
    borderColor: '#10b981',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.text.secondary,
  },
  tabTextActive: {
    color: '#fff',
    fontWeight: '600',
  },
});