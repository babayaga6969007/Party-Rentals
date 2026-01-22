const mongoose = require("mongoose");

const signageConfigSchema = new mongoose.Schema(
  {
    // Font configuration
    fonts: [
      {
        name: { type: String, required: true },
        value: { type: String, required: true }, // CSS font-family value
      },
    ],

    // Size configuration
    sizes: [
      {
        key: { type: String, required: true, unique: true }, // e.g., "small", "medium", "large", "extralarge"
        label: { type: String, required: true }, // Display label
        width: { type: Number, required: true },
        height: { type: Number, required: true },
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

    // Canvas dimensions
    canvasWidth: {
      type: Number,
      default: 600,
      min: 100,
    },
    canvasHeight: {
      type: Number,
      default: 1200,
      min: 100,
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
      fonts: [
        { name: "Farmhouse", value: "'Farmhouse', cursive" },
        { name: "Black Mango Bold", value: "'BlackMango-Bold', sans-serif" },
        { name: "Bodoni 72 Smallcaps", value: "'Bodoni 72 Smallcaps', serif" },
        { name: "Bright", value: "'Bright', sans-serif" },
        { name: "Futura", value: "'Futura', sans-serif" },
        { name: "Greycliff CF Thin", value: "'Greycliff CF Thin', sans-serif" },
        { name: "SignPainter", value: "'SignPainter', cursive" },
        { name: "Sloop Script Three", value: "'Sloop Script Three', cursive" },
      ],
      sizes: [
        { key: "small", label: "Small", width: 150, height: 40, fontSize: 32, price: 0 },
        { key: "medium", label: "Medium", width: 250, height: 60, fontSize: 48, price: 0 },
        { key: "large", label: "Large", width: 350, height: 80, fontSize: 64, price: 0 },
        { key: "extralarge", label: "Extra Large", width: 450, height: 100, fontSize: 80, price: 0 },
      ],
      basePrice: 0,
      canvasWidth: 600,
      canvasHeight: 1200,
    });
  }
  return config;
};

module.exports = mongoose.model("SignageConfig", signageConfigSchema);
