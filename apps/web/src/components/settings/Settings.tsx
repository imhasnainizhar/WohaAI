"use client";

import { SettingSection } from "@/components/settings/SettingSection"
import { useAppContext } from "@/providers/AppProvider";
import { SettingSectionType } from "@/types/settings";
import { useState } from "react";
import UsernamePlate from "@/components/ui/cards/UsernamePlate";

interface Props {
  schema: SettingSectionType[];
}

export function Settings({ schema }: Props) {
  const { settingsVisible, setSettingsVisible } = useAppContext();
  const [activeSection, setActiveSection] = useState<SettingSectionType>(schema[0]!);
  return (
    (settingsVisible ? (
      <div className="fixed bg-translucent-bg w-full h-full flex items-center justify-center transition-all duration-500 ease-in-out
    z-120 py-8 space-y-8">
        <section className="flex items-start justify-start flex-col space-y-2 overflow-hidden w-[640px] h-[700px] bg-bg-secondary rounded-[25px]">
          <div className="flex items-center justify-center h-full w-full min-h-[500px]">
            <div className="flex flex-col items-start justify-start gap-4 bg-bg-primary h-full p-5 w-[220px]">
              <div className="w-full h-auto">
                <UsernamePlate />
              </div>
              <div className="rounded-x-[25px] w-[150px] h-full flex flex-col items-start justify-start gap-2">
                {schema.map(section => (
                  <div
                    key={section.id}
                    onClick={() => {
                      setActiveSection(section)
                    }}
                    className="flex items-center justify-start pl-2 w-full h-[35px] text-left hover:bg-bg-btn-hover transition-all
                    duration-200 ease-in-out cursor-pointer rounded-[12px]">{section.label}
                  </div>
                ))}
              </div>
            </div>
            {/* <div className="h-full w-px border border-solid border-border-secondary"></div> */}
            <div className="w-full h-full px-4 pt-6 flex flex-col items-start justify-start gap-2">
              <div className="w-full h-[30px] flex items-center justify-between"
              >
                <h2 className="text-xl font-bold mb-2">{activeSection.label}</h2>
                <div
                  className="w-[30px] h-[30px] cursor-pointer hover:bg-bg-btn-hover rounded-[999%]
                transition-all duration-200 ease-in-out"
                  onClick={() => {
                    setSettingsVisible(false)
                  }}
                >
                  <div className="w-full h-[30px] flex justify-center items-center text-text-primary font-medium text-[14px]">X</div>
                </div>
              </div>
              <div className="w-full h-full">
                <SettingSection section={activeSection} />
              </div>
            </div>
          </div>
        </section >
      </div >
    ) : null)
  );
}
