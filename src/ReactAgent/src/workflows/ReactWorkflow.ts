import { StateGraph, START, END, Annotation } from '@langchain/langgraph';
import { BaseMessage, ToolMessage, ToolCall } from 'langchain';
import { toolsNode } from '@graph/tool_nodes/tool_executor.js';
import { plannerNode } from '@graph/workflow_nodes/planner.js';
import { responseNode } from '@graph/workflow_nodes/response.js';
import summarizerNode from '@graph/tool_nodes/summarizer.js';
import { InitChatNode } from '@graph/workflow_nodes/init_chat.js';
import { workflowTransitionLogger } from '@utils/workflow_logger.js';
import { PlannerDecision } from '@internals/schemas/planner.js';
import { memoryNode } from '@graph/memory_nodes/memory.js';
// import { toolCallNode } from '@graph/workflow_nodes/tool_call.js';
import { threadHistoryNode } from '@graph/memory_nodes/thread_history.js';
import { uuidv7 } from 'zod/v4';

// Define the annotation schema for the workflow state
export const AnnotationState = Annotation.Root({
    userID: Annotation<string | undefined>({
        default: () => "3hani213", // Just for testing purposes.
        reducer: (userID, newUserID) => newUserID
    }),
    username: Annotation<string | undefined>({
        default: () => "3hani213", // Just for testing purposes.
        reducer: (username, newUsername) => newUsername
    }),
    sid: Annotation<string>({
        default: () => "session_1",  // Just for testing purposes.
        reducer: (sid, newSid) => newSid
    }),
    threadID: Annotation<string>({
        default: () => uuidv7().toString(),
        // We will never change it, so we don't need to reduce it
        reducer: (threadID, _) => threadID
    }),
    input: Annotation<string>(),
    // Msg state keep all messages
    messages: Annotation<BaseMessage[]>({
        default: () => [],
        reducer: (messages, newMessages) => {
            return [...messages, ...newMessages];
        }
    }),
    // tool_call state keep only latest tool calls
    tool_calls: Annotation<ToolCall[]>({
        default: () => [],
        reducer: (_, new_tool_calls) => [...new_tool_calls]
    }),
    tool_exec_count: Annotation<number>({
        default: () => 0,
        reducer: (count, newCount) => count + newCount
    }),
    // tool_messages state keep only latest tool messages
    tool_messages: Annotation<ToolMessage[]>({
        default: () => [],
        reducer: (_, newTool_messages) => [...newTool_messages]
    }),
    planner_decision: Annotation<PlannerDecision>(),
    // tool_outputs state keep all tool outputs
    tool_outputs: Annotation<String[]>({
        default: () => [],
        reducer: (tool_outputs, new_tool_outputs) => [...tool_outputs, ...new_tool_outputs]
    }),
    // new_tool_output state keep only latest tool output
    new_tool_output: Annotation<String[]>({
        default: () => [],
        reducer: (tool_outputs, new_tool_outputs) => [...new_tool_outputs]
    }),
    // summarizer_path state helps to decide wheather to route on planner decision or not.
    summarizer_path: Annotation<boolean>({
        default: () => false,
        reducer: (summarizerValue, newSummarizerValue) => newSummarizerValue
    }),
    // summarized_tool_output state keep all summarized tool outputs
    summarized_tool_output: Annotation<String[]>({
        default: () => [],
        reducer: (summarized_tool_output, newSummarized_tool_output) => [...summarized_tool_output, ...newSummarized_tool_output]
    }),
    // last_summary_index state keep the index of the last summarized tool output
    last_summary_index: Annotation<number>({
        default: () => 0,
        reducer: (_, newIndex) => newIndex
    }),
    // memory state keep the memory of the agent
    memory: Annotation<string>({
        default: () => "",
        reducer: (memory, newMemory) => memory.concat(newMemory ?? "")
    }),
    // refinedInput state keep the refined input of the agent
    refinedInput: Annotation<string>(),
    // output state keep the output of the agent
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

        .addNode("Memory", memoryNode)

        .addNode("Planner", plannerNode)

        // .addNode("ToolCall", toolCallNode)

        .addNode("Tools", toolsNode)

        .addNode("Summarize", summarizerNode)

        .addNode("Response", responseNode)

        .addNode("ThreadHistory", threadHistoryNode)

        // Added Workflow Edges
        .addEdge(START, "InitChat")
        .addConditionalEdges("InitChat", workflowTransitionLogger("InitChat", (state) => {
            if (state.userID) return "Memory";
            return "Planner";
        }), {
            Memory: "Memory",
            Planner: "Planner",
        })

        // Planner decides: tools or final
        .addConditionalEdges("Memory", workflowTransitionLogger("Memory", (state) => {
            return "Planner";
        }), {
            Planner: "Planner",
        })

        // Planner decides: tools or final
        .addConditionalEdges(
            "Planner",
            workflowTransitionLogger("Planner", (state) => {
                const hasPendingToolRequests = state.tool_calls.length > 0;

                const hasNewToolOutputs = (
                    state.tool_outputs.length > (state.last_summary_index ?? 0)
                    && state.tool_outputs.length > 6
                    && state.tool_outputs.length % 3 === 0
                ) || (
                        state.summarizer_path && state.tool_calls.length === 0
                    );

                if (hasPendingToolRequests) return "Tools";
                if (hasNewToolOutputs) return "Summarize";
                return "Response";
            }),
            {
                Tools: "Tools",
                Summarize: "Summarize",
                Response: "Response"
            }
        )

        // .addConditionalEdges("Planner", workflowTransitionLogger("Planner", (state) => {
        //     if (state.planner_decision.action === "Tools") return "ToolCall";
        //     if (state.planner_decision.action === "Summarize") return "Summarize";
        //     return "Response";
        // }), {
        //     ToolCall: "ToolCall",
        //     Summarize: "Summarize",
        //     Response: "Response",
        // })

        // .addConditionalEdges("ToolCall", workflowTransitionLogger("ToolCall", (state) => {
        //     if (state.tool_calls.length > 0) return "Tools";
        //     return "Response";
        // }), {
        //     Tools: "Tools",
        //     Response: "Response",
        // })

        // After Tools, decide whether to summarize
        .addConditionalEdges(
            "Tools",
            workflowTransitionLogger(
                "Tools",
                (state) => {

                    const needSummarization = state.tool_outputs.length && state.tool_outputs.length % 3 === 0;
                    if (state.tool_calls.length > 0) return "Tools";
                    if (needSummarization) return "Summarize";
                    return "Planner";
                }),
            {
                Summarize: "Summarize",
                Planner: "Planner",
            }
        )

        // Summarizer now flows to Planner for deciding is data enough to answer user question or not.
        .addEdge("Summarize", "Planner")

        // Save thread history after response
        .addEdge("Response", "ThreadHistory")

        // Final is decided by Planner.
        .addEdge("ThreadHistory", END);

    // Compiling Workflow
    return workflow.compile({
        checkpointer: undefined,
        store: undefined,
        cache: undefined,
    })
}