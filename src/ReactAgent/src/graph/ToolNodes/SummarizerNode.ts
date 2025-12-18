import { AnnotationState } from "@workflows/ReactWorkflow";
import { logger } from "@utils/logger";
import { AIMessage, HumanMessage, SystemMessage, Tool } from "langchain";
import { summarizerModel } from "@models/summarizer.model";
import summarizerPrompt from "@internals/prompts/summarizer_prompt";
import { summarizingTextTemplate } from "@internals/templates/summarizing_text_template";

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
    logger.debug(`Text to summarize: ${textToSummarize}`);
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

    // Log summary completion
    logger.info(
        `Summarizer summarized ${state.tool_outputs.length} tool output(s) → Planner path 🧠`
    );

    return {
        // ✅ Return summarized tool output
        summarized_tool_output: [summarizedToolOutput],
        last_summary_index: lastSummaryIndex + toolOutputsToSummarize.length
    };
}