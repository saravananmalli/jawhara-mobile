import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import { createContext, PropsWithChildren, useContext, useEffect, useState } from 'react';
import { setAuthToken } from '@/services/api';
import { useCartStore } from '@/store/cartStore';
import { useWishlistStore } from '@/store/wishlistStore';

const TOKEN_KEY = 'jawhara_auth_token';
const USER_KEY = 'jawhara_user';

/* Platform-aware storage: SecureStore on native, localStorage on web */
const storage = {
  get: async (key: string): Promise<string | null> => {
    if (Platform.OS === 'web') {
      return localStorage.getItem(key);
    }
    return SecureStore.getItemAsync(key);
  },
  set: async (key: string, value: string): Promise<void> => {
    if (Platform.OS === 'web') {
      localStorage.setItem(key, value);
      return;
    }
    await SecureStore.setItemAsync(key, value);
  },
  remove: async (key: string): Promise<void> => {
    if (Platform.OS === 'web') {
      localStorage.removeItem(key);
      return;
    }
    await SecureStore.deleteItemAsync(key);
  },
};

export interface AuthUser {
  id: string;
  email: string;
  name: string;
}

interface AuthContextValue {
  isLoading: boolean;
  isLoggedIn: boolean;
  token: string | null;
  user: AuthUser | null;
  login: (token: string, user: AuthUser) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: PropsWithChildren) {
  const [isLoading, setIsLoading] = useState(true);
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<AuthUser | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const stored = await storage.get(TOKEN_KEY);
        const storedUser = await storage.get(USER_KEY);
        if (stored) {
          setToken(stored);
          setAuthToken(stored);
          useWishlistStore.getState().loadWishlist();
          useCartStore.getState().loadCart();
        }
        if (storedUser) {
          setUser(JSON.parse(storedUser));
        }
      } catch {
        // ignore read errors on first launch
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  const login = async (newToken: string, newUser: AuthUser) => {
    await storage.set(TOKEN_KEY, newToken);
    await storage.set(USER_KEY, JSON.stringify(newUser));
    setAuthToken(newToken);
    setToken(newToken);
    setUser(newUser);
    await Promise.all([
      useWishlistStore.getState().loadWishlist(),
      useCartStore.getState().loadCart(),
    ]);
  };

  const logout = async () => {
    await storage.remove(TOKEN_KEY);
    await storage.remove(USER_KEY);
    setAuthToken(null);
    setToken(null);
    setUser(null);
    // Each account's Cart/Wishlist must never leak to the next user on this device.
    useWishlistStore.getState().clearWishlist();
    useCartStore.getState().clearCart();
  };

  return (
    <AuthContext.Provider value={{ isLoading, isLoggedIn: !!token, token, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
