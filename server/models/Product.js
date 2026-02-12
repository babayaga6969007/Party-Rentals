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
    // Paint-only: per-product config (price, price per addition, allow multiple)
    allowMultiple: { type: Boolean, default: false },
    price: { type: Number, default: null },
    pricePerAddition: { type: Number, default: null },
  },
  { _id: false }
);

// Add-ons with optional per-product price override
const ProductAddonSchema = new mongoose.Schema(
  {
    optionId: {
  type: mongoose.Schema.Types.ObjectId,
  required: true,
},


    // Optional override for flat addons
    overridePrice: {
      type: Number,
      default: null,
    },

    /* =========================
       SHELVING CONFIG
    ========================= */
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

    // Per-product shelving pricing (overrides global Shelving Config when set)
    shelvingPriceOverrides: {
      tierA: {
        sizes: [
          {
            size: { type: String, trim: true },
            dimensions: { type: String, trim: true, default: "" },
            price: { type: Number, min: 0 },
          },
        ],
      },
      tierB: { price: { type: Number, min: 0, default: undefined } },
      tierC: { price: { type: Number, min: 0, default: undefined } },
    },

    /* =========================
       PEDESTALS CONFIG
    ========================= */
    pedestals: {
      type: [
        {
          dimension: {
            type: String,
            trim: true,
            required: true,
          },
          price: {
            type: Number,
            required: true,
            min: 0,
          },
        },
      ],
      default: [],
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
    pricePerDay: {
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

    // Optional description for this variation (e.g. "10x10 - Perfect for small gatherings")
    description: {
      type: String,
      trim: true,
      default: "",
      maxlength: 2000,
    },

// =========================
// VARIATION IMAGES
// =========================
images: {
  type: [
    {
      public_id: { type: String, trim: true },
      url: {
        type: String,
        required: true,
        trim: true,
      },
    },
  ],
  default: [],
  validate: {
    validator: function (arr) {
      return Array.isArray(arr) && arr.length <= 5;
    },
    message: "Each variation can have a maximum of 5 images",
  },
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

price: {
  type: Number,
  required: function () {
    return this.productType === "sale";
  },
  min: 0,
},

salePrice: {
  type: Number,
  default: null,
  min: 0,
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

    /* Custom title (e.g. telephone booth) — when true, client can enter title text */
    allowCustomTitle: {
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

productSchema.pre("validate", function (next) {
  if (
    this.productType === "rental" &&
    this.productSubType === "variable"
  ) {
    // Variable rentals should NOT have base images or simple pricing
    this.images = [];
    this.pricePerDay = undefined;
    this.availabilityCount = 0;
  }
  next();
});

module.exports = mongoose.model("Product", productSchema);