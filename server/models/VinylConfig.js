const mongoose = require("mongoose");

const vinylAddonSizeSchema = new mongoose.Schema(
  {
    key: { type: String, required: true },
    label: { type: String, required: true },
    widthInches: { type: Number, required: true, min: 0.1 },
    heightInches: { type: Number, required: true, min: 0.1 },
    price: { type: Number, required: true, min: 0, default: 0 },
  },
  { _id: true }
);

const vinylConfigSchema = new mongoose.Schema(
  {
    sizes: [vinylAddonSizeSchema],
  },
  { timestamps: true }
);

const DEFAULT_SIZES = [
  { key: "2x2", label: "2' x 2'", widthInches: 24, heightInches: 24, price: 28.8 },
  { key: "2x3", label: "2' x 3'", widthInches: 24, heightInches: 36, price: 43.2 },
  { key: "3x4", label: "3' x 4'", widthInches: 36, heightInches: 48, price: 86.4 },
  { key: "4x4", label: "4' x 4'", widthInches: 48, heightInches: 48, price: 115.4 },
  { key: "4x6", label: "4' x 6'", widthInches: 48, heightInches: 72, price: 172.8 },
  { key: "4x8", label: "4' x 8'", widthInches: 48, heightInches: 96, price: 230.4 },
];

vinylConfigSchema.statics.getConfig = async function () {
  let config = await this.findOne();
  if (!config) {
    config = await this.create({ sizes: DEFAULT_SIZES });
  }
  if (!config.sizes || config.sizes.length === 0) {
    config.sizes = DEFAULT_SIZES;
    await config.save();
  }
  return config;
};

module.exports = mongoose.model("VinylConfig", vinylConfigSchema);
