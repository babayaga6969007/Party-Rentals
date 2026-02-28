const VinylPrintingConfig = require("../models/VinylPrintingConfig");

exports.getConfig = async (req, res) => {
  try {
    const config = await VinylPrintingConfig.getConfig();
    res.json({ config });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateConfig = async (req, res) => {
  try {
    let config = await VinylPrintingConfig.findOne();
    if (!config) {
      config = await VinylPrintingConfig.create(req.body);
    } else {
      config = await VinylPrintingConfig.findOneAndUpdate(
        {},
        { $set: req.body },
        { new: true, runValidators: true }
      );
    }
    res.json({ config, message: "Vinyl printing configuration updated successfully" });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.addSize = async (req, res) => {
  try {
    const { key, label, price, minimum } = req.body;
    if (!key || !label || price === undefined) {
      return res.status(400).json({ error: "Key, label, and price are required" });
    }

    const config = await VinylPrintingConfig.getConfig();
    if (config.sizes.some((s) => s.key === key)) {
      return res.status(400).json({ error: "Size key already exists" });
    }

    config.sizes.push({
      key,
      label,
      price: Number(price),
      minimum: !!minimum,
    });
    await config.save();

    res.json({ config, message: "Size added successfully" });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.updateSize = async (req, res) => {
  try {
    const { sizeId } = req.params;
    const { key, label, price, minimum } = req.body;

    const config = await VinylPrintingConfig.getConfig();
    const sizeIndex = config.sizes.findIndex((s) => s._id.toString() === sizeId);
    if (sizeIndex === -1) {
      return res.status(404).json({ error: "Size not found" });
    }

    if (key != null) config.sizes[sizeIndex].key = key;
    if (label != null) config.sizes[sizeIndex].label = label;
    if (price !== undefined) config.sizes[sizeIndex].price = Number(price);
    if (minimum !== undefined) config.sizes[sizeIndex].minimum = !!minimum;

    await config.save();
    res.json({ config, message: "Size updated successfully" });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.removeSize = async (req, res) => {
  try {
    const { sizeId } = req.params;
    const config = await VinylPrintingConfig.getConfig();
    config.sizes = config.sizes.filter((s) => s._id.toString() !== sizeId);
    await config.save();
    res.json({ config, message: "Size removed successfully" });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
