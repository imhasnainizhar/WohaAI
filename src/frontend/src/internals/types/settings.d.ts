export type SettingLevel = "usual" | "critical";

export type SettingUI =
  | "select"
  | "toggle"
  | "navigate"
  | "danger";

export interface SettingOption {
  value: string;
  label: string;
}

export interface SettingAction {
  type: "route" | "intent";
  target?: string;
  intent?: string;
}

export interface SettingItem {
  id: string;
  ui: SettingUI;
  label: string;
  description?: string;
  level: SettingLevel;
  icon?: string;
  valueType?: "enum" | "boolean";
  default?: any;
  options?: SettingOption[];
  action?: SettingAction;
}

export interface SettingSection {
  id: string;
  label: string;
  items: SettingItem[];
}
