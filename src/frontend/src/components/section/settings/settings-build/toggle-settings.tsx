"use client";

import { SettingItem } from "@internals/types/settings";
import { SettingRow } from "@components/section/settings/settings-build/setting-row";

export function ToggleSetting({ item }: { item: SettingItem }) {
  return (
    <SettingRow
      label={item.label}
      description={item.description}
      right={
        <input
          type="checkbox"
          defaultChecked={item.default}
          className="h-4 w-4 accent-blue-500"
        />
      }
    />
  );
}
