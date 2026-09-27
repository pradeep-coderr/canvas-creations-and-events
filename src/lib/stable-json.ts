/**
 * JSON with object keys sorted, so two values compare equal regardless of key
 * order (Postgres jsonb, for one, returns keys in its own order). Used to
 * check that what the database stored is what was sent.
 */
export function stableJson(value: unknown): string {
  return JSON.stringify(value, (_key, v: unknown) =>
    v && typeof v === "object" && !Array.isArray(v)
      ? Object.fromEntries(Object.entries(v as Record<string, unknown>).sort(([a], [b]) => a.localeCompare(b)))
      : v,
  );
}

export const sameJson = (a: unknown, b: unknown) => stableJson(a) === stableJson(b);
