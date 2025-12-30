const Category = require("../models/Category");
const slugify = require("../utils/slugify");

/* =========================
   GET ALL CATEGORIES
========================= */
exports.getCategories = async (req, res) => {
  try {
    const categories = await Category.find().sort({ createdAt: -1 });
    res.json(categories);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* =========================
   GET CATEGORY BY SLUG
========================= */
exports.getCategoryBySlug = async (req, res) => {
  try {
    const category = await Category.findOne({ slug: req.params.slug });
    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }
    res.json(category);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* =========================
   CREATE CATEGORY (ADMIN)
========================= */
exports.createCategory = async (req, res) => {

  try {
    const { name, type } = req.body;
    if (!req.file) {
  return res.status(400).json({ message: "Category image is required" });
}


    if (!name || !type) {
      return res.status(400).json({
        message: "Category name and type are required",
      });
    }

    const slug = slugify(name, { lower: true, strict: true });

    const exists = await Category.findOne({ slug });
    if (exists) {
      return res.status(409).json({
        message: "Category already exists",
      });
    }

const imageUrl = `${req.protocol}://${req.get("host")}/uploads/${req.file.filename}`;

const category = new Category({
  name: name.trim(),
  slug,
  type,
  image: imageUrl,
});


    await category.save();

    // 🔴 THIS WAS MISSING EARLIER
    res.status(201).json(category);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

/* =========================
   UPDATE CATEGORY (ADMIN)
========================= */
exports.updateCategory = async (req, res) => {
  try {
    const { name, type } = req.body;

    const updates = {};
    if (name) updates.name = name.trim();
    if (type) updates.type = type;

    if (updates.name) {
      updates.slug = slugify(updates.name, {
        lower: true,
        strict: true,
      });
    }

    const updated = await Category.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ message: "Category not found" });
    }

    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* =========================
   DELETE CATEGORY (ADMIN)
========================= */
exports.deleteCategory = async (req, res) => {
  try {
    const deleted = await Category.findByIdAndDelete(req.params.id);

    if (!deleted) {
      return res.status(404).json({ message: "Category not found" });
    }

    res.json({ message: "Category deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
