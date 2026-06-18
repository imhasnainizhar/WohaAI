// conversation.model.ts
import mongoose, { Schema, model, Types } from "mongoose";
import { ThreadEventType } from "@wohaai/types";

const { models } = mongoose;

const ThreadSchema = new Schema(
  {
    userId: {
      type: Types.ObjectId,
      ref: "User",
      required: true,
    },

    title: {
      type: String,
      default: "New Chat",
    },

    /**
     * Monotonically increasing counter used for ordering and optimistic
     * concurrency. Increment on every append so clients can detect gaps.
     */
    sequence: {
      type: Number,
      default: 0,
    },

    /**
     * Denormalized timestamp of the latest event — lets list queries sort
     * cheaply without touching the events array at all.
     */
    lastEventAt: {
      type: Date,
      default: Date.now,
    },

    events: [
      {
        type: {
          type: String,
          enum: ThreadEventType,
          required: true,
        },
        content: String,
        thinking: String,
        delta: String,
        tool: {
          name: String,
          callID: String,
          arguments: Schema.Types.Mixed,
        },
        toolResult: {
          callID: String,
          result: Schema.Types.Mixed,
          error: String,
        },
        metadata: {
          model: String,
          tokens: Number,
          latencyMs: Number,
        },
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Listing sidebar — userId + recency, events excluded via projection
ThreadSchema.index({ userId: 1, lastEventAt: -1 });
// Replay / streaming — userId + sequence for ordered event fetch
ThreadSchema.index({ userId: 1, sequence: -1 });

export const Thread =
  models.Thread ?? model("Thread", ThreadSchema);