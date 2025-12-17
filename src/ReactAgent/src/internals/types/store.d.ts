// memory.types.ts
export type MemoryQuadrant =
  | "FACTS"
  | "PREFERENCES"
  | "PROJECTS"
  | "EPISODIC";

export interface MemoryRecord {
  id: string;
  quadrant: MemoryQuadrant;
  content: string;
  embedding: number[];
  metadata?: Record<string, any>;
  createdAt: number;
}