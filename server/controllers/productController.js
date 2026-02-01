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
// 🔹 Separate base images and variation images (upload.fields())
const baseImages = req.files?.images || [];
// 1️⃣ Upload base images (ONLY for simple products)
let uploadedImages = [];


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
   const featuredFlag =
  req.body.featured === "true" || req.body.featured === true;

const {
  title,
  description,
  dimensions,
  category,
  productType,
  pricePerDay,
  price,        
  salePrice,
  availabilityCount,
  tags,
} = req.body;
if (
  productType === "rental" &&
  !req.body.variations
) {
  const baseImages = req.files?.images || [];
  uploadedImages = await uploadImagesToCloudinary(baseImages);
}

if (productType === "sale") {
  const baseImages = req.files?.images || [];
  uploadedImages = await uploadImagesToCloudinary(baseImages);
}

// 🔹 Determine subtype
const productSubType =
  productType === "rental" && req.body.variations
    ? "variable"
    : "simple";
    
if (productSubType === "variable") {
  req.body.featured = false;
}

if (productSubType === "variable") {
  req.body.pricePerDay = undefined;
  req.body.availabilityCount = 0;
}

// 🔹 Parse variations
let parsedVariations = [];

if (productSubType === "variable") {
  try {
    parsedVariations = JSON.parse(req.body.variations || "[]");
  } catch {
    return res.status(400).json({ message: "Invalid variations format" });
  }

  if (parsedVariations.length === 0) {
    return res.status(400).json({
      message: "Variable rental must have at least one variation",
    });
  }
}
// ✅ FIX 1: Upload variation images (1 image per variation)
const variationImagesMap = {};

if (productSubType === "variable") {
  for (let i = 0; i < parsedVariations.length; i++) {
    const files = req.files?.[`variationImages_${i}`] || [];

    // Your UI allows a single image per variation, so we take [0]
    if (files.length > 0) {
      const uploaded = await uploadImagesToCloudinary(files);
      variationImagesMap[i] = uploaded[0]; // { public_id, url }
    }
  }
}

const finalVariations =
  productSubType === "variable"
    ? parsedVariations.map((v, i) => ({
        dimension: v.dimension,
        pricePerDay: Number(v.pricePerDay),
        salePrice: v.salePrice ? Number(v.salePrice) : null,
        stock: Number(v.stock),
        image: variationImagesMap[i] || null,
      }))
    : [];

const basePayload = {
  title,
  description,
  category,
  productType,
  productSubType,
  tags,
  attributes,
  addons,

  dimensions: productSubType === "simple" ? dimensions : "",
  availabilityCount:
    productSubType === "simple" ? Number(availabilityCount) : 0,

  images: productSubType === "simple" ? uploadedImages : [],
  variations: finalVariations,
};


if (productType === "rental" && productSubType === "simple") {
  basePayload.pricePerDay = Number(pricePerDay);
}

if (productType === "sale") {
  basePayload.price = Number(price);
  basePayload.salePrice = salePrice ? Number(salePrice) : null;
}

const product = await Product.create(basePayload);


// 🔒 ENFORCE MAX 8 FEATURED RENTAL PRODUCTS (FIFO)
if (featuredFlag) {
  const featuredProducts = await Product.find({
    featured: true,
    productType: "rental",
  }).sort({ featuredAt: 1 }); // oldest first

  if (featuredProducts.length > 8) {
    const excess = featuredProducts.slice(0, featuredProducts.length - 8);

    await Product.updateMany(
      { _id: { $in: excess.map((p) => p._id) } },
      { $set: { featured: false, featuredAt: null } }
    );
  }
}



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
    const updates = {};
    // Load existing product (needed to preserve variation images)
const existingProduct = await Product.findById(req.params.id).lean();
if (!existingProduct) {
  return res.status(404).json({ message: "Product not found" });
}


   
   // -------- BASIC FIELDS --------
if (req.body.title !== undefined) updates.title = req.body.title;
if (req.body.description !== undefined)
  updates.description = req.body.description;
if (req.body.dimensions !== undefined)
  updates.dimensions = req.body.dimensions; // ✅
if (req.body.category !== undefined) updates.category = req.body.category;
updates.productSubType = "simple";
updates.variations = [];


    if (req.body.productType !== undefined)
      updates.productType = req.body.productType;
    if (req.body.featured !== undefined) {
  const featuredFlag =
    req.body.featured === "true" || req.body.featured === true;

  updates.featured = featuredFlag;
  updates.featuredAt = featuredFlag ? new Date() : null;
}
// ❌ Sale products should NEVER be featured
if (updates.productType === "sale") {
  updates.featured = false;
  updates.featuredAt = null;
}


    if (req.body.availabilityCount !== undefined)
      updates.availabilityCount = Number(req.body.availabilityCount);

    if (req.body.pricePerDay !== undefined)
      updates.pricePerDay = Number(req.body.pricePerDay);

    if (req.body.salePrice !== undefined)
      updates.salePrice = Number(req.body.salePrice);

else if (updates.productSubType === "simple") {
  // Clear variations if switching back to simple
  updates.variations = [];
}

    // -------- ATTRIBUTES --------
   if (req.body.attributes) {
  const parsedAttrs = JSON.parse(req.body.attributes);

  updates.attributes = (parsedAttrs || []).filter(
    (a) =>
      a?.groupId &&
      a.groupId !== "null" &&
      a.groupId !== "undefined" &&
      Array.isArray(a.optionIds) &&
      a.optionIds.length > 0
  );
}


    // -------- ADDONS (CRITICAL FIX) --------
  if ("addons" in req.body) {
  const parsedAddons = JSON.parse(req.body.addons || "[]");

  updates.addons = parsedAddons.map((a) => {
    const addonData = {
      optionId: a.optionId,
      overridePrice:
        a.overridePrice === "" || a.overridePrice === null
          ? null
          : Number(a.overridePrice),
    };
    
    // Include shelving configuration if present
    if (a.shelvingTier) {
      addonData.shelvingTier = a.shelvingTier;
      addonData.shelvingSize = a.shelvingSize || "";
      addonData.shelvingQuantity = a.shelvingQuantity || 1;
    }
    
    return addonData;
  });
}



    // -------- EXISTING IMAGES --------
    if (req.body.existingImages) {
      updates.images = JSON.parse(req.body.existingImages);
    }

    // -------- NEW IMAGES --------
   if (req.files && typeof req.files === "object") {
  const baseImages = req.files.images || [];

  // Upload base images
  if (baseImages.length > 0) {
    const uploaded = await uploadImagesToCloudinary(baseImages);
    updates.images = updates.images
      ? [...updates.images, ...uploaded]
      : uploaded;
  }


}


    const updated = await Product.findByIdAndUpdate(
      req.params.id,
      { $set: updates },   // 🔒 IMPORTANT
      { new: true, runValidators: true }
    );
    // 🔒 ENFORCE MAX 8 FEATURED RENTAL PRODUCTS (FIFO)
if (updates.featured === true) {
  const featuredProducts = await Product.find({
    featured: true,
    productType: "rental",
  }).sort({ featuredAt: 1 });

  if (featuredProducts.length > 8) {
    const excess = featuredProducts.slice(0, featuredProducts.length - 8);

    await Product.updateMany(
      { _id: { $in: excess.map((p) => p._id) } },
      { $set: { featured: false, featuredAt: null } }
    );
  }
}


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
const product = await Product.findById(req.params.id)
  .populate({
    path: "attributes.groupId",
    model: "Attribute",
  })
  .populate({
    path: "variations.attributes.groupId",
    model: "Attribute",
  });

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
exports.getSingleProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate("attributes.groupId")
      .lean();

    if (!product) return res.status(404).json({ message: "Product not found" });

    const addonGroups = await Attribute.find({ type: "addon" }).lean();

    const optionMap = {};
    addonGroups.forEach((g) => {
      g.options.forEach((o) => {
        optionMap[String(o._id)] = {
          label: o.label,
          priceDelta: o.priceDelta || 0,
          groupName: g.name,
          tier: o.tier, // Include tier for shelving addons
        };
      });
    });

    product.addons = (product.addons || []).map((a) => ({
      ...a,
      option: optionMap[String(a.optionId)] || null,
      // Preserve shelving data if it exists
      shelvingData: (a.shelvingTier || a.shelvingSize || a.shelvingQuantity) ? {
        tier: a.shelvingTier || "",
        size: a.shelvingSize || "",
        quantity: a.shelvingQuantity || 1,
      } : null,
    }));

    res.json(product);
  } catch (err) {
    res.status(500).json({ message: err.message });
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
  // Price Range (rental products)
if (minPrice || maxPrice) {
  query.$or = [
    // Simple rental
    {
      productSubType: "simple",
      pricePerDay: {
        ...(minPrice && { $gte: Number(minPrice) }),
        ...(maxPrice && { $lte: Number(maxPrice) }),
      },
    },
    // Variable rental (check variations)
    {
      productSubType: "variable",
      variations: {
        $elemMatch: {
          pricePerDay: {
            ...(minPrice && { $gte: Number(minPrice) }),
            ...(maxPrice && { $lte: Number(maxPrice) }),
          },
        },
      },
    },
  ];
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
  .populate("category", "name")         
  .populate("attributes.groupId");


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
