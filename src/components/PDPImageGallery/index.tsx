import { useCallback, useState } from 'react';
import {
  Dimensions,
  NativeScrollEvent,
  NativeSyntheticEvent,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { AppImage } from '@/components/AppImage';
import { BACKEND_URL } from '@/services/api';
import { BorderRadius, Spacing } from '@/theme';

const SCREEN_WIDTH = Dimensions.get('window').width;
const GALLERY_HEIGHT = SCREEN_WIDTH;
const TRACK_WIDTH = SCREEN_WIDTH * 0.55;

function resolveUri(path: string): string {
  return path.startsWith('http') ? path : `${BACKEND_URL}${path}`;
}

interface PDPImageGalleryProps {
  images: string[];
}

export function PDPImageGallery({ images }: PDPImageGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0);

  const uris: (string | null)[] = images.length > 0 ? images.map(resolveUri) : [null];
  const count = uris.length;

  const onScroll = useCallback((e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const index = Math.round(e.nativeEvent.contentOffset.x / SCREEN_WIDTH);
    setActiveIndex(index);
  }, []);

  const thumbWidth = TRACK_WIDTH / count;
  const thumbLeft = (TRACK_WIDTH - thumbWidth) * (activeIndex / Math.max(count - 1, 1));

  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={onScroll}
        scrollEventThrottle={16}
      >
        {uris.map((uri, index) => (
          <AppImage
            key={index}
            uri={uri}
            style={{ width: SCREEN_WIDTH, height: GALLERY_HEIGHT }}
            contentFit="contain"
            borderRadius={0}
          />
        ))}
      </ScrollView>

      <View style={styles.trackWrap}>
        <View style={styles.track}>
          <View style={[styles.thumb, { width: thumbWidth, left: thumbLeft }]} />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { position: 'relative' },
  trackWrap: {
    position: 'absolute',
    bottom: Spacing.md,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  track: {
    width: TRACK_WIDTH,
    height: 3,
    borderRadius: BorderRadius.full,
    backgroundColor: '#D9D9D9',
    overflow: 'hidden',
  },
  thumb: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    borderRadius: BorderRadius.full,
    backgroundColor: '#9B9B9B',
  },
});
