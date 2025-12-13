const Category = require("../models/Category");
const slugify = require("../utils/slugify");
const { uploadImagesToCloudinary } = require("../utils/upload");

// ADMIN: Create category
exports.createCategory = async (req, res) => {
  try {
    const { name, description, sortOrder, isActive } = req.body;

    if (!name?.trim()) {
      return res.status(400).json({ message: "Category name is required" });
    }

    const slug = slugify(name);

    const exists = await Category.findOne({ $or: [{ name }, { slug }] });
    if (exists) {
      return res.status(400).json({ message: "Category already exists" });
    }

    let image = { public_id: "", url: "" };
    if (req.files?.length) {
      const uploaded = await uploadImagesToCloudinary(req.files);
      image = uploaded[0] || image;
    }

    const category = await Category.create({
      name: name.trim(),
      slug,
      description: description || "",
      sortOrder: Number(sortOrder || 0),
      isActive: isActive !== undefined ? isActive === "true" || isActive === true : true,
      image,
    });

    res.status(201).json({ message: "Category created", category });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ADMIN: Update category
exports.updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = { ...req.body };

    if (updates.name) {
      updates.name = updates.name.trim();
      updates.slug = slugify(updates.name);
    }

    if (req.files?.length) {
      const uploaded = await uploadImagesToCloudinary(req.files);
      updates.image = uploaded[0];
    }

    const category = await Category.findByIdAndUpdate(id, updates, { new: true });

    if (!category) return res.status(404).json({ message: "Category not found" });

    res.json({ message: "Category updated", category });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ADMIN: Delete category
exports.deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;

    const category = await Category.findByIdAndDelete(id);
    if (!category) return res.status(404).json({ message: "Category not found" });

    res.json({ message: "Category deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// PUBLIC: Get all categories
exports.getCategories = async (req, res) => {
  try {
    const categories = await Category.find({ isActive: true }).sort({ sortOrder: 1, name: 1 });
    res.json({ categories });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// PUBLIC: Get single category by slug
exports.getCategoryBySlug = async (req, res) => {
  try {
    const category = await Category.findOne({ slug: req.params.slug, isActive: true });
    if (!category) return res.status(404).json({ message: "Category not found" });
    res.json({ category });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
