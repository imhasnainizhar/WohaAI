

// ─── Storable setting keys ────────────────────────────────────────────────────
// Only settings with ui: "select" | "toggle" live here.
// Settings with ui: "navigate" | "danger" are handled by dedicated user APIs.
export type StorableSettingKey =
    | "personalization.memory"
    | "personalization.chatHistory"
    | "data.training";

// ─── Value shape ──────────────────────────────────────────────────────────────
export interface ISettingsValues {
    personalization: {
        memory: boolean;
        chatHistory: boolean;
    };
    data: {
        training: boolean;
    };
}