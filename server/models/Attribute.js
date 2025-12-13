const mongoose = require("mongoose");

const attributeSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      required: true,
      enum: ["color", "tag", "size", "material"],
    },
    name: { type: String, required: true, trim: true },
value: { type: String, trim: true, default: "" },
    isActive: { type: Boolean, default: true },
    sortOrder: { type: Number, default: 0 },
  },
  { timestamps: true }
);

// Prevent duplicates per type
attributeSchema.index({ type: 1, name: 1 }, { unique: true });

module.exports = mongoose.model("Attribute", attributeSchema);
