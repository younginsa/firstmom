import i18n from '../i18n';

// ─────────────────────────────────────────────────────────────
// TODO M3: replace these mocks with real Claude streaming via
// /api/chat. System prompt persona: blend of 오은영 (warm emotional
// validation, gentle questioning, never lecturing) + 조선미
// (evidence-based, practical, grounded). Don't lose this persona
// note — it's the seed of the Warm Friend voice.
// ─────────────────────────────────────────────────────────────

/**
 * Warm-friend voice mock replies (M2). Cycles through the array stored
 * in `chat.mockReplies` for the current language so consecutive sends
 * don't feel canned. M3 replaces this with the real Claude streaming
 * response — the call site shape stays the same.
 */
let replyIndex = 0;

export function pickMockReply(): string {
  const replies = (i18n.t('chat.mockReplies', { returnObjects: true }) ?? []) as string[];
  if (!replies.length) return '';
  const reply = replies[replyIndex % replies.length] ?? '';
  replyIndex += 1;
  return reply;
}

export function resetMockReplyCycle(): void {
  replyIndex = 0;
}
