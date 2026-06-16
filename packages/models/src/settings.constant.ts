import { ISettingsValues } from "./settings.types";

export const DEFAULT_SETTINGS: ISettingsValues = {
    personalization: {
        memory: true,
        chatHistory: true,
    },
    data: {
        training: false,
    },
};