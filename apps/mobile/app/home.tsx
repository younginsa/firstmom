import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';

import {
  type ChildProfile,
  clearChildProfile,
  loadChildProfile,
  saveLanguage,
} from '../src/lib/storage';
import { englishAgeLabel, koreanAgeLabel } from '../src/lib/stage';
import { palette, type } from '../src/theme/tokens';

/**
 * M1 placeholder Home. Header is `{childName} {age}` (matching mockup
 * screen 3, lines 1164-1248). Stage shows as a soft-yellow pill below
 * the title; concerns chips below that. Daily-message card, intent
 * grid, tab bar, and settings gear are explicitly deferred to v1.1+
 * milestones — not added here.
 */
export default function Home() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { t, i18n } = useTranslation();
  const [profile, setProfile] = useState<ChildProfile | null>(null);

  useEffect(() => {
    loadChildProfile().then(setProfile);
  }, []);

  async function handleReset() {
    await clearChildProfile();
    router.replace('/');
  }

  async function handleToggleLanguage() {
    const next = i18n.language === 'ko' ? 'en' : 'ko';
    await i18n.changeLanguage(next);
    await saveLanguage(next);
  }

  if (!profile) {
    return (
      <View style={[styles.root, { paddingTop: insets.top + 48 }]}>
        <Text style={styles.loading}>…</Text>
      </View>
    );
  }

  const ageLabel =
    i18n.language === 'ko'
      ? koreanAgeLabel(profile.birthdate)
      : englishAgeLabel(profile.birthdate);
  const stageLabel = t(`stage.${profile.stage}`);
  const stageBadge = t('home.stageBadge', { name: profile.childName, stage: stageLabel });

  return (
    <View style={[styles.root, { paddingTop: insets.top + 32 }]}>
      <Text style={styles.title}>
        {profile.childName} {ageLabel}
      </Text>

      <View style={styles.stagePill}>
        <Text style={styles.stagePillText} allowFontScaling={false}>
          {stageBadge}
        </Text>
      </View>

      {profile.concerns.length > 0 && (
        <View style={styles.concernsBlock}>
          <Text style={styles.concernsOverline}>
            {i18n.language === 'ko' ? '관심사' : 'Concerns'}
          </Text>
          <Text style={styles.concernsList}>
            {profile.concerns.map((c) => t(`onboarding.concerns.${c}`)).join(' · ')}
          </Text>
        </View>
      )}

      <View style={{ flex: 1 }} />

      <View style={styles.devRow}>
        <Pressable
          onPress={handleReset}
          style={({ pressed }) => [styles.devBtn, pressed && { opacity: 0.7 }]}
        >
          <Text style={styles.devLabel}>
            {i18n.language === 'ko' ? '프로필 초기화 (개발용)' : 'Reset profile (dev)'}
          </Text>
        </Pressable>
        <Pressable
          onPress={handleToggleLanguage}
          style={({ pressed }) => [styles.devBtn, pressed && { opacity: 0.7 }]}
        >
          <Text style={styles.devLabel}>{t('home.devLangToggle')}</Text>
        </Pressable>
      </View>

      <View style={{ height: insets.bottom + 16 }} />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: palette.cream,
    paddingHorizontal: 28,
  },
  loading: {
    color: palette.inkFaint,
    textAlign: 'center',
    ...type.display,
  },
  // -- page header --------------------------------------------------
  title: {
    color: palette.ink,
    marginBottom: 16,
    ...type.display,
  },
  // -- soft-yellow stage badge pill --------------------------------
  stagePill: {
    alignSelf: 'flex-start',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 999,
    backgroundColor: palette.goldSoft,
  },
  stagePillText: {
    color: palette.ink,
    ...type.bodyMedium,
  },
  // -- concerns block ----------------------------------------------
  concernsBlock: {
    marginTop: 28,
  },
  concernsOverline: {
    color: palette.inkFaint,
    textTransform: 'uppercase',
    marginBottom: 8,
    ...type.overline,
  },
  concernsList: {
    color: palette.ink,
    ...type.bodyMedium,
  },
  // -- dev affordances ---------------------------------------------
  devRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  devBtn: {
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  devLabel: {
    color: palette.inkFaint,
    textDecorationLine: 'underline',
    ...type.small,
  },
});
