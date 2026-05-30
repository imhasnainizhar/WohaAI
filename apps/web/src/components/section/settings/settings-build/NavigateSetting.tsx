"use client";

import { useRouter } from "next/navigation";
import { SettingItem } from "@internals/types/settings";
import { SettingRow } from "@components/section/settings/settings-build/SettingRow";

export function NavigateSetting({ item }: { item: SettingItem }) {
  const router = useRouter();

  return (
    <SettingRow
      label={item.label}
      description={item.description}
      right={
        <button
          onClick={() => {
            if (item.action?.type === "route") {
              router.push(item.action.target!);
            }
          }}
          className="text-gray-400 hover:text-white"
        >
          →
        </button>
      }
    />
  );
}
