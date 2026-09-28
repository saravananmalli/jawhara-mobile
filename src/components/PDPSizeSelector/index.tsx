import { memo, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { BorderRadius, Colors, FontSize, PoppinsFonts, Spacing } from '@/theme';

interface PDPSizeSelectorProps {
  sizes: string[];
}

export const PDPSizeSelector = memo(function PDPSizeSelector({ sizes }: PDPSizeSelectorProps) {
  const [selected, setSelected] = useState(sizes[0]);

  if (sizes.length === 0) return null;

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Select Size</Text>
      <View style={styles.row}>
        {sizes.map((size) => {
          const isSelected = size === selected;
          return (
            <TouchableOpacity
              key={size}
              style={[styles.chip, isSelected && styles.chipSelected]}
              onPress={() => setSelected(size)}
              activeOpacity={0.8}
            >
              <Text style={[styles.chipText, isSelected && styles.chipTextSelected]}>{size}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  container: { gap: Spacing.sm },
  heading: {
    fontSize: FontSize.md,
    fontFamily: PoppinsFonts.bold,
    color: Colors.textPrimary,
  },
  row: { flexDirection: 'row', gap: Spacing.sm, flexWrap: 'wrap' },
  chip: {
    minWidth: 44,
    height: 44,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.cardBackground,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chipSelected: {
    backgroundColor: Colors.primary,
  },
  chipText: {
    fontSize: FontSize.sm,
    fontFamily: PoppinsFonts.semibold,
    color: Colors.textPrimary,
  },
  chipTextSelected: {
    color: Colors.textInverse,
  },
});
