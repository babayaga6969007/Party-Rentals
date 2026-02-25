const mongoose = require("mongoose");

const galleryImageSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Image title is required"],
      trim: true,
    },
    subtitle: {
      type: String,
      trim: true,
    },
    category: {
      type: String,
      enum: ["signage", "vinyl-wraps"],
      required: [true, "Category is required"],
    },
    image: {
      url: {
        type: String,
        required: [true, "Image URL is required"],
      },
      public_id: {
        type: String,
        required: true,
      },
    },
    order: {
      type: Number,
      default: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("GalleryImage", galleryImageSchema);
