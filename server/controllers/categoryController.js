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

    if (!name || !type) {
      return res.status(400).json({ message: "Name and type are required" });
    }

    if (!req.file || !req.file.path) {
      return res.status(400).json({ message: "Image upload failed" });
    }

    const category = await Category.create({
      name: name.trim(),
      type,
      slug: name.toLowerCase().replace(/\s+/g, "-"),
      image: req.file.path, // ✅ THIS IS THE KEY FIX
    });

    res.status(201).json(category); // ✅ return ONLY category
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};


/* =========================
   UPDATE CATEGORY (ADMIN)
========================= */
exports.updateCategory = async (req, res) => {
  try {
    const updateData = { ...req.body };

    if (req.file?.path) {
      updateData.image = req.file.path; // ✅ Cloudinary URL
    }

    const updated = await Category.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ message: "Category not found" });
    }

    res.json(updated); // ✅ return plain category
  } catch (err) {
    res.status(500).json({ message: err.message });
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
