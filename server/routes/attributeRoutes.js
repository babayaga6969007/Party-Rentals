const express = require("express");
const Attribute = require("../models/Attribute");

const router = express.Router();

// helper
function slugify(str) {
  return String(str || "")
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

/**
 * GET all attribute groups
 */
router.get("/", async (req, res) => {
  try {
    const groups = await Attribute.find().sort({ createdAt: -1 });
    res.json(groups);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to load attributes" });
  }
});

/**
 * POST create a new attribute group
 */
router.post("/", async (req, res) => {
  try {
    const { name, type = "multi", required = false } = req.body;

    if (!name) {
      return res.status(400).json({ message: "name is required" });
    }

    const slug = slugify(name);
    const exists = await Attribute.findOne({ slug });
    if (exists) {
      return res
        .status(409)
        .json({ message: "Attribute group with this name already exists" });
    }

    const created = await Attribute.create({
      name,
      slug,
      type,
      required,
    });

    res.status(201).json(created);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to create attribute group" });
  }
});

/**
 * DELETE a group
 */
router.delete("/:groupId", async (req, res) => {
  try {
    const deleted = await Attribute.findByIdAndDelete(req.params.groupId);
    if (!deleted) {
      return res.status(404).json({ message: "Group not found" });
    }
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to delete group" });
  }
});

/**
 * POST add option to group
 */
router.post("/:groupId/options", async (req, res) => {
  try {
    const { label, hex, priceDelta = 0, tier } = req.body;
    if (!label) {
      return res.status(400).json({ message: "label is required" });
    }

    const group = await Attribute.findById(req.params.groupId);
    if (!group) {
      return res.status(404).json({ message: "Group not found" });
    }

    const duplicate = group.options.some(
      (o) => o.label.toLowerCase().trim() === label.toLowerCase().trim()
    );
    if (duplicate) {
      return res
        .status(409)
        .json({ message: "Option already exists in this group" });
    }

    // Check if this is a shelving addon (for tier assignment)
    const isShelving = group.type === "addon" && 
      (label.toLowerCase().includes("shelving") || label.toLowerCase().includes("shelf"));

    group.options.push({
      label: label.trim(),
      hex: group.type === "color" ? hex || "#000000" : undefined,
      priceDelta: group.type === "addon" ? Number(priceDelta) : 0,
      tier: isShelving && tier ? tier : undefined, // Only set tier for shelving addons
    });

    await group.save();
    res.status(201).json(group);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to add option" });
  }
});

/**
 * DELETE option
 */
router.delete("/:groupId/options/:optionId", async (req, res) => {
  try {
    const group = await Attribute.findById(req.params.groupId);
    if (!group) {
      return res.status(404).json({ message: "Group not found" });
    }

    group.options = group.options.filter(
      (o) => String(o._id) !== String(req.params.optionId)
    );

    await group.save();
    res.json(group);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to delete option" });
  }
});

module.exports = router;
