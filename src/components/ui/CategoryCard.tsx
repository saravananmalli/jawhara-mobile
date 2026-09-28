import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { BorderRadius, Colors, PoppinsFonts } from '@/constants/theme';
import { BACKEND_URL } from '@/services/api';

interface CategoryCardProps {
  name: string;
  icon?: string;
  imageUrl?: string | null;
  onPress?: () => void;
}

const CARD_SIZE = 100;

export function CategoryCard({ name, icon = '💍', imageUrl, onPress }: CategoryCardProps) {
  const src = imageUrl ? { uri: `${BACKEND_URL}${imageUrl}` } : null;

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.8}>
      <View style={styles.imageBox}>
        {src ? (
          <Image source={src} style={styles.image} resizeMode="cover" />
        ) : (
          <View style={styles.fallback}>
            <Text style={styles.emoji}>{icon}</Text>
          </View>
        )}
      </View>
      <Text style={styles.name} numberOfLines={2}>
        {name}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    width: CARD_SIZE,
    alignItems: 'center',
  },
  imageBox: {
    width: CARD_SIZE,
    height: CARD_SIZE,
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
    backgroundColor: Colors.goldLight,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  fallback: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emoji: {
    fontSize: 48,
  },
  name: {
    marginTop: 8,
    fontSize: 14,
    fontFamily: PoppinsFonts.semibold,
    color: Colors.textPrimary,
    textAlign: 'center',
    lineHeight: 19,
  },
});
