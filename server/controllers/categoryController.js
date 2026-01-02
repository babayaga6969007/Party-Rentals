const Category = require("../models/Category");
const slugify = require("../utils/slugify");
const fs = require("fs");
const cloudinary = require("../config/cloudinary");

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

    // Multer should attach file here
    if (!req.file || !req.file.path) {
      return res.status(400).json({ message: "Image upload failed" });
    }

    // 1) Upload local temp file to Cloudinary
    const result = await cloudinary.v2.uploader.upload(req.file.path, {
      folder: "party-rentals/categories",
      resource_type: "image",
    });

    // 2) Delete temp file from local disk
    try {
      fs.unlinkSync(req.file.path);
    } catch (e) {
      console.log("Temp file cleanup skipped:", e.message);
    }

    // 3) Save category in DB with Cloudinary URL
    const category = await Category.create({
      name: name.trim(),
      type,
      slug: name.toLowerCase().replace(/\s+/g, "-"),
      image: result.secure_url,
    });

    return res.status(201).json(category);
  } catch (err) {
    console.error("CREATE CATEGORY ERROR:", err);
    return res.status(500).json({ message: err.message });
  }
};

/* =========================
   UPDATE CATEGORY (ADMIN)
========================= */
exports.updateCategory = async (req, res) => {
  try {
    const updateData = { ...req.body };

    // If a new image is uploaded, upload to Cloudinary
    if (req.file?.path) {
      const result = await cloudinary.v2.uploader.upload(req.file.path, {
        folder: "party-rentals/categories",
        resource_type: "image",
      });

      // delete temp file
      try {
        fs.unlinkSync(req.file.path);
      } catch (e) {
        console.log("Temp file cleanup skipped:", e.message);
      }

      updateData.image = result.secure_url;
    }

    const updated = await Category.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
    });

    if (!updated) {
      return res.status(404).json({ message: "Category not found" });
    }

    return res.json(updated);
  } catch (err) {
    console.error("UPDATE CATEGORY ERROR:", err);
    return res.status(500).json({ message: err.message });
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
