import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { View, useColorScheme } from 'react-native';

import { AnimatedSplashOverlay } from '@/components/animated-icon';
import { I18nProvider } from '@/i18n';
import { StoreProvider, useStore } from '@/store/store-provider';

SplashScreen.preventAutoHideAsync();

function RootStack() {
  return (
    <Stack>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="task/new" options={{ presentation: 'card' }} />
      <Stack.Screen name="task/[id]" options={{ presentation: 'card' }} />
      <Stack.Screen name="category/new" options={{ presentation: 'card' }} />
      <Stack.Screen name="category/[id]" options={{ presentation: 'card' }} />
      <Stack.Screen name="queues" options={{ presentation: 'card', headerShown: false }} />
      <Stack.Screen name="categories" options={{ presentation: 'card', headerShown: false }} />
      <Stack.Screen name="settings" options={{ presentation: 'card', headerShown: false }} />
      <Stack.Screen name="statistics" options={{ presentation: 'card', headerShown: false }} />
      <Stack.Screen name="import" options={{ presentation: 'card', headerShown: false }} />
      <Stack.Screen name="situation/new" options={{ presentation: 'card' }} />
      <Stack.Screen name="situation/[id]" options={{ presentation: 'card' }} />
      <Stack.Screen name="note/new" options={{ presentation: 'card' }} />
      <Stack.Screen name="note/[id]" options={{ presentation: 'card' }} />
    </Stack>
  );
}

/** Waits for persisted data, then mounts the app localized with the stored language. */
function AppGate() {
  const { loaded, settings } = useStore();
  if (!loaded) return <View style={{ flex: 1 }} />;
  return (
    <I18nProvider language={settings.language}>
      <RootStack />
    </I18nProvider>
  );
}

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <StoreProvider>
        <AnimatedSplashOverlay />
        <AppGate />
        <StatusBar style="auto" />
      </StoreProvider>
    </ThemeProvider>
  );
}
