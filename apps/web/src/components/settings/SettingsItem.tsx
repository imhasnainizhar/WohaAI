import { SelectSetting } from "@/components/settings/setting-items/SelectSetting";
import { ToggleSetting } from "@/components/settings/setting-items/ToggleSetting";
import { NavigateSetting } from "@/components/settings/setting-items/NavigateSetting";
import { DangerSetting } from "@/components/settings/setting-items/DangerSetting";
import { SettingItem } from "@/types/settings";

interface Props {
  item: SettingItem;
}

export function SettingsItem({ item }: Props) {
  switch (item.ui) {
    case "select":
      return <SelectSetting item={item} />;

    case "toggle":
      return <ToggleSetting item={item} />;

    case "navigate":
      return <NavigateSetting item={item} />;

    case "danger":
      return <DangerSetting item={item} />;

    default:
      return null;
  }
}
