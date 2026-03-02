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

exports.addSize = async (req, res) => {
  try {
    const { key, label, widthInches, heightInches, price } = req.body;
    if (!key || !label || widthInches == null || heightInches == null || price == null) {
      return res.status(400).json({ message: "key, label, widthInches, heightInches, and price are required" });
    }
    const w = Number(widthInches);
    const h = Number(heightInches);
    const p = Number(price);
    if (!Number.isFinite(w) || w <= 0 || !Number.isFinite(h) || h <= 0) {
      return res.status(400).json({ message: "widthInches and heightInches must be positive numbers" });
    }
    if (!Number.isFinite(p) || p < 0) {
      return res.status(400).json({ message: "price must be 0 or greater" });
    }
    let config = await VinylConfig.findOne();
    if (!config) config = await VinylConfig.getConfig();
    if (!config.sizes) config.sizes = [];
    const existing = config.sizes.find((s) => String(s.key).toLowerCase() === String(key).toLowerCase());
    if (existing) {
      return res.status(400).json({ message: "A size with this key already exists" });
    }
    config.sizes.push({ key: String(key).trim(), label: String(label).trim(), widthInches: w, heightInches: h, price: p });
    await config.save();
    res.status(201).json({ config, message: "Size added successfully" });
  } catch (err) {
    console.error("Add vinyl addon size error:", err);
    res.status(400).json({ error: err.message || "Failed to add size" });
  }
};

exports.updateSize = async (req, res) => {
  try {
    const { sizeId } = req.params;
    const { key, label, widthInches, heightInches, price } = req.body;
    let config = await VinylConfig.findOne();
    if (!config) config = await VinylConfig.getConfig();
    const idx = config.sizes.findIndex((s) => String(s._id) === String(sizeId));
    if (idx === -1) return res.status(404).json({ message: "Size not found" });
    if (key !== undefined) config.sizes[idx].key = String(key).trim();
    if (label !== undefined) config.sizes[idx].label = String(label).trim();
    if (widthInches != null) {
      const w = Number(widthInches);
      if (!Number.isFinite(w) || w <= 0) return res.status(400).json({ message: "widthInches must be a positive number" });
      config.sizes[idx].widthInches = w;
    }
    if (heightInches != null) {
      const h = Number(heightInches);
      if (!Number.isFinite(h) || h <= 0) return res.status(400).json({ message: "heightInches must be a positive number" });
      config.sizes[idx].heightInches = h;
    }
    if (price != null) {
      const p = Number(price);
      if (!Number.isFinite(p) || p < 0) return res.status(400).json({ message: "price must be 0 or greater" });
      config.sizes[idx].price = p;
    }
    await config.save();
    res.json({ config, message: "Size updated successfully" });
  } catch (err) {
    console.error("Update vinyl addon size error:", err);
    res.status(400).json({ error: err.message || "Failed to update size" });
  }
};

exports.removeSize = async (req, res) => {
  try {
    const { sizeId } = req.params;
    let config = await VinylConfig.findOne();
    if (!config) config = await VinylConfig.getConfig();
    const idx = config.sizes.findIndex((s) => String(s._id) === String(sizeId));
    if (idx === -1) return res.status(404).json({ message: "Size not found" });
    config.sizes.splice(idx, 1);
    await config.save();
    res.json({ config, message: "Size removed successfully" });
  } catch (err) {
    console.error("Remove vinyl addon size error:", err);
    res.status(400).json({ error: err.message || "Failed to remove size" });
  }
};
