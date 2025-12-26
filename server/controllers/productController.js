const Product = require("../models/Product");
const Attribute = require("../models/Attribute");
const { uploadImagesToCloudinary } = require("../utils/upload");
const cloudinary = require("../config/cloudinary");

// ----------------------------------------------
// Add Product (Admin Only)
// ----------------------------------------------
exports.addProduct = async (req, res) => {
  try {
    // 1️⃣ Upload images
    const uploadedImages = await uploadImagesToCloudinary(req.files);

    // 2️⃣ Parse attributes & addons (from FormData JSON strings)
    let attributes = [];
    let addons = [];

    try {
      attributes = req.body.attributes
        ? JSON.parse(req.body.attributes)
        : [];
      addons = req.body.addons
        ? JSON.parse(req.body.addons)
        : [];
    } catch (err) {
      return res.status(400).json({
        message: "Invalid attributes or addons format",
      });
    }

    // 3️⃣ Server-side validation for REQUIRED attributes
    if (attributes.length > 0) {
      const groupIds = attributes.map((a) => a.groupId);

      const attributeGroups = await Attribute.find({
        _id: { $in: groupIds },
      });

      const requiredGroups = attributeGroups.filter((g) => g.required);

      for (const group of requiredGroups) {
        const found = attributes.find(
          (a) => String(a.groupId) === String(group._id)
        );

        if (!found || !found.optionIds || found.optionIds.length === 0) {
          return res.status(400).json({
            message: `Missing required attribute: ${group.name}`,
          });
        }
      }
    }

    // 4️⃣ Create product
    const product = await Product.create({
      ...req.body,
      attributes,
      addons,
      images: uploadedImages,
    });

    res.json({
      message: "Product added successfully",
      product,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

// ----------------------------------------------
// Edit Product
// ----------------------------------------------
exports.editProduct = async (req, res) => {
  try {
    let updates = { ...req.body };

    // Parse attributes & addons if present
    if (req.body.attributes) {
      updates.attributes = JSON.parse(req.body.attributes);
    }

    if (req.body.addons) {
      updates.addons = JSON.parse(req.body.addons);
    }

    // Parse existing images array (from frontend)
    if (req.body.existingImages) {
      updates.images = JSON.parse(req.body.existingImages);
    }

    // If new images uploaded, add them
    if (req.files?.length > 0) {
      const newUploaded = await uploadImagesToCloudinary(req.files);
      updates.images = updates.images
        ? [...updates.images, ...newUploaded]
        : newUploaded;
    }

    const updated = await Product.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true }
    );

    res.json({ message: "Product updated", product: updated });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

// ----------------------------------------------
// Delete Product
// ----------------------------------------------
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

    await Product.findByIdAndDelete(req.params.id);

    res.json({ message: "Product deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

// ----------------------------------------------
// GET Single Product
// ----------------------------------------------
exports.getSingleProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate("attributes.groupId")
      .populate("addons.optionId");

    res.json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ----------------------------------------------
// GET All Products + Filters
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
    query.title = { $regex: search, $options: "i" };
  }

  // Category
  if (category) query.category = category;

  // Price Range (rental products)
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

  // Availability filter
  if (startDate && endDate) {
    const start = new Date(startDate).toISOString().split("T")[0];
    const end = new Date(endDate).toISOString().split("T")[0];

    query.blockedDates = {
      $not: {
        $elemMatch: { $gte: start, $lte: end },
      },
    };
  }

  const skip = (page - 1) * limit;

  try {
    const products = await Product.find(query)
      .skip(skip)
      .limit(limit)
      .populate("attributes.groupId")
      .populate("addons.optionId");

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
