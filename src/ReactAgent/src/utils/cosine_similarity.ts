export function cosineSimilarity(a: number[], b: number[]) {
    let dot = 0, na = 0, nb = 0;
    if (a !== undefined && b !== undefined) {
        for (let i = 0; i < a.length; i++) {
            dot += a[i]! * b[i]!;
            na += a[i]! * a[i]!;
            nb += b[i]! * b[i]!;
        }
        return dot / (Math.sqrt(na) * Math.sqrt(nb));
    }
    return 0;
}