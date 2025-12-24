"use client";

import { SettingSection } from "@components/section/settings/settings-section/section"
import { SettingSectionType } from "@internals/types/settings"
import { useAppContext } from "@providers/AppContext";
import { useState } from "react";
interface Props {
  schema: SettingSectionType[];
}

export function Settings({ schema }: Props) {
  const { settingsVisible } = useAppContext();
  const [activeSectionId, setActiveSectionId] = useState<SettingSectionType>(schema[0]);
  return (
    (settingsVisible ? (
      <div className="fixed top-0 right-0 transition-all duration-500 ease-in-out w-[450px] h-[700px] 
    bg-bg-secondary rounded-l-[25px] z-120 p-8 space-y-8">
        <section className="space-y-4 overflow-auto h-auto">
          <h2 className="text-sm font-semibold uppercase text-gray-400">
            Settings
          </h2>
          <div className="rounded-xl border border-gray-800 bg-gray-900 divide-y divide-gray-800">
            <div>
              {schema.map(section => (
                <button
                  key={section.id}
                  onClick={() => {
                    setActiveSectionId(section)
                  }}
                  className="w-full p-2 text-left text-gray-400 hover:bg-gray-800">{section.label}
                </button>
              ))}
            </div>
            <SettingSection section={activeSectionId} />
          </div>
        </section>
      </div>
    ) : null)
  );
}
