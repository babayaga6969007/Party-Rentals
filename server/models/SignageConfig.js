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
      fonts: [
        { name: "Dancing Script", value: "'Dancing Script', cursive" },
        { name: "Pacifico", value: "'Pacifico', cursive" },
        { name: "Great Vibes", value: "'Great Vibes', cursive" },
        { name: "Satisfy", value: "'Satisfy', cursive" },
        { name: "Allura", value: "'Allura', cursive" },
        { name: "Brush Script MT", value: "'Brush Script MT', cursive" },
        { name: "Lobster", value: "'Lobster', cursive" },
        { name: "Playball", value: "'Playball', cursive" },
        { name: "Tangerine", value: "'Tangerine', cursive" },
        { name: "Cookie", value: "'Cookie', cursive" },
        { name: "Amatic SC", value: "'Amatic SC', cursive" },
        { name: "Caveat", value: "'Caveat', cursive" },
      ],
      sizes: [
        { key: "small", label: "Small", width: 150, height: 40, fontSize: 32 },
        { key: "medium", label: "Medium", width: 250, height: 60, fontSize: 48 },
        { key: "large", label: "Large", width: 350, height: 80, fontSize: 64 },
        { key: "extralarge", label: "Extra Large", width: 450, height: 100, fontSize: 80 },
      ],
      basePrice: 0,
    });
  }
  return config;
};

module.exports = mongoose.model("SignageConfig", signageConfigSchema);
