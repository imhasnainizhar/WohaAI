import { SettingSectionType, SettingItem } from "@/types/settings";

const SettingSchema: SettingSectionType[] = [
  {
    id: "security",
    label: "Security",
    items: [
      {
        id: "security.2fa",
        ui: "navigate",
        level: "critical",
        label: "Two-Factor Authentication",
        description: "Enable or disable two-factor authentication",
        icon: "shield",
        action: {
          type: "route",
          target: "/settings/security/2fa"
        }
      } as SettingItem,
      {
        id: "security.password",
        ui: "navigate",
        level: "critical",
        label: "Password",
        description: "Change your password",
        icon: "lock",
        action: {
          type: "route",
          target: "/settings/security/password"
        }
      } as SettingItem,
    ]
  },

  {
    id: "account",
    label: "Account",
    items: [
      {
        id: "account.name",
        ui: "navigate",
        level: "usual",
        label: "Change Name",
        description: "Change your name",
        icon: "user",
        action: {
          type: "route",
          target: "/settings/account/name"
        }
      } as SettingItem,
      {
        id: "account.username",
        ui: "navigate",
        level: "usual",
        label: "Change Username",
        description: "Change your username",
        icon: "user",
        action: {
          type: "route",
          target: "/settings/account/username"
        }
      } as SettingItem,
      {
        id: "account.email",
        ui: "navigate",
        level: "critical",
        label: "Change Email",
        description: "Change your email",
        icon: "mail",
        action: {
          type: "route",
          target: "/settings/account/email"
        }
      } as SettingItem,
      {
        id: "account.delete",
        ui: "danger",
        level: "critical",
        label: "Delete Account",
        description: "Delete your account",
        icon: "trash",
        action: {
          type: "intent",
          intent: "account.delete"
        }
      }
    ]
  },

  {
    id: "personalization",
    label: "Personalization",
    items: [
      {
        id: "personalization.memory",
        ui: "toggle",
        valueType: "boolean",
        level: "usual",
        label: "Save Memory",
        description: "Save memories to personalize your experience",
        default: true
      } as SettingItem,
      {
        id: "personalization.chatHistory",
        ui: "toggle",
        valueType: "boolean",
        level: "usual",
        label: "Save Chat History",
        description: "Store chat history on this account",
        default: true
      } as SettingItem,
    ] as SettingItem[]
  },

  {
    id: "dataControl",
    label: "Data Control",
    items: [
      {
        id: "data.training",
        ui: "toggle",
        valueType: "boolean",
        level: "usual",
        label: "Use My Data",
        description: "Allow data usage to improve models",
        default: false
      } as SettingItem,
      {
        id: "data.clearHistory",
        ui: "danger",
        level: "critical",
        label: "Delete Chat History",
        description: "Permanently delete all chat history",
        action: {
          type: "intent",
          intent: "data.clearHistory"
        }
      } as SettingItem,
    ] as SettingItem[]
  }
]


export default SettingSchema;