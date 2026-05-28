import { useEffect, useState } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import i18n from '../src/i18n';
import { loadLanguage } from '../src/lib/storage';
import { palette } from '../src/theme/tokens';

// Hold the native splash until fonts + i18n are ready so the user
// doesn't see a flash of fallback typography.
SplashScreen.preventAutoHideAsync().catch(() => {
  /* already prevented */
});

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    // Static Pretendard variants — variable + fontWeight on RN was
    // unreliable (rendered SemiBold even when fontWeight=700 was set),
    // so every Text uses an explicit fontFamily. See tokens.ts `fonts`.
    'Pretendard-Regular': require('../assets/fonts/Pretendard-Regular.otf'),
    'Pretendard-Medium': require('../assets/fonts/Pretendard-Medium.otf'),
    'Pretendard-SemiBold': require('../assets/fonts/Pretendard-SemiBold.otf'),
    'Pretendard-Bold': require('../assets/fonts/Pretendard-Bold.otf'),
  });
  // A persisted user choice (from the dev toggle on Home) wins over
  // the device-detected locale that i18n initialized with.
  const [languageReady, setLanguageReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const stored = await loadLanguage();
      if (cancelled) return;
      if (stored && stored !== i18n.language) {
        await i18n.changeLanguage(stored);
      }
      setLanguageReady(true);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const ready = (fontsLoaded || !!fontError) && languageReady;

  useEffect(() => {
    if (ready) {
      SplashScreen.hideAsync().catch(() => {
        /* already hidden */
      });
    }
  }, [ready]);

  if (!ready) {
    return null;
  }

  return (
    <SafeAreaProvider>
      <StatusBar style="dark" />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: palette.cream },
          animation: 'fade',
        }}
      />
    </SafeAreaProvider>
  );
}
