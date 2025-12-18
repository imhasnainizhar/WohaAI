

// Graph State Type
export type GraphState = {
  userID?: string;
  username?: string;
  sid: string;
  input: string;
  messages: string[];
  memory?: string;
  searchResult?: string;
  scrapedResult?: string;
  output?: string;
};

// Normalized Tool Output Type
export type NormalizedToolOutput = {
  tool: ToolName;
  call_id: string;
  contentType?: "text" | "json" | "html" | "error";
  body: string;              // ALWAYS stringified
  meta?: Record<string, any>;
  createdAt?: number | undefined;
};

//-----------------------------------//
// Plan Type for LLM Planner
// For Future Use

export readonly type Step =
  | "WebSearch"
  | "WebScrape"
  | "Summarize"
  | "CreateMemory"
  | "FinalResponse";


  export type Plan = {
  readonly goal: string,
  readonly steps: readonly Step[],
}

export function validtePlan(plan: Plan) : Promise<Boolean>;
//-----------------------------------//