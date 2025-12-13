import { useMemo, useState } from "react";
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

const DEMO = {
  // daily sales (mix of rental + shop)
  daily: [
    { date: "2025-11-20", revenue: 980, orders: 2, aov: 490, rentals: 1, shop: 1 },
    { date: "2025-11-21", revenue: 1460, orders: 3, aov: 486, rentals: 2, shop: 1 },
    { date: "2025-11-22", revenue: 2100, orders: 4, aov: 525, rentals: 3, shop: 1 },
    { date: "2025-11-23", revenue: 1600, orders: 3, aov: 533, rentals: 2, shop: 1 },
    { date: "2025-11-24", revenue: 2450, orders: 5, aov: 490, rentals: 4, shop: 1 },
    { date: "2025-11-25", revenue: 3100, orders: 6, aov: 517, rentals: 4, shop: 2 },
    { date: "2025-11-26", revenue: 2750, orders: 5, aov: 550, rentals: 3, shop: 2 },
    { date: "2025-11-27", revenue: 3600, orders: 7, aov: 514, rentals: 5, shop: 2 },
    { date: "2025-11-28", revenue: 4200, orders: 8, aov: 525, rentals: 6, shop: 2 },
    { date: "2025-11-29", revenue: 3900, orders: 7, aov: 557, rentals: 5, shop: 2 },
    { date: "2025-11-30", revenue: 4700, orders: 9, aov: 522, rentals: 7, shop: 2 },
    { date: "2025-12-01", revenue: 5200, orders: 10, aov: 520, rentals: 7, shop: 3 },
    { date: "2025-12-02", revenue: 4850, orders: 9, aov: 539, rentals: 6, shop: 3 },
    { date: "2025-12-03", revenue: 6100, orders: 12, aov: 508, rentals: 9, shop: 3 },
  ],

  categoryRevenue: [
    { name: "Backdrops", value: 9800 },
    { name: "Furniture", value: 7200 },
    { name: "Lights", value: 4600 },
    { name: "Photo Props", value: 3200 },
    { name: "Balloon Stands", value: 2500 },
    { name: "Tables", value: 4100 },
  ],

  topProducts: [
    { name: "Backdrop Arch (Rental)", revenue: 5400, orders: 12, avgDays: 3.2 },
    { name: "Luxury Sofa Set (Rental)", revenue: 4200, orders: 6, avgDays: 2.7 },
    { name: "LED Fairy Lights (Shop)", revenue: 2600, orders: 18, avgDays: 0 },
    { name: "Wedding Floral Stand (Rental)", revenue: 2200, orders: 4, avgDays: 2.5 },
    { name: "Cocktail Table Set (Rental)", revenue: 1900, orders: 5, avgDays: 1.8 },
  ],

  channelMix: [
    { name: "Direct", orders: 18, revenue: 9800 },
    { name: "Instagram", orders: 12, revenue: 6200 },
    { name: "Referral", orders: 7, revenue: 3100 },
    { name: "Google", orders: 6, revenue: 2600 },
  ],

  orderPipeline: [
    { stage: "Enquiries", count: 120 },
    { stage: "Quoted", count: 78 },
    { stage: "Booked", count: 44 },
    { stage: "Delivered", count: 32 },
    { stage: "Completed", count: 28 },
  ],

  // “rental ops” style metrics
  utilization: [
    { week: "W1", utilization: 54 },
    { week: "W2", utilization: 61 },
    { week: "W3", utilization: 66 },
    { week: "W4", utilization: 72 },
    { week: "W5", utilization: 69 },
  ],
};

const PIE_COLORS = ["#8B5C42", "#2D2926", "#CFAF9B", "#EAD9C7", "#A77C63", "#6B5B53"];

function inRange(d, start, end) {
  if (!start && !end) return true;
  const t = new Date(d).getTime();
  const s = start ? new Date(start).getTime() : -Infinity;
  const e = end ? new Date(end).getTime() : Infinity;
  return t >= s && t <= e;
}

const SalesReports = () => {
  const [startDate, setStartDate] = useState(addDaysISO(todayISO(), -14));
  const [endDate, setEndDate] = useState(todayISO());
  const [view, setView] = useState("All"); // All | Rental | Shop

  const filteredDaily = useMemo(() => {
    const base = DEMO.daily.filter((x) => inRange(x.date, startDate, endDate));
    if (view === "All") return base;
    if (view === "Rental") {
      // keep revenue but focus rentals; we’ll recompute revenue proxy for demo
      return base.map((x) => ({
        ...x,
        revenue: Math.round((x.revenue * x.rentals) / Math.max(1, x.orders)),
        orders: x.rentals,
        aov: x.rentals ? Math.round(((x.revenue * x.rentals) / Math.max(1, x.orders)) / x.rentals) : 0,
      }));
    }
    // Shop
    return base.map((x) => ({
      ...x,
      revenue: Math.round((x.revenue * x.shop) / Math.max(1, x.orders)),
      orders: x.shop,
      aov: x.shop ? Math.round(((x.revenue * x.shop) / Math.max(1, x.orders)) / x.shop) : 0,
    }));
  }, [startDate, endDate, view]);

  const kpis = useMemo(() => {
    const revenue = filteredDaily.reduce((s, x) => s + x.revenue, 0);
    const orders = filteredDaily.reduce((s, x) => s + x.orders, 0);
    const aov = orders ? revenue / orders : 0;

    // compare to previous period (same length) for “trend”
    const days = Math.max(1, filteredDaily.length);
    const prevStart = addDaysISO(startDate, -days);
    const prevEnd = addDaysISO(endDate, -days);
    const prev = DEMO.daily.filter((x) => inRange(x.date, prevStart, prevEnd));

    const prevRevenue = prev.reduce((s, x) => s + x.revenue, 0);
    const prevOrders = prev.reduce((s, x) => s + x.orders, 0);

    const revChange = prevRevenue ? ((revenue - prevRevenue) / prevRevenue) * 100 : 0;
    const orderChange = prevOrders ? ((orders - prevOrders) / prevOrders) * 100 : 0;

    // rental utilization proxy
    const util = DEMO.utilization.reduce((s, x) => s + x.utilization, 0) / DEMO.utilization.length;

    return {
      revenue,
      orders,
      aov,
      revChange,
      orderChange,
      util,
    };
  }, [filteredDaily, startDate, endDate]);

  const insights = useMemo(() => {
    if (filteredDaily.length === 0) return [];
    const bestDay = [...filteredDaily].sort((a, b) => b.revenue - a.revenue)[0];
    const worstDay = [...filteredDaily].sort((a, b) => a.revenue - b.revenue)[0];

    const growthHint =
      kpis.revChange >= 0
        ? `Revenue is up ${Math.abs(kpis.revChange).toFixed(1)}% vs previous period.`
        : `Revenue is down ${Math.abs(kpis.revChange).toFixed(1)}% vs previous period.`;

    const aovHint =
      kpis.aov >= 500
        ? "AOV is strong — consider bundle upsells to keep it above $500."
        : "AOV is below $500 — add bundles (Backdrop + Lights) and minimum rental days.";

    return [
      `Top revenue day: ${bestDay.date} (${CURRENCY(bestDay.revenue)}).`,
      `Lowest revenue day: ${worstDay.date} (${CURRENCY(worstDay.revenue)}).`,
      growthHint,
      aovHint,
      `Utilization trend is healthy (~${formatPct(kpis.util)}). Consider blocking maintenance days proactively.`,
    ];
  }, [filteredDaily, kpis]);

  const exportCSV = () => {
    const header = ["date", "revenue", "orders", "aov", "rentals", "shop"];
    const rows = filteredDaily.map((x) => [x.date, x.revenue, x.orders, x.aov, x.rentals, x.shop]);
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
            Revenue, orders, product performance & rental ops — demo analytics (ready to connect to backend).
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
          >
            Export CSV
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
        <KpiCard
          title="Revenue"
          value={CURRENCY(kpis.revenue)}
          sub={`${kpis.revChange >= 0 ? "▲" : "▼"} ${Math.abs(kpis.revChange).toFixed(1)}% vs prev`}
        />
        <KpiCard
          title="Orders"
          value={String(kpis.orders)}
          sub={`${kpis.orderChange >= 0 ? "▲" : "▼"} ${Math.abs(kpis.orderChange).toFixed(1)}% vs prev`}
        />
        <KpiCard title="Avg Order Value" value={CURRENCY(kpis.aov)} sub="Target: $500+" />
        <KpiCard title="Rental Utilization" value={formatPct(kpis.util)} sub="Weekly average (demo)" />
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
            <MiniStat label="Peak day" value={CURRENCY(Math.max(...filteredDaily.map((d) => d.revenue || 0)))} />
            <MiniStat label="Avg / day" value={CURRENCY(kpis.revenue / Math.max(1, filteredDaily.length))} />
            <MiniStat label="Min order" value={CURRENCY(1000)} />
            <MiniStat label="Payment" value="Prepaid (later Stripe)" />
          </div>
        </div>

        {/* Category split */}
        <div className="bg-white border rounded-2xl shadow-sm p-5">
          <h2 className="text-lg font-semibold text-[#2D2926] mb-4">Revenue by Category</h2>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={DEMO.categoryRevenue}
                  dataKey="value"
                  nameKey="name"
                  outerRadius={100}
                  innerRadius={55}
                  paddingAngle={3}
                >
                  {DEMO.categoryRevenue.map((_, idx) => (
                    <Cell key={idx} fill={PIE_COLORS[idx % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(v) => CURRENCY(v)} />
                <Legend verticalAlign="bottom" height={36} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <p className="text-xs text-gray-500 mt-3">
            Tip: push bundles in top categories to lift AOV and reduce churn.
          </p>
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
              <li>When orders rise but AOV drops: add minimum days or bundle add-ons.</li>
              <li>When AOV rises but orders drop: run “starter packages” for smaller events.</li>
              <li>For rentals, focus on utilization and delivery capacity — not only revenue.</li>
            </ul>
          </div>
        </div>

        {/* Channel mix */}
        <div className="bg-white border rounded-2xl shadow-sm p-5">
          <h2 className="text-lg font-semibold text-[#2D2926] mb-4">Channel Mix</h2>

          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={DEMO.channelMix}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Legend />
                <Bar dataKey="orders" fill="#2D2926" />
                <Bar dataKey="revenue" fill="#8B5C42" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <p className="text-xs text-gray-500 mt-3">
            Tip: Track CAC by channel later (Meta/Google spend) to measure profitable growth.
          </p>
        </div>
      </div>

      {/* Tables + Funnel */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Top products */}
        <div className="bg-white border rounded-2xl shadow-sm p-5 xl:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-[#2D2926]">Top Products</h2>
            <span className="text-xs text-gray-500">By revenue</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-[#FAF7F5] border-b">
                <tr className="text-left">
                  <th className="py-3 px-4">Product</th>
                  <th className="py-3 px-4">Revenue</th>
                  <th className="py-3 px-4">Orders</th>
                  <th className="py-3 px-4">Avg Days</th>
                  <th className="py-3 px-4">Action</th>
                </tr>
              </thead>
              <tbody>
                {DEMO.topProducts.map((p, i) => (
                  <tr key={i} className="border-b last:border-0 hover:bg-gray-50 transition">
                    <td className="py-3 px-4 font-medium text-[#2D2926]">{p.name}</td>
                    <td className="py-3 px-4">{CURRENCY(p.revenue)}</td>
                    <td className="py-3 px-4">{p.orders}</td>
                    <td className="py-3 px-4">{p.avgDays ? p.avgDays.toFixed(1) : "—"}</td>
                    <td className="py-3 px-4">
                      <button className="text-[#8B5C42] hover:underline">View</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-3">
            <ActionCard title="Bundle Opportunity" text="Backdrop + Lights + Props = higher AOV" />
            <ActionCard title="Utilization Risk" text="Top rentals need maintenance days planned" />
            <ActionCard title="Pricing Test" text="Try weekend premium for peak dates" />
          </div>
        </div>

        {/* Funnel + Utilization */}
        <div className="bg-white border rounded-2xl shadow-sm p-5 space-y-6">
          <div>
            <h2 className="text-lg font-semibold text-[#2D2926] mb-3">Enquiry → Completion Funnel</h2>
            <div className="space-y-2">
              {DEMO.orderPipeline.map((s, idx) => {
                const max = DEMO.orderPipeline[0].count;
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
              Biggest drop is usually “Quoted → Booked”. Improve with faster follow-ups + clear packages.
            </p>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-[#2D2926] mb-3">Rental Utilization</h2>
            <div className="h-44">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={DEMO.utilization}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="week" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} domain={[0, 100]} />
                  <Tooltip formatter={(v) => `${v}%`} />
                  <Line type="monotone" dataKey="utilization" stroke="#8B5C42" strokeWidth={2} dot />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div className="mt-3 bg-[#FAF7F5] border rounded-xl p-3 text-xs text-gray-700">
              <p className="font-medium text-[#2D2926] mb-1">Recommendation</p>
              <p>
                When utilization crosses ~75%, increase delivery slots and consider raising rental prices on peak weekends.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Insights panel */}
      <div className="mt-6 bg-white border rounded-2xl shadow-sm p-5">
        <h2 className="text-lg font-semibold text-[#2D2926] mb-3">Executive Summary (Auto Insights)</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {insights.map((t, i) => (
            <div key={i} className="bg-[#FFF7F0] border border-[#EAD9C7] rounded-xl p-4 text-sm text-[#2D2926]">
              {t}
            </div>
          ))}
        </div>
      </div>
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

const ActionCard = ({ title, text }) => (
  <div className="border rounded-xl p-4 bg-white">
    <p className="text-sm font-semibold text-[#2D2926]">{title}</p>
    <p className="text-xs text-gray-600 mt-1">{text}</p>
    <button className="mt-3 text-xs text-[#8B5C42] hover:underline">Open</button>
  </div>
);
