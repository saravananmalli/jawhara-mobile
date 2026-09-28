import React, { memo } from 'react';
import { StyleSheet, Text, TouchableOpacity, View, ViewStyle } from 'react-native';
import { AppImage } from '@/components/AppImage';
import { BACKEND_URL } from '@/services/api';
import { BorderRadius, Colors, FontSize, PoppinsFonts, Spacing } from '@/theme';

interface CategoryCardProps {
  name: string;
  icon?: string;
  imageUrl?: string | null;
  onPress?: () => void;
  size?: number;
  style?: ViewStyle;
}

export const CategoryCard = memo(function CategoryCard({
  name,
  icon = '💍',
  imageUrl,
  onPress,
  size = 100,
  style,
}: CategoryCardProps) {
  const uri = imageUrl ? `${BACKEND_URL}${imageUrl}` : null;

  return (
    <TouchableOpacity style={[styles.card, { width: size }, style]} onPress={onPress} activeOpacity={0.8}>
      <AppImage
        uri={uri}
        placeholder={icon}
        style={{ width: size, height: size }}
        borderRadius={BorderRadius.lg}
        contentFit="cover"
      />
      <Text style={styles.name} numberOfLines={2}>{name}</Text>
    </TouchableOpacity>
  );
});

const styles = StyleSheet.create({
  card: { alignItems: 'center' },
  name: {
    marginTop: Spacing.sm,
    fontSize: FontSize.base,
    fontFamily: PoppinsFonts.semibold,
    color: Colors.textPrimary,
    textAlign: 'center',
    lineHeight: 19,
  },
});
