export type TAIModel = {
    id: "claude-sonnet-4-6"|"claude-opus-4" | "claude-haiku-4-5"|"claude-opus-4-7" ;
    name: string;
    description: string;
    provider: string;
    tier: string;
}

export const MODELS : TAIModel[] = [
  {
    id: "claude-haiku-4-5",
    name: "Claude Haiku 4.5",
    description: "For fast response.",
    provider: "anthropic",
    tier: "fast",
  },
  {
    id: "claude-sonnet-4-6",
    name: "Claude Sonnet 4.6",
    description: "For balanced performance.",
    provider: "anthropic",
    tier: "balanced",
  },
    {
    id: "claude-opus-4",
    name: "Claude Opus 4",
    description: "For coding and thinking tasks",
    provider: "anthropic",
    tier: "excellent",
  },
  {
    id: "claude-opus-4-7",
    name: "Claude Opus 4.7",
    description: "Best in class for complex tasks",
    provider: "anthropic",
    tier: "premium",
  },
];