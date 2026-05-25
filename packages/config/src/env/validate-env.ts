import { EnvConfig } from "../EnvConfig";

export function validateEnv(env: EnvConfig) {
    const missing = Object.entries(env)
        .filter(([_, v]) => !v || v.trim?.() === "")
        .map(([k]) => k);

    if (missing.length) {
        throw new Error(`Missing env: ${missing.join(", ")}`);
    }
    return env as EnvConfig
}