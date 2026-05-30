export type MemoryCollection =
  | "FACTS"
  | "PREFERENCES"
  | "PROJECTS"
  | "EPISODIC";

export interface MemoryRecord {
  id: string;
  collection: MemoryCollection;
  userID: string;
  content: string;
  embedding: number[];
  createdAt: number;
}

export type MemoryPointPayload = {
  content: string;
  userID: string;
  collection: MemoryCollection;
  createdAt: number;
}

export type MemoryPoint = {
  id: string;
  vector: number[];
  payload: MemoryPointPayload;
};

export type MemoryPoints = MemoryPoint[];

export type MemoryQuery = {
  userID: string;
  collection: MemoryCollection;
  embedding: number[];
  topK: number;
};

export type MemoryQueryResponse = {
  id: string;
  userID: string;
  content: string;
  score: number;
  collection: MemoryCollection;
  createdAt: number;
};