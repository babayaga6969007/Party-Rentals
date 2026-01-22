const mongoose = require("mongoose");

const shelvingConfigSchema = new mongoose.Schema(
  {
    // Tier A: Multiple size options
    tierA: {
      sizes: [
        {
          size: { type: String, required: true }, // e.g., "24\"", "34\"", etc.
          dimensions: { type: String, required: true }, // e.g., "24\" long x 5.5\" deep x 0.75\" thick"
          price: { type: Number, required: true, min: 0 }, // Price per shelf
        },
      ],
    },

    // Tier B: Single option
    tierB: {
      dimensions: { type: String, default: "43\" wide x 11.5\" deep x 1.5\" thick (including height of front lip)" },
      price: { type: Number, default: 29, min: 0 }, // Price per shelf
    },

    // Tier C: Single option
    tierC: {
      dimensions: { type: String, default: "75\" wide x 25\" deep x 1.5\" thick (including height of front lip)" },
      price: { type: Number, default: 50, min: 0 }, // Price per shelf
      maxQuantity: { type: Number, default: 1, min: 1 }, // Max 1 shelf
    },

    // Active status
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

// Ensure only one config document exists
shelvingConfigSchema.statics.getConfig = async function () {
  let config = await this.findOne();
  if (!config) {
    // Create default config
    config = await this.create({
      tierA: {
        sizes: [
          { size: "24\"", dimensions: "24\" long x 5.5\" deep x 0.75\" thick", price: 20 },
          { size: "34\"", dimensions: "34\" long x 5.5\" deep x 0.75\" thick", price: 25 },
          { size: "46\"", dimensions: "46\" long x 5.5\" deep x 0.75\" thick", price: 25 },
          { size: "70\"", dimensions: "70\" long x 5.5\" deep x 0.75\" thick", price: 32 },
          { size: "83\"", dimensions: "83\" long x 5.5\" deep x 0.75\" thick", price: 38 },
          { size: "94\"", dimensions: "94\" long x 5.5\" deep x 0.75\" thick", price: 43 },
        ],
      },
      tierB: {
        dimensions: "43\" wide x 11.5\" deep x 1.5\" thick (including height of front lip)",
        price: 29,
      },
      tierC: {
        dimensions: "75\" wide x 25\" deep x 1.5\" thick (including height of front lip)",
        price: 50,
        maxQuantity: 1,
      },
      isActive: true,
    });
  }
  return config;
};

module.exports = mongoose.model("ShelvingConfig", shelvingConfigSchema);
