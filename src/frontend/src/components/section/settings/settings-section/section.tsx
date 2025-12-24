// components/SettingSection.tsx
import React from "react";
import { SettingSectionType } from "@internals/types/settings";
import { SettingsItem } from "@components/section/settings/settings-build/setting-item";

interface Props {
  section: SettingSectionType | undefined;
}

export const SettingSection: React.FC<Props> = ({ section }) => {
  if (!section) return null;

  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-xl font-bold mb-2">{section.label}</h2>
      {section.items.map((item) => (
        <SettingsItem key={item.id} item={item} />
      ))}
    </div>
  );
};
