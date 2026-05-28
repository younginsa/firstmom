/**
 * AsyncStorage wrapper for the child profile (M1).
 * Key shape kept flat — DB sync (Neon) happens in M3.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

import type { Stage } from './stage';

const KEY = 'firstmom:childProfile:v1';
const LANG_KEY = 'firstmom:language:v1';
const THREAD_KEY = 'firstmom:thread:v1';

export type ChildProfile = {
  childId: string;
  childName: string;
  /** ISO 8601 date string (YYYY-MM-DD) */
  birthdate: string;
  stage: Stage;
  concerns: string[];
};

export async function loadChildProfile(): Promise<ChildProfile | null> {
  const raw = await AsyncStorage.getItem(KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as ChildProfile;
  } catch {
    return null;
  }
}

export async function saveChildProfile(profile: ChildProfile): Promise<void> {
  await AsyncStorage.setItem(KEY, JSON.stringify(profile));
}

export async function clearChildProfile(): Promise<void> {
  await AsyncStorage.removeItem(KEY);
}

/** Lightweight ID for v1 — replaced by server UUID in M3. */
export function newChildId(): string {
  return `c_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

/**
 * Stored language preference. `null` means "no user choice yet —
 * fall back to device locale". Wired up by the dev-only toggle on Home
 * until a real Settings screen exists in v1.2.
 */
export async function loadLanguage(): Promise<string | null> {
  return AsyncStorage.getItem(LANG_KEY);
}

export async function saveLanguage(lng: string): Promise<void> {
  await AsyncStorage.setItem(LANG_KEY, lng);
}

/**
 * Chat thread persistence (M2). One thread per device for now; M3 will
 * key this by childId once we have multi-child support. Messages are
 * stored verbatim — mock replies in M2 are indistinguishable in shape
 * from real Claude responses in M3.
 */
export type ChatRole = 'user' | 'assistant';

export type ChatMessage = {
  id: string;
  role: ChatRole;
  text: string;
  /** Unix ms */
  timestamp: number;
};

export async function loadThread(): Promise<ChatMessage[]> {
  const raw = await AsyncStorage.getItem(THREAD_KEY);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as ChatMessage[]) : [];
  } catch {
    return [];
  }
}

export async function saveThread(messages: ChatMessage[]): Promise<void> {
  await AsyncStorage.setItem(THREAD_KEY, JSON.stringify(messages));
}

export async function clearThread(): Promise<void> {
  await AsyncStorage.removeItem(THREAD_KEY);
}

export function newMessageId(): string {
  return `m_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}
