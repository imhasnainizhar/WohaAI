import reactAgentWorkflow from "@workflows/ReactWorkflow";

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
      userID: undefined,
      username: undefined,
      sid: "session_1",
    };
  
    // Run the workflow
    const finalState = await agent.invoke(initialState);
  
    console.log("Workflow finished:", finalState.output);
  }