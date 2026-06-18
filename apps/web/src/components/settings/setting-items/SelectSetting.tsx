"use client";

import { SettingItem } from "@/types/settings";
import { SettingRow } from "../SettingRow";
import { useSetting } from "@/providers/SettingsProvider";

export function SelectSetting({ item }: { item: SettingItem }) {
  const [value, setValue] = useSetting(item.id as any);

  return (
    <SettingRow
      label={item.label}
      description={item.description}
      right={
        <select
          className="bg-gray-800 text-sm rounded-md px-2 py-1"
          value={value as string}
          onChange={(e) => setValue(e.target.value)}
        >
          {item.options?.map(opt => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      }
    />
  );
}
