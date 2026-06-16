export function applyDotPath<T>(
    obj: T,
    path: string,
    value: unknown
): T {
    const parts = path.split(".");

    const clone = structuredClone(
        obj
    );

    let cursor: any = clone;

    for (
        let i = 0;
        i < parts.length - 1;
        i++
    ) {
        const part = parts[i];
        if (part === undefined) continue;
        cursor = cursor[part];
    }

    cursor[
        parts[parts.length - 1] as keyof T
    ] = value as any;

    return clone;
}