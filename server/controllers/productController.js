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

    if (req.files?.length > 0) {
      const uploadedImages = await uploadImagesToCloudinary(req.files);
      updates.images = uploadedImages;
    }

    const product = await Product.findByIdAndUpdate(req.params.id, updates, {
      new: true,
    });

    res.json({
      message: "Product updated",
      product,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ----------------------------------------------
// Delete Product
// ----------------------------------------------
exports.deleteProduct = async (req, res) => {
  try {
    await Product.findByIdAndDelete(req.params.id);

    res.json({ message: "Product deleted" });
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
