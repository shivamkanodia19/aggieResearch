"use client";

import { useEffect, useRef, useCallback, useState } from "react";

const DEFAULT_DELAY_MS = 1500;

/**
 * Debounced auto-save: runs saveFn after `delayMs` of no changes.
 * Use for notes/text fields that should auto-save as you type.
 */
export function useDebouncedSave<T>(options: {
  value: T;
  saveFn: (value: T) => void | Promise<void>;
  isDirty?: (value: T) => boolean;
  delayMs?: number;
  enabled?: boolean;
}) {
  const {
    value,
    saveFn,
    isDirty = () => true,
    delayMs = DEFAULT_DELAY_MS,
    enabled = true,
  } = options;

  const [saving, setSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const valueRef = useRef(value);
  valueRef.current = value;

  const performSave = useCallback(async () => {
    if (!enabled || !isDirty(valueRef.current)) return;
    setSaving(true);
    try {
      await saveFn(valueRef.current);
      setLastSaved(true);
      const t = setTimeout(() => setLastSaved(false), 2000);
      return () => clearTimeout(t);
    } catch (err) {
      console.error("Auto-save failed:", err);
    } finally {
      setSaving(false);
    }
  }, [saveFn, isDirty, enabled]);

  // Debounced save when value changes
  useEffect(() => {
    if (!enabled || !isDirty(value)) return;

    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      timerRef.current = null;
      performSave();
    }, delayMs);

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [value, delayMs, enabled, isDirty, performSave]);

  // Save immediately (e.g. on blur)
  const saveNow = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    if (enabled && isDirty(valueRef.current)) {
      performSave();
    }
  }, [enabled, isDirty, performSave]);

  return { saving, lastSaved, saveNow };
}
