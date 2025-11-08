import { Colors } from '@/styles/colors';
import { Ionicons } from '@expo/vector-icons';
import { Image, ImageContentFit } from 'expo-image';
import React from 'react';
import { ActivityIndicator, ImageStyle, StyleSheet, View } from 'react-native';

interface CachedImageProps {
  source: { uri: string };
  style?: ImageStyle | ImageStyle[];
  placeholder?: React.ReactNode;
  showLoader?: boolean;
  resizeMode?: ImageContentFit;
  priority?: 'low' | 'normal' | 'high';
}

export const CachedImage: React.FC<CachedImageProps> = ({
  source,
  placeholder,
  showLoader = false,
  style,
  resizeMode = 'cover',
  priority = 'normal',
}) => {
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(false);

  if (!source?.uri) {
    return (
      <View style={[styles.placeholder, style]}>
        {placeholder || (
          <Ionicons name="image-outline" size={40} color={Colors.gray[400]} />
        )}
      </View>
    );
  }

  return (
    <View style={[styles.container, style]}>
      <Image
        source={source.uri}
        style={[StyleSheet.absoluteFill, style]}
        contentFit={resizeMode}
        priority={priority}
        // ✅ Cấu hình cache - Expo Image tự động cache
        cachePolicy="memory-disk" // Cache vào memory và disk
        transition={200} // Smooth transition khi load
        onLoadStart={() => setLoading(true)}
        onLoad={() => {
          setLoading(false);
          setError(false);
        }}
        onError={() => {
          setLoading(false);
          setError(true);
        }}
      />

      {/* Loading indicator */}
      {loading && showLoader && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="small" color={Colors.primary} />
        </View>
      )}

      {/* Error placeholder */}
      {error && (
        <View style={styles.errorOverlay}>
          {placeholder || (
            <Ionicons name="image-outline" size={40} color={Colors.gray[400]} />
          )}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
    backgroundColor: Colors.gray[100],
  },
  placeholder: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.gray[100],
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
  },
  errorOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.gray[100],
  },
});

// Export constants
export const ImagePriority = {
  low: 'low' as const,
  normal: 'normal' as const,
  high: 'high' as const,
};