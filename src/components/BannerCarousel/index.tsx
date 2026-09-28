import { BACKEND_URL, BannerSlide } from "@/services/api";
import { BorderRadius, Colors, Spacing } from "@/theme";
import { Image } from "expo-image";
import React, { memo, useEffect, useRef, useState } from "react";
import {
  Dimensions,
  FlatList,
  NativeScrollEvent,
  NativeSyntheticEvent,
  StyleSheet,
  TouchableOpacity,
  View,
  ViewStyle,
} from "react-native";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const PEEK = 22;
const GAP = 10;
const SLIDE_W = SCREEN_WIDTH - PEEK * 2;

interface BannerCarouselProps {
  banners: BannerSlide[];
  onPress?: (banner: BannerSlide) => void;
  height?: number;
  style?: ViewStyle;
}

export const BannerCarousel = memo(function BannerCarousel({
  banners,
  onPress,
  height = 360,
  style,
}: BannerCarouselProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const listRef = useRef<FlatList<BannerSlide>>(null);
  const loopedIdxRef = useRef(1);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const N = banners.length;
  const looped: BannerSlide[] =
    N === 0
      ? []
      : N === 1
        ? [banners[0], banners[0], banners[0]]
        : [banners[N - 1], ...banners, banners[0]];

  const step = SLIDE_W + GAP;
  const offsetFor = (i: number) => i * step;

  useEffect(() => {
    if (N === 0) return;
    const t = setTimeout(() => {
      listRef.current?.scrollToOffset({
        offset: offsetFor(1),
        animated: false,
      });
      loopedIdxRef.current = 1;
    }, 80);
    return () => clearTimeout(t);
  }, [N]);

  useEffect(() => {
    if (N < 1) return;
    timerRef.current = setInterval(() => {
      const next = loopedIdxRef.current + 1;
      listRef.current?.scrollToOffset({
        offset: offsetFor(next),
        animated: true,
      });
      loopedIdxRef.current = next;
      setActiveIndex((((next - 1) % N) + N) % N);
      if (next >= looped.length - 1) {
        setTimeout(() => {
          listRef.current?.scrollToOffset({
            offset: offsetFor(1),
            animated: false,
          });
          loopedIdxRef.current = 1;
        }, 400);
      }
    }, 5000);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [N, looped.length]);

  const onMomentumEnd = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const x = e.nativeEvent.contentOffset.x;
    const idx = Math.round(x / step);
    const clamped = Math.max(0, Math.min(looped.length - 1, idx));
    setActiveIndex((((clamped - 1) % N) + N) % N);
    loopedIdxRef.current = clamped;
    if (clamped === 0) {
      setTimeout(() => {
        const jumpTo = N;
        listRef.current?.scrollToOffset({
          offset: offsetFor(jumpTo),
          animated: false,
        });
        loopedIdxRef.current = jumpTo;
      }, 50);
    } else if (clamped === looped.length - 1) {
      setTimeout(() => {
        listRef.current?.scrollToOffset({
          offset: offsetFor(1),
          animated: false,
        });
        loopedIdxRef.current = 1;
      }, 50);
    }
  };

  if (N === 0) return null;

  return (
    <View style={[styles.wrapper, style]}>
      <FlatList
        ref={listRef}
        data={looped}
        keyExtractor={(_, i) => String(i)}
        horizontal
        showsHorizontalScrollIndicator={false}
        snapToInterval={step}
        decelerationRate="fast"
        contentContainerStyle={styles.content}
        ItemSeparatorComponent={() => <View style={{ width: GAP }} />}
        scrollEventThrottle={16}
        getItemLayout={(_, index) => ({
          length: SLIDE_W,
          offset: PEEK + index * step,
          index,
        })}
        onMomentumScrollEnd={onMomentumEnd}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[styles.slide, { height }]}
            activeOpacity={item.ctaLink ? 0.85 : 1}
            onPress={() => onPress?.(item)}
          >
            <Image
              source={{ uri: `${BACKEND_URL}${item.imageUrl}` }}
              style={[styles.image, { borderRadius: BorderRadius.xl }]}
              contentFit="cover"
            />
          </TouchableOpacity>
        )}
      />

      {N > 1 && (
        <View style={styles.dotsRow}>
          {banners.map((_, i) => (
            <View
              key={i}
              style={[styles.dot, i === activeIndex && styles.dotActive]}
            />
          ))}
        </View>
      )}
    </View>
  );
});

const styles = StyleSheet.create({
  wrapper: { marginTop: Spacing.md },
  content: { paddingHorizontal: PEEK },
  slide: { width: SLIDE_W },
  image: { width: "100%", height: "100%" },
  dotsRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 6,
    marginTop: Spacing.sm,
  },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: Colors.border },
  dotActive: { width: 18, backgroundColor: Colors.primary },
});
