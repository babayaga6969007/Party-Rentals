const mongoose = require("mongoose");

const orderItemSchema = new mongoose.Schema(
  {
    productId: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "Product", 
      required: function() {
        // productId optional for signage and vinyl-printing
        return this.productType !== "signage" && this.productType !== "vinyl-printing";
      }
    },
    name: { type: String, required: true },
    productType: { type: String, enum: ["rental", "purchase", "signage", "vinyl-printing"], required: true },

    qty: { type: Number, required: true, min: 1 },

    // pricing snapshot
    unitPrice: { type: Number, required: true }, // per day for rental, per unit for purchase
    lineTotal: { type: Number, required: true },

    // rental only
    startDate: { type: String, default: "" }, // yyyy-mm-dd
    endDate: { type: String, default: "" },   // yyyy-mm-dd
    days: { type: Number, default: 0 },

    // signage only
    signageId: { type: mongoose.Schema.Types.ObjectId, ref: "Signage", default: null },
    signageData: {
      texts: { type: Array, default: [] },
      textContent: { type: String, default: "" },
      fontFamily: { type: String, default: "" },
      fontSize: { type: Number, default: null },
      textColor: { type: String, default: "" },
      textWidth: { type: Number, default: null },
      textHeight: { type: Number, default: null },
      widthInches: { type: Number, default: null },
      heightInches: { type: Number, default: null },
      size: { type: String, default: "" },
      backgroundType: { type: String, default: "" },
      backgroundColor: { type: String, default: "" },
      backgroundGradient: { type: String, default: "" },
      backgroundImageUrl: { type: String, default: "" },
      signageType: { type: String, enum: ["acrylic", "vinyl"], default: "acrylic" },
      rushProduction: { type: Boolean, default: false },
    },

    // vinyl-printing only
    vinylPrintingData: {
      sizeLabel: { type: String, default: "" },
      sizeKey: { type: String, default: "" },
      price: { type: Number, default: 0 },
      fileUrl: { type: String, default: "" },
      rushProduction: { type: Boolean, default: false },
    },

    // Custom title text (e.g. for telephone booth) when product allows it
    customTitle: { type: String, default: "" },

    // Add-ons (for rental products)
    addons: [{
      optionId: { type: String },
      name: { type: String },
      price: { type: Number, default: 0 },
      signageText: { type: String, default: "" },
      vinylColor: { type: String, default: "" },
      vinylHex: { type: String, default: "" },
      vinylImageUrl: { type: String, default: "" },
      vinylWidthInches: { type: Number, default: 0 },
      vinylHeightInches: { type: Number, default: 0 },
      vinylSizeKey: { type: String, default: "" },
      vinylSizeLabel: { type: String, default: "" },
      shelvingData: {
        tier: { type: String },
        size: { type: String },
        quantity: { type: Number, default: 0 },
      },
    }],

    // Colors & paints (attribute selections for rental) – for admin order view
    selectedOptions: [{
      groupName: { type: String, default: "" },
      type: { type: String, default: "" },
      optionLabels: [{ type: String }],
      optionIds: [{ type: String }],
      optionHexes: [{ type: String }],
      optionImageUrls: [{ type: String }],
      price: { type: Number, default: 0 },
    }],
    paintSelections: [{
      groupId: { type: String, default: "" },
      groupName: { type: String, default: "" },
      optionIds: [{ type: String }],
      optionLabels: [{ type: String }],
      optionImageUrls: [{ type: String }],
      price: { type: Number, default: 0 },
    }],

    image: { type: String, default: "" },
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    customer: {
      name: { type: String, required: true },
      email: { type: String, required: true },
      phone: { type: String, default: "" },
      addressLine: { type: String, required: true },
      city: { type: String, default: "" },
      state: { type: String, default: "" },
      postalCode: { type: String, default: "" },
    },

    items: { type: [orderItemSchema], required: true },

    pricing: {
      subtotal: { type: Number, required: true },
      discount: { type: Number, default: 0 },
      deliveryFee: { type: Number, default: 0 },
      tax: { type: Number, default: 0 },
      total: { type: Number, required: true },
    },
    delivery: { type: mongoose.Schema.Types.Mixed, default: null },

coupon: {
  code: { type: String },
  discount: { type: Number },
},
    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "failed", "refunded"],
      default: "pending",
    },
    paymentType: {
  type: String,
  enum: ["FULL", "PARTIAL_60"],
  default: "FULL",
},

amountPaid: {
  type: Number,
  default: 0,
},

amountDue: {
  type: Number,
  default: 0,
},

orderStatus: {
  type: String,
  enum: ["pending", "confirmed", "dispatched", "completed", "cancelled"],
  default: "pending",
},

   statusHistory: [
  {
    status: String,
    at: { type: Date, default: Date.now },
    note: String,
  },
],

    notes: { type: String, default: "" },
  },
  { timestamps: true }
);
orderSchema.pre("save", function (next) {
  if (this.paymentType === "FULL") {
    this.amountDue = 0;
    if (this.amountPaid >= this.pricing.total) {
      this.paymentStatus = "paid";
    }
  }

  if (this.paymentType === "PARTIAL_60") {
    this.paymentStatus = "pending";
  }

  next();
});

module.exports = mongoose.model("Order", orderSchema);
