import mongoose, { Schema, Types, model } from "mongoose";

const { models } = mongoose;

const UserSessionSchema = new Schema(
  {
    userSessionID: {
      type: String,
      required: true,
      index: true,
    },

    id: {
      type: Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    refreshTokenHash: { type: String, required: true },

    revoked: { type: Boolean, default: false },
    revokedAt: { type: Date },

    userIPAddress: { type: String, required: true },
    userDeviceName: { type: String, required: true },
    userDeviceType: { type: String, required: true },
    userDeviceBrowser: { type: String, required: true },
    userDeviceOS: { type: String, required: true },
  },
  {
    timestamps: true,
  }
);

export const UserSession = models.UserSession ?? model("UserSession", UserSessionSchema);