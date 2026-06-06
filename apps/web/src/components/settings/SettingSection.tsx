// components/SettingSection.tsx
import React from "react";
import { SettingsItem } from "@/components/settings/SettingsItem";
import { SettingSectionType } from "@/types/settings";

interface Props {
  section: SettingSectionType | undefined;
}

export const SettingSection: React.FC<Props> = ({ section }) => {
  if (!section) return null;

  return (
    <div className="flex flex-col gap-4">
      {section.items.map((item) => (
        <SettingsItem key={item.id} item={item} />
      ))}
    </div>
  );
};
