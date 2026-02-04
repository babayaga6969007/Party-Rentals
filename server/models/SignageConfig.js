const mongoose = require("mongoose");

const signageConfigSchema = new mongoose.Schema(
  {
    // Background physical dimensions (feet) – admin sets these; canvas pixels derived from them
    widthFt: { type: Number, default: 4, min: 0.5 },
    heightFt: { type: Number, default: 8, min: 0.5 },

    // Size configuration (text sizes; fontSize is at reference canvas height 1200, scaled by canvas in frontend)
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
    // Create default config (4 ft × 8 ft background)
    config = await this.create({
      widthFt: 4,
      heightFt: 8,
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
