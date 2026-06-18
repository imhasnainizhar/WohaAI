import mongoose, { Schema, model, Types } from "mongoose";

const { models } = mongoose;

const UserSchema = new Schema(
  {
    profilePicURI: { type: String },

    fullName: { type: String },

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
    settings: [{ type: Types.ObjectId, ref: "Settings" }],
  },
  {
    timestamps: true, // replaces createdAt + updatedAt
  }
);

export const User = models.User ?? model("User", UserSchema);