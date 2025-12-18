import { StateGraph, START, END, Annotation } from '@langchain/langgraph';
import { BaseMessage, HumanMessage, ToolMessage, ToolCall, SystemMessage, AIMessage } from 'langchain';
import { toolsNode } from '@graph/ToolNodes/ToolNode';
import { logger } from '@utils/logger';
import { plannerNode } from '@graph/WorkflowNodes/PlaannerNode';
import { responseNode } from '@graph/WorkflowNodes/ResponseNode';
import summarizerNode from '@graph/ToolNodes/SummarizerNode';
import { InitChatNode } from '@graph/WorkflowNodes/InitChatNode';


// Define the annotation schema for the workflow state
export const AnnotationState = Annotation.Root({
    userID: Annotation<string | undefined>(),
    username: Annotation<string | undefined>(),
    sid: Annotation<string>(),
    input: Annotation<string>(),
    messages: Annotation<BaseMessage[]>({
        default: () => [],
        reducer: (messages, newMessages) => {
            return [...messages, ...newMessages];
        }
    }),
    tool_calls: Annotation<ToolCall[]>({
        default: () => [],
        reducer: (_, new_call) => new_call
    }),
    tool_exec_count: Annotation<number>({
        default: () => 0,
        reducer: (count, newCount) => count + newCount
    }),
    tool_messages: Annotation<ToolMessage[]>({
        default: () => [],
        reducer: (tool_messages, newTool_messages) => [...tool_messages, ...newTool_messages]
    }),
    tool_outputs: Annotation<String[]>({
        default: () => [],
        reducer: (tool_outputs, newTool_outputs) => [...tool_outputs, ...newTool_outputs]
    }),
    summarizer_path: Annotation<boolean>({
        default: () => false,
        reducer: (summarizerValue, newSummarizerValue) => newSummarizerValue
    }),
    summarized_tool_output: Annotation<String[]>({
        default: () => [],
        reducer: (summarized_tool_output, newSummarized_tool_output) => [...newSummarized_tool_output]
    }),
    last_summary_index: Annotation<number>({
        default: () => 0,
        reducer: (_, newIndex) => newIndex
    }),
    memory: Annotation<string>({
        default: () => "",
        reducer: (memory, newMemory) => newMemory
    }),
    refinedInput: Annotation<string>(),
    output: Annotation<string>({
        default: () => "",
        reducer: (output, newOutput) => newOutput
    }),
    errorMessages: Annotation<string[]>({
        default: () => [],
        reducer: (errorMessages, newErrorMessages) => [...errorMessages, ...newErrorMessages]
    })
});

export default async function reactAgentWorkflow() {

    // Creating Graph Workflow
    const workflow = new StateGraph(AnnotationState)

        // Added Workflow Nodes
        .addNode("InitChat", InitChatNode)

        .addNode("Planner", plannerNode)

        .addNode("Tools", toolsNode)

        .addNode("Summarize", summarizerNode)

        .addNode("Response", responseNode)

        // Added Workflow Edges
        .addEdge(START, "InitChat")
        .addEdge("InitChat", "Planner")

        // Planner decides: tools or final
        .addEdge(START, "InitChat")
        .addEdge("InitChat", "Planner")

        // Planner decides: tools or final
        .addConditionalEdges(
            "Planner",
            (state) => {
                const hasPendingToolCalls = state.tool_calls.length > 0;
                const hasNewToolOutputs = state.tool_outputs.length > (state.last_summary_index ?? 0) && state.summarizer_path && state.tool_calls.length === 0;
                if (hasPendingToolCalls) return "Tools";
                if (hasNewToolOutputs) return "Summarize";
                return "Response";
            },
            {
                Tools: "Tools",
                Summarize: "Summarize",
                Response: "Response"
            }
        )

        // After Tools, decide whether to summarize
        .addConditionalEdges(
            "Tools",
            (state) => {
                const hasNewToolOutputs = state.tool_outputs.length > (state.last_summary_index ?? 0) && state.summarizer_path && state.tool_calls.length === 0;
                if (hasNewToolOutputs) return "Summarize";
                return "Planner";
            },
            {
                Summarize: "Summarize",
                Planner: "Planner",
            }
        )

        // Summarizer now flows to Planner for deciding is data enough to answer user question or not.
        .addEdge("Summarize", "Planner")

        // Final is decided by Planner.
        .addEdge("Response", END);

    // Compiling Workflow
    return workflow.compile({
        checkpointer: undefined,
        store: undefined,
        cache: undefined,
    })
}