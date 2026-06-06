import { Schema, model, Types } from "mongoose";

const ThreadSchema = new Schema(
  {
    userID: {
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

export const Thread = model("Thread", ThreadSchema);