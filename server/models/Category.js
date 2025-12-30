const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Category name is required"],
      trim: true,
    },

    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },

    type: {
      type: String,
      enum: ["rental", "sale"],
      required: true,
    },

    image: {
      type: String,
      required: [true, "Category image is required"], // ✅ compulsory
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Category", categorySchema);
