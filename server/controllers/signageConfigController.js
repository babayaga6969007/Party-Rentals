const SignageConfig = require("../models/SignageConfig");

// Get signage configuration
exports.getConfig = async (req, res) => {
  try {
    const config = await SignageConfig.getConfig();
    res.json({ config });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update signage configuration
exports.updateConfig = async (req, res) => {
  try {
    let config = await SignageConfig.findOne();
    
    if (!config) {
      config = await SignageConfig.create(req.body);
    } else {
      config = await SignageConfig.findOneAndUpdate(
        {},
        { $set: req.body },
        { new: true, runValidators: true }
      );
    }

    res.json({ config, message: "Signage configuration updated successfully" });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Add a font
exports.addFont = async (req, res) => {
  try {
    const { name, value } = req.body;
    if (!name || !value) {
      return res.status(400).json({ error: "Font name and value are required" });
    }

    const config = await SignageConfig.getConfig();
    config.fonts.push({ name, value });
    await config.save();

    res.json({ config, message: "Font added successfully" });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Remove a font
exports.removeFont = async (req, res) => {
  try {
    const { fontId } = req.params;
    const config = await SignageConfig.getConfig();
    
    config.fonts = config.fonts.filter(
      (font) => font._id.toString() !== fontId
    );
    await config.save();

    res.json({ config, message: "Font removed successfully" });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Add a size
exports.addSize = async (req, res) => {
  try {
    const { key, label, width, height, fontSize } = req.body;
    if (!key || !label || width === undefined || height === undefined || fontSize === undefined) {
      return res.status(400).json({ error: "All size fields are required" });
    }

    const config = await SignageConfig.getConfig();
    
    // Check if key already exists
    if (config.sizes.some((s) => s.key === key)) {
      return res.status(400).json({ error: "Size key already exists" });
    }

    config.sizes.push({ key, label, width, height, fontSize });
    await config.save();

    res.json({ config, message: "Size added successfully" });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Update a size
exports.updateSize = async (req, res) => {
  try {
    const { sizeId } = req.params;
    const { key, label, width, height, fontSize } = req.body;
    
    const config = await SignageConfig.getConfig();
    const sizeIndex = config.sizes.findIndex(
      (s) => s._id.toString() === sizeId
    );

    if (sizeIndex === -1) {
      return res.status(404).json({ error: "Size not found" });
    }

    // Update size
    if (key) config.sizes[sizeIndex].key = key;
    if (label) config.sizes[sizeIndex].label = label;
    if (width !== undefined) config.sizes[sizeIndex].width = width;
    if (height !== undefined) config.sizes[sizeIndex].height = height;
    if (fontSize !== undefined) config.sizes[sizeIndex].fontSize = fontSize;

    await config.save();

    res.json({ config, message: "Size updated successfully" });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Remove a size
exports.removeSize = async (req, res) => {
  try {
    const { sizeId } = req.params;
    const config = await SignageConfig.getConfig();
    
    config.sizes = config.sizes.filter(
      (size) => size._id.toString() !== sizeId
    );
    await config.save();

    res.json({ config, message: "Size removed successfully" });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Update base price
exports.updatePrice = async (req, res) => {
  try {
    const { basePrice } = req.body;
    if (basePrice === undefined || basePrice < 0) {
      return res.status(400).json({ error: "Valid base price is required" });
    }

    const config = await SignageConfig.getConfig();
    config.basePrice = basePrice;
    await config.save();

    res.json({ config, message: "Base price updated successfully" });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
