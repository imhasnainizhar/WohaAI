

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