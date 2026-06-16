import mongoose, { Schema, Document, Model, Types } from "mongoose";
import { ISettingsValues, StorableSettingKey } from "./settings.types";
import { DEFAULT_SETTINGS } from "./settings.constant";

export const STORABLE_KEYS: ReadonlySet<StorableSettingKey> = new Set([
  "personalization.memory",
  "personalization.chatHistory",
  "data.training",
]);

// ─── Mongoose document ────────────────────────────────────────────────────────
export interface ISettingsDocument extends Document {
  /** Populated reference to the User document. */
  userId: Types.ObjectId;
  values: ISettingsValues;
  /**
   * Manually managed timestamp.  We expose this to clients so they can
   * skip a full re-fetch when their local cache is already up to date.
   */
  updatedAt: Date;
}

// ─── Sub-schema (no _id, no __v) ─────────────────────────────────────────────
const ValuesSchema = new Schema<ISettingsValues>(
  {
    personalization: {
      memory: { type: Boolean, default: true },
      chatHistory: { type: Boolean, default: true },
    },
    data: {
      training: { type: Boolean, default: false },
    },
  },
  { _id: false }
);

// ─── Root schema ──────────────────────────────────────────────────────────────
const SettingsSchema = new Schema<ISettingsDocument>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",          // ← matches your User model name
      required: true,
      unique: true,         // one settings doc per user
      index: true,
    },
    values: {
      type: ValuesSchema,
      default: () => ({ ...DEFAULT_SETTINGS }),
    },
    updatedAt: {
      type: Date,
      default: () => new Date(),
    },
  },
  {
    // We manage updatedAt ourselves — don't let Mongoose touch it.
    timestamps: false,
    versionKey: false,
  }
);

// Bump updatedAt on every findOneAndUpdate call (used by the PATCH handler).
SettingsSchema.pre("findOneAndUpdate", function (this) {
  this.set({ updatedAt: new Date() });
});

// ─── Model (singleton-safe for Next.js hot reload) ───────────────────────────
export const Settings: Model<ISettingsDocument> =
  (mongoose.models.Settings as Model<ISettingsDocument>) ??
  mongoose.model<ISettingsDocument>("Settings", SettingsSchema);