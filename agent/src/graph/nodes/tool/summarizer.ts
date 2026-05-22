import { AnnotationState } from "@workflows/react.js";
import { logger } from "../../../logger/logger.js";
import { AIMessage, HumanMessage, SystemMessage, Tool } from "langchain";
import { summarizerModel } from "src/llm(s)/summarizer.js";
import summarizerPrompt from "../../../domain/prompts/summarizer.js";
import { summarizingTextTemplate } from "../../../domain/templates/summarizer.js";

// Summarizer node compresses tool outputs into a single summarized message
export default async function summarizerNode(state: typeof AnnotationState.State) {
    // 📝 Summarizer entry
    logger.debug("Summarizer Node Processing...");

    const llm = await summarizerModel();

    logger.debug(`Summarizer content size: ${state.tool_outputs.length} tool output(s)`);

    const lastSummaryIndex = state.last_summary_index;
    const toolOutputsToSummarize: String[] = state.tool_outputs.slice(lastSummaryIndex, state.tool_outputs.length);


    const textToSummarize = summarizingTextTemplate(state.summarized_tool_output, toolOutputsToSummarize);
    const textToSummarizeHumanMsg = new HumanMessage({
        content: textToSummarize
    });
    logger.debug(`Text to summarize: ${textToSummarize.slice(0, 250)}`);
    // Invoke LLM to summarize tool outputs
    const summarizedResult: AIMessage = await llm.invoke([
        summarizerPrompt,
        textToSummarizeHumanMsg
    ]);

    logger.debug(`Summarized result: ${JSON.stringify(summarizedResult)}`);

    // 🚨 Validate summary result
    if (!summarizedResult.content || summarizedResult.content === "") {
        throw new Error("Summarizer must emit content");
    }

    const summarizedToolOutput: String = JSON.stringify(summarizedResult.content);

    return {
        // ✅ Return summarized tool output
        summarized_tool_output: [...state.summarized_tool_output, summarizedToolOutput],
        last_summary_index: lastSummaryIndex + toolOutputsToSummarize.length
    };
}