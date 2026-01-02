const Order = require("../models/Order");
const Product = require("../models/Product");
const { getDateStringsBetween } = require("../utils/dateRange");


// -------------------------------
// CREATE ORDER (Public)
// -------------------------------
exports.createOrder = async (req, res) => {
  try {
    const {
      customer,
      items,
      pricing,
      delivery,
      paymentMethod,
      stripePayment,
      orderStatus,
    } = req.body;
    // 🔒 Safety: ensure required customer fields exist
if (!customer?.addressLine) {
  return res.status(400).json({
    message: "Customer addressLine is required",
  });
}


    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: "Order items required" });
    }

    const order = new Order({
      customer,
      items,
      pricing,
      delivery,
      paymentMethod,
      stripePayment,

      orderStatus: orderStatus || "pending",
    });

    await order.save();

    return res.status(201).json({ order });
  } catch (err) {
    console.error("CREATE ORDER ERROR:", err);
    return res.status(500).json({ message: "Failed to create order" });
  }
};


// -------------------------------
// ADMIN: GET ALL ORDERS
// GET /api/orders/admin/all
// -------------------------------
exports.getAllOrdersAdmin = async (req, res) => {
  try {
    const { status, paymentStatus, page = 1, limit = 20 } = req.query;

    const query = {};
    if (status) query.orderStatus = status;
    if (paymentStatus) query.paymentStatus = paymentStatus;

    const skip = (Number(page) - 1) * Number(limit);

    const [orders, total] = await Promise.all([
      Order.find(query).sort({ createdAt: -1 }).skip(skip).limit(Number(limit)),
      Order.countDocuments(query),
    ]);

    res.json({
      total,
      page: Number(page),
      limit: Number(limit),
      orders,
    });
  } catch (err) {
    console.error("Get all orders admin error:", err);
    res.status(500).json({ message: err.message || "Server error" });
  }
};

// -------------------------------
// ADMIN: GET SINGLE ORDER
// GET /api/orders/admin/:id
// -------------------------------
exports.getSingleOrderAdmin = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: "Order not found." });
    res.json({ order });
  } catch (err) {
    console.error("Get single order admin error:", err);
    res.status(500).json({ message: err.message || "Server error" });
  }
};

// -------------------------------
// ADMIN: UPDATE ORDER STATUS
// PATCH /api/orders/admin/:id/status
// body: { status: "confirmed" | "dispatched" | "completed" | "cancelled", note?: "" }
// -------------------------------
exports.updateOrderStatusAdmin = async (req, res) => {
  try {
    const { status, note } = req.body || {};

    const allowed = ["pending", "confirmed", "dispatched", "completed", "cancelled"];
    if (!allowed.includes(status)) {
      return res.status(400).json({
        message: `Invalid status. Allowed: ${allowed.join(", ")}`,
      });
    }

    const flow = {
      pending: ["confirmed", "cancelled"],
      confirmed: ["dispatched", "cancelled"],
      dispatched: ["completed"],
      completed: [],
      cancelled: [],
    };

    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: "Order not found." });

    const current = order.orderStatus;
    if (!flow[current].includes(status) && current !== status) {
      return res.status(400).json({
        message: `Invalid transition: ${current} → ${status}`,
      });
    }

    // ✅ If confirming, block rental dates
    if (current !== "confirmed" && status === "confirmed") {
      // Only rental items should block dates
      const rentalItems = (order.items || []).filter(
        (it) => (it.productType || "").toLowerCase() === "rental"
      );

      // Validate rental items contain dates
      for (const it of rentalItems) {
        if (!it.productId) {
          return res.status(400).json({ message: "Rental item missing productId." });
        }
        if (!it.startDate || !it.endDate) {
          return res.status(400).json({
            message: `Rental item "${it.name}" is missing startDate/endDate.`,
          });
        }
      }

      // Check conflicts + apply blocks
      for (const it of rentalItems) {
        const product = await Product.findById(it.productId);
        if (!product) {
          return res.status(404).json({
            message: `Product not found for rental item: ${it.name}`,
          });
        }

        const datesToBlock = getDateStringsBetween(it.startDate, it.endDate);

        // Conflict check
        const blockedSet = new Set(product.blockedDates || []);
        const conflict = datesToBlock.find((d) => blockedSet.has(d));
        if (conflict) {
          return res.status(400).json({
            message: `Product "${product.name}" is not available on ${conflict}.`,
          });
        }

        // Apply blocks
        product.blockedDates = [...(product.blockedDates || []), ...datesToBlock];
        // remove duplicates
        product.blockedDates = Array.from(new Set(product.blockedDates));
        await product.save();
      }
    }

    // Save status + history
    order.orderStatus = status;
    order.statusHistory = order.statusHistory || [];
    order.statusHistory.push({
      status,
      note: note || `Status updated to ${status}`,
      at: new Date(),
    });

    await order.save();

    res.json({ message: "Order status updated", order });
  } catch (err) {
    console.error("Update order status admin error:", err);
    res.status(500).json({ message: err.message || "Server error" });
  }
};
// PUBLIC: GET ALL ORDERS (limited, safe)
exports.getAllOrdersPublic = async (req, res) => {
  try {
    const orders = await Order.find({})
      .select("customer items pricing orderStatus paymentStatus createdAt")
      .sort({ createdAt: -1 })
      .limit(20);

    res.json({ orders });
  } catch (err) {
    console.error("Get orders public error:", err);
    res.status(500).json({ message: err.message || "Server error" });
  }
};
