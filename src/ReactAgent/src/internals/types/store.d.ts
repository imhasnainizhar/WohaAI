export type MemoryCollection =
  | "FACTS"
  | "PREFERENCES"
  | "PROJECTS"
  | "EPISODIC";

export interface MemoryRecord {
  id: string;
  collection: MemoryCollection;
  userId: string;
  username?: string;
  content: string;
  embedding: number[];
}


export type MemoryPoint = {
  id: string;
  vector: number[];
  payload: {
    content: string;
    userId: string;
    username?: string;
    collection: MemoryCollection;
    createdAt: number;
  };
};

export type MemoryQuery = {
  userId: string;
  username?: string;
  collection: MemoryCollection;
  embedding: number[];
  topK: number;
};

export type MemoryQueryResponse = {
  id: string;
  userId: string;
  username?: string;
  content: string;
  score: number;
  collection: MemoryCollection;
  createdAt: number;
};