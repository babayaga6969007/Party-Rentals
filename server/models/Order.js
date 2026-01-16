const mongoose = require("mongoose");

const orderItemSchema = new mongoose.Schema(
  {
    productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
    name: { type: String, required: true },
    productType: { type: String, enum: ["rental", "purchase"], required: true },

    qty: { type: Number, required: true, min: 1 },

    // pricing snapshot
    unitPrice: { type: Number, required: true }, // per day for rental, per unit for purchase
    lineTotal: { type: Number, required: true },

    // rental only
    startDate: { type: String, default: "" }, // yyyy-mm-dd
    endDate: { type: String, default: "" },   // yyyy-mm-dd
    days: { type: Number, default: 0 },

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
