const Attribute = require("../models/Attribute");

// ADMIN: Create attribute
exports.createAttribute = async (req, res) => {
  try {
    const { type, name, value, sortOrder } = req.body;

    if (!type || !name) {
      return res.status(400).json({ message: "Type and name are required" });
    }

    const attribute = await Attribute.create({
      type,
      name: name.trim(),
value: (value && value.trim()) ? value.trim() : name.trim(),
      sortOrder: Number(sortOrder || 0),
    });

    res.status(201).json({ message: "Attribute created", attribute });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ADMIN: Update attribute
exports.updateAttribute = async (req, res) => {
  try {
    const attribute = await Attribute.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    if (!attribute) {
      return res.status(404).json({ message: "Attribute not found" });
    }

    res.json({ message: "Attribute updated", attribute });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ADMIN: Delete attribute
exports.deleteAttribute = async (req, res) => {
  try {
    await Attribute.findByIdAndDelete(req.params.id);
    res.json({ message: "Attribute deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// PUBLIC: Get attributes by type
exports.getAttributesByType = async (req, res) => {
  try {
    const attributes = await Attribute.find({
      type: req.params.type,
      isActive: true,
    }).sort({ sortOrder: 1, name: 1 });

    res.json({ attributes });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
