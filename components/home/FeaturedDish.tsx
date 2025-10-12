import React from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import { Colors } from '../../styles/colors';

export default function FeaturedDish() {
  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <View style={styles.content}>
          <Text style={styles.badge}>Món ăn hôm nay ⚡</Text>
          <Text style={styles.title}>Phở Bò Truyền Thống</Text>
          <Text style={styles.time}>20 phút</Text>
        </View>
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: 'https://via.placeholder.com/120' }}
            style={styles.image}
            resizeMode="cover"
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  card: {
    backgroundColor: Colors.orange[100],
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  content: {
    flex: 1,
  },
  badge: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text.primary,
    marginBottom: 4,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: 4,
  },
  time: {
    fontSize: 13,
    color: Colors.text.secondary,
  },
  imageContainer: {
    width: 100,
    height: 100,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: Colors.white,
    marginLeft: 12,
  },
  image: {
    width: '100%',
    height: '100%',
  },
});