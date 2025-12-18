import { AnnotationState } from '@workflows/ReactWorkflow';
import { ToolName, ToolOutput, ToolRegistry } from "@tools/registry";
import { ToolMessage } from "langchain";
import { ToolInput } from '@tools/registry';
import { logger } from '@utils/logger';
import { NormalizedToolOutput } from '@internals/types/agent';

export async function toolsNode(state: typeof AnnotationState.State) {
    // 🔧 Tool execution entry point
    logger.debug("Tool Node Processing...");

    // Only collect messages produced by THIS node
    const toolMessages: ToolMessage[] = [];
    const toolOutput: NormalizedToolOutput[] = [];
    for (const call of state.tool_calls ?? []) {
        if (!call.id) {
            // 🚨 Tool calls must always have IDs
            throw new Error("Tool call missing id");
        }

        const toolName = call.name as ToolName;
        const tool = ToolRegistry[toolName];

        logger.debug(`Executing Tool → ${toolName} (${call.id})`);

        try {
            // Execute tool with validated input
            const output: ToolOutput<typeof toolName> = await tool.execute(
                call.args as ToolInput<typeof toolName>
            );

            const normalized: NormalizedToolOutput = {
                tool: toolName,
                call_id: call.id,
                body: JSON.stringify(output),
                meta: { status: "success" },
                createdAt: Date.now()
            };

            // Extract main content for logging
            let mainContent: string = "";
            if (typeof output === "string") mainContent = JSON.stringify(output).slice(0, 250) as string;
            else if (Array.isArray(output) && output.length > 0) mainContent = JSON.stringify(output[0]).slice(0, 250) as string;
            else mainContent = JSON.stringify(output).slice(0, 250) as string;

            toolOutput.push(normalized);

            // ToolMessage MUST reference tool_call_id
            const tm = new ToolMessage({
                tool_call_id: call.id,
                content: JSON.stringify({
                    status: "success",
                    meta: { status: "success" },
                    createdAt: Date.now(),
                }),
            });

            toolMessages.push(tm);

            // ✅ Log main content only
            logger.info(`Tool OK → ${toolName} (${call.id}), main content: ${mainContent}...`);
        } catch (err: any) {
            // Tool failure still produces a ToolMessage
            const tm = new ToolMessage({
                tool_call_id: call.id,
                content: JSON.stringify(err.message),
            });

            toolMessages.push(tm);
            logger.error(`Tool FAILED → ${toolName}: ${err.message}`);
        }
    }

    logger.debug(`Tools executed: ${toolMessages.length}`);

    // Tool Node just returns without mutating workflow state
    // State is mutated in Workflow file for tool messages and tool outputs
    return {
        // ✅ Only messages produced by this node
        // We are not using [] array notation to make ToolMessage iterable by reducer...
        // Because toolMessages is already an iterable array of ToolMessage objects.
        messages: toolMessages,

        // ✅ Persist tool outputs separately for final response
        // Same here, toolMessages is already an iterable array of ToolMessage objects.
        tool_messages: toolMessages,

        // ✅ Persist tool outputs separately for final response
        // Same here, toolOutput is already an iterable array of ToolOutput objects.
        tool_outputs: toolOutput ?? [],

        // 🔥 MUST clear tool_calls or planner will loop
        tool_calls: [],

        // Increment execution count via reducer
        tool_exec_count: toolMessages.length
    };
}
