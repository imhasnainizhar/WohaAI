import { AnnotationState } from "@workflows/ReactWorkflow";
import { logger } from "./logger";

type transitionFn = (state: typeof AnnotationState.State) => string;

const workflowTransitionLogger =
    (nodeName: string, fn: transitionFn): transitionFn =>
        (state: typeof AnnotationState.State) => {
            const next = fn(state);

            logger.info(
                `[Transition] ${nodeName} → ${next} | ` +
                `tool_calls=${state.tool_calls.length}, ` +
                `tool_outputs=${state.tool_outputs.length}, ` +
                `last_summary_index=${state.last_summary_index}, ` +
                `summarizer_path=${state.summarizer_path}`
            );

            return next;
        };

export { workflowTransitionLogger };
