const mongoose = require("mongoose");

/* =========================
   SUB-SCHEMAS
========================= */

// Attribute selections (global attributes → selected options)
const ProductAttributeSchema = new mongoose.Schema(
  {
    groupId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Attribute",
      required: true,
    },
    optionIds: [
      {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
      },
    ],
  },
  { _id: false }
);

// Add-ons with optional per-product price override
const ProductAddonSchema = new mongoose.Schema(
  {
    optionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Attribute",
      required: true,
    },
    overridePrice: {
      type: Number,
      default: null, // if null → use base price from Attribute option
    },
  },
  { _id: false }
);

/* =========================
   PRODUCT SCHEMA
========================= */

const productSchema = new mongoose.Schema(
  {
    /* BASIC INFO */
    title: {
      type: String,
      required: [true, "Product title is required"],
      trim: true,
    },

    category: {
  type: String,
  required: true,
},


    description: {
      type: String,
      maxlength: 2000,
    },

    /* PRODUCT TYPE */
    productType: {
      type: String,
      enum: ["rental", "sale"],
      default: "rental",
      required: true,
    },

    /* PRICING */
    pricePerDay: {
      type: Number,
      required: function () {
        return this.productType === "rental";
      },
    },

    salePrice: {
      type: Number,
      required: function () {
        return this.productType === "sale";
      },
    },

    /* INVENTORY */
    availabilityCount: {
      type: Number,
      default: 1,
      min: 0,
    },

    /* IMAGES */
    images: [
      {
        public_id: { type: String },
        url: { type: String, required: true },
      },
    ],

    /* GLOBAL ATTRIBUTES (dynamic) */
    attributes: {
      type: [ProductAttributeSchema],
      default: [],
    },

    /* ADD-ONS (pricing overrides allowed) */
    addons: {
      type: [ProductAddonSchema],
      default: [],
    },

    /* OPTIONAL METADATA (kept for future use) */
    tags: {
      type: [String],
      default: [],
    },

    specifications: {
      width: { type: String },
      height: { type: String },
      color: { type: String },
      material: { type: String },
      weight: { type: String },
    },

    featured: {
      type: Boolean,
      default: false,
    },

    /* RENTAL LOGIC */
    blockedDates: {
      type: [String], // yyyy-mm-dd
      default: [],
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Product", productSchema);
