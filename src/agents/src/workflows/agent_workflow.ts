import { StateGraph, START, END, Annotation, AnnotationRoot } from '@langchain/langgraph';
import type { GraphState } from '@internals/types/agent';


const AnnotationState = Annotation.Root({
    userID: Annotation<string | undefined>,
    username: Annotation<string | undefined>,
    sid: Annotation<string>,
    input: Annotation<string>,
    messages: Annotation<string[]>,
    memory: Annotation<string>,
    engineeredInput: Annotation<string>,
    searchResult: Annotation<string>,
    scrapedResult: Annotation<string>,
    output: Annotation<string>
})

export default async function initAgentWorkflow(state: typeof AnnotationState.State) {

    const workflow = new StateGraph(AnnotationState);

    // Start node
    workflow.addNode(START, async (state: GraphState) => {
        return { ...state };
    });

    workflow.addNode("engineer_prompt", async (state: GraphState) => {
        return ""
    })

    // Search node using MCP tool via agent
    workflow.addNode("web_search", async (state: typeof AnnotationState) => {
        const result = await agent.invoke({ messages: state.State.messages });
        return { ...state, searchResult: result.output };
    });

    // Search node using MCP tool via agent
    workflow.addNode("web_scrap", async (state: GraphState) => {
        const result = await agent.invoke({ sid: state.sid, input: state.input });
        return { ...state, scrapedResult: result.output };
    });

    // Summarization node
    workflow.addNode("summarize", async (state: GraphState) => {
        const summary = await agent.invoke({ input: state.input, sid: state.sid });
        return { ...state, output: summary.output };
    });

    // End node
    workflow.addNode(END, async (state: GraphState) => state);

    // Connect nodes
    workflow.addEdge(START, "__start__");
    workflow.addEdge("web_search", "summarize");
    workflow.addEdge("summarize", END);

    return workflow.compile;
}