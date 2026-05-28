import { useState } from 'react';
import { Pressable, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import Svg, { Defs, Ellipse, FeGaussianBlur, Filter, G } from 'react-native-svg';

import { BrandMark } from '../src/components/BrandMark';
import { loadChildProfile } from '../src/lib/storage';
import {
  palette,
  splashBase,
  splashBlurStd,
  splashFogOpacity,
  splashFogScale,
  splashGlow,
  type,
} from '../src/theme/tokens';

// Splash screen — mockup-warm.html lines 1067-1101.
// Tap CTA → if a child profile exists, go straight to /home; else /onboarding.
export default function Splash() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const { width: W, height: H } = useWindowDimensions();
  const [busy, setBusy] = useState(false);

  async function handleStart() {
    if (busy) return;
    setBusy(true);
    const profile = await loadChildProfile();
    if (profile) {
      router.replace('/home');
    } else {
      router.replace('/onboarding');
    }
  }

  // Scale-from-center so the fog group bleeds slightly past every edge,
  // matching .splash-bg { transform: scale(1.15) } in the mockup.
  const cx = W / 2;
  const cy = H / 2;
  const fogTransform = `translate(${cx} ${cy}) scale(${splashFogScale}) translate(${-cx} ${-cy})`;

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* === Layer 1: full-screen base gradient — the always-present warm wash === */}
      <LinearGradient
        colors={splashBase.colors as unknown as readonly [string, string, ...string[]]}
        locations={splashBase.locations as unknown as readonly [number, number, ...number[]]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />

      {/* === Layer 2: real Gaussian-blurred corner ellipses (SVG filter) ===
        Mirrors mockup's .splash-bg { filter: blur(28px); opacity: 0.7;
        transform: scale(1.15) }. The filter region is expanded so the
        blur kernel has room to bleed past each ellipse's bbox. */}
      <Svg
        width={W}
        height={H}
        style={StyleSheet.absoluteFill}
        pointerEvents="none"
      >
        <Defs>
          <Filter
            id="splash-blur"
            x="-50%"
            y="-50%"
            width="200%"
            height="200%"
          >
            <FeGaussianBlur stdDeviation={splashBlurStd} />
          </Filter>
        </Defs>
        <G
          opacity={splashFogOpacity}
          transform={fogTransform}
          filter="url(#splash-blur)"
        >
          <Ellipse
            cx={W * 0.05}
            cy={H * 0.06}
            rx={W * 0.32}
            ry={H * 0.16}
            fill={splashGlow.topLeft.color}
          />
          <Ellipse
            cx={W * 0.95}
            cy={H * 0.1}
            rx={W * 0.32}
            ry={H * 0.14}
            fill={splashGlow.topRight.color}
          />
          <Ellipse
            cx={W * 0.05}
            cy={H * 0.78}
            rx={W * 0.32}
            ry={H * 0.18}
            fill={splashGlow.bottomLeft.color}
          />
          <Ellipse
            cx={W * 0.95}
            cy={H * 0.92}
            rx={W * 0.34}
            ry={H * 0.18}
            fill={splashGlow.bottomRight.color}
          />
        </G>
      </Svg>

      {/* === Layer 3: content (left-aligned, vertically centered) === */}
      <View style={styles.content}>
        <BrandMark size={64} />
        <Text style={styles.wordmark}>{t('splash.wordmark')}</Text>
        {/* Hard line break per design — never auto-wrapped. */}
        <Text style={styles.tagline} allowFontScaling={false}>
          {t('splash.taglineLine1')}
        </Text>
        <Text style={styles.tagline} allowFontScaling={false}>
          {t('splash.taglineLine2')}
        </Text>
      </View>

      {/* === CTA + legal === */}
      <View style={[styles.ctaBlock, { paddingBottom: Math.max(insets.bottom, 0) + 32 }]}>
        <Pressable
          onPress={handleStart}
          style={({ pressed }) => [styles.cta, pressed && styles.ctaPressed]}
          accessibilityRole="button"
          accessibilityLabel={t('splash.cta')}
        >
          <Text style={styles.ctaLabel}>{t('splash.cta')}</Text>
        </Pressable>
        <Text style={styles.legal}>
          {t('splash.legalPrefix')}
          <Text style={styles.legalLink}>{t('splash.legalTerms')}</Text>
          {t('splash.legalAnd')}
          <Text style={styles.legalLink}>{t('splash.legalPrivacy')}</Text>
          {t('splash.legalSuffix')}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: palette.cream,
  },
  // -- centered content ------------------------------------------
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'flex-start',
    paddingHorizontal: 32,
  },
  wordmark: {
    marginTop: 24,
    marginBottom: 16,
    color: palette.inkSoft,
    ...type.wordmark,
  },
  tagline: {
    color: palette.ink,
    // type.tagline = Pretendard-Bold 22/30. Solid/heavy per design,
    // distinct from the SemiBold body weight elsewhere on the screen.
    ...type.tagline,
  },
  // -- CTA + legal -----------------------------------------------
  ctaBlock: {
    paddingHorizontal: 32,
  },
  cta: {
    height: 52,
    borderRadius: 26,
    backgroundColor: palette.ink,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ctaPressed: {
    opacity: 0.85,
  },
  ctaLabel: {
    color: palette.creamSoft,
    ...type.pillLabel,
  },
  legal: {
    marginTop: 16,
    textAlign: 'center',
    color: palette.inkFaint,
    ...type.legal,
  },
  legalLink: {
    color: palette.inkSoft,
    textDecorationLine: 'underline',
    ...type.legal,
  },
});
