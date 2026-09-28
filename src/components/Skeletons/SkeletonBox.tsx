import { LinearGradient } from 'expo-linear-gradient';
import { memo, useEffect } from 'react';
import { Animated, Dimensions, Easing, StyleSheet, View, ViewStyle } from 'react-native';

const SCREEN_W = Dimensions.get('window').width;
const SHIMMER_W = 220;

// ── Shared shimmer — one animation loop drives every SkeletonBox on screen ────
const shimmerX = new Animated.Value(-SHIMMER_W);
let mountedCount = 0;
let activeLoop: Animated.CompositeAnimation | null = null;

function startLoop() {
  if (activeLoop) return;
  activeLoop = Animated.loop(
    Animated.timing(shimmerX, {
      toValue: SCREEN_W,
      duration: 1300,
      easing: Easing.linear,
      useNativeDriver: true,
    }),
  );
  activeLoop.start();
}

function stopLoop() {
  if (!activeLoop) return;
  activeLoop.stop();
  activeLoop = null;
  shimmerX.setValue(-SHIMMER_W);
}
// ─────────────────────────────────────────────────────────────────────────────

interface SkeletonBoxProps {
  style?: ViewStyle;
  borderRadius?: number;
}

export const SkeletonBox = memo(function SkeletonBox({
  style,
  borderRadius = 6,
}: SkeletonBoxProps) {
  useEffect(() => {
    mountedCount++;
    if (mountedCount === 1) startLoop();
    return () => {
      mountedCount--;
      if (mountedCount === 0) stopLoop();
    };
  }, []);

  return (
    <View style={[styles.base, { borderRadius }, style]}>
      <Animated.View style={[styles.shimmer, { transform: [{ translateX: shimmerX }] }]}>
        <LinearGradient
          colors={['transparent', 'rgba(255,255,255,0.62)', 'transparent']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.gradient}
        />
      </Animated.View>
    </View>
  );
});

const styles = StyleSheet.create({
  base: {
    backgroundColor: '#EBEBEB',
    overflow: 'hidden',
  },
  shimmer: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    width: SHIMMER_W,
  },
  gradient: {
    width: '100%',
    height: '100%',
  },
});
