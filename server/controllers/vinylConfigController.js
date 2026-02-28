const VinylConfig = require("../models/VinylConfig");

exports.getConfig = async (req, res) => {
  try {
    const config = await VinylConfig.getConfig();
    res.json({ config });
  } catch (err) {
    console.error("Get vinyl config error:", err);
    res.status(500).json({ error: "Failed to load vinyl configuration" });
  }
};

exports.updateConfig = async (req, res) => {
  try {
    const { pricePerSqInch } = req.body;
    let config = await VinylConfig.findOne();
    if (!config) {
      config = await VinylConfig.getConfig();
    }
    if (pricePerSqInch !== undefined) {
      config.pricePerSqInch = Math.max(0, Number(pricePerSqInch));
    }
    await config.save();
    res.json({ config, message: "Vinyl configuration updated successfully" });
  } catch (err) {
    console.error("Update vinyl config error:", err);
    res.status(400).json({ error: err.message || "Failed to update vinyl configuration" });
  }
};
