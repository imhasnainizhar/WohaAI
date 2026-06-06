import { Schema, Types, model } from "mongoose";
import { SessionDuration } from "./User.model";

const UserSessionSchema = new Schema(
  {
    userSessionID: {
      type: String,
      required: true,
      index: true,
    },
    
    userID: {
      type: Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    refreshTokenHash: { type: String, required: true },

    revoked: { type: Boolean, default: false },
    revokedAt: { type: Date },

    rememberMe: { type: Boolean, default: false },

    userIPAddress: { type: String, required: true },
    userDeviceName: { type: String, required: true },
    userDeviceType: { type: String, required: true },
    userDeviceBrowser: { type: String, required: true },
    userDeviceOS: { type: String, required: true },

    sessionDuration: {
      type: String,
      enum: Object.values(SessionDuration),
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

export const UserSession = model("UserSession", UserSessionSchema);