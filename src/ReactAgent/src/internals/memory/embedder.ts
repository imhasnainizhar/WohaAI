

export interface Embedder {
    embed(text: string): Promise<number[]>;
}
  