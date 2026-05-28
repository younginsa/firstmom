import { useCallback, useEffect, useRef, useState } from 'react';
import {
  Animated,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import DateTimePicker, {
  type DateTimePickerEvent,
} from '@react-native-community/datetimepicker';
import { useRouter } from 'expo-router';
import Svg, { Path } from 'react-native-svg';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';

import { deriveStage } from '../src/lib/stage';
import { newChildId, saveChildProfile } from '../src/lib/storage';
import { palette, radius, space, type } from '../src/theme/tokens';

const CONCERN_KEYS = ['sleep', 'daycare', 'eating', 'language', 'assertiveness', 'play'] as const;
type ConcernKey = (typeof CONCERN_KEYS)[number];

// Approximate height of the iOS picker sheet (spinner ~250 + padding +
// 48 button + safe-area). Used as the off-screen start position for the
// slide-up animation. Pick something larger than the real height so the
// sheet starts fully out of view.
const SHEET_HIDDEN_Y = 480;

export default function Onboarding() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { t, i18n } = useTranslation();

  const [name, setName] = useState('');
  const [birthdate, setBirthdate] = useState<Date | undefined>();
  const [pickerVisible, setPickerVisible] = useState(false);
  const [tempDate, setTempDate] = useState<Date>(new Date());
  const [concerns, setConcerns] = useState<Set<ConcernKey>>(new Set());

  // iOS bottom-sheet animation: backdrop fades in while sheet slides up,
  // two layers driven independently (the iOS Photos / Share-sheet pattern).
  const backdropOpacity = useRef(new Animated.Value(0)).current;
  const sheetTranslateY = useRef(new Animated.Value(SHEET_HIDDEN_Y)).current;

  useEffect(() => {
    if (pickerVisible) {
      // Reset to off-screen before animating in, so reopens always animate.
      backdropOpacity.setValue(0);
      sheetTranslateY.setValue(SHEET_HIDDEN_Y);
      Animated.parallel([
        Animated.timing(backdropOpacity, {
          toValue: 1,
          duration: 240,
          useNativeDriver: true,
        }),
        Animated.spring(sheetTranslateY, {
          toValue: 0,
          useNativeDriver: true,
          damping: 22,
          stiffness: 240,
          mass: 1,
        }),
      ]).start();
    }
  }, [pickerVisible, backdropOpacity, sheetTranslateY]);

  const dismissPicker = useCallback(() => {
    Animated.parallel([
      Animated.timing(backdropOpacity, {
        toValue: 0,
        duration: 220,
        useNativeDriver: true,
      }),
      Animated.timing(sheetTranslateY, {
        toValue: SHEET_HIDDEN_Y,
        duration: 220,
        useNativeDriver: true,
      }),
    ]).start(({ finished }) => {
      if (finished) setPickerVisible(false);
    });
  }, [backdropOpacity, sheetTranslateY]);

  const canSubmit = name.trim().length > 0 && !!birthdate;

  function toggleConcern(k: ConcernKey) {
    setConcerns((prev) => {
      const next = new Set(prev);
      if (next.has(k)) next.delete(k);
      else next.add(k);
      return next;
    });
  }

  function handleAndroidDateChange(event: DateTimePickerEvent, d?: Date) {
    setPickerVisible(false);
    if (event.type === 'set' && d) {
      setBirthdate(d);
    }
  }

  async function handleSubmit() {
    if (!canSubmit || !birthdate) return;
    const birthdateISO = formatISO(birthdate);
    const stage = deriveStage(birthdateISO);
    await saveChildProfile({
      childId: newChildId(),
      childName: name.trim(),
      birthdate: birthdateISO,
      stage,
      concerns: Array.from(concerns),
    });
    router.replace('/home');
  }

  const formattedBirth = birthdate ? formatKoreanDate(birthdate, i18n.language) : '';

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header: back + progress bar */}
        <View style={styles.headerRow}>
          <Pressable
            onPress={() => router.back()}
            style={styles.backBtn}
            hitSlop={8}
            accessibilityLabel={t('onboarding.back')}
          >
            <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
              <Path
                d="M15 18l-6-6 6-6"
                stroke={palette.ink}
                strokeWidth={1.8}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </Svg>
          </Pressable>
          <View style={styles.progress}>
            <View style={styles.progressFill} />
          </View>
        </View>

        {/* Question — hard line break, never auto-wrapped */}
        <View style={styles.questionBlock}>
          <Text style={styles.question} allowFontScaling={false}>
            {t('onboarding.questionLine1')}
          </Text>
          <Text style={styles.question} allowFontScaling={false}>
            {t('onboarding.questionLine2')}
          </Text>
        </View>

        {/* Name field */}
        <View style={styles.field}>
          <Text style={styles.fieldLabel}>{t('onboarding.nameLabel')}</Text>
          <TextInput
            value={name}
            onChangeText={setName}
            placeholder={t('onboarding.namePlaceholder')}
            placeholderTextColor={palette.inkFaint}
            style={styles.fieldValueInput}
            autoCapitalize="none"
            autoCorrect={false}
            returnKeyType="done"
          />
        </View>

        {/* Birthday field — tap to open date picker */}
        <Pressable
          style={styles.field}
          onPress={() => {
            setTempDate(birthdate ?? new Date());
            setPickerVisible(true);
          }}
          accessibilityRole="button"
        >
          <Text style={styles.fieldLabel}>{t('onboarding.birthdayLabel')}</Text>
          <Text
            style={[
              styles.fieldValueText,
              !birthdate && { color: palette.inkFaint },
            ]}
          >
            {formattedBirth || t('onboarding.birthdayPlaceholder')}
          </Text>
        </Pressable>

        {/* Concerns chips */}
        <Text style={styles.overline}>{t('onboarding.concernsOverline')}</Text>
        <View style={styles.chipRow}>
          {CONCERN_KEYS.map((k) => {
            const selected = concerns.has(k);
            return (
              <Pressable
                key={k}
                onPress={() => toggleConcern(k)}
                style={[styles.chip, selected && styles.chipSelected]}
              >
                <Text
                  style={[styles.chipText, selected && styles.chipTextSelected]}
                >
                  {t(`onboarding.concerns.${k}`)}
                  {selected ? '  ✓' : ''}
                </Text>
              </Pressable>
            );
          })}
          {/* Visual-only + Add chip (custom concerns are v1.2) */}
          <View style={[styles.chip, styles.chipAdd]}>
            <Svg width={14} height={14} viewBox="0 0 24 24" fill="none">
              <Path
                d="M12 5v14M5 12h14"
                stroke={palette.inkSoft}
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </Svg>
            <Text style={[styles.chipText, { marginLeft: 4 }]}>
              {t('onboarding.addChip')}
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* CTA pinned at bottom */}
      <View style={[styles.ctaBlock, { paddingBottom: Math.max(insets.bottom, 0) + 24 }]}>
        <Pressable
          onPress={handleSubmit}
          disabled={!canSubmit}
          style={({ pressed }) => [
            styles.cta,
            !canSubmit && styles.ctaDisabled,
            pressed && canSubmit && styles.ctaPressed,
          ]}
        >
          <Text style={styles.ctaLabel}>{t('onboarding.next')}</Text>
        </Pressable>
      </View>

      {/* Platform-aware date picker */}
      {pickerVisible && Platform.OS === 'android' && (
        <DateTimePicker
          value={tempDate}
          mode="date"
          maximumDate={new Date()}
          onChange={handleAndroidDateChange}
        />
      )}
      {Platform.OS === 'ios' && (
        <Modal
          visible={pickerVisible}
          transparent
          animationType="none"
          onRequestClose={dismissPicker}
        >
          <View style={{ flex: 1 }}>
            {/* Backdrop — fades in independently */}
            <Animated.View
              style={[
                StyleSheet.absoluteFill,
                styles.modalBackdrop,
                { opacity: backdropOpacity },
              ]}
            >
              <Pressable style={{ flex: 1 }} onPress={dismissPicker} />
            </Animated.View>
            {/* Sheet — slides up independently */}
            <Animated.View
              style={[
                styles.modalSheet,
                { transform: [{ translateY: sheetTranslateY }] },
              ]}
            >
              <DateTimePicker
                value={tempDate}
                mode="date"
                display="spinner"
                maximumDate={new Date()}
                onChange={(_, d) => d && setTempDate(d)}
                textColor={palette.ink}
              />
              <Pressable
                style={styles.modalDone}
                onPress={() => {
                  setBirthdate(tempDate);
                  dismissPicker();
                }}
              >
                <Text style={styles.modalDoneLabel}>OK</Text>
              </Pressable>
            </Animated.View>
          </View>
        </Modal>
      )}
    </View>
  );
}

function formatISO(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function formatKoreanDate(d: Date, lang: string): string {
  const y = d.getFullYear();
  const m = d.getMonth() + 1;
  const day = d.getDate();
  if (lang === 'ko') return `${y}년 ${m}월 ${day}일`;
  return `${m}/${day}/${y}`;
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: palette.cream,
  },
  scrollContent: {
    paddingHorizontal: 28,
    paddingTop: 24,
    paddingBottom: 24,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.sm,
    marginBottom: space.xs,
  },
  backBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: -10, // visually align edge of glyph with content
  },
  progress: {
    flex: 1,
    height: 4,
    backgroundColor: palette.creamWarmer,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    width: '33%',
    height: '100%',
    backgroundColor: palette.coral,
    borderRadius: 2,
  },
  questionBlock: {
    marginTop: 32,
    marginBottom: 24,
  },
  question: {
    color: palette.ink,
    ...type.question,
  },
  field: {
    backgroundColor: palette.creamSoft,
    borderColor: palette.line,
    borderWidth: 1,
    borderRadius: radius.field,
    paddingVertical: 14,
    paddingHorizontal: 18,
    marginBottom: 14,
  },
  fieldLabel: {
    color: palette.inkSoft,
    marginBottom: 6,
    ...type.fieldLabel,
  },
  fieldValueText: {
    color: palette.ink,
    paddingVertical: 0,
    ...type.fieldValue,
  },
  fieldValueInput: {
    color: palette.ink,
    padding: 0,
    ...type.fieldValue,
  },
  overline: {
    color: palette.inkFaint,
    textTransform: 'uppercase' as const,
    marginTop: space.sm,
    marginBottom: space.sm,
    ...type.overline,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: space.xs,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: radius.chip,
    backgroundColor: palette.creamSoft,
    borderWidth: 1,
    borderColor: palette.line,
  },
  chipSelected: {
    backgroundColor: palette.ink,
    borderColor: palette.ink,
  },
  chipAdd: {
    backgroundColor: 'transparent',
    borderStyle: 'dashed',
    borderColor: palette.inkFaint,
  },
  chipText: {
    color: palette.inkSoft,
    ...type.chipLabel,
  },
  chipTextSelected: {
    color: palette.creamSoft,
  },
  ctaBlock: {
    paddingHorizontal: 28,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: palette.line,
    backgroundColor: palette.cream,
  },
  cta: {
    height: 52,
    borderRadius: 26,
    backgroundColor: palette.coral,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ctaDisabled: {
    opacity: 0.4,
  },
  ctaPressed: {
    opacity: 0.85,
  },
  ctaLabel: {
    color: palette.white,
    ...type.pillLabel,
  },
  // iOS modal picker — backdrop & sheet animated independently
  modalBackdrop: {
    backgroundColor: 'rgba(0,0,0,0.35)',
  },
  modalSheet: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: palette.creamSoft,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 28,
  },
  modalDone: {
    height: 48,
    borderRadius: 24,
    backgroundColor: palette.ink,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  modalDoneLabel: {
    color: palette.creamSoft,
    ...type.pillLabel,
  },
});
