const Product = require("../models/Product");
const { uploadImagesToCloudinary } = require("../utils/upload");

// ----------------------------------------------
// Add Product (Admin Only)
// ----------------------------------------------
exports.addProduct = async (req, res) => {
  try {
    const uploadedImages = await uploadImagesToCloudinary(req.files);

    const product = await Product.create({
      ...req.body,
      images: uploadedImages,
    });

    res.json({
      message: "Product added successfully",
      product,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// ----------------------------------------------
// Edit Product
// ----------------------------------------------
exports.editProduct = async (req, res) => {
  try {
    let updates = { ...req.body };

    // Parse existing images array (from frontend)
    if (req.body.existingImages) {
      updates.images = JSON.parse(req.body.existingImages);
    }

    // If new images uploaded, add them
    if (req.files?.length > 0) {
      const newUploaded = await uploadImagesToCloudinary(req.files);
      updates.images = [...updates.images, ...newUploaded];
    }

    const updated = await Product.findByIdAndUpdate(req.params.id, updates, {
      new: true,
    });

    res.json({ message: "Product updated", product: updated });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ----------------------------------------------
// Delete Product
// ----------------------------------------------
const cloudinary = require("../config/cloudinary");


exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    // Delete Cloudinary images
    for (const img of product.images) {
      if (img.public_id) {
        await cloudinary.uploader.destroy(img.public_id);
      }
    }

    // Delete product from DB
    await Product.findByIdAndDelete(req.params.id);

    res.json({ message: "Product deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// ----------------------------------------------
// GET Single Product
// ----------------------------------------------
exports.getSingleProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    res.json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ----------------------------------------------
// GET All Products + Filters (Advanced)
// ----------------------------------------------
exports.getProducts = async (req, res) => {
  let {
    search,
    category,
    minPrice,
    maxPrice,
    tags,
    featured,
    startDate,
    endDate,
    page = 1,
    limit = 20,
  } = req.query;

  let query = {};

  // Search
  if (search) {
    query.name = { $regex: search, $options: "i" };
  }

  // Category
  if (category) query.category = category;

  // Price Range
  if (minPrice || maxPrice) {
    query.pricePerDay = {};
    if (minPrice) query.pricePerDay.$gte = Number(minPrice);
    if (maxPrice) query.pricePerDay.$lte = Number(maxPrice);
  }

  // Tags
  if (tags) {
    const tagArray = tags.split(",");
    query.tags = { $in: tagArray };
  }

  // Featured
  if (featured === "true") query.featured = true;

  // Availability Filter (remove items blocked in user-selected range)
  if (startDate && endDate) {
    const start = new Date(startDate).toISOString().split("T")[0];
    const end = new Date(endDate).toISOString().split("T")[0];

    query.blockedDates = {
      $not: {
        $elemMatch: { $gte: start, $lte: end },
      },
    };
  }

  // Pagination
  const skip = (page - 1) * limit;

  try {
    const products = await Product.find(query).skip(skip).limit(limit);

    res.json({
      total: await Product.countDocuments(query),
      page: Number(page),
      limit: Number(limit),
      products,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
