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
    // Shelving configuration (for shelving addons)
    shelvingTier: {
      type: String,
      enum: ["A", "B", "C"],
      default: undefined,
    },
    shelvingSize: {
      type: String,
      default: "",
    },
    shelvingQuantity: {
      type: Number,
      default: 1,
      min: 0,
    },
  },
  { _id: false }
);
// =========================
// VARIATION SUB-SCHEMA
// =========================

const ProductVariationSchema = new mongoose.Schema(
  {
    // Attribute combination for this variation
    attributes: [
      {
        groupId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Attribute",
          required: true,
        },
        optionId: {
          type: mongoose.Schema.Types.ObjectId,
          required: true,
        },
      },
    ],

    // Pricing (required)
    price: {
      type: Number,
      required: true,
      min: 0,
    },

    // Optional discount
    salePrice: {
      type: Number,
      default: null,
      min: 0,
    },

    // Stock per variation
    stock: {
      type: Number,
      default: 0,
      min: 0,
    },

    // dimension
dimension: {
  type: String,
  trim: true,
  default: "",
},


    // Optional image override
    image: {
      public_id: { type: String },
      url: { type: String },
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
dimensions: {
  type: String,
  trim: true,
},

    /* PRODUCT TYPE */
    productType: {
      type: String,
      enum: ["rental", "sale"],
      default: "rental",
      required: true,
    },
productSubType: {
  type: String,
  enum: ["simple", "variable"],
  default: "simple",
},

    /* PRICING */
    pricePerDay: {
  type: Number,
  required: function () {
    return (
      this.productType === "rental" &&
      this.productSubType === "simple"
    );
  },
},

   salePrice: {
  type: Number,
  required: function () {
    return (
      this.productType === "sale" &&
      this.productSubType === "simple"
    );
  },
},

variations: {
  type: [ProductVariationSchema],
  default: [],
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
featuredAt: {
  type: Date,
  default: null,
},

 


    /* RENTAL LOGIC */
    blockedDates: {
      type: [String], // yyyy-mm-dd
      default: [],
    },
    
  },
  
  { timestamps: true }
);

/* =========================
   SCHEMA-LEVEL SAFETY GUARDS
========================= */

productSchema.pre("validate", function (next) {
  // 🚫 Selling products cannot be variable
  if (this.productType === "sale" && this.productSubType === "variable") {
    return next(new Error("Selling products cannot have variations."));
  }

  // 🚫 Variable products must have variations
  if (
    this.productSubType === "variable" &&
    (!this.variations || this.variations.length === 0)
  ) {
    return next(
      new Error("Variable products must have at least one variation.")
    );
  }

  next();
});

module.exports = mongoose.model("Product", productSchema);