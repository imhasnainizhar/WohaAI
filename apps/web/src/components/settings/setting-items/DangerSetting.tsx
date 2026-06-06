"use client";

import { SettingItem } from "@/types/settings";
import { SettingRow } from "../SettingRow";

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
