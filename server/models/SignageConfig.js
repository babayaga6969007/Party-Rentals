const mongoose = require("mongoose");

const signageConfigSchema = new mongoose.Schema(
  {
    // Size configuration
    sizes: [
      {
        key: { type: String, required: true, unique: true }, // e.g., "small", "medium", "large", "extralarge"
        label: { type: String, required: true }, // Display label
        fontSize: { type: Number, required: true },
        price: { type: Number, default: 0, min: 0 }, // Price for this size
      },
    ],

    // Signage pricing
    basePrice: {
      type: Number,
      default: 0,
      min: 0,
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
signageConfigSchema.statics.getConfig = async function () {
  let config = await this.findOne();
  if (!config) {
    // Create default config
    config = await this.create({
      sizes: [
        { key: "small", label: "Small", fontSize: 32, price: 0 },
        { key: "medium", label: "Medium", fontSize: 48, price: 0 },
        { key: "large", label: "Large", fontSize: 64, price: 0 },
        { key: "extralarge", label: "Extra Large", fontSize: 80, price: 0 },
      ],
      basePrice: 0,
    });
  }
  return config;
};

module.exports = mongoose.model("SignageConfig", signageConfigSchema);
