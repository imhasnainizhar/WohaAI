import {
    Settings,
} from "@wohaai/db";
import { StorableSettingKey } from "@wohaai/types";
import { DEFAULT_SETTINGS } from "@wohaai/constants";

function toMongoPath(
    key: StorableSettingKey
) {
    return `values.${key}`;
}

export async function findOrCreateSettings(
    userId: string
) {
    return Settings.findOneAndUpdate(
        { userId },
        {
            $setOnInsert: {
                userId,
                values: DEFAULT_SETTINGS,
                updatedAt: new Date(),
            },
        },
        {
            new: true,
            upsert: true,
        }
    );
}

export async function patchSettings(
    userId: string,
    updates: {
        key: StorableSettingKey;
        value: unknown;
    }[]
) {
    const $set: Record<string, unknown> = {
        updatedAt: new Date(),
    };

    for (const update of updates) {
        $set[toMongoPath(update.key)] =
            update.value;
    }

    return Settings.findOneAndUpdate(
        { userId },
        { $set },
        {
            new: true,
            upsert: true,
        }
    );
}