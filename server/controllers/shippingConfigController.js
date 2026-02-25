const ShippingConfig = require("../models/ShippingConfig");

// Get config (public or admin)
exports.getConfig = async (req, res) => {
  try {
    const config = await ShippingConfig.getConfig();
    res.json({ config });
  } catch (err) {
    console.error("Get shipping config error:", err);
    res.status(500).json({ error: "Failed to load shipping configuration" });
  }
};

// Update distance ranges
exports.updateDistanceRanges = async (req, res) => {
  try {
    const { distanceRanges } = req.body;

    if (!Array.isArray(distanceRanges)) {
      return res.status(400).json({ error: "distanceRanges must be an array" });
    }

    // Validate each range
    for (const range of distanceRanges) {
      if (
        range.minDistance === undefined ||
        range.label === undefined ||
        range.price === undefined
      ) {
        return res.status(400).json({
          error: "Each range must have minDistance, label, and price",
        });
      }
      if (range.minDistance < 0 || range.price < 0) {
        return res.status(400).json({
          error: "minDistance and price must be non-negative",
        });
      }
    }

    let config = await ShippingConfig.findOne();
    if (!config) {
      config = await ShippingConfig.getConfig();
    }

    config.distanceRanges = distanceRanges;
    await config.save();

    res.json({ config });
  } catch (err) {
    console.error("Update distance ranges error:", err);
    res.status(500).json({ error: "Failed to update distance ranges" });
  }
};

// Add distance range
exports.addDistanceRange = async (req, res) => {
  try {
    const { minDistance, maxDistance, label, price } = req.body;

    if (
      minDistance === undefined ||
      label === undefined ||
      price === undefined
    ) {
      return res
        .status(400)
        .json({ error: "minDistance, label, and price are required" });
    }

    if (minDistance < 0 || price < 0) {
      return res
        .status(400)
        .json({ error: "minDistance and price must be non-negative" });
    }

    let config = await ShippingConfig.findOne();
    if (!config) {
      config = await ShippingConfig.getConfig();
    }

    config.distanceRanges.push({
      minDistance: Number(minDistance),
      maxDistance: maxDistance !== undefined && maxDistance !== null ? Number(maxDistance) : null,
      label: label.trim(),
      price: Number(price),
    });

    await config.save();

    res.json({ config });
  } catch (err) {
    console.error("Add distance range error:", err);
    res.status(500).json({ error: "Failed to add distance range" });
  }
};

// Update distance range
exports.updateDistanceRange = async (req, res) => {
  try {
    const { rangeId } = req.params;
    const { minDistance, maxDistance, label, price } = req.body;

    let config = await ShippingConfig.findOne();
    if (!config) {
      return res.status(404).json({ error: "Configuration not found" });
    }

    const rangeIndex = config.distanceRanges.findIndex(
      (r) => String(r._id) === String(rangeId)
    );

    if (rangeIndex === -1) {
      return res.status(404).json({ error: "Distance range not found" });
    }

    if (minDistance !== undefined) {
      if (minDistance < 0) {
        return res.status(400).json({ error: "minDistance must be non-negative" });
      }
      config.distanceRanges[rangeIndex].minDistance = Number(minDistance);
    }
    if (maxDistance !== undefined) {
      config.distanceRanges[rangeIndex].maxDistance =
        maxDistance !== null && maxDistance !== "" ? Number(maxDistance) : null;
    }
    if (label !== undefined) {
      config.distanceRanges[rangeIndex].label = label.trim();
    }
    if (price !== undefined) {
      if (price < 0) {
        return res.status(400).json({ error: "price must be non-negative" });
      }
      config.distanceRanges[rangeIndex].price = Number(price);
    }

    await config.save();

    res.json({ config });
  } catch (err) {
    console.error("Update distance range error:", err);
    res.status(500).json({ error: "Failed to update distance range" });
  }
};

// Remove distance range
exports.removeDistanceRange = async (req, res) => {
  try {
    const { rangeId } = req.params;

    let config = await ShippingConfig.findOne();
    if (!config) {
      return res.status(404).json({ error: "Configuration not found" });
    }

    config.distanceRanges = config.distanceRanges.filter(
      (r) => String(r._id) !== String(rangeId)
    );

    await config.save();

    res.json({ config });
  } catch (err) {
    console.error("Remove distance range error:", err);
    res.status(500).json({ error: "Failed to remove distance range" });
  }
};

// Update warehouse location
exports.updateWarehouse = async (req, res) => {
  try {
    const { address, lat, lng } = req.body;

    let config = await ShippingConfig.findOne();
    if (!config) {
      config = await ShippingConfig.getConfig();
    }

    if (address !== undefined) config.warehouse.address = address;
    if (lat !== undefined) config.warehouse.lat = Number(lat);
    if (lng !== undefined) config.warehouse.lng = Number(lng);

    await config.save();

    res.json({ config });
  } catch (err) {
    console.error("Update warehouse error:", err);
    res.status(500).json({ error: "Failed to update warehouse location" });
  }
};
