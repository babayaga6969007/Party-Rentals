const mongoose = require("mongoose");

const AttributeOptionSchema = new mongoose.Schema(
  {
    label: { type: String, required: true, trim: true },
    value: { type: String, trim: true },
    hex: { type: String, trim: true },
    priceDelta: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
    sortOrder: { type: Number, default: 0 },
  },
  { timestamps: true }
);

const AttributeSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true },
    type: {
      type: String,
      enum: ["select", "multi", "color", "addon"],
      default: "multi",
    },
    required: { type: Boolean, default: false },
    options: { type: [AttributeOptionSchema], default: [] },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Attribute", AttributeSchema);
