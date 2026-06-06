"use client";

import { SettingItem } from "@/types/settings";
import { SettingRow } from "../SettingRow";

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
