const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Product name is required"],
    },

    category: {
      type: String,
      required: true,
      enum: [
        "Backdrops",
        "Furniture",
        "Balloon Stands",
        "Lights",
        "Photo Props",
        "Tables",
        "Other",
      ],
    },

    pricePerDay: {
      type: Number,
      required: true,
    },

    availabilityCount: {
      type: Number,
      required: true,
      default: 1,
    },

    description: {
      type: String,
      required: true,
      maxlength: 2000,
    },

    images: [
      {
        public_id: { type: String, required: true },
        url: { type: String, required: true },
      },
    ],

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

    blockedDates: {
      type: [String], // store yyyy-mm-dd as string
      default: [],
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Product", productSchema);
