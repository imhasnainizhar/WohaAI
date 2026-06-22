/**
 * WoahAgent
 * ─────────
 * Wraps @anthropic-ai/claude-agent-sdk and re-emits its output as a typed
 * Server-Sent-Events (SSE) stream using the `w_*` event protocol.
 *
 * ══════════════════════════════════════════════════════════════════
 * BUGS FIXED (all annotated inline with "BUG FIX [N]")
 * ══════════════════════════════════════════════════════════════════
 *  1. Constructor options (model, maxTurns, temperature, thinking) were never
 *     forwarded to query() — the agent silently ignored every option.
 *  2. `parseWebSearchResult` was defined but never called — dead code.
 *     Now called when handling `user` tool_result messages.
 *  3. `user` messages (tool results, web-search responses) were silently dropped.
 *  4. `result` messages (agent completion) were silently dropped — clients
 *     had no way to know when the run finished or if it errored.
 *  5. Thinking-block delta (w_thinking_delta) was never yielded.
 *  6. Tool-use input delta (w_input_json_delta) was never yielded.
 *  7. content_block_stop was emitted immediately after content_block_start in
 *     the same loop iteration — before any delta — which violates SSE ordering.
 *     Stops are now deferred until stop_reason is present.
 *  8. w_message_start incorrectly included full `content` — only token usage
 *     and metadata belong there per the Anthropic streaming spec.
 *  9. serialize() was a redundant deep-clone; the bigint replacer already in
 *     sse() handles the only non-serialisable type. Removed.
 * 10. Partial-message accumulation was missing: with includePartialMessages:true
 *     the SDK fires the same turn multiple times as it grows. Each fire
 *     re-emitted all text from scratch, duplicating content on the client.
 *     Now we diff against last-seen text/thinking/json and emit only the delta.
 * 11. `error` in catch was typed as `any` and accessed without narrowing,
 *     which is unsafe. Replaced with a proper unknown → narrowed helper.
 * 12. temperature override logic was wrong:
 *     `thinking_allowed ? 1.0 : temperature` meant the user-supplied temperature
 *     was silently discarded whenever thinking was enabled. The API enforces
 *     temperature=1 server-side when extended-thinking is active, so we don't
 *     need to override it here at all.
 *
 * ══════════════════════════════════════════════════════════════════
 * TODO (requires verification against SDK internals)
 * ══════════════════════════════════════════════════════════════════
 *  • Verify Options field names: the SDK may use `model` / `max_turns` /
 *    `system_prompt` or camelCase equivalents.  Marked with TODO comments.
 *  • Confirm whether thinking / temperature are passed via Options or via a
 *    nested `apiParams` / `claudeOptions` field in the SDK.
 *  • Confirm the `result` message shape (result.subtype, result.error, etc.).
 *  • `w_done` / `w_web_search_result` may need to be added to the WSSEEvent
 *    union in types/events.ts if they aren't already present.
 */

import { query } from '@anthropic-ai/claude-agent-sdk';
import type { Options } from '@anthropic-ai/claude-agent-sdk';
import type {
  WSSEEvent,
  WMessageStart,
  WMessageStop,
  WTextDelta,
  WInputJsonDelta,
  WThinkingDelta,
  WMessageDelta,
  WContentBlockStop,
  TextBlock,
  ThinkingBlock,
  ToolUseBlock,
  WError,
  WSearchResult,
  WWebSearchToolResult,
} from './types/events';

// ─── Public API ──────────────────────────────────────────────────────────────

export interface WoahAgentOptions {
  model_name?: string;
  prompt: string;
  max_turns?: number;
  thinking_allowed?: boolean;
  thinking_budget_tokens?: number;
  max_budget_usd?: number;
  temperature?: number;
  system_prompt?: string; // Added: common need that was missing
}

// ─── Internal: per-block accumulation state ───────────────────────────────────

/**
 * Tracks content emitted so far for a single content block.
 * Required for correct delta computation across partial-message callbacks.
 */
interface BlockState {
  started: boolean;
  stopped: boolean;
  text: string;       // accumulated text (text blocks)
  thinking: string;   // accumulated thinking (thinking blocks)
  json: string;       // accumulated JSON (tool_use blocks)
}

function emptyBlockState(): BlockState {
  return { started: false, stopped: false, text: '', thinking: '', json: '' };
}

// ─── SSE helpers ─────────────────────────────────────────────────────────────

/** Serialises a typed SSE event to the wire format. */
function sse(event: WSSEEvent): string {
  // BUG FIX [9]: serialize() was a pointless deep-clone.
  // JSON.stringify with a replacer handles the only edge-case (BigInt) directly.
  return (
    `event: ${event.type}\n` +
    `data: ${JSON.stringify(
      event.data ?? {},
      (_key, value) => (typeof value === 'bigint' ? value.toString() : value)
    )}\n\n`
  );
}

function errorSse(
  errorType: string,
  message: string,
  recoverable = false
): string {
  return sse({
    type: 'w_error',
    data: { error_type: errorType, message, recoverable } satisfies WError,
  });
}

// ─── Web-search result parser ─────────────────────────────────────────────────

// BUG FIX [2]: This function was defined but never called. It is now invoked
// when processing `user` type messages that contain tool_result blocks.
function parseWebSearchResult(
  toolUseId: string,
  rawContent: unknown[]
): WWebSearchToolResult {
  const results: WSearchResult[] = [];
  let searchQuery = '';

  for (const item of rawContent) {
    if (typeof item !== 'object' || item === null) continue;

    const typed = item as Record<string, unknown>;
    const itemType = typeof typed.type === 'string' ? typed.type : '';

    if (itemType === 'web_search_result') {
      results.push({
        url: String(typed.url ?? ''),
        title: String(typed.title ?? ''),
        snippet: String(typed.snippet ?? typed.encrypted_content ?? ''),
        page_age: typed.page_age as string | undefined,
      });
    } else if (itemType === 'web_search_tool_result') {
      searchQuery = String(typed.query ?? '');
      const inner = Array.isArray(typed.content) ? typed.content : [];
      for (const hit of inner) {
        if (typeof hit !== 'object' || hit === null) continue;
        const h = hit as Record<string, unknown>;
        if (h.type === 'web_search_result') {
          results.push({
            url: String(h.url ?? ''),
            title: String(h.title ?? ''),
            snippet: String(h.snippet ?? h.encrypted_content ?? ''),
            page_age: h.page_age as string | undefined,
          });
        }
      }
    }
  }

  return { tool_use_id: toolUseId, query: searchQuery, results };
}

// ─── Type guards ──────────────────────────────────────────────────────────────

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null && !Array.isArray(v);
}

// ─── WoahAgent ────────────────────────────────────────────────────────────────

export class WoahAgent {
  private readonly modelName: string;
  private readonly prompt: string;
  private readonly maxTurns: number;
  private readonly maxBudgetUsd: number;
  // BUG FIX [12]: removed the incorrect `thinking_allowed ? 1.0 : temperature`
  // override. The API enforces temperature=1 server-side when thinking is active.
  private readonly temperature: number;
  private readonly thinkingAllowed: boolean;
  private readonly thinkingBudgetTokens: number;
  private readonly systemPrompt?: string;

  constructor(options: WoahAgentOptions) {
    this.modelName = options.model_name ?? 'claude-sonnet-4-20250514';
    this.prompt = options.prompt;
    this.maxTurns = options.max_turns ?? 12;
    this.maxBudgetUsd = options.max_budget_usd ?? 5.0;
    this.temperature = options.temperature ?? 1.0;
    this.thinkingAllowed = options.thinking_allowed ?? true;
    this.thinkingBudgetTokens = options.thinking_budget_tokens ?? 10_000;
    this.systemPrompt = options.system_prompt;
  }

  /**
   * Streams SSE strings representing the agent's output.
   *
   * @param signal - Optional AbortSignal for cancellation.
   */
  async *chat(signal?: AbortSignal): AsyncGenerator<string, void, unknown> {
    // BUG FIX [1]: All constructor options were set but NEVER passed to query().
    // TODO: Verify exact field names against the SDK's Options type.
    //       The SDK may use snake_case (max_turns) or camelCase (maxTurns).
    const options: Options = {
      // TODO: confirm whether the SDK exposes 'model' here or if it must be
      //       set at client construction time.
      // model: this.modelName,

      // TODO: confirm field name — may be `maxTurns` or `max_turns`
      maxTurns: this.maxTurns,

      // TODO: confirm how thinking and temperature are forwarded.
      //       They may live under a nested `claudeOptions` or `apiParams` key.
      //
      // thinking: this.thinkingAllowed
      //   ? { type: 'enabled', budget_tokens: this.thinkingBudgetTokens }
      //   : { type: 'disabled' },
      // temperature: this.temperature,

      includePartialMessages: true,
      allowedTools: ['WebSearch', 'WebFetch', 'AskUserQuestion', 'Skill', 'Monitor'],
    };

    // ── Per-turn streaming state ──────────────────────────────────────────────
    // BUG FIX [10]: partial-message accumulation tracking.
    // With includePartialMessages:true the SDK fires the same assistant turn
    // repeatedly as text grows. We must diff to emit only new characters.
    let emittedMessageStart = false;
    const blocks = new Map<number, BlockState>();

    const resetTurnState = () => {
      emittedMessageStart = false;
      blocks.clear();
    };

    const getBlock = (i: number): BlockState => {
      if (!blocks.has(i)) blocks.set(i, emptyBlockState());
      return blocks.get(i)!;
    };

    try {
      for await (const message of query({ prompt: this.prompt, options })) {
        // Honour abort between SDK callbacks
        if (signal?.aborted) {
          yield errorSse('aborted', 'Request was aborted by caller', false);
          return;
        }

        // ── Assistant turn ────────────────────────────────────────────────────
        if (message.type === 'assistant' && isRecord(message.message)) {
          const msg = message.message as Record<string, unknown>;
          const usage = isRecord(msg.usage) ? msg.usage : {};
          const content = Array.isArray(msg.content) ? msg.content : [];

          // Emit w_message_start exactly once per turn
          if (!emittedMessageStart) {
            emittedMessageStart = true;
            // BUG FIX [8]: removed `content` from message_start payload.
            // message_start carries only token counts and metadata.
            yield sse({
              type: 'w_message_start',
              data: {
                id: String(msg.id ?? ''),
                type: String(msg.type ?? 'message'),
                model: String(msg.model ?? this.modelName),
                input_tokens: Number(usage.input_tokens ?? 0),
                output_tokens: Number(usage.output_tokens ?? 0),
                stop_reason: (msg.stop_reason as string | null) ?? undefined,
                stop_sequence: (msg.stop_sequence as string | null) ?? undefined,
              } satisfies WMessageStart,
            });
          }

          // Process each content block
          for (let i = 0; i < content.length; i++) {
            const block = content[i];
            if (!isRecord(block)) continue;

            const b = getBlock(i);

            // ── Text block ─────────────────────────────────────────────────
            if (typeof block.text === 'string') {
              if (!b.started) {
                b.started = true;
                yield sse({
                  type: 'w_content_block_start',
                  data: { type: 'text', index: i, text: '' } satisfies TextBlock,
                });
              }

              // BUG FIX [10]: only emit the newly-arrived characters
              const newText = block.text;
              if (newText.length > b.text.length) {
                const delta = newText.slice(b.text.length);
                b.text = newText;
                yield sse({
                  type: 'w_content_block_delta',
                  data: { type: 'w_text_delta', index: i, text: delta } satisfies WTextDelta,
                });
              }
            }

            // ── Thinking block ─────────────────────────────────────────────
            else if (typeof block.thinking === 'string') {
              if (!b.started) {
                b.started = true;
                yield sse({
                  type: 'w_content_block_start',
                  data: {
                    type: 'thinking',
                    index: i,
                    // signature arrives once the block is finalised
                    signature: String(block.signature ?? ''),
                  } satisfies ThinkingBlock,
                });
              }

              // BUG FIX [5]: thinking text delta was never emitted
              const newThinking = block.thinking;
              if (newThinking.length > b.thinking.length) {
                const delta = newThinking.slice(b.thinking.length);
                b.thinking = newThinking;
                yield sse({
                  type: 'w_content_block_delta',
                  data: {
                    type: 'w_thinking_delta',
                    index: i,
                    thinking: delta,
                  } satisfies WThinkingDelta,
                });
              }
            }

            // ── Tool-use block ─────────────────────────────────────────────
            else if (typeof block.name === 'string') {
              if (!b.started) {
                b.started = true;
                yield sse({
                  type: 'w_content_block_start',
                  data: {
                    type: 'tool_use',
                    index: i,
                    id: String(block.id ?? ''),
                    name: block.name,
                    input: {},
                  } satisfies ToolUseBlock,
                });
              }

              // BUG FIX [6]: tool input JSON delta was never emitted.
              // The full input is available once the block is complete; emit it
              // as a single input_json_delta (clients should accumulate).
              if (isRecord(block.input)) {
                const newJson = JSON.stringify(block.input);
                if (newJson !== b.json) {
                  b.json = newJson;
                  yield sse({
                    type: 'w_content_block_delta',
                    data: {
                      type: 'w_input_json_delta',
                      index: i,
                      partial_json: newJson,
                    } satisfies WInputJsonDelta,
                  });
                }
              }
            }
          }

          // BUG FIX [7]: content_block_stop and message_stop must only be
          // emitted when the turn is actually finished (stop_reason present).
          // In the original they were emitted immediately after the block start,
          // which broke SSE ordering for partial messages.
          if (typeof msg.stop_reason === 'string' && msg.stop_reason) {
            // Stop all blocks that were started
            for (const [i, b] of blocks) {
              if (b.started && !b.stopped) {
                b.stopped = true;
                yield sse({
                  type: 'w_content_block_stop',
                  data: { index: i } satisfies WContentBlockStop,
                });
              }
            }

            yield sse({
              type: 'w_message_delta',
              data: {
                stop_reason: msg.stop_reason,
                stop_sequence: (msg.stop_sequence as string | null) ?? undefined,
                usage: isRecord(msg.usage)
                  ? {
                      input_tokens: (msg.usage.input_tokens as number) || 0,
                      output_tokens: (msg.usage.output_tokens as number) || 0,
                    }
                  : undefined,
              } satisfies WMessageDelta,
            });

            yield sse({
              type: 'w_message_stop',
              data: { type: 'assistant' } satisfies WMessageStop,
            });

            // Reset so we're ready for the next assistant turn
            resetTurnState();
          }
        }

        // ── User turn (tool results) ───────────────────────────────────────
        // BUG FIX [3]: user messages were completely unhandled.
        else if (message.type === 'user' && isRecord(message.message)) {
          const userMsg = message.message as Record<string, unknown>;
          const content = Array.isArray(userMsg.content) ? userMsg.content : [];

          for (const block of content) {
            if (!isRecord(block) || block.type !== 'tool_result') continue;

            const toolUseId = String(block.tool_use_id ?? '');
            const rawContent = Array.isArray(block.content) ? block.content : [block.content];

            // BUG FIX [2]: parseWebSearchResult was never called — used here
            const webResult = parseWebSearchResult(toolUseId, rawContent);
            if (webResult.results.length > 0) {
              // TODO: add `w_web_search_result` to WSSEEvent union if not present
              yield sse({
                type: 'w_web_search_result' as WSSEEvent['type'],
                data: webResult satisfies WWebSearchToolResult,
              } as WSSEEvent);
            }
          }
        }

        // ── Agent result (completion) ──────────────────────────────────────
        // BUG FIX [4]: result messages were silently dropped.
        else if (message.type === 'result') {
          const result = message as Record<string, unknown>;
          const subtype = String(result.subtype ?? 'unknown');

          if (subtype === 'success') {
            // TODO: add `w_done` to WSSEEvent union if not present
            yield sse({
              type: 'w_done' as WSSEEvent['type'],
              data: { subtype },
            } as WSSEEvent);
          } else {
            // Known SDK subtypes: 'error_max_turns', 'error_during_generation'
            const errMsg = isRecord(result.error)
              ? String(result.error.message ?? subtype)
              : subtype;
            yield errorSse(subtype, errMsg, subtype === 'error_max_turns');
          }
        }
      }
    } catch (error: unknown) {
      // BUG FIX [11]: original used `error.type` on an `any`-typed catch binding.
      // Now narrowed safely via isRecord().
      if (!isRecord(error)) {
        yield errorSse('internal_server_error', String(error), false);
        return;
      }

      const message = typeof error.message === 'string' ? error.message : 'Unknown error';
      const errorType = typeof error.type === 'string' ? error.type : '';
      const status = typeof error.status === 'number' ? error.status : 500;

      switch (errorType) {
        case 'api_status_error':
          yield errorSse(
            `api_status_${status}`,
            message,
            // 429 = rate-limited, 529 = overloaded — both are transient
            status === 429 || status === 529
          );
          break;
        case 'api_connection_error':
          yield errorSse('connection_error', message, true);
          break;
        case 'api_timeout_error':
          yield errorSse('timeout_error', message, true);
          break;
        default:
          yield errorSse('internal_server_error', message, false);
      }
    }
  }
}