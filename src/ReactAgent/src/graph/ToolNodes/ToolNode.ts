import { AnnotationState } from '@workflows/ReactWorkflow';
import { ToolName, ToolOutput, ToolRegistry } from "@tools/registry";
import { ContentBlock, ToolMessage, tool } from "langchain";
import { getMCPTools } from '@tools/externals/MCPTools';
import { ToolInput } from '@tools/registry';
import { AIMessage } from 'langchain';
import { logger } from '@utils/logger';


export async function toolsNode(state: typeof AnnotationState.State) {
    logger.debug("Tool node processing...")
    const toolMessages: ToolMessage[] = [];
    // Important: Do not modify 'messages' until the very end when returning the new state.

    logger.fatal(`Calls lenght: ${state.tool_calls.length}`)


    for (const call of state.tool_calls ?? []) {
        if (!call.id) {
            logger.fatal(`Tool call had no ID, generated: ${call.id}`);
            throw new Error("Unexpected error, misisng id for tool message!");
        }

        const toolName = call.name as ToolName
        const tool = ToolRegistry[toolName];

        if (!tool) {
            // If tool is not found, push an error tool message
            toolMessages.push(new ToolMessage({
                tool_call_id: call.id,
                content: `Tool ${call.name} not found`
            }));
            // Depending on your workflow logic, you might want to continue or throw here.
            // Since this seems fatal based on your original throw, I'll assume you stop:
            throw new Error(`No tool named ${toolName} exists`)
        }

        logger.debug(`Called Tool name: ` + toolName)

        try {
            const output = await tool.execute(call.args as ToolInput<typeof toolName>);
            
            // Ensure the content passed to ToolMessage is a valid string representation.
            // Your logs showed `Output: undefined` previously, which likely caused issues.
            const contentString = typeof output.content === 'string' ? output.content : JSON.stringify(output);
            
            // FIX 1: Only use 'tool_call_id' in the constructor. The API requires this field to link the message.
            const tm = new ToolMessage({ 
                tool_call_id: call.id, 
                content: contentString // Use the sanitized string
            });
            
            toolMessages.push(tm);

            logger.debug(`Output: ${contentString}`)
            logger.debug(`XXXXXXX ID:  ${call.id}`)

            toolMessages.map(t => logger.fatal(`XXXXXXX MSG:  ${t.tool_call_id} ID: ${t.id}`));

        } catch (err: any) {
             // Handle execution errors with a tool message
             toolMessages.push(new ToolMessage({
                tool_call_id: call.id,
                content: JSON.stringify(err.message || "An unexpected error occurred during tool execution")
            }));
            // You might want to stop the process here if an execution error is fatal
            throw err;
        }
        state.tool_exec_count++;
    }
    logger.debug(`Tool Execution Count: ` + state.tool_exec_count);

    toolMessages.forEach(m => {
        logger.debug(
            `Tool Node msg reading:
            TYPE: ${m.type ?? "unknown"}
            ID: ${m.id}
            toolID: ${m.tool_call_id}
            content; ${m.content}`
        );
    });

    // FIX 2: Ensure all relevant messages are combined correctly when returning the *new* state.
    // The previous state messages + the newly generated tool messages.
    return {
        ...state,
        messages: [...state.messages, ...toolMessages],
        tool_messages: [...state.tool_messages, ...toolMessages],
        tool_calls: [] // Clear tool calls for the next step
    }
}



// import { AnnotationState } from '@workflows/ReactWorkflow';
// import { ToolName, ToolRegistry } from "@tools/registry";
// import { ToolMessage } from "langchain";
// import { ToolInput } from '@tools/registry';
// import { AIMessage } from 'langchain';
// import { logger } from '@utils/logger';

// export async function toolsNode(state: typeof AnnotationState.State) {
//     logger.debug("Tool node processing...");
//     const messages = [...state.messages];

//     for (const call of state.tool_calls ?? []) {
//         if (!call.id) {
//             logger.fatal(`Tool call had no ID`);
//             throw new Error("Missing id for tool message!");
//         }

//         const toolName = call.name as ToolName;
//         const tool = ToolRegistry[toolName];

//         if (!tool) {
//             const tm = new ToolMessage({
//                 tool_call_id: call.id,
//                 content: `Tool ${call.name} not found`
//             });
//             messages.push(tm);
//             throw new Error(`No tool named ${call.name} exists`);
//         }

//         logger.debug(`Executing Tool: ${toolName}`);

//         try {
//             const output = await tool.execute(call.args as ToolInput<typeof toolName>);

//             // Find AIMessage that triggered this tool call
//             const aiIndex = messages.findIndex(
//                 m => m instanceof AIMessage && m.tool_calls?.some(tc => tc.id === call.id)
//             );

//             if (aiIndex === -1) throw new Error("No AIMessage with this tool_call_id found");

//             const tm = new ToolMessage({
//                 tool_call_id: call.id,
//                 content: JSON.stringify(output)
//             });

//             // Insert immediately after AIMessage
//             messages.splice(aiIndex + 1, 0, tm);

//             logger.debug(`Tool executed. tool_call_id: ${tm.tool_call_id}, content: ${tm.content}`);

//         } catch (err: any) {
//             const tm = new ToolMessage({
//                 tool_call_id: call.id,
//                 content: JSON.stringify(err.message)
//             });
//             messages.push(tm);
//             logger.error(`Tool execution error: ${err.message}`);
//         }

//         state.tool_exec_count++;
//     }

//     logger.debug(`Tool Execution Count: ${state.tool_exec_count}`);

//     return {
//         ...state,
//         messages,
//         tool_messages: [...state.tool_messages, ...messages.filter(m => m instanceof ToolMessage)],
//         tool_calls: []
//     };
// }
