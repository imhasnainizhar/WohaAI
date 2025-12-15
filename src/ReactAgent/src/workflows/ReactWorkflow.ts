import { AnnotationState } from '@workflows/ReactWorkflow';
import { StateGraph, START, END, Annotation, AnnotationRoot } from '@langchain/langgraph';
import { BaseMessage, HumanMessage, ToolMessage, ToolCall, AIMessage, SystemMessage } from 'langchain';
import { toolsNode } from '@graph/ToolNodes/ToolNode';
import { webScraperNode } from '@graph/ToolNodes/WebScraperNode';
import { webSearchNode } from '@graph/ToolNodes/WebSearchNode';
import llmNode from '@graph/LLMNodes/LLMNode';
import { logger } from '@utils/logger';


// Define the annotation schema for the workflow state
export const AnnotationState = Annotation.Root({
    userID: Annotation<string | undefined>(),
    username: Annotation<string | undefined>(),
    sid: Annotation<string>(),
    input: Annotation<string>(),
    messages: Annotation<BaseMessage[]>({
        default: () => [],
        reducer: (messages, newMessages) => [...messages, ...newMessages]
    }),
    tool_calls: Annotation<ToolCall[]>({
        default: () => [],
        reducer: (_, new_call) => new_call
    }),
    tool_exec_count: Annotation<number>({
        default: () => 0,
        reducer: (_, newCount) => newCount
    }),
    tool_messages: Annotation<ToolMessage[]>({
        default: () => [],
        reducer: (tool_messages, newTool_messages) => [...tool_messages, ...newTool_messages]
    }),
    memory: Annotation<string>({
        default: () => "",
        reducer: (memory, newMemory) => newMemory
    }),
    refinedInput: Annotation<string>(),
    output: Annotation<string>({
        default: () => "",
        reducer: (output, newOutput) => newOutput
    })
});

export default async function reactAgentWorkflow() {

    const llm = await llmNode();

    // Internal Nodes
    const InitChatNode = async (state: typeof AnnotationState.State) => {
        logger.debug("Refining input...")
        const refined = `Refined prompt for input: ${state.input}`;
        logger.debug(`Refining input: ${state.input}`)
        return { ...state, messages: [...state.messages, new HumanMessage(refined)], refinedInput: refined };
    };

    const FinalResponseNode = async (state: typeof AnnotationState.State) => {
        logger.debug("Final Responding...")
        const finalResult = await llm.invoke([...state.messages, ...state.tool_messages]);
        logger.debug(`Response: ${finalResult.content}`)
        return { ...state, messages: [...state.messages, finalResult], output: finalResult.content };
    };

    // Router Nodes
    const llmRoutingNode = async (state: typeof AnnotationState.State) => {
        
    }


    // Creating Graph Workflow
    const workflow = new StateGraph(AnnotationState)

        // Adding Nodes to Graph
        .addNode("InitChat", InitChatNode)
        .addNode("Tools", toolsNode)
        .addNode("llmRouting", llmRoutingNode)
        .addNode("WebSearch", webSearchNode)
        .addNode("WebScraper", webScraperNode)
        .addNode("FinalResponse", FinalResponseNode)

        // Adding Edges to Graph
        .addEdge(START, "InitChat")
        .addEdge("InitChat", "WebSearch")
        .addEdge("WebSearch", "RouterWebSearch")


        .addConditionalEdges(
            "RouterWebSearch",
            (state) => state.tool_calls?.length > 0 ? "Tools" : "WebScraper",
            {
                Tools: "Tools",
                WebScraper: "WebScraper"
            }
        )

        .addEdge("Tools", "RouterWebSearch")
        .addEdge("WebScraper", "RouterWebScraper")

        .addConditionalEdges(
            "RouterWebScraper",
            (state) => state.tool_calls?.length > 0 ? "Tools" : "FinalResponse",
            {
                Tools: "Tools",
                FinalResponse: 'FinalResponse'
            }
        )

        .addEdge("FinalResponse", END);

    // Compiling Workflow
    return workflow.compile({
        checkpointer: undefined,
        store: undefined,
        cache: undefined,
    });
}