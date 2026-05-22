function validateEnv(env: Record<string, any>) {
    const missing = Object.entries(env)
        .filter(([_, v]) => !v || v.trim?.() === "")
        .map(([k]) => k);

    if (missing.length) {
        throw new Error(`Missing env: ${missing.join(", ")}`);
    }
}