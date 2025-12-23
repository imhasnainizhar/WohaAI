"use client";

import { SettingSection } from "@internals/types/settings";
import { SettingsItem } from "@components/section/settings/setting-item";
import { useAppContext } from "@providers/AppContext";

interface Props {
  schema: SettingSection[];
}

export function Settings({ schema }: Props) {
  const { settingsVisible } = useAppContext();
  return (
    (settingsVisible ? (
    <div className="fixed top-0 right-0 transition-all duration-500 ease-in-out w-[450px] h-[700px] 
    bg-bg-secondary rounded-l-[25px] z-120 p-8 space-y-8">
      {schema.map(section => (
        <section key={section.id} className="space-y-4 overflow-auto h-auto">
          <h2 className="text-sm font-semibold uppercase text-gray-400">
            {section.label}
          </h2>

          <div className="rounded-xl border border-gray-800 bg-gray-900 divide-y divide-gray-800">
            {section.items.map(item => (
              <SettingsItem key={item.id} item={item} />
            ))}
          </div>
        </section>
      ))}
    </div>
    ) : null)
  );
}
