import { SettingItem } from "@internals/types/settings";
import { SelectSetting } from "@components/section/settings/settings-build/select-settings";
import { ToggleSetting } from "@components/section/settings/settings-build/toggle-settings";
import { NavigateSetting } from "@components/section/settings/settings-build/navigate-setting";
import { DangerSetting } from "@components/section/settings/settings-build/danger-setting";

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
