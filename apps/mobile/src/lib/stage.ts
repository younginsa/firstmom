/**
 * Stage derivation. Pure function: birthdate (ISO string) → stage key.
 * Boundaries from BUILD_PLAN.md:
 *   infant     0–12 months
 *   baby       12–24 months
 *   toddler    24–48 months
 *   preschool  48+ months
 */

export type Stage = 'infant' | 'baby' | 'toddler' | 'preschool';

export function deriveStage(birthdateISO: string, now: Date = new Date()): Stage {
  const months = monthsBetween(new Date(birthdateISO), now);
  if (months < 12) return 'infant';
  if (months < 24) return 'baby';
  if (months < 48) return 'toddler';
  return 'preschool';
}

/**
 * Whole months between two dates. Counts a month elapsed only if the
 * day-of-month has been reached, so a child born May 15 isn't "1 month
 * old" on June 1.
 */
export function monthsBetween(from: Date, to: Date): number {
  let months = (to.getFullYear() - from.getFullYear()) * 12 + (to.getMonth() - from.getMonth());
  if (to.getDate() < from.getDate()) months -= 1;
  return Math.max(0, months);
}

/**
 * Korean age label for Home header. Format depends on age:
 *   < 12 mo  → "8개월"            (months only)
 *   12–23 mo → "1살 3개월"         (years + remaining months)
 *   24+ mo   → "6살"              (years only — months omitted)
 */
export function koreanAgeLabel(birthdateISO: string, now: Date = new Date()): string {
  const months = monthsBetween(new Date(birthdateISO), now);
  if (months < 12) return `${months}개월`;
  if (months < 24) {
    const remaining = months % 12;
    return remaining === 0 ? `1살` : `1살 ${remaining}개월`;
  }
  return `${Math.floor(months / 12)}살`;
}

/**
 * English age label for Home header. Mirrors the same three bands:
 *   < 12 mo  → "8 mo"
 *   12–23 mo → "1 yr 3 mo"
 *   24+ mo   → "6 yrs old"
 */
export function englishAgeLabel(birthdateISO: string, now: Date = new Date()): string {
  const months = monthsBetween(new Date(birthdateISO), now);
  if (months < 12) return `${months} mo`;
  if (months < 24) {
    const remaining = months % 12;
    return remaining === 0 ? `1 yr old` : `1 yr ${remaining} mo`;
  }
  return `${Math.floor(months / 12)} yrs old`;
}
