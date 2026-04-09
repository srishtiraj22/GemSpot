/**
 * Root Layout — Auth-gated: shows welcome screen unless logged in
 * Role-based routing: creators → (creator-tabs), viewers → (tabs)
 * Wrapped with AppThemeProvider for dark/light mode
 */

import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import * as Font from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { useState } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import 'react-native-reanimated';

import { AuthProvider, useAuth } from '@/contexts/auth-context';
import { AppThemeProvider, useTheme } from '@/contexts/theme-context';
import { Colors } from '@/constants/theme';

SplashScreen.preventAutoHideAsync();

export const unstable_settings = {
  anchor: '(tabs)',
};

function AuthGate() {
  const { isAuthenticated, isLoading, user } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;

    const inAuthGroup = segments[0] === 'auth' || segments[0] === 'welcome';

    if (!isAuthenticated && !inAuthGroup) {
      // Not logged in and trying to access protected route → redirect to welcome
      router.replace('/welcome' as any);
    } else if (isAuthenticated && inAuthGroup) {
      // Logged in but on auth/welcome screen → route based on role
      if (user?.role === 'creator') {
        router.replace('/(creator-tabs)' as any);
      } else {
        router.replace('/(tabs)' as any);
      }
    }
  }, [isAuthenticated, isLoading, segments]);

  if (isLoading) {
    return (
      <View style={styles.loadingScreen}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  return null;
}

function InnerLayout() {
  const { isDark } = useTheme();

  return (
    <ThemeProvider value={isDark ? DarkTheme : DefaultTheme}>
      <AuthGate />
      <Stack screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
        <Stack.Screen name="welcome" options={{ animation: 'fade' }} />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="(creator-tabs)" />
        <Stack.Screen
          name="video/[id]"
          options={{ animation: 'slide_from_bottom', presentation: 'card' }}
        />
        <Stack.Screen name="creator/[id]" />
        <Stack.Screen name="brand-deals" />
        <Stack.Screen name="shop" />
        <Stack.Screen
          name="auth/login"
          options={{ animation: 'fade', presentation: 'modal' }}
        />
        <Stack.Screen
          name="auth/signup"
          options={{ animation: 'fade', presentation: 'modal' }}
        />
      </Stack>
      <StatusBar style={isDark ? 'light' : 'dark'} />
    </ThemeProvider>
  );
}

export default function RootLayout() {
  const [fontsLoaded, setFontsLoaded] = useState(false);

  useEffect(() => {
    async function loadFonts() {
      try {
        await Font.loadAsync({
          Inter_300Light: require('@expo-google-fonts/inter/300Light/Inter_300Light.ttf'),
          Inter_400Regular: require('@expo-google-fonts/inter/400Regular/Inter_400Regular.ttf'),
          Inter_500Medium: require('@expo-google-fonts/inter/500Medium/Inter_500Medium.ttf'),
          Inter_600SemiBold: require('@expo-google-fonts/inter/600SemiBold/Inter_600SemiBold.ttf'),
          Inter_700Bold: require('@expo-google-fonts/inter/700Bold/Inter_700Bold.ttf'),
        });
        setFontsLoaded(true);
      } catch (e) {
        console.warn('Font loading failed, using system fonts:', e);
        setFontsLoaded(true);
      }
    }
    loadFonts();
  }, []);

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) return null;

  return (
    <AuthProvider>
      <AppThemeProvider>
        <InnerLayout />
      </AppThemeProvider>
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  loadingScreen: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: Colors.backgroundDark,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 999,
  },
});
