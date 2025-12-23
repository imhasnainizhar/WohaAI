"use client";

import { SettingItem } from "@internals/types/settings";
import { SettingRow } from "@components/section/settings/setting-row";

export function DangerSetting({ item }: { item: SettingItem }) {
  return (
    <SettingRow
      label={item.label}
      description={item.description}
      danger
      right={
        <button className="text-red-400 hover:text-red-300">
          →
        </button>
      }
    />
  );
}
