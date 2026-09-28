import { Image, ImageContentFit } from 'expo-image';
import React, { memo } from 'react';
import { StyleSheet, Text, View, ViewStyle } from 'react-native';
import { BorderRadius, Colors, FontSize } from '@/theme';

interface AppImageProps {
  uri?: string | null;
  style?: ViewStyle | ViewStyle[];
  contentFit?: ImageContentFit;
  placeholder?: string;
  borderRadius?: number;
}

export const AppImage = memo(function AppImage({
  uri,
  style,
  contentFit = 'cover',
  placeholder = '💍',
  borderRadius = BorderRadius.md,
}: AppImageProps) {
  return (
    <View style={[styles.container, { borderRadius }, style]}>
      {uri ? (
        <Image
          source={{ uri }}
          style={[StyleSheet.absoluteFill, { borderRadius }]}
          contentFit={contentFit}
          transition={200}
        />
      ) : (
        <View style={[StyleSheet.absoluteFill, styles.fallback, { borderRadius }]}>
          <Text style={styles.emoji}>{placeholder}</Text>
        </View>
      )}
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.cardBackground,
    overflow: 'hidden',
  },
  fallback: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.cardBackground,
  },
  emoji: {
    fontSize: FontSize['5xl'],
  },
});
