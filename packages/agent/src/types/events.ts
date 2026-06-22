// Event types for WoahAI Agent

export interface WSSEEvent<T = any> {
  type: string;
  data?: T;
}

export interface WMessageStart {
  id: string;
  type: string;
  model: string;
  input_tokens: number;
  output_tokens: number;
  stop_reason?: string;
  stop_sequence?: string;
  content?: any[];
}

export interface WMessageStop {
  type: string;
}

export interface WTextDelta {
  type: string;
  index: number;
  text: string;
}

export interface WContentDeltaBlock {
  type: string;
  data: any;
}

export interface WInputJsonDelta {
  type: string;
  index: number;
  partial_json: string;
}

export interface WSignatureDelta {
  type: string;
  index: number;
  signature: string;
}

export interface WThinkingDelta {
  type: string;
  index: number;
  thinking: string;
}

export interface WMessageDelta {
  stop_reason?: string;
  stop_sequence?: string;
  usage?: {
    input_tokens: number;
    output_tokens: number;
  };
}

export interface WContentBlockStop {
  index: number;
}

export interface TextBlock {
  type: string;
  index: number;
  text: string;
}

export interface ThinkingBlock {
  type: string;
  index: number;
  signature: string;
}

export interface ToolUseBlock {
  type: string;
  index: number;
  id: string;
  name: string;
  input: Record<string, any>;
}

export interface WError {
  error_type: string;
  message: string;
  recoverable: boolean;
}

export interface WSearchResult {
  url: string;
  title: string;
  snippet: string;
  page_age?: string;
}

export interface WWebSearchToolResult {
  tool_use_id: string;
  query: string;
  results: WSearchResult[];
}
