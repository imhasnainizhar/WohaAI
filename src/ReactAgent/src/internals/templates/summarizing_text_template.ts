export const summarizingTextTemplate = (summarizedToolOutput: String[] = [], toolOutputsToSummarize: String[] = []) => `
PREVIOUS SUMMARY (if any):
${JSON.stringify(summarizedToolOutput)}

NEW TOOL OUTPUTS:
${toolOutputsToSummarize
        .map((o, i) =>
            `Source ${i + 1}:\n- ${o}`
        )
        .join("\n\n")}`;

