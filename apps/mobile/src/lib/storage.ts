/**
 * AsyncStorage wrapper for the child profile (M1).
 * Key shape kept flat — DB sync (Neon) happens in M3.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

import type { Stage } from './stage';

const KEY = 'firstmom:childProfile:v1';
const LANG_KEY = 'firstmom:language:v1';

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
