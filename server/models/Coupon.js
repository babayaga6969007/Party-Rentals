const mongoose = require("mongoose");

const couponSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
    },

    discountType: {
      type: String,
      enum: ["percent", "flat"],
      required: true,
    },

    discountValue: {
      type: Number,
      required: true,
    },

    maxDiscountAmount: {
      type: Number, // optional cap
      default: null,
    },

    minCartValue: {
      type: Number,
      default: 0,
    },

    expiryDate: {
      type: Date,
      default: null,
    },

    usageLimit: {
      type: Number, // total allowed uses
      default: null,
    },

    usedCount: {
      type: Number,
      default: 0,
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Coupon", couponSchema);
