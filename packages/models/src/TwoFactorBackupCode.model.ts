import { Schema, Types, model, models } from "mongoose";

const TwoFactorBackupCodeSchema = new Schema(
  {
    id: {
      type: Types.ObjectId,
      ref: "User",
      index: true,
      required: true,
    },

    codeHash: { type: String, required: true },
    used: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  }
);

export const TwoFactorBackupCode = models.TwoFactorBackupCode ?? model(
  "TwoFactorBackupCode",
  TwoFactorBackupCodeSchema
);