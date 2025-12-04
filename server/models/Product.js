const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    // Use title instead of name (matches your frontend)
    title: {
      type: String,
      required: [true, "Product title is required"],
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
      default: 1,
    },

    description: {
      type: String,
      required: false,
      maxlength: 2000,
    },

    images: [
      {
        public_id: { type: String, required: false }, // make optional
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
      type: [String], // yyyy-mm-dd
      default: [],
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Product", productSchema);
