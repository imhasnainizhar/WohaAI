

// Graph State Type used as param of agent
export type GraphState = {
  sid: string;
  input: string;
  memory?: string;
  searchResult?: string;
  output?: string;
};