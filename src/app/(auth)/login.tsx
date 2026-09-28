import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useRef, useState } from "react";
import {
  Animated,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { BorderRadius, Colors, PoppinsFonts, Spacing } from "@/constants/theme";
import { api } from "@/services/api";
import { useAuth } from "@/hooks/useAuth";
import { usePendingActionStore } from "@/store/pendingActionStore";

import googleIcon from "@/assets/images/socialmedia/google.png";

function resumeAfterLogin() {
  const pending = usePendingActionStore.getState().action;
  usePendingActionStore.getState().setAction(null);
  if (pending) pending();
  if (router.canGoBack()) {
    router.back();
  } else {
    router.replace("/(tabs)/home");
  }
}

const GOLD = "#967123";

export default function AuthScreen() {
  const { login } = useAuth();
  const [activeTab, setActiveTab] = useState<"login" | "register">("login");
  const [error, setError] = useState("");

  // Login state
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);

  // Register state
  const [name, setName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [regLoading, setRegLoading] = useState(false);

  // Animations
  const tabSlide = useRef(new Animated.Value(0)).current; // 0 = login, 1 = register
  const formOpacity = useRef(new Animated.Value(1)).current;

  const switchTab = (tab: "login" | "register") => {
    if (tab === activeTab) return;
    const toValue = tab === "login" ? 0 : 1;

    Animated.timing(formOpacity, {
      toValue: 0,
      duration: 140,
      useNativeDriver: true,
    }).start(() => {
      setActiveTab(tab);
      Animated.parallel([
        Animated.spring(tabSlide, {
          toValue,
          useNativeDriver: false,
          tension: 140,
          friction: 16,
        }),
        Animated.timing(formOpacity, {
          toValue: 1,
          duration: 180,
          useNativeDriver: true,
        }),
      ]).start();
    });
  };

  const handleLogin = async () => {
    setError("");
    if (!loginEmail || !loginPassword) {
      setError("Please fill in email and password.");
      return;
    }
    setLoginLoading(true);
    try {
      const res = await api.login(loginEmail, loginPassword);
      await login(res.token, res.user);
      resumeAfterLogin();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Login failed.");
    } finally {
      setLoginLoading(false);
    }
  };

  const handleRegister = async () => {
    setError("");
    if (!name || !regEmail || !regPassword) {
      setError("Please fill in all fields.");
      return;
    }
    if (regPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    setRegLoading(true);
    try {
      const res = await api.register(name, regEmail, regPassword);
      await login(res.token, res.user);
      resumeAfterLogin();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Registration failed.");
    } finally {
      setRegLoading(false);
    }
  };

  const isLogin = activeTab === "login";

  const tabIndicatorLeft = tabSlide.interpolate({
    inputRange: [0, 1],
    outputRange: ["0%", "50%"],
  });

  return (
    <SafeAreaView style={styles.safe} edges={["top", "bottom"]}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Title */}
          <Text style={styles.title}>
            {isLogin ? "Begin Your Jewellery Journey" : "Create an Account"}
          </Text>

          {/* Subtitle */}
          {isLogin ? (
            <Text style={styles.subtitle}>Login to your account</Text>
          ) : (
            <View style={styles.subtitleRow}>
              <Text style={styles.subtitleText}>Already have an account? </Text>
              <TouchableOpacity onPress={() => switchTab("login")}>
                <Text style={styles.subtitleLink}>Login</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* ── Tab switcher ── */}
          <View style={styles.tabWrap}>
            {/* Sliding gold indicator */}
            <Animated.View style={[styles.tabIndicator, { left: tabIndicatorLeft }]} />

            <TouchableOpacity
              style={styles.tab}
              onPress={() => switchTab("login")}
              activeOpacity={0.85}
            >
              <Text style={[styles.tabText, isLogin && styles.tabTextActive]}>LOGIN</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.tab}
              onPress={() => switchTab("register")}
              activeOpacity={0.85}
            >
              <Text style={[styles.tabText, !isLogin && styles.tabTextActive]}>REGISTER</Text>
            </TouchableOpacity>
          </View>

          {/* ── Form (crossfades on switch) ── */}
          <Animated.View style={{ opacity: formOpacity }}>
            <View style={styles.fields}>
              {isLogin ? (
                <>
                  <Input
                    placeholder="Email id / Mobile Number"
                    value={loginEmail}
                    onChangeText={setLoginEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                  />
                  <Input
                    placeholder="Password"
                    value={loginPassword}
                    onChangeText={setLoginPassword}
                    isPassword
                  />
                  <TouchableOpacity
                    style={styles.forgotWrap}
                    onPress={() => setError("Password reset coming soon.")}
                  >
                    <Text style={styles.forgotText}>Forgot Password?</Text>
                  </TouchableOpacity>
                </>
              ) : (
                <>
                  <Input
                    placeholder="Full name"
                    value={name}
                    onChangeText={setName}
                    autoCapitalize="words"
                  />
                  <Input
                    placeholder="Email"
                    value={regEmail}
                    onChangeText={setRegEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                  />
                  <Input
                    placeholder="Password"
                    value={regPassword}
                    onChangeText={setRegPassword}
                    isPassword
                  />
                  <Input
                    placeholder="Confirm Password"
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    isPassword
                  />
                </>
              )}
            </View>

            {/* Error message */}
            {error ? <Text style={styles.errorText}>{error}</Text> : null}

            {/* Action button */}
            <Button
              title={isLogin ? "LOGIN" : "CREATE ACCOUNT"}
              onPress={isLogin ? handleLogin : handleRegister}
              loading={isLogin ? loginLoading : regLoading}
              style={styles.mainBtn}
            />

            {/* Divider */}
            <View style={styles.dividerRow}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>or continue with</Text>
              <View style={styles.dividerLine} />
            </View>

            {/* Social buttons */}
            <View style={styles.socialRow}>
              <TouchableOpacity style={styles.socialBtn}>
                <Image source={googleIcon} style={styles.socialIcon} resizeMode="contain" />
                <Text style={styles.socialText}>Google</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.socialBtn}>
                <Ionicons name="logo-apple" size={20} color="#000" />
                <Text style={styles.socialText}>Apple</Text>
              </TouchableOpacity>
            </View>

            {/* Bottom link (login tab only) */}
            {isLogin && (
              <View style={styles.bottomRow}>
                <Text style={styles.bottomText}>Don't have an account? </Text>
                <TouchableOpacity onPress={() => switchTab("register")}>
                  <Text style={styles.bottomLink}>Sign up</Text>
                </TouchableOpacity>
              </View>
            )}
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scroll: {
    flexGrow: 1,
    paddingHorizontal: Spacing.xl,
    paddingTop: 40,
    paddingBottom: Spacing.xl,
    gap: Spacing.lg,
  },
  title: {
    fontSize: 26,
    fontFamily: PoppinsFonts.bold,
    color: GOLD,
    textAlign: "center",
    lineHeight: 34,
  },
  subtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: "center",
    marginTop: -Spacing.sm,
  },
  subtitleRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: -Spacing.sm,
  },
  subtitleText: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  subtitleLink: {
    fontSize: 14,
    color: GOLD,
    fontFamily: PoppinsFonts.semibold,
  },

  /* Tab switcher */
  tabWrap: {
    flexDirection: "row",
    backgroundColor: "#F5EFE6",
    borderRadius: BorderRadius.full,
    padding: 4,
    position: "relative",
  },
  tabIndicator: {
    position: "absolute",
    top: 4,
    bottom: 4,
    width: "50%",
    backgroundColor: GOLD,
    borderRadius: BorderRadius.full,
  },
  tab: {
    flex: 1,
    height: 48,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1,
  },
  tabText: {
    fontSize: 14,
    fontFamily: PoppinsFonts.semibold,
    color: Colors.textSecondary,
    letterSpacing: 0.5,
  },
  tabTextActive: {
    color: "#FFFFFF",
  },

  /* Form */
  fields: {
    gap: Spacing.md,
    marginBottom: Spacing.lg,
  },
  forgotWrap: {
    alignSelf: "flex-end",
  },
  forgotText: {
    fontSize: 13,
    color: GOLD,
    fontFamily: PoppinsFonts.medium,
  },
  errorText: {
    fontSize: 13,
    color: Colors.error,
    textAlign: "center",
    marginBottom: Spacing.sm,
  },
  mainBtn: {
    alignSelf: "stretch",
    marginBottom: Spacing.lg,
  },
  dividerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: Colors.border,
  },
  dividerText: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  socialRow: {
    flexDirection: "row",
    gap: Spacing.md,
  },
  socialBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    height: 52,
    borderRadius: BorderRadius.full,
    backgroundColor: "#F2F2F2",
  },
  socialIcon: {
    width: 20,
    height: 20,
  },
  socialText: {
    fontSize: 15,
    fontFamily: PoppinsFonts.medium,
    color: Colors.textPrimary,
  },
  bottomRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: Spacing.md,
  },
  bottomText: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  bottomLink: {
    fontSize: 14,
    color: GOLD,
    fontFamily: PoppinsFonts.semibold,
  },
});
