import { AnnotationState } from "@workflows/react.js";
import { ToolRegistry, ToolName, ToolInput, ToolOutput } from "@tools/registry.js";
import { ToolMessage } from "langchain";
import { logger } from "@utils/logger.js";
import { NormalizedToolOutput } from "../../../domain/types/agent.js";

export async function toolsNode(state: typeof AnnotationState.State) {
  logger.debug("🔧 Tool Node start");

  const toolMessages: ToolMessage[] = [];
  const toolOutputs: NormalizedToolOutput[] = [];

  for (const call of state.tool_calls ?? []) {
    const { id, name, args } = call;

    if (!id) throw new Error("Tool call missing id");

    const toolName = name as ToolName;
    const tool = ToolRegistry[toolName];

    if (!tool?.execute) {
      logger.warn(`Invalid tool: ${toolName}`);

      toolMessages.push(
        new ToolMessage({
          tool_call_id: id,
          content: JSON.stringify({ error: "Invalid tool" }),
        })
      );

      toolOutputs.push({
        tool: toolName,
        call_id: id,
        body: JSON.stringify({ error: "Invalid tool" }),
        meta: { status: "invalid" },
        createdAt: Date.now(),
      });

      continue;
    }

    try {
      const output: ToolOutput<typeof toolName> = await tool.execute(
        args as ToolInput<typeof toolName>
      );

      toolOutputs.push({
        tool: toolName,
        call_id: id,
        body: JSON.stringify(output),
        meta: { status: "success" },
        createdAt: Date.now(),
      });

      toolMessages.push(
        new ToolMessage({
          tool_call_id: id,
          content: JSON.stringify({ status: "success" }),
        })
      );

      logger.info(`✅ Tool OK → ${toolName} (${id})`);
    } catch (err: any) {
      toolMessages.push(
        new ToolMessage({
          tool_call_id: id,
          content: JSON.stringify({ error: err.message }),
        })
      );

      toolOutputs.push({
        tool: toolName,
        call_id: id,
        body: JSON.stringify({ error: err.message }),
        meta: { status: "error" },
        createdAt: Date.now(),
      });

      logger.error(`❌ Tool FAILED → ${toolName}: ${err.message}`);
    }
  }

  return {
    messages: toolMessages,
    tool_messages: toolMessages,
    tool_outputs: toolOutputs,

    // CRITICAL: always clear tool_calls
    tool_calls: [],

    tool_exec_count: toolMessages.length,
  };
}
