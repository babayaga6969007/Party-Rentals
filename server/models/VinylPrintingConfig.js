const mongoose = require("mongoose");

const vinylPrintingConfigSchema = new mongoose.Schema(
  {
    sizes: [
      {
        key: { type: String, required: true }, // e.g. "2x2", "4x8"
        label: { type: String, required: true }, // e.g. "2' x 2'"
        price: { type: Number, required: true, min: 0 },
        minimum: { type: Boolean, default: false }, // "minimum applies"
      },
    ],
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

vinylPrintingConfigSchema.statics.getConfig = async function () {
  let config = await this.findOne();
  if (!config) {
    config = await this.create({
      sizes: [
        { key: "2x2", label: "2' x 2'", price: 95, minimum: true },
        { key: "2x3", label: "2' x 3'", price: 95, minimum: true },
        { key: "3x4", label: "3' x 4'", price: 144, minimum: false },
        { key: "4x4", label: "4' x 4'", price: 192, minimum: false },
        { key: "4x6", label: "4' x 6'", price: 288, minimum: false },
        { key: "4x8", label: "4' x 8'", price: 384, minimum: false },
      ],
    });
  }
  return config;
};

module.exports = mongoose.model("VinylPrintingConfig", vinylPrintingConfigSchema);
