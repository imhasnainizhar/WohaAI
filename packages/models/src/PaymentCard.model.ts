import { Schema, model, Types, models } from "mongoose";
import { CardBrand } from "./payment-card.types";

const PaymentCardSchema = new Schema(
  {
    id: {
      type: Types.ObjectId, 
      ref: "User",
      required: true,
      index: true,
    },

    // 🔐 NEVER store full card number in real systems
    last4: {
      type: String,
      required: true,
      match: /^[0-9]{4}$/,
    },

    brand: {
      type: String,
      enum: Object.values(CardBrand),
      required: true,
    },

    expiryMonth: {
      type: Number,
      required: true,
      min: 1,
      max: 12,
    },

    expiryYear: {
      type: Number,
      required: true,
    },

    // token from Stripe / Paddle / Adyen etc.
    paymentProvider: {
      type: String,
      required: true,
      default: "stripe",
    },

    paymentMethodToken: {
      type: String,
      required: true,
      index: true,
    },

    isDefault: {
      type: Boolean,
      default: false,
    },

    billingName: {
      type: String,
    },

    billingEmail: {
      type: String,
    },

    billingAddress: {
      line1: String,
      line2: String,
      city: String,
      state: String,
      country: String,
      postalCode: String,
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// ⚡ prevent duplicate token per user
PaymentCardSchema.index({ id: 1, paymentMethodToken: 1 }, { unique: true });

export const PaymentCard = models.PaymentCard ?? model("PaymentCard", PaymentCardSchema);