import { useEffect, useMemo, useState } from "react";
import AdminLayout from "./AdminLayout";

import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  Legend,
  AreaChart,
  Area,
} from "recharts";

// ✅ SAME api util used in your working Orders page
// If your path differs, change only this line.
import { api } from "../utils/api";

const CURRENCY = (n) =>
  new Intl.NumberFormat("en-AU", { style: "currency", currency: "AUD" }).format(
    Number(n || 0)
  );

const formatPct = (n) => `${Math.round(n)}%`;

const todayISO = () => new Date().toISOString().slice(0, 10);
const addDaysISO = (baseISO, delta) => {
  const d = new Date(baseISO);
  d.setDate(d.getDate() + delta);
  return d.toISOString().slice(0, 10);
};

const PIE_COLORS = ["#8B5C42", "#2D2926", "#CFAF9B", "#EAD9C7", "#A77C63", "#6B5B53"];

function inRange(d, start, end) {
  if (!start && !end) return true;
  const t = new Date(d).getTime();
  const s = start ? new Date(start).getTime() : -Infinity;
  const e = end ? new Date(end).getTime() : Infinity;
  return t >= s && t <= e;
}

const getAdminToken = () => localStorage.getItem("admin_token") || "";

// Normalize order to safe numbers
const getOrderTotal = (order) => Number(order?.pricing?.total || 0);
const getOrderDateISO = (order) => {
  const dt = order?.createdAt ? new Date(order.createdAt) : new Date();
  return dt.toISOString().slice(0, 10);
};

const normalizeType = (t) => String(t || "").toLowerCase();

// What counts as "rental" vs "shop" in reports
const isRentalItem = (item) => normalizeType(item?.productType) === "rental";

// I’m treating purchase + signage as “Shop” since your Orders page distinguishes them similarly :contentReference[oaicite:4]{index=4}
const isShopItem = (item) => {
  const t = normalizeType(item?.productType);
  return t === "purchase" || t === "signage";
};

// Allocate revenue by item line totals (fallback to proportional if line totals missing)
const splitOrderRevenue = (order) => {
  const items = Array.isArray(order?.items) ? order.items : [];
  const total = getOrderTotal(order);

  let rentalLine = 0;
  let shopLine = 0;
  let allLine = 0;

  for (const it of items) {
    const line = Number(it?.lineTotal || 0);
    allLine += line;
    if (isRentalItem(it)) rentalLine += line;
    if (isShopItem(it)) shopLine += line;
  }

  // If line totals exist, use them; else fallback to "whole order goes to whichever type exists"
  if (allLine > 0) {
    const rentalRevenue = (rentalLine / allLine) * total;
    const shopRevenue = (shopLine / allLine) * total;
    return { rentalRevenue, shopRevenue };
  }

  const hasRental = items.some(isRentalItem);
  const hasShop = items.some(isShopItem);

  if (hasRental && !hasShop) return { rentalRevenue: total, shopRevenue: 0 };
  if (!hasRental && hasShop) return { rentalRevenue: 0, shopRevenue: total };

  // mixed but no line totals => split 50/50
  return { rentalRevenue: total / 2, shopRevenue: total / 2 };
};

const SalesReports = () => {
  const [startDate, setStartDate] = useState(addDaysISO(todayISO(), -30));
  const [endDate, setEndDate] = useState(todayISO());
  const [view, setView] = useState("All"); // All | Rental | Shop

  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [orders, setOrders] = useState([]);
const [products, setProducts] = useState([]);

  // ---------------------------
  // FETCH REAL DATA (ADMIN)
  // GET /orders/admin/all
  // ---------------------------
  const fetchProducts = async () => {
  try {
    const res = await api("/products", { method: "GET" });
    setProducts(res?.products || res || []);
  } catch (e) {
    console.error("Failed to fetch products", e);
    setProducts([]);
  }
};

const fetchOrders = async () => {
  try {
    setLoading(true);
    setErr("");

    const token = getAdminToken();

    const res = await api(`/orders/admin/all?page=1&limit=1000`, {
      method: "GET",
      headers: { Authorization: `Bearer ${token}` },
    });

    const serverOrders = res?.orders || [];
    setOrders(serverOrders);
  } catch (e) {
    console.error(e);
    setErr(e?.message || "Failed to fetch orders");
    setOrders([]);
  } finally {
    setLoading(false);
  }
};

 useEffect(() => {
  fetchOrders();
  fetchProducts();
  // eslint-disable-next-line
}, []);

  // ---------------------------
  // BUILD DAILY SERIES FROM ORDERS
  // ---------------------------
  const dailyFromOrders = useMemo(() => {
    // exclude cancelled by default (common reporting expectation)
    const validOrders = (orders || []).filter((o) => String(o?.orderStatus || "") !== "cancelled");

    // group by date
    const byDate = new Map();

    for (const o of validOrders) {
      const date = getOrderDateISO(o);

      if (!byDate.has(date)) {
        byDate.set(date, {
          date,
          revenueAll: 0,
          ordersAll: 0,
          rentalRevenue: 0,
          rentalOrders: 0,
          shopRevenue: 0,
          shopOrders: 0,
        });
      }

      const bucket = byDate.get(date);
      const total = getOrderTotal(o);

      bucket.revenueAll += total;
      bucket.ordersAll += 1;

      const { rentalRevenue, shopRevenue } = splitOrderRevenue(o);

      const hasRental = rentalRevenue > 0.0001;
      const hasShop = shopRevenue > 0.0001;

      bucket.rentalRevenue += rentalRevenue;
      bucket.shopRevenue += shopRevenue;

      if (hasRental) bucket.rentalOrders += 1;
      if (hasShop) bucket.shopOrders += 1;
    }

    // sort chronologically
    const rows = Array.from(byDate.values()).sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    // convert to chart-friendly shape
    return rows.map((r) => ({
      date: r.date,
      revenue: Math.round(r.revenueAll),
      orders: r.ordersAll,
      aov: r.ordersAll ? Math.round(r.revenueAll / r.ordersAll) : 0,
      rentals: r.rentalOrders,
      shop: r.shopOrders,
      rentalRevenue: Math.round(r.rentalRevenue),
      shopRevenue: Math.round(r.shopRevenue),
    }));
  }, [orders]);

  // ---------------------------
  // APPLY DATE RANGE + VIEW (All/Rental/Shop)
  // ---------------------------
  const filteredDaily = useMemo(() => {
    const base = dailyFromOrders.filter((x) => inRange(x.date, startDate, endDate));

    if (view === "All") return base;

    if (view === "Rental") {
      return base.map((x) => ({
        ...x,
        revenue: x.rentalRevenue,
        orders: x.rentals,
        aov: x.rentals ? Math.round(x.rentalRevenue / x.rentals) : 0,
      }));
    }

    // Shop
    return base.map((x) => ({
      ...x,
      revenue: x.shopRevenue,
      orders: x.shop,
      aov: x.shop ? Math.round(x.shopRevenue / x.shop) : 0,
    }));
  }, [dailyFromOrders, startDate, endDate, view]);

  // ---------------------------
  // KPI CALCS (with previous-period comparison)
  // ---------------------------
  const kpis = useMemo(() => {
    const revenue = filteredDaily.reduce((s, x) => s + Number(x.revenue || 0), 0);
    const ordersCount = filteredDaily.reduce((s, x) => s + Number(x.orders || 0), 0);
    const aov = ordersCount ? revenue / ordersCount : 0;

    // compare to previous period (same number of days)
    const days = Math.max(1, filteredDaily.length);
    const prevStart = addDaysISO(startDate, -days);
    const prevEnd = addDaysISO(endDate, -days);

    const prevBase = dailyFromOrders
      .filter((x) => inRange(x.date, prevStart, prevEnd))
      .map((x) => {
        if (view === "All") return { revenue: x.revenue, orders: x.orders };
        if (view === "Rental") return { revenue: x.rentalRevenue, orders: x.rentals };
        return { revenue: x.shopRevenue, orders: x.shop };
      });

    const prevRevenue = prevBase.reduce((s, x) => s + Number(x.revenue || 0), 0);
    const prevOrders = prevBase.reduce((s, x) => s + Number(x.orders || 0), 0);

    const revChange = prevRevenue ? ((revenue - prevRevenue) / prevRevenue) * 100 : 0;
    const orderChange = prevOrders ? ((ordersCount - prevOrders) / prevOrders) * 100 : 0;

    // Utilization: you don’t have this in backend yet, so keep a neutral computed proxy
    // Proxy = % of days in range that had at least 1 rental order (only meaningful for Rental/All)
    const daysWithRental = filteredDaily.filter((d) => Number(d.rentals || 0) > 0).length;
    const util = filteredDaily.length ? (daysWithRental / filteredDaily.length) * 100 : 0;

    return { revenue, orders: ordersCount, aov, revChange, orderChange, util };
  }, [filteredDaily, startDate, endDate, dailyFromOrders, view]);

  // ---------------------------
  // TOP PRODUCTS TABLE (REAL)
  // based on items[].name + lineTotal + days
  // ---------------------------
  const topProducts = useMemo(() => {
    const validOrders = (orders || []).filter((o) => String(o?.orderStatus || "") !== "cancelled");

    const map = new Map();

    for (const o of validOrders) {
      const orderDate = getOrderDateISO(o);
      if (!inRange(orderDate, startDate, endDate)) continue;

      for (const it of o.items || []) {
        // view filter: All / Rental / Shop
        if (view === "Rental" && !isRentalItem(it)) continue;
        if (view === "Shop" && !isShopItem(it)) continue;

        const name = it?.name || "Unnamed item";
        const line = Number(it?.lineTotal || 0);
        const days = Number(it?.days || 0);

        if (!map.has(name)) {
          map.set(name, { name, revenue: 0, orders: 0, daysTotal: 0, daysCount: 0 });
        }
        const row = map.get(name);
        row.revenue += line;
        row.orders += 1;
        if (days > 0) {
          row.daysTotal += days;
          row.daysCount += 1;
        }
      }
    }

    const arr = Array.from(map.values())
      .map((x) => ({
        name: x.name,
        revenue: Math.round(x.revenue),
        orders: x.orders,
        avgDays: x.daysCount ? x.daysTotal / x.daysCount : 0,
      }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 10);

    return arr;
  }, [orders, startDate, endDate, view]);

const categoryRevenue = useMemo(() => {
  if (!products.length) return [];

  // Build productId → categoryName map
  const productCategoryMap = new Map();
  for (const p of products) {
    const catName =
      typeof p.category === "object"
        ? p.category.name
        : p.category || "Uncategorized";

    productCategoryMap.set(String(p._id), catName);
  }

  const buckets = new Map();

  const validOrders = (orders || []).filter(
    (o) => String(o?.orderStatus || "") !== "cancelled"
  );

  for (const o of validOrders) {
    const orderDate = getOrderDateISO(o);
    if (!inRange(orderDate, startDate, endDate)) continue;

    for (const it of o.items || []) {
      if (view === "Rental" && !isRentalItem(it)) continue;
      if (view === "Shop" && !isShopItem(it)) continue;

      const category =
        productCategoryMap.get(String(it.productId)) || "Uncategorized";

      const value = Number(it?.lineTotal || 0);
      buckets.set(category, (buckets.get(category) || 0) + value);
    }
  }

  return Array.from(buckets.entries())
    .map(([name, value]) => ({
      name,
      value: Math.round(value),
    }))
    .sort((a, b) => b.value - a.value);
}, [orders, products, startDate, endDate, view]);


  // ---------------------------
  // PIPELINE (REAL) using orderStatus counts (since Enquiry/Quoted don’t exist in schema) :contentReference[oaicite:7]{index=7}
  // ---------------------------
  const orderPipeline = useMemo(() => {
    const validOrders = (orders || []).filter((o) => {
      const orderDate = getOrderDateISO(o);
      return inRange(orderDate, startDate, endDate);
    });

    const stages = ["pending", "confirmed", "dispatched", "completed", "cancelled"];
    const labels = {
      pending: "Pending",
      confirmed: "Confirmed",
      dispatched: "Dispatched",
      completed: "Completed",
      cancelled: "Cancelled",
    };

    const counts = {};
    for (const s of stages) counts[s] = 0;

    for (const o of validOrders) {
      const st = String(o?.orderStatus || "pending");
      if (counts[st] === undefined) counts[st] = 0;
      counts[st] += 1;
    }

    return stages.map((s) => ({ stage: labels[s] || s, count: counts[s] || 0 }));
  }, [orders, startDate, endDate]);

  // ---------------------------
  // INSIGHTS (REAL from filteredDaily)
  // ---------------------------
  const insights = useMemo(() => {
    if (filteredDaily.length === 0) return ["No data in this date range."];

    const bestDay = [...filteredDaily].sort((a, b) => (b.revenue || 0) - (a.revenue || 0))[0];
    const worstDay = [...filteredDaily].sort((a, b) => (a.revenue || 0) - (b.revenue || 0))[0];

    const growthHint =
      kpis.revChange >= 0
        ? `Revenue is up ${Math.abs(kpis.revChange).toFixed(1)}% vs previous period.`
        : `Revenue is down ${Math.abs(kpis.revChange).toFixed(1)}% vs previous period.`;

    const aovHint =
      kpis.aov >= 500
        ? "AOV is strong — keep pushing bundles and add-ons."
        : "AOV is below $500 — consider bundles and minimum rental days.";

    return [
      `Top revenue day: ${bestDay.date} (${CURRENCY(bestDay.revenue)}).`,
      `Lowest revenue day: ${worstDay.date} (${CURRENCY(worstDay.revenue)}).`,
      growthHint,
      aovHint,
      view === "Shop"
        ? "Shop view: watch conversion and repeat purchase later."
        : `Rental activity proxy: ~${formatPct(kpis.util)} of days had rentals in this period.`,
    ];
  }, [filteredDaily, kpis, view]);

  // ---------------------------
  // EXPORT CSV (FIXED)
  // ---------------------------
  const exportCSV = () => {
    const header = ["date", "revenue", "orders", "aov", "rentals", "shop"];
    const rows = filteredDaily.map((x) => [
      x.date,
      x.revenue,
      x.orders,
      x.aov,
      x.rentals,
      x.shop,
    ]);

    const csv = [header.join(","), ...rows.map((r) => r.join(","))].join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `sales-report-${startDate || "start"}-to-${endDate || "end"}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <AdminLayout>
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-semibold text-[#2D2926]">Sales Reports</h1>
          <p className="text-gray-600 mt-1">
            Revenue, orders, product performance & ops — now powered by real orders.
          </p>
        </div>

        {/* Controls */}
        <div className="bg-white border rounded-2xl p-4 shadow-sm flex flex-col sm:flex-row gap-3 items-start sm:items-end">
          <div>
            <label className="block text-xs text-gray-600 mb-1">Start</label>
            <input
              type="date"
              className="border rounded-lg px-3 py-2 text-sm"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-xs text-gray-600 mb-1">End</label>
            <input
              type="date"
              className="border rounded-lg px-3 py-2 text-sm"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-xs text-gray-600 mb-1">View</label>
            <select
              className="border rounded-lg px-3 py-2 text-sm"
              value={view}
              onChange={(e) => setView(e.target.value)}
            >
              <option>All</option>
              <option>Rental</option>
              <option>Shop</option>
            </select>
          </div>

          <button
            onClick={exportCSV}
            className="sm:ml-2 px-4 py-2 rounded-lg bg-[#8B5C42] text-white text-sm hover:bg-[#704A36] transition"
            disabled={loading}
          >
            Export CSV
          </button>

          <button
            onClick={fetchOrders}
            className="px-4 py-2 rounded-lg border text-sm hover:bg-gray-50 transition"
          >
            Refresh
          </button>
        </div>
      </div>

      {/* STATES */}
      {loading && <div className="bg-white p-6 rounded-xl border">Loading sales data…</div>}

      {!loading && err && (
        <div className="bg-white p-6 rounded-xl border text-red-600">
          {err}
        </div>
      )}

      {!loading && !err && (
        <>
          {/* KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
            <KpiCard
              title="Revenue"
              value={CURRENCY(kpis.revenue)}
              sub={`${kpis.revChange >= 0 ? "▲" : "▼"} ${Math.abs(kpis.revChange).toFixed(
                1
              )}% vs prev`}
            />
            <KpiCard
              title="Orders"
              value={String(kpis.orders)}
              sub={`${kpis.orderChange >= 0 ? "▲" : "▼"} ${Math.abs(kpis.orderChange).toFixed(
                1
              )}% vs prev`}
            />
            <KpiCard title="Avg Order Value" value={CURRENCY(kpis.aov)} sub="Target: $500+" />
            <KpiCard
              title={view === "Shop" ? "Activity" : "Rental Activity"}
              value={formatPct(kpis.util)}
              sub="Proxy metric (days with rentals)"
            />
          </div>

          {/* Charts row 1 */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-6">
            {/* Revenue Trend */}
            <div className="bg-white border rounded-2xl shadow-sm p-5 xl:col-span-2">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-[#2D2926]">Revenue Trend</h2>
                <span className="text-xs text-gray-500">Daily</span>
              </div>

              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={filteredDaily}>
                    <defs>
                      <linearGradient id="revFill" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#8B5C42" stopOpacity={0.25} />
                        <stop offset="95%" stopColor="#8B5C42" stopOpacity={0.02} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip formatter={(v) => CURRENCY(v)} />
                    <Area type="monotone" dataKey="revenue" stroke="#8B5C42" fill="url(#revFill)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4">
                <MiniStat
                  label="Peak day"
                  value={CURRENCY(Math.max(...filteredDaily.map((d) => d.revenue || 0), 0))}
                />
                <MiniStat
                  label="Avg / day"
                  value={CURRENCY(kpis.revenue / Math.max(1, filteredDaily.length))}
                />
                <MiniStat label="Orders total" value={String(kpis.orders)} />
                <MiniStat label="View" value={view} />
              </div>
            </div>

            {/* Category split */}
            <div className="bg-white border rounded-2xl shadow-sm p-5">
              <h2 className="text-lg font-semibold text-[#2D2926] mb-4">
                Revenue by Category
              </h2>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoryRevenue}
                      dataKey="value"
                      nameKey="name"
                      outerRadius={100}
                      innerRadius={55}
                      paddingAngle={3}
                    >
                      {categoryRevenue.map((_, idx) => (
                        <Cell key={idx} fill={PIE_COLORS[idx % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(v) => CURRENCY(v)} />
                    <Legend verticalAlign="bottom" height={36} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              
            </div>
          </div>

          {/* Charts row 2 */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-6">
            {/* Orders & AOV */}
            <div className="bg-white border rounded-2xl shadow-sm p-5 xl:col-span-2">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-[#2D2926]">Orders & AOV</h2>
                <span className="text-xs text-gray-500">Daily</span>
              </div>

              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={filteredDaily}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                    <YAxis yAxisId="left" tick={{ fontSize: 12 }} />
                    <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 12 }} />
                    <Tooltip
                      formatter={(v, name) => {
                        if (name === "aov") return CURRENCY(v);
                        return v;
                      }}
                    />
                    <Line yAxisId="left" type="monotone" dataKey="orders" stroke="#2D2926" strokeWidth={2} dot={false} />
                    <Line yAxisId="right" type="monotone" dataKey="aov" stroke="#8B5C42" strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              <div className="mt-4 bg-[#FAF7F5] border rounded-xl p-4 text-sm text-gray-700">
                <p className="font-medium text-[#2D2926] mb-1">Interpretation</p>
                <ul className="list-disc ml-5 space-y-1">
                  <li>When orders rise but AOV drops: add bundles and add-ons.</li>
                  <li>When AOV rises but orders drop: create starter packages.</li>
                  <li>For rentals: delivery capacity and scheduling drive growth.</li>
                </ul>
              </div>
            </div>

            {/* Status funnel */}
            <div className="bg-white border rounded-2xl shadow-sm p-5">
              <h2 className="text-lg font-semibold text-[#2D2926] mb-4">
                Order Status Funnel
              </h2>

              <div className="space-y-2">
                {orderPipeline.map((s, idx) => {
                  const max = Math.max(...orderPipeline.map((x) => x.count), 1);
                  const pct = (s.count / max) * 100;
                  return (
                    <div key={idx}>
                      <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
                        <span>{s.stage}</span>
                        <span>{s.count}</span>
                      </div>
                      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full"
                          style={{
                            width: `${pct}%`,
                            background: idx < 2 ? "#2D2926" : "#8B5C42",
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>

              <p className="text-xs text-gray-500 mt-3">
                This funnel is built from real <code>orderStatus</code> values.
              </p>
            </div>
          </div>

          {/* Top products */}
          <div className="bg-white border rounded-2xl shadow-sm p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-[#2D2926]">Top Products</h2>
              <span className="text-xs text-gray-500">By item revenue</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-[#FAF7F5] border-b">
                  <tr className="text-left">
                    <th className="py-3 px-4">Product</th>
                    <th className="py-3 px-4">Revenue</th>
                    <th className="py-3 px-4">Orders</th>
                    <th className="py-3 px-4">Avg Days</th>
                  </tr>
                </thead>
                <tbody>
                  {topProducts.map((p, i) => (
                    <tr key={i} className="border-b last:border-0 hover:bg-gray-50 transition">
                      <td className="py-3 px-4 font-medium text-[#2D2926]">{p.name}</td>
                      <td className="py-3 px-4">{CURRENCY(p.revenue)}</td>
                      <td className="py-3 px-4">{p.orders}</td>
                      <td className="py-3 px-4">{p.avgDays ? p.avgDays.toFixed(1) : "—"}</td>
                    </tr>
                  ))}

                  {topProducts.length === 0 && (
                    <tr>
                      <td className="py-6 px-4 text-gray-500" colSpan={4}>
                        No product data in this range.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Insights panel */}
          <div className="mt-6 bg-white border rounded-2xl shadow-sm p-5">
            <h2 className="text-lg font-semibold text-[#2D2926] mb-3">
              Executive Summary (Auto Insights)
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {insights.map((t, i) => (
                <div
                  key={i}
                  className="bg-[#FFF7F0] border border-[#EAD9C7] rounded-xl p-4 text-sm text-[#2D2926]"
                >
                  {t}
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </AdminLayout>
  );
};

export default SalesReports;

/* ---------- UI helpers ---------- */

const KpiCard = ({ title, value, sub }) => {
  return (
    <div className="bg-white border rounded-2xl shadow-sm p-5">
      <p className="text-xs text-gray-500">{title}</p>
      <p className="text-2xl font-semibold text-[#2D2926] mt-1">{value}</p>
      <p className="text-xs text-gray-500 mt-2">{sub}</p>
    </div>
  );
};

const MiniStat = ({ label, value }) => (
  <div className="border rounded-xl p-3">
    <p className="text-xs text-gray-500">{label}</p>
    <p className="text-sm font-semibold text-[#2D2926] mt-1">{value}</p>
  </div>
);
