import { useEffect, useRef, useState } from 'react';
import {
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { ArrowUp } from 'lucide-react-native';

import { MessageBubble } from '../../src/components/MessageBubble';
import { TypingIndicator } from '../../src/components/TypingIndicator';
import { pickMockReply } from '../../src/lib/mockReplies';
import {
  type ChatMessage,
  loadThread,
  newMessageId,
  saveThread,
} from '../../src/lib/storage';
import { palette, type } from '../../src/theme/tokens';

const STREAM_CHAR_INTERVAL_MS = 35;
const TYPING_INDICATOR_DELAY_MS = 500;

/**
 * Chat screen — mockup screen 5 (lines 1300-1357).
 *
 * Korean IME safety:
 *   - Standard controlled `<TextInput value onChangeText multiline>`.
 *   - `value` is reset to `''` ONLY after send commits — never during
 *     composition (조합 중).
 *   - No `key` prop that would re-mount the input mid-typing.
 *   - No `keyboardType` override; default IME is used.
 *   - No `.trim()` / `.normalize()` per keystroke.
 *   - Send button is a separate Pressable; return key inserts newline.
 *
 * Mock streaming pipeline (M2):
 *   user taps send
 *     → user message appended, draft cleared
 *     → 500ms pause (typing indicator visible)
 *     → empty assistant message appended, indicator hidden
 *     → text grows char-by-char every 35ms via setInterval
 *     → thread persisted to AsyncStorage on every state update
 */
export default function Chat() {
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [draft, setDraft] = useState('');
  const [streaming, setStreaming] = useState(false);
  const [showTyping, setShowTyping] = useState(false);

  const listRef = useRef<FlatList<ChatMessage>>(null);
  const streamTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const typingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hydrated = useRef(false);

  // Load persisted thread on mount.
  useEffect(() => {
    loadThread().then((stored) => {
      setMessages(stored);
      hydrated.current = true;
    });
    return () => {
      if (streamTimerRef.current) clearInterval(streamTimerRef.current);
      if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
    };
  }, []);

  // Persist on every change (skip the initial hydration so we don't
  // overwrite the saved thread with `[]` before load completes).
  useEffect(() => {
    if (hydrated.current) {
      void saveThread(messages);
    }
  }, [messages]);

  function scrollToEnd() {
    requestAnimationFrame(() => {
      listRef.current?.scrollToEnd({ animated: true });
    });
  }

  function send() {
    const text = draft.trim();
    if (!text || streaming) return;

    const userMsg: ChatMessage = {
      id: newMessageId(),
      role: 'user',
      text,
      timestamp: Date.now(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setDraft('');
    setStreaming(true);
    scrollToEnd();

    // Show typing indicator briefly before the reply starts streaming.
    setShowTyping(true);
    typingTimerRef.current = setTimeout(() => {
      setShowTyping(false);
      startStreaming();
    }, TYPING_INDICATOR_DELAY_MS);
  }

  function startStreaming() {
    const fullReply = pickMockReply();
    if (!fullReply) {
      setStreaming(false);
      return;
    }
    const replyId = newMessageId();
    const startedAt = Date.now();

    setMessages((prev) => [
      ...prev,
      { id: replyId, role: 'assistant', text: '', timestamp: startedAt },
    ]);

    let charIndex = 1;
    streamTimerRef.current = setInterval(() => {
      if (charIndex > fullReply.length) {
        if (streamTimerRef.current) clearInterval(streamTimerRef.current);
        streamTimerRef.current = null;
        setStreaming(false);
        return;
      }
      const partial = fullReply.slice(0, charIndex);
      setMessages((prev) =>
        prev.map((m) => (m.id === replyId ? { ...m, text: partial } : m)),
      );
      charIndex += 1;
    }, STREAM_CHAR_INTERVAL_MS);
  }

  const showEmptyState = hydrated.current && messages.length === 0 && !showTyping;

  return (
    <KeyboardAvoidingView
      style={[styles.root, { paddingTop: insets.top }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
    >
      <View style={styles.header}>
        <Text style={styles.headerTitle} allowFontScaling={false}>
          {t('chat.title')}
        </Text>
      </View>

      <FlatList
        ref={listRef}
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <MessageBubble message={item} />}
        contentContainerStyle={styles.listContent}
        onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: false })}
        ListFooterComponent={showTyping ? <TypingIndicator /> : null}
        ListEmptyComponent={
          showEmptyState ? (
            <View style={styles.emptyWrap}>
              <Text style={styles.emptyText}>{t('chat.emptyState')}</Text>
            </View>
          ) : null
        }
        keyboardShouldPersistTaps="handled"
      />

      <View style={[styles.inputWrap, { paddingBottom: 12 }]}>
        <View style={styles.inputBar}>
          <TextInput
            value={draft}
            onChangeText={setDraft}
            placeholder={t('chat.inputPlaceholder')}
            placeholderTextColor={palette.inkFaint}
            multiline
            style={styles.input}
            // Avoid anything that would interfere with Korean IME composition:
            autoCorrect={false}
            autoCapitalize="none"
            textAlignVertical="center"
          />
          <Pressable
            onPress={send}
            disabled={!draft.trim() || streaming}
            accessibilityRole="button"
            accessibilityLabel={t('chat.sendA11y')}
            style={({ pressed }) => [
              styles.sendBtn,
              (!draft.trim() || streaming) && styles.sendBtnDisabled,
              pressed && styles.sendBtnPressed,
            ]}
          >
            <ArrowUp size={20} strokeWidth={2} color={palette.white} />
          </Pressable>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: palette.cream,
  },
  header: {
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  headerTitle: {
    color: palette.ink,
    ...type.title,
    fontSize: 17,
  },
  listContent: {
    paddingHorizontal: 22,
    paddingTop: 8,
    paddingBottom: 16,
    flexGrow: 1,
  },
  emptyWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  emptyText: {
    color: palette.inkFaint,
    textAlign: 'center',
    ...type.body,
  },
  inputWrap: {
    paddingHorizontal: 12,
    paddingTop: 6,
    backgroundColor: palette.cream,
  },
  inputBar: {
    flexDirection: 'row',
    // `center` keeps placeholder vertically aligned with the send
    // button on single-line; the input itself uses `minHeight: 40`
    // so it never collapses below the send button's footprint, and
    // grows upward gracefully when the user types multi-line.
    alignItems: 'center',
    gap: 8,
    backgroundColor: palette.creamSoft,
    borderColor: palette.line,
    borderWidth: 1,
    borderRadius: 28,
    paddingVertical: 6,
    paddingLeft: 20,
    paddingRight: 6,
  },
  input: {
    flex: 1,
    color: palette.ink,
    minHeight: 40, // match send-button height for visual balance
    maxHeight: 120,
    paddingTop: 9, // (40 - lineHeight 22) / 2 → centers single-line text
    paddingBottom: 9,
    paddingHorizontal: 0,
    ...type.body,
    fontSize: 15,
    lineHeight: 22,
  },
  sendBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: palette.coral,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendBtnDisabled: {
    opacity: 0.35,
  },
  sendBtnPressed: {
    opacity: 0.85,
  },
});
