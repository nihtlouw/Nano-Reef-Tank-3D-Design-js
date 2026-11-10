import { useEffect, useState } from "react";

export function useLocalData<T>(
  key: string,
  initial: T,
  validate: (value: unknown) => value is T,
) {
  const [warning, setWarning] = useState(false);
  const [value, setValue] = useState<T>(() => {
    try {
      const raw = localStorage.getItem(key);
      if (raw === null) return initial;
      const parsed: unknown = JSON.parse(raw);
      return validate(parsed) ? parsed : initial;
    } catch {
      return initial;
    }
  });
  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      setWarning(false);
    } catch {
      setWarning(true);
    }
  }, [key, value]);
  return [value, setValue, warning] as const;
}
export const isRecord = (v: unknown): v is Record<string, unknown> =>
  typeof v === "object" && v !== null && !Array.isArray(v);
export const isChecks = (v: unknown): v is Record<string, boolean> =>
  isRecord(v) && Object.values(v).every((x) => typeof x === "boolean");
export const isPrices = (v: unknown): v is Record<string, number> =>
  isRecord(v) &&
  Object.values(v).every(
    (x) =>
      typeof x === "number" && Number.isFinite(x) && x >= 0 && x <= 100_000_000,
  );
export interface JournalEntry {
  id: string;
  date: string;
  temp: string;
  sal: string;
  ammonia: string;
  nitrite: string;
  nitrate: string;
  alk: string;
  note: string;
}
export const isJournal = (v: unknown): v is JournalEntry[] =>
  Array.isArray(v) &&
  v.length <= 500 &&
  v.every(
    (row) =>
      isRecord(row) &&
      [
        "id",
        "date",
        "temp",
        "sal",
        "ammonia",
        "nitrite",
        "nitrate",
        "alk",
        "note",
      ].every((k) => typeof row[k] === "string"),
  );
