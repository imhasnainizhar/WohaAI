import { Schema, model, Types, models } from "mongoose";
import { ConversationEventType } from "./conversation.types";

const ConversationSchema = new Schema(
  {
    id: {
      type: Types.ObjectId,
      ref: "User",
      index: true,
      required: true,
    },

    title: {
      type: String,
      default: "New Conversation",
    },

    /**
     * ORDERING (critical for replay + streaming)
     */
    sequence: {
      type: Number,
      default: 0,
    },

    /**
     * SINGLE STREAM OF EVERYTHING
     */
    events: [
      {
        type: {
          type: String,
          enum: Object.values(ConversationEventType),
          required: true,
        },

        content: {
          type: String,
        },

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

    /**
     * lightweight state cache for fast access
     */
    lastEventAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

ConversationSchema.index({ id: 1, lastEventAt: -1 });
ConversationSchema.index({ id: 1, sequence: -1 });

export const Conversation = models.Conversation ?? model("Conversation", ConversationSchema);