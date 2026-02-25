const ShelvingConfig = require("../models/ShelvingConfig");

// Get config (public or admin)
exports.getConfig = async (req, res) => {
  try {
    const config = await ShelvingConfig.getConfig();
    res.json({ config });
  } catch (err) {
    console.error("Get shelving config error:", err);
    res.status(500).json({ error: "Failed to load shelving configuration" });
  }
};

// Update Tier A sizes
exports.updateTierA = async (req, res) => {
  try {
    const { sizes } = req.body;
    
    if (!Array.isArray(sizes)) {
      return res.status(400).json({ error: "sizes must be an array" });
    }

    let config = await ShelvingConfig.findOne();
    if (!config) {
      config = await ShelvingConfig.getConfig();
    }

    config.tierA.sizes = sizes;
    await config.save();

    res.json({ config });
  } catch (err) {
    console.error("Update Tier A error:", err);
    res.status(500).json({ error: "Failed to update Tier A configuration" });
  }
};

// Update Tier B
exports.updateTierB = async (req, res) => {
  try {
    const { dimensions, price } = req.body;

    let config = await ShelvingConfig.findOne();
    if (!config) {
      config = await ShelvingConfig.getConfig();
    }

    if (dimensions !== undefined) config.tierB.dimensions = dimensions;
    if (price !== undefined) config.tierB.price = Number(price);

    await config.save();

    res.json({ config });
  } catch (err) {
    console.error("Update Tier B error:", err);
    res.status(500).json({ error: "Failed to update Tier B configuration" });
  }
};

// Update Tier C
exports.updateTierC = async (req, res) => {
  try {
    const { dimensions, price, maxQuantity } = req.body;

    let config = await ShelvingConfig.findOne();
    if (!config) {
      config = await ShelvingConfig.getConfig();
    }

    if (dimensions !== undefined) config.tierC.dimensions = dimensions;
    if (price !== undefined) config.tierC.price = Number(price);
    if (maxQuantity !== undefined) config.tierC.maxQuantity = Number(maxQuantity);

    await config.save();

    res.json({ config });
  } catch (err) {
    console.error("Update Tier C error:", err);
    res.status(500).json({ error: "Failed to update Tier C configuration" });
  }
};

// Add Tier A size
exports.addTierASize = async (req, res) => {
  try {
    const { size, dimensions, price } = req.body;

    if (!size || !dimensions || price === undefined) {
      return res.status(400).json({ error: "size, dimensions, and price are required" });
    }

    let config = await ShelvingConfig.findOne();
    if (!config) {
      config = await ShelvingConfig.getConfig();
    }

    config.tierA.sizes.push({
      size: size.trim(),
      dimensions: dimensions.trim(),
      price: Number(price),
    });

    await config.save();

    res.json({ config });
  } catch (err) {
    console.error("Add Tier A size error:", err);
    res.status(500).json({ error: "Failed to add Tier A size" });
  }
};

// Update Tier A size
exports.updateTierASize = async (req, res) => {
  try {
    const { sizeId } = req.params;
    const { size, dimensions, price } = req.body;

    let config = await ShelvingConfig.findOne();
    if (!config) {
      return res.status(404).json({ error: "Configuration not found" });
    }

    const sizeIndex = config.tierA.sizes.findIndex(
      (s) => String(s._id) === String(sizeId)
    );

    if (sizeIndex === -1) {
      return res.status(404).json({ error: "Size not found" });
    }

    if (size !== undefined) config.tierA.sizes[sizeIndex].size = size.trim();
    if (dimensions !== undefined) config.tierA.sizes[sizeIndex].dimensions = dimensions.trim();
    if (price !== undefined) config.tierA.sizes[sizeIndex].price = Number(price);

    await config.save();

    res.json({ config });
  } catch (err) {
    console.error("Update Tier A size error:", err);
    res.status(500).json({ error: "Failed to update Tier A size" });
  }
};

// Remove Tier A size
exports.removeTierASize = async (req, res) => {
  try {
    const { sizeId } = req.params;

    let config = await ShelvingConfig.findOne();
    if (!config) {
      return res.status(404).json({ error: "Configuration not found" });
    }

    config.tierA.sizes = config.tierA.sizes.filter(
      (s) => String(s._id) !== String(sizeId)
    );

    await config.save();

    res.json({ config });
  } catch (err) {
    console.error("Remove Tier A size error:", err);
    res.status(500).json({ error: "Failed to remove Tier A size" });
  }
};
