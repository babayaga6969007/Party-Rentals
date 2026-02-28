const mongoose = require("mongoose");

const vinylConfigSchema = new mongoose.Schema(
  {
    pricePerSqInch: { type: Number, default: 0, min: 0 },
  },
  { timestamps: true }
);

vinylConfigSchema.statics.getConfig = async function () {
  let config = await this.findOne();
  if (!config) {
    config = await this.create({ pricePerSqInch: 0 });
  }
  return config;
};

module.exports = mongoose.model("VinylConfig", vinylConfigSchema);
