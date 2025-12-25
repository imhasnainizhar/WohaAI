"use client";

import { SettingItem } from "@internals/types/settings";
import { SettingRow } from "@components/section/settings/settings-build/setting-row";

export function SelectSetting({ item }: { item: SettingItem }) {
  return (
    <SettingRow
      label={item.label}
      description={item.description}
      right={
        <select
          className="bg-gray-800 text-sm rounded-md px-2 py-1"
          defaultValue={item.default}
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
