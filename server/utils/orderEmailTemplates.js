// utils/orderEmailTemplates.js

const formatMoney = (amount = 0) => {
  return `$${Number(amount).toFixed(2)}`;
};

const renderItems = (items = []) => {
  return items
    .map(
      (item) => `
        <li>
          <strong>${item.name}</strong> × ${item.qty}
          <br/>
          Price: ${formatMoney(item.lineTotal)}
          ${
            item.productType === "rental"
              ? `<br/>Rental: ${item.startDate} → ${item.endDate} (${item.days} days)`
              : ""
          }
        </li>
      `
    )
    .join("");
};

/* =========================
   CUSTOMER EMAIL
========================= */
const customerOrderEmail = (order) => {
  return `
    <h2>Thank you for your order!</h2>

    <p>Hi <strong>${order.customer.name}</strong>,</p>

    <p>
      We have successfully received your order.
      Below are your order details.
    </p>

    <h3>Order Summary</h3>
    <ul>
      ${renderItems(order.items)}
    </ul>

    <h3>Payment Details</h3>
    <p>
      Amount Paid: <strong>${formatMoney(order.amountPaid)}</strong><br/>
      Amount Due: <strong>${formatMoney(order.amountDue)}</strong>
    </p>

    <h3>Delivery & Pickup</h3>
    <p>
      Delivery Date: ${order.delivery?.deliveryDate || "—"}<br/>
      Pickup Date: ${order.delivery?.pickupDate || "—"}
    </p>

    <p>
      We will contact you before delivery.
      Thank you for choosing <strong>Party Rentals</strong>.
    </p>
  `;
};

/* =========================
   OWNER EMAIL
========================= */
const ownerOrderEmail = (order) => {
  return `
    <h2>New Order Received</h2>

    <h3>Customer Details</h3>
    <p>
      Name: ${order.customer.name}<br/>
      Email: ${order.customer.email}<br/>
      Phone: ${order.customer.phone || "—"}<br/>
      Address: ${order.customer.addressLine}
    </p>

    <h3>Order Items</h3>
    <ul>
      ${renderItems(order.items)}
    </ul>

    <h3>Payment</h3>
    <p>
      Payment Type: ${order.paymentType}<br/>
      Amount Paid: ${formatMoney(order.amountPaid)}<br/>
      Amount Due: ${formatMoney(order.amountDue)}
    </p>

    <h3>Delivery & Pickup</h3>
    <p>
      Delivery Date: ${order.delivery?.deliveryDate || "—"}<br/>
      Pickup Date: ${order.delivery?.pickupDate || "—"}
    </p>

    <p>
      <strong>Order ID:</strong> ${order._id}
    </p>
  `;
};

module.exports = {
  customerOrderEmail,
  ownerOrderEmail,
};
