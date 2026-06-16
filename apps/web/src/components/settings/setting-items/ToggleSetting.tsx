"use client";

import { SettingItem } from "@/types/settings";
import { SettingRow } from "../SettingRow";
import { useSetting } from "@/providers/SettingsProvider";

export function ToggleSetting({ item }: { item: SettingItem }) {
  const [value, setValue] = useSetting(item.id as any);

  return (
    <SettingRow
      label={item.label}
      description={item.description}
      right={
        <input
          type="checkbox"
          checked={value as boolean}
          onChange={(e) => setValue(e.target.checked)}
          className="h-4 w-4 accent-blue-500"
        />
      }
    />
  );
}
