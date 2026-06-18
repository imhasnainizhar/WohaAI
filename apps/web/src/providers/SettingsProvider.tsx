"use client";

import { useCallback, useEffect } from "react";
import { create } from "zustand";
import {
  DEFAULT_SETTINGS,
} from "@wohaai/constants";

import {
  ISettingsValues,
  StorableSettingKey
} from "@wohaai/types";

// ─── Cache keys ───────────────────────────────────────────────────────────────
const LS_SETTINGS_KEY = "app:settings";
const LS_TIMESTAMP_KEY = "app:settings:ts";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function readCache(): { settings: ISettingsValues; ts: number } | null {
  try {
    const raw = localStorage.getItem(LS_SETTINGS_KEY);
    const tsRaw = localStorage.getItem(LS_TIMESTAMP_KEY);
    if (!raw || !tsRaw) return null;
    return { settings: JSON.parse(raw) as ISettingsValues, ts: Number(tsRaw) };
  } catch {
    return null;
  }
}

function writeCache(settings: ISettingsValues, ts?: number) {
  try {
    localStorage.setItem(LS_SETTINGS_KEY, JSON.stringify(settings));
    if (ts !== undefined) {
      localStorage.setItem(LS_TIMESTAMP_KEY, String(ts));
    }
  } catch {
    // Storage quota exceeded — not fatal.
  }
}

function applyPath(
  base: ISettingsValues,
  path: string,
  value: unknown
): ISettingsValues {
  const parts = path.split(".");
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const clone: any = structuredClone(base);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let cursor: any = clone;
  for (let i = 0; i < parts.length - 1; i++) cursor = cursor[parts[i]!];
  cursor[parts[parts.length - 1]!] = value;
  return clone as ISettingsValues;
}

// ─── API calls ────────────────────────────────────────────────────────────────

async function fetchSettings(): Promise<{
  settings: ISettingsValues;
  updatedAt: number;
}> {
  const res = await fetch("/api/settings", { credentials: "include" });
  if (!res.ok) throw new Error(`GET /api/settings → ${res.status}`);
  return res.json();
}

async function patchSettings(
  updates: Array<{ key: StorableSettingKey; value: unknown }>
): Promise<{ settings: ISettingsValues; updatedAt: number }> {
  const res = await fetch("/api/settings", {
    method: "PATCH",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ updates }),
  });
  if (!res.ok) throw new Error(`PATCH /api/settings → ${res.status}`);
  return res.json();
}

// ─── Store ────────────────────────────────────────────────────────────────────

interface SettingsState {
  settings: ISettingsValues;
  isLoading: boolean;
  lastSynced: number | null;

  /**
   * Last settings confirmed by the server.
   * Kept outside React state to avoid re-renders; used only for rollback.
   */
  _serverSnapshot: ISettingsValues;

  updateSetting(
    keyOrBatch:
      | StorableSettingKey
      | Array<{ key: StorableSettingKey; value: unknown }>,
    value?: unknown
  ): Promise<void>;

  refetch(): Promise<void>;
}

const initialSettings =
  typeof window !== "undefined"
    ? (readCache()?.settings ?? DEFAULT_SETTINGS)
    : DEFAULT_SETTINGS;

export const useSettingsStore = create<SettingsState>()((set, get) => ({
  settings: initialSettings,
  isLoading: true,
  lastSynced: null,
  _serverSnapshot: initialSettings,

  // ── Sync from server ──────────────────────────────────────────────────────
  async refetch() {
    const localTs = Number(localStorage.getItem(LS_TIMESTAMP_KEY) ?? "0");

    try {
      const { settings: remote, updatedAt } = await fetchSettings();

      if (updatedAt > localTs) {
        set({ settings: remote, _serverSnapshot: remote, lastSynced: updatedAt });
        writeCache(remote, updatedAt);
      } else {
        const current = get().settings;
        set({ _serverSnapshot: current, lastSynced: localTs });
        writeCache(current, localTs);
      }
    } catch (err) {
      console.error("[SettingsStore] Failed to sync settings:", err);
      // Non-fatal: continue with whatever is in local cache
    } finally {
      set({ isLoading: false });
    }
  },

  // ── Optimistic update with rollback ───────────────────────────────────────
  async updateSetting(keyOrBatch, value) {
    const updates: Array<{ key: StorableSettingKey; value: unknown }> =
      Array.isArray(keyOrBatch)
        ? keyOrBatch
        : [{ key: keyOrBatch, value: value as unknown }];

    const previous = get()._serverSnapshot;

    // Optimistic update
    const optimistic = updates.reduce(
      (acc, { key, value: v }) => applyPath(acc, key, v),
      get().settings
    );
    set({ settings: optimistic });
    writeCache(optimistic);

    try {
      const { settings: confirmed, updatedAt } = await patchSettings(updates);

      set({ settings: confirmed, _serverSnapshot: confirmed, lastSynced: updatedAt });
      writeCache(confirmed, updatedAt);
    } catch (err) {
      console.error("[SettingsStore] PATCH failed — rolling back:", err);

      set({ settings: previous });
      writeCache(previous);
    }
  },
}));

export function SettingsProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const refetch = useSettingsStore((s) => s.refetch);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return children;
}

// ─── Consumer hooks ───────────────────────────────────────────────────────────

/** Access the full settings store (same API as the old useSettings()). */
export function useSettings() {
  return useSettingsStore();
}

/**
 * Convenience hook to read + update a single setting by its dot-path key.
 *
 * const [theme, setTheme] = useSetting("general.theme");
 */
export function useSetting<T = unknown>(
  key: StorableSettingKey
): [T, (value: T) => Promise<void>] {
  const updateSetting = useSettingsStore((s) => s.updateSetting);

  // Derive value with a stable selector to avoid unnecessary re-renders
  const value = useSettingsStore(
    useCallback(
      (s) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        let v: any = s.settings;
        for (const part of key.split(".")) v = v?.[part];
        return v as T;
      },
      [key]
    )
  );

  const set = useCallback(
    (v: T) => updateSetting(key, v),
    [key, updateSetting]
  );

  return [value, set];
}