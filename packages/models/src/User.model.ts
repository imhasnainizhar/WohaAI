import mongoose, { Schema, model, Types } from "mongoose";

const UserSchema = new Schema(
  {
    profilePicURI: { type: String },

    firstName: { type: String, required: true },
    lastName: { type: String, required: true },

    email: { type: String, required: true, unique: true, index: true },
    username: { type: String, required: true, unique: true, index: true },

    dateOfBirth: { type: Date },

    hashedPassword: { type: String, required: true },

    twoFactorEnabled: { type: Boolean, default: false },
    twoFactorSecret: { type: String },
    twoFactorEnabledAt: { type: Date },

    // relations (reference IDs)
    backupCodes: [{ type: Types.ObjectId, ref: "TwoFactorBackupCode" }],
    userSessions: [{ type: Types.ObjectId, ref: "UserSession" }],
    cards: [{ type: Types.ObjectId, ref: "Card" }],
  },
  {
    timestamps: true, // replaces createdAt + updatedAt
  }
);

export const User = model("User", UserSchema);