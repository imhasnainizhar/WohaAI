import mongoose, { Schema, model, Types } from "mongoose";

const { models } = mongoose;

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