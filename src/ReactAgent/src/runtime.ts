import reactAgentWorkflow from "@workflows/ReactWorkflow.js";

export async function llmRuntime(input: string) {
    const agent = await reactAgentWorkflow();

    // Initial state
    const initialState = {
      input: input,
      messages: [],
      tool_calls: [],
      tool_messages: [],
      memory: "",
      refinedInput: "",
      searchResult: "",
      scrapedResult: "",
      output: "",
      userID: "hani212",
      username: "hani212",
      sid: "hani_session_1",
    };
  
    // Run the workflow
    const finalState = await agent.invoke(initialState);
    return finalState;
}