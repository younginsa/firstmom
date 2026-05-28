/**
 * i18n init. Korean is the default — English strings exist for future
 * Settings toggle (M1 has no user-facing switcher).
 *
 * Device locale is read once at startup via expo-localization. If the
 * device is Korean, stay Korean. Anything else falls back to English.
 */

import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { getLocales } from 'expo-localization';

import en from './en.json';
import ko from './ko.json';

const deviceLanguage = getLocales()[0]?.languageCode ?? 'ko';
const initialLanguage = deviceLanguage === 'ko' ? 'ko' : 'en';

i18n
  .use(initReactI18next)
  .init({
    resources: {
      ko: { translation: ko },
      en: { translation: en },
    },
    lng: initialLanguage,
    fallbackLng: 'ko',
    interpolation: {
      escapeValue: false, // React handles escaping
    },
    compatibilityJSON: 'v4',
  })
  .catch(() => {
    // Surfaced via console in dev; not user-visible.
  });

export default i18n;
