import { Button } from "@/components/ui/Button";
import { BorderRadius, Colors, PoppinsFonts, Spacing } from "@/constants/theme";
import { useAuth } from "@/hooks/useAuth";
import { api, BACKEND_URL, OnboardingSlide } from "@/services/api";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import fallbackHero from "@/assets/images/onboarding-hero.jpg";

const GOLD = "#967123";

export default function OnboardingScreen() {
  const { isLoggedIn } = useAuth();

  const [slides, setSlides] = useState<OnboardingSlide[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  const fadeAnim = useRef(new Animated.Value(1)).current;

  const currentSlide = slides[activeIndex];
  const isLastSlide = slides.length > 0 && activeIndex === slides.length - 1;

  useEffect(() => {
    api
      .getOnboardingSlides()
      .then((data) => setSlides(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const changeSlide = (newIndex: number) => {
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start(() => {
      setActiveIndex(newIndex);
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 250,
        useNativeDriver: true,
      }).start();
    });
  };

  const handleSkip = () => router.push("/(auth)/login");
  const handleNext = () => {
    if (activeIndex < slides.length - 1) changeSlide(activeIndex + 1);
  };
  const handleBack = () => {
    if (activeIndex > 0) changeSlide(activeIndex - 1);
  };
  const handleExplore = () =>
    router.push(isLoggedIn ? "/(tabs)/home" : "/(auth)/login");

  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator color={GOLD} size="large" />
      </View>
    );
  }

  const imageSource = currentSlide
    ? { uri: `${BACKEND_URL}${currentSlide.imageUrl}` }
    : fallbackHero;

  return (
    <>
      <StatusBar style="light" />

      {/* Outer container — image extends behind status bar */}
      <View style={styles.root}>
        {/* ── IMAGE AREA ── */}
        <View style={styles.imageArea}>
          <Animated.Image
            source={imageSource}
            style={[StyleSheet.absoluteFill, { opacity: fadeAnim }]}
            resizeMode="cover"
          />

          {/* Skip pill — top-right, below status bar */}
          <SafeAreaView edges={["top"]} style={styles.skipSafe}>
            <TouchableOpacity
              onPress={handleSkip}
              style={styles.skipBtn}
              activeOpacity={0.75}
            >
              <Text style={styles.skipText}>Skip</Text>
            </TouchableOpacity>
          </SafeAreaView>
        </View>

        {/* ── CONTENT CARD ── */}
        <SafeAreaView edges={["bottom"]} style={styles.card}>
          {/* Title + Description */}
          <Animated.View style={{ opacity: fadeAnim }}>
            <Text style={styles.title} numberOfLines={2}>
              {currentSlide?.title ?? "No hassle, try before you buy!"}
            </Text>
            <Text style={styles.description} numberOfLines={3}>
              {currentSlide?.description ??
                "Shortlist your favorite design online and choose to try them at home or visit your nearest store."}
            </Text>
          </Animated.View>

          {/* Dot indicators */}
          {slides.length > 1 && (
            <View style={styles.dots}>
              {slides.map((_, i) => (
                <View
                  key={i}
                  style={[styles.dot, i === activeIndex && styles.dotActive]}
                />
              ))}
            </View>
          )}

          {/* Buttons — always two columns, left empty on first screen */}
          <View style={styles.btnRow}>
            {activeIndex === 0 ? (
              <View style={styles.halfBtn} />
            ) : (
              <Button
                title="BACK"
                variant="outline"
                onPress={handleBack}
                style={styles.halfBtn}
              />
            )}
            <Button
              title={isLastSlide ? "SEE COLLECTIONS" : "NEXT"}
              onPress={isLastSlide ? handleExplore : handleNext}
              style={styles.halfBtn}
            />
          </View>
        </SafeAreaView>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  loader: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.background,
  },
  root: {
    flex: 1,
    backgroundColor: Colors.background,
  },

  /* Image */
  imageArea: {
    flex: 1,
  },
  skipSafe: {
    position: "absolute",
    top: 0,
    right: 0,
  },
  skipBtn: {
    margin: Spacing.md,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.75)",
    borderRadius: BorderRadius.full,
    paddingHorizontal: 14,
    paddingVertical: 5,
    backgroundColor: "rgba(255,255,255,0.15)",
  },
  skipText: {
    fontSize: 13,
    fontFamily: PoppinsFonts.medium,
    color: "#FFFFFF",
  },

  /* Content card */
  card: {
    backgroundColor: Colors.background,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.xl,
    paddingBottom: Spacing.md,
    gap: Spacing.lg,
    alignItems: "center",
  },
  title: {
    fontSize: 18,
    fontFamily: PoppinsFonts.bold,
    color: GOLD,
    letterSpacing: 0.2,
    marginBottom: 6,
    fontStyle: "italic",
    textAlign: "center",
  },
  description: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 22,
    textAlign: "center",
  },
  dots: {
    flexDirection: "row",
    gap: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.border,
  },
  dotActive: {
    width: 28,
    backgroundColor: GOLD,
    borderRadius: BorderRadius.full,
  },

  /* Buttons */
  btnRow: {
    flexDirection: "row",
    gap: Spacing.md,
    alignSelf: "stretch",
  },
  halfBtn: {
    flex: 1,
  },
});
