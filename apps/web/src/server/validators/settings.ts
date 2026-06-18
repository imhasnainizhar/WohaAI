import {
    STORABLE_KEYS,
    StorableSettingKey,
} from "@wohaai/db";

type RawUpdate = {
    key: unknown;
    value: unknown;
};

export function normalizeUpdates(
    body: unknown
): {
    key: StorableSettingKey;
    value: unknown;
}[] {
    let updates: RawUpdate[] = [];

    if (
        body &&
        typeof body === "object" &&
        "key" in body &&
        "value" in body
    ) {
        updates = [body as RawUpdate];
    } else if (
        body &&
        typeof body === "object" &&
        "updates" in body &&
        Array.isArray(
            (body as any).updates
        )
    ) {
        updates = (body as any).updates;
    } else {
        throw new Error(
            "Invalid body"
        );
    }

    const valid = updates.filter(
        (
            u
        ): u is {
            key: StorableSettingKey;
            value: unknown;
        } =>
            typeof u.key === "string" &&
            STORABLE_KEYS.has(
                u.key as StorableSettingKey
            )
    );

    if (!valid.length) {
        throw new Error(
            "No valid settings"
        );
    }

    return valid;
}