import { StateGraph, START, END, Annotation, AnnotationRoot } from '@langchain/langgraph';
import type { GraphState } from '@internals/types/graph';
import { openAiModelWithTools } from '@internals/models/chat.model';
import { BaseMessage, HumanMessage, ToolMessage, ToolCall, AIMessage, SystemMessage } from 'langchain';
import { getMCPTools } from '@tools/externals/mcp_tools';


// Define the annotation schema for the workflow state
const AnnotationState = new AnnotationRoot({
    userID: Annotation<string | undefined>(),
    username: Annotation<string | undefined>(),
    sid: Annotation<string>(),
    input: Annotation<string>(),
    messages: Annotation<BaseMessage[]>(),
    tool_calls: Annotation<ToolCall[] | undefined>(),
    tool_messages: Annotation<ToolMessage[] | undefined>(),
    memory: Annotation<string>(),
    refinedInput: Annotation<string>(),
    searchResult: Annotation<string>(),
    scrapedResult: Annotation<string>(),
    output: Annotation<string>()
});

export default async function initAgentWorkflow() {

    // Tools node: execute MCP tool calls
    async function toolsNode(state: typeof AnnotationState.State) {
        const tools = await getMCPTools();

        const toolMessages: ToolMessage[] = [];

        for (const toolCall of state.tool_calls || []) {
            const tool = tools.find(t => t.name === toolCall.name);
            if (!tool) {
                toolMessages.push( new ToolMessage({
                    content: `Tool ${toolCall.name} not found`,
                    tool_call_id: toolCall.id
                }));
                continue;
            }

            try {
                const result = await tool.invoke(toolCall.args);
                toolMessages.push(new ToolMessage({
                    content: typeof result === 'string' ? result : JSON.stringify(result),
                    tool_call_id: toolCall.id
                }));
            } catch (error : any) {
                toolMessages.push(new ToolMessage({
                    content: `Error: ${error.message}`,
                    tool_call_id: toolCall.id
                }));
            }
        }

        return {
            messages: [...state.messages, ...toolMessages],
            tool_messages: [...(state.tool_messages || []), ...toolMessages],
            tool_calls: []
        };
    }

    // Router: decide between LLM/tools/END based on tool_calls
    function shouldContinue(state: typeof AnnotationState.State) {
        return state.tool_calls?.length ? "tools" : END;      // 🚨 Need for maturity 🚨
    }

    const llm = await openAiModelWithTools();

    // Prompt engineering node
    const init_chat = async (state: typeof AnnotationState.State) => {
        const refined = `Refined prompt for input: ${state.input}`;
        return { ...state, RefinedInput: refined };
    };

    // Web search node using LLM (can later integrate MCP tool)
    const web_search = async (state: typeof AnnotationState.State) => {
        const systemMessage = new SystemMessage(
            `You can call web search tool to get webpages urls for latest information, urls be scrapped later.
            When a tool is required, return a ToolCall object in JSON format with name and args.`
        );    
        const result = await llm.invoke([
            systemMessage, 
            ...state.messages, 
            new HumanMessage(state.refinedInput)
        ]);
        return { ...state, searchResult: result.content };
    };

    // Web scraping node
    const web_scraper = async (state: typeof AnnotationState.State) => {
        const systemMessage = new SystemMessage(
            `You have to call web scraper tool to get latest information by fetching webpages url & scrapping webpages.
            When a tool is required, return a ToolCall object in JSON format with name and args.`
        );    
        const result = await llm.invoke(state.searchResult);
        return { ...state, scrapedResult: result.content };
    };

    // Final Response Node
    const finalResponse = async (state: typeof AnnotationState.State) => {
        const finalResult = await llm.invoke(state.scrapedResult);
        return { ...state, output: finalResult.content };
    };

    // Creating Graph Workflow
    const workflow = new StateGraph(AnnotationState)

        // Adding Nodes to Graph
        .addNode("__start__", async (state: typeof AnnotationState.State) => state)
        .addNode("init_chat", init_chat)
        .addNode("web_search", web_search)
        .addNode("web_scraper", web_scraper)
        .addNode("final_response", finalResponse)

        // End node
        .addNode(END, async (state: typeof AnnotationState.State) => state)
        
        // Connect nodes
        .addEdge(START, "init_chat")
        .addEdge("init_chat", "web_search")
        .addEdge("web_search", "web_scraper")
        .addEdge("web_scraper", "final_response")
        .addEdge("final_response", END);

    // Compiling Workflow
    workflow.compile();

}
