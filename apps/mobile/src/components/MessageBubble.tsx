import { StyleSheet, Text, View } from 'react-native';

import type { ChatMessage } from '../lib/storage';
import { palette, type } from '../theme/tokens';

type Props = {
  message: ChatMessage;
};

/**
 * Two visual treatments per the mockup (lines 670-697):
 *   - User → soft cream-warmer pill, right-aligned, 80% max-width
 *   - AI   → no bubble, just text on cream, left-aligned, 100% width
 *
 * Korean text wraps at word/character boundaries by default in RN —
 * we set no special `numberOfLines` or break rules.
 */
export function MessageBubble({ message }: Props) {
  if (message.role === 'user') {
    return (
      <View style={styles.userRow}>
        <View style={styles.userBubble}>
          <Text style={styles.userText} allowFontScaling={false}>
            {message.text}
          </Text>
        </View>
      </View>
    );
  }
  return (
    <View style={styles.aiRow}>
      <Text style={styles.aiText} allowFontScaling={false}>
        {message.text}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  userRow: {
    alignItems: 'flex-end',
    marginBottom: 18,
  },
  userBubble: {
    maxWidth: '80%',
    backgroundColor: palette.creamWarmer,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 18,
  },
  userText: {
    color: palette.ink,
    ...type.bodyMedium,
    fontSize: 14,
    lineHeight: 22,
  },
  aiRow: {
    alignItems: 'flex-start',
    marginBottom: 18,
    maxWidth: '100%',
  },
  aiText: {
    color: palette.ink,
    ...type.body,
    fontSize: 15,
    lineHeight: 24,
  },
});
