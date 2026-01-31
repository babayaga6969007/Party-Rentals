const mongoose = require("mongoose");
const Order = require("../models/Order");
const Product = require("../models/Product");
const transporter = require("../utils/mailer");
const { customerOrderEmail } = require("../utils/orderCustomer");
const { adminOrderEmail } = require("../utils/orderAdmin");


const { getDateStringsBetween } = require("../utils/dateRange");
const { incrementCouponUsage } =
  require("../controllers/couponController");


// -------------------------------
// CREATE ORDER (Public)
// -------------------------------
exports.createOrder = async (req, res) => {
  try {
   const {
  customer,
  items,
  pricing,
  coupon,
  delivery,
  paymentMethod,
  stripePayment,
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

    // Process items: for signage items without valid productId, set to null
    // Also ensure addons and signageData are preserved
    const processedItems = items.map(item => {
      // Create a new object preserving all fields including nested ones
      const processed = {
        productId: item.productId,
        name: item.name,
        productType: item.productType,
        qty: item.qty,
        unitPrice: item.unitPrice,
        lineTotal: item.lineTotal,
        days: item.days || 0,
        startDate: item.startDate || "",
        endDate: item.endDate || "",
        image: item.image || "",
        // Explicitly preserve addons array
        addons: item.addons && Array.isArray(item.addons) ? item.addons.map(addon => ({
          optionId: addon.optionId || "",
          name: addon.name || "",
          price: addon.price || 0,
          signageText: addon.signageText || "",
          vinylColor: addon.vinylColor || "",
          vinylHex: addon.vinylHex || "",
          vinylImageUrl: addon.vinylImageUrl || "",
          shelvingData: addon.shelvingData ? {
            tier: addon.shelvingData.tier || "",
            size: addon.shelvingData.size || "",
            quantity: addon.shelvingData.quantity || 0
          } : null
        })) : [],
        // Explicitly preserve signageData for signage items
        signageData: item.productType === "signage" ? (item.signageData || {
          texts: [],
          backgroundType: "",
          backgroundColor: "",
          backgroundImageUrl: ""
        }) : null
      };
      
      if (item.productType === "signage" && (!item.productId || item.productId === "signage" || !mongoose.Types.ObjectId.isValid(item.productId))) {
        processed.productId = null; // Set to null for standalone signage items
      }
      
      return processed;
    });

const order = new Order({
  customer,
  items: processedItems,
  pricing,
  coupon: coupon || null,
  delivery,
  paymentMethod,
  stripePayment,
  orderStatus: "pending",
});

await order.save();
// 🔔 Notify admins (calendar refresh)
const io = req.app.get("io");
if (io) {
  io.emit("orders:changed", {
    type: "created",
    orderId: order._id,
  });
}


try {
  // Email to customer
  if (order.customer?.email) {
    await transporter.sendMail({
      from: `"Your Brand" <${process.env.EMAIL_USER}>`,
      to: order.customer.email,
      ...customerOrderEmail(order),
    });
  }

  // Email to admin
  await transporter.sendMail({
    from: `"Order Alert" <${process.env.EMAIL_USER}>`,
    to: process.env.ADMIN_EMAIL,
    ...adminOrderEmail(order),
  });

} catch (emailError) {
  console.error("❌ Email sending failed:", emailError);
}


if (order.coupon?.code) {
  await incrementCouponUsage(order.coupon.code);
}

    return res.status(201).json({ order });
  } catch (err) {
    console.error("CREATE ORDER ERROR:", err);
    return res.status(500).json({ message: "Failed to create order" });
  }
};

// -------------------------------
// ADMIN: RENTAL CALENDAR (month view)
// GET /api/orders/admin/rentals/calendar?month=YYYY-MM
// returns: { month: "YYYY-MM", days: { "YYYY-MM-DD": [booking,...] } }
// -------------------------------
exports.getRentalCalendarAdmin = async (req, res) => {
  try {
    const { month } = req.query; // "2026-01"
    if (!month || !/^\d{4}-\d{2}$/.test(month)) {
      return res.status(400).json({ message: "month query must be YYYY-MM" });
    }

    const startOfMonth = `${month}-01`;
    const startDateObj = new Date(startOfMonth);
    const endDateObj = new Date(startDateObj.getFullYear(), startDateObj.getMonth() + 1, 0); // last day
    const endOfMonth = endDateObj.toISOString().split("T")[0];

    // Only statuses that should block availability (same logic you already use) :contentReference[oaicite:6]{index=6}
    const blockingStatuses = ["pending", "confirmed", "dispatched"];

    // Pull only orders that are in blocking statuses
    const orders = await Order.find({ orderStatus: { $in: blockingStatuses } })
      .select("_id customer orderStatus items createdAt");

    // Prepare map for each day of month
    const days = {};
    const monthDays = getDateStringsBetween(startOfMonth, endOfMonth); // you already import this util :contentReference[oaicite:7]{index=7}
    monthDays.forEach((d) => (days[d] = []));

    // Fill day map with rental bookings that overlap each day
    for (const order of orders) {
      for (const item of order.items || []) {
        if (item.productType !== "rental") continue;

        // Rental items store startDate/endDate as "yyyy-mm-dd" strings :contentReference[oaicite:8]{index=8}
        const s = item.startDate;
        const e = item.endDate;
        if (!s || !e) continue;

        // If item doesn't overlap this month at all, skip
        if (e < startOfMonth || s > endOfMonth) continue;

        // Clamp the rental range to this month for mapping
        const clampStart = s < startOfMonth ? startOfMonth : s;
        const clampEnd = e > endOfMonth ? endOfMonth : e;

        const overlapDays = getDateStringsBetween(clampStart, clampEnd);

        overlapDays.forEach((day) => {
          if (!days[day]) return;

          days[day].push({
            orderId: order._id,
            status: order.orderStatus,
            customerName: order.customer?.name || "",
            productId: item.productId || null,
            name: item.name,
            image: item.image || "",
            qty: item.qty,
            startDate: s,
            endDate: e,
          });
        });
      }
    }

    return res.json({ month, days });
  } catch (err) {
    console.error("getRentalCalendarAdmin error:", err);
    return res.status(500).json({ message: err.message || "Server error" });
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
// -------------------------------
// ADMIN: UPDATE ORDER STATUS
// PATCH /api/orders/admin/:id/status
// -------------------------------
exports.updateOrderStatusAdmin = async (req, res) => {
  try {
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({ message: "Status is required" });
    }

    const validStatuses = [
      "pending",
      "confirmed",
      "dispatched",
      "completed",
      "cancelled",
    ];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: "Invalid status value" });
    }

    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // ✅ CAPTURE PREVIOUS STATUS FIRST
    const previousStatus = order.orderStatus;

    // ---------------- INVENTORY ADJUSTMENT ----------------

    // pending → confirmed (reduce stock)
    if (previousStatus !== "confirmed" && status === "confirmed") {
      for (const item of order.items) {
        const product = await Product.findById(item.productId);
        if (!product) continue;

        if (product.availabilityCount < item.qty) {
  return res.status(400).json({
    message: `Insufficient stock for ${product.title}`,
  });
}

product.availabilityCount -= item.qty;


        await product.save();
      }
    }

    // confirmed → completed OR cancelled (revert stock)
    if (
      previousStatus === "confirmed" &&
      (status === "completed" || status === "cancelled")
    ) {
      for (const item of order.items) {
        const product = await Product.findById(item.productId);
        if (!product) continue;

        product.availabilityCount += item.qty;
        await product.save();
      }
    }

    // ✅ NOW update order status
    order.orderStatus = status;

    // optional: status history
    if (Array.isArray(order.statusHistory)) {
      order.statusHistory.push({
        status,
        at: new Date(),
      });
    }

    await order.save();
   // 🔔 Notify admins (calendar refresh)
const io = req.app.get("io");
if (io) {
  io.emit("orders:changed", {
    type: "status",
    orderId: order._id,
    status: order.orderStatus,
  });
}


// 📧 SEND EMAILS ON ORDER PLACEMENT ONLY
try {
  // Email to customer
  if (order.customer?.email) {
    await transporter.sendMail({
      from: `"Your Brand" <${process.env.EMAIL_USER}>`,
      to: order.customer.email,
      ...customerOrderEmail(order),
    });
  }

  // Email to admin
  await transporter.sendMail({
    from: `"Order Alert" <${process.env.EMAIL_USER}>`,
    to: process.env.ADMIN_EMAIL,
    ...adminOrderEmail(order),
  });

} catch (emailError) {
  console.error("❌ Email sending failed:", emailError);
}


    return res.json({ order });
  } catch (err) {
    console.error("Update order status admin error:", err);
    return res.status(500).json({ message: "Failed to update order status" });
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
// -------------------------------
// ADMIN: DELETE ORDER
// DELETE /api/orders/admin/:id
// -------------------------------
exports.deleteOrderAdmin = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    await Order.deleteOne({ _id: req.params.id });

    return res.json({ message: "Order deleted successfully" });
  } catch (err) {
    console.error("Delete order admin error:", err);
    return res.status(500).json({ message: "Failed to delete order" });
  }
};
/* =========================================================
   ADMIN – RENTAL AVAILABILITY CALENDAR (MONTH VIEW)
   GET /api/orders/admin/rentals/calendar?month=YYYY-MM
========================================================= */
exports.getRentalCalendarAdmin = async (req, res) => {
  try {
    const { month } = req.query; // expected: "2026-01"

    if (!month || !/^\d{4}-\d{2}$/.test(month)) {
      return res.status(400).json({
        message: "Invalid month format. Use YYYY-MM",
      });
    }

    // Month boundaries
    const monthStart = new Date(`${month}-01`);
    const monthEnd = new Date(
      monthStart.getFullYear(),
      monthStart.getMonth() + 1,
      0
    );

    const startStr = monthStart.toISOString().split("T")[0];
    const endStr = monthEnd.toISOString().split("T")[0];

    // Order statuses that BLOCK availability
    const blockingStatuses = ["pending", "confirmed", "dispatched"];

    // Fetch only blocking orders
    const orders = await Order.find({
      orderStatus: { $in: blockingStatuses },
    }).select("orderStatus customer items");

    // Utility: generate all dates between two yyyy-mm-dd strings
    const getDatesBetween = (start, end) => {
      const dates = [];
      let current = new Date(start);

      while (current <= new Date(end)) {
        dates.push(current.toISOString().split("T")[0]);
        current.setDate(current.getDate() + 1);
      }
      return dates;
    };

    // Prepare empty map for the month
    const days = {};
    getDatesBetween(startStr, endStr).forEach((d) => {
      days[d] = [];
    });

    // Fill calendar
    for (const order of orders) {
      for (const item of order.items || []) {
        if (item.productType !== "rental") continue;
        if (!item.startDate || !item.endDate) continue;

        // Skip if rental does not overlap this month
        if (item.endDate < startStr || item.startDate > endStr) continue;

        // Clamp rental range to this month
        const rentalStart =
          item.startDate < startStr ? startStr : item.startDate;
        const rentalEnd =
          item.endDate > endStr ? endStr : item.endDate;

        const rentalDays = getDatesBetween(rentalStart, rentalEnd);

        rentalDays.forEach((day) => {
          if (!days[day]) return;

          days[day].push({
            orderId: order._id,
            status: order.orderStatus,
            customerName: order.customer?.name || "",
            productId: item.productId || null,
            name: item.name,
            image: item.image || "",
            qty: item.qty,
            startDate: item.startDate,
            endDate: item.endDate,
          });
        });
      }
    }

    res.json({
      month,
      days,
    });
  } catch (error) {
    console.error("Calendar error:", error);
    res.status(500).json({
      message: "Failed to load rental calendar",
    });
  }
};
