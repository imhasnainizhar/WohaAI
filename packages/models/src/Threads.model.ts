import { Schema, model, Types, models } from "mongoose";

const ThreadSchema = new Schema(
  {
    id: {
      type: Types.ObjectId,
      ref: "User",
      index: true,
      required: true,
    },

    title: {
      type: String,
      default: "New Chat",
    },

    lastSequence: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

export const Thread = models.Thread ?? model("Thread", ThreadSchema);