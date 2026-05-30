import { EnvConfig } from "../env-config";

export function validateEnv(env: EnvConfig) {
    const missing = Object.entries(env)
        .filter(([_, v]) => {
            if (v === undefined || v === null) return true;

            if (typeof v === "string") {
                return v.trim() === "";
            }

            return false;
        })
        .map(([k]) => k);

    if (missing.length) {
        throw new Error(`Missing env: ${missing.join(", ")}`);
    }

    return env;
}