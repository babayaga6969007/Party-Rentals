const mongoose = require("mongoose");

const textElementSchema = new mongoose.Schema(
  {
    content: { type: String, required: true },
    x: { type: Number, required: true },
    y: { type: Number, required: true },
    fontSize: { type: Number, required: true },
    fontFamily: { type: String, required: true },
    color: { type: String, required: true },
  },
  { _id: false }
);

const signageSchema = new mongoose.Schema(
  {
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    name: {
      type: String,
      required: false,
      trim: true,
      default: "",
    },
    texts: {
      type: [textElementSchema],
      required: true,
      default: [],
    },
    backgroundType: {
      type: String,
      enum: ["color", "image"],
      default: "color",
    },
    backgroundColor: {
      type: String,
      default: "#FFFFFF",
    },
    backgroundImage: {
      public_id: { type: String },
      url: { type: String },
    },
    canvasWidth: {
      type: Number,
      default: 800,
    },
    canvasHeight: {
      type: Number,
      default: 600,
    },
    // Metadata for sharing
    metadata: {
      shareable: { type: Boolean, default: false },
      shareToken: { type: String, default: null },
      sharedAt: { type: Date, default: null },
      viewCount: { type: Number, default: 0 },
    },
    // User information (if you have user auth later)
    createdBy: {
      type: String,
      default: "guest",
    },
  },
  { timestamps: true }
);

// Generate share token
signageSchema.methods.generateShareToken = function () {
  const crypto = require("crypto");
  this.metadata.shareToken = crypto.randomBytes(16).toString("hex");
  this.metadata.shareable = true;
  this.metadata.sharedAt = new Date();
  return this.metadata.shareToken;
};

module.exports = mongoose.model("Signage", signageSchema);
