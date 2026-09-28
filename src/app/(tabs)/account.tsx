import { router } from 'expo-router';
import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { AppHeader } from '@/components/ui/AppHeader';
import { Button } from '@/components/ui/Button';
import { BorderRadius, Colors, PoppinsFonts, Spacing } from '@/constants/theme';
import { useAuth } from '@/hooks/useAuth';

export default function AccountScreen() {
  const { user, isLoggedIn, logout } = useAuth();

  const handleLogout = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: async () => {
          await logout();
          router.replace('/(tabs)/home');
        },
      },
    ]);
  };

  if (!isLoggedIn) {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <AppHeader />
        <View style={styles.content}>
          <View style={styles.avatar}>
            <Ionicons name="person-outline" size={44} color={Colors.primary} />
          </View>
          <Text style={styles.name}>You&apos;re browsing as a guest</Text>
          <Text style={styles.email}>Log in to see your account, orders, and wishlist</Text>
          <Button
            title="LOGIN / SIGN UP"
            onPress={() => router.push('/(auth)/login')}
            style={styles.logoutBtn}
          />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <AppHeader />
      <View style={styles.content}>
        <View style={styles.avatar}>
          <Ionicons name="person" size={44} color={Colors.primary} />
        </View>
        <Text style={styles.name}>{user?.name}</Text>
        <Text style={styles.email}>{user?.email || ''}</Text>

        <View style={styles.menu}>
          {[
            { icon: 'heart-outline' as const, label: 'Wishlist' },
            { icon: 'bag-outline' as const, label: 'Orders' },
            { icon: 'location-outline' as const, label: 'Addresses' },
            { icon: 'settings-outline' as const, label: 'Settings' },
          ].map((item) => (
            <TouchableOpacity key={item.label} style={styles.menuItem}>
              <Ionicons name={item.icon} size={20} color={Colors.textPrimary} />
              <Text style={styles.menuLabel}>{item.label}</Text>
              <Ionicons name="chevron-forward" size={16} color={Colors.textSecondary} />
            </TouchableOpacity>
          ))}
        </View>

        <Button title="SIGN OUT" variant="outline" onPress={handleLogout} style={styles.logoutBtn} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  content: {
    flex: 1,
    padding: Spacing.xl,
    alignItems: 'center',
    gap: Spacing.md,
  },
  avatar: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: Colors.goldLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: Spacing.xl,
  },
  name: {
    fontSize: 20,
    fontFamily: PoppinsFonts.bold,
    color: Colors.textPrimary,
  },
  email: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: -8,
  },
  menu: {
    alignSelf: 'stretch',
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
    marginTop: Spacing.md,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    padding: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  menuLabel: {
    flex: 1,
    fontSize: 15,
    color: Colors.textPrimary,
  },
  logoutBtn: {
    alignSelf: 'stretch',
    marginTop: Spacing.md,
  },
});
