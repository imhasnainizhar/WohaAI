import { SettingItem } from "@internals/types/settings";
import { SelectSetting } from "@components/section/settings/settings-build/SelectSetting";
import { ToggleSetting } from "@components/section/settings/settings-build/ToggleSetting";
import { NavigateSetting } from "@components/section/settings/settings-build/NavigateSetting";
import { DangerSetting } from "@components/section/settings/settings-build/DangerSetting";

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
