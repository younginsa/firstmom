import { StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { User } from 'lucide-react-native';

import { palette, type } from '../../src/theme/tokens';

// v1.2 — Settings + child profile editing lands then. This is a stub.
export default function Me() {
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <View style={styles.center}>
        <View style={styles.iconWrap}>
          <User size={32} strokeWidth={1.6} color={palette.inkFaint} />
        </View>
        <Text style={styles.title}>{t('tabs.me')}</Text>
        <Text style={styles.subtitle}>{t('stub.comingSoon')}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: palette.cream,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  iconWrap: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: palette.creamSoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  title: {
    color: palette.ink,
    ...type.title,
  },
  subtitle: {
    marginTop: 4,
    color: palette.inkFaint,
    ...type.body,
  },
});
