import { memo, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Colors, FontSize, PoppinsFonts, Spacing } from '@/theme';

// Static, generic trust copy — there is no purchase-count field anywhere in
// the API, so this never claims a specific number. One is picked at random
// each time the page opens, per request, instead of always showing the same line.
const PHRASES = [
  'Top Pick. Loved by our customers',
  'Handpicked favorite this season',
  'A customer favorite',
  'Trending in our collection',
];

function pickPhrase(): string {
  return PHRASES[Math.floor(Math.random() * PHRASES.length)];
}

export const PDPTopPickBanner = memo(function PDPTopPickBanner() {
  const [phrase] = useState(pickPhrase);

  return (
    <View style={styles.container}>
      <Text style={styles.text}>
        <Text style={styles.star}>⭐ </Text>
        {phrase}
      </Text>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.backgroundCream,
    paddingVertical: Spacing.sm,
    alignItems: 'center',
  },
  text: {
    fontSize: FontSize.sm,
    fontFamily: PoppinsFonts.semibold,
    color: Colors.primary,
  },
  star: { fontSize: FontSize.sm },
});
