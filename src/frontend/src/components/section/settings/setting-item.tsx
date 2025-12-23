import { SettingItem } from "@internals/types/settings";
import { SelectSetting } from "@components/section/settings/setting-types/select-settings";
import { ToggleSetting } from "@components/section/settings/setting-types/toggle-settings";
import { NavigateSetting } from "@components/section/settings/setting-types/navigate-setting";
import { DangerSetting } from "@components/section/settings/setting-types/danger-setting";

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
