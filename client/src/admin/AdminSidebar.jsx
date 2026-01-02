import { useState, useEffect } from "react";
import { NavLink, useLocation } from "react-router-dom";
import {
  FiGrid,
  FiShoppingCart,
  FiBox,
  FiImage,
  FiBarChart2,
  FiUsers,
  FiCalendar,
  FiSettings,
  FiLogOut,
} from "react-icons/fi";

const Sidebar = () => {
  const [open, setOpen] = useState(null);
  const location = useLocation();

  const toggle = (menu) => {
    setOpen(open === menu ? null : menu);
  };

  /* ---------- Active route checks ---------- */
  const isEcommerceActive =
    location.pathname.startsWith("/admin/products") ||
    location.pathname.startsWith("/admin/categories") ||
    location.pathname.startsWith("/admin/attributes");

  const isOrdersActive = location.pathname.startsWith("/admin/orders");
  const isReportsActive = location.pathname.startsWith("/admin/reports");
  const isSettingsActive = location.pathname.startsWith("/admin/settings");

  /* ---------- Auto-open submenu ---------- */
  useEffect(() => {
    if (isEcommerceActive) setOpen("ecommerce");
    else if (isOrdersActive) setOpen("orders");
    else if (isReportsActive) setOpen("reports");
    else if (isSettingsActive) setOpen("settings");
  }, [isEcommerceActive, isOrdersActive, isReportsActive, isSettingsActive]);

  /* ---------- Styles ---------- */
  const linkClass = ({ isActive }) =>
    `block px-4 py-2 rounded-lg text-sm transition
     ${
       isActive
         ? "bg-blue-100 text-blue-600 font-semibold"
         : "hover:bg-gray-100 text-gray-700"
     }`;

  const parentButtonClass = (active) =>
    `block px-4 py-2 rounded-lg text-sm w-full text-left transition
     ${
       active
         ? "bg-blue-50 text-blue-600 font-semibold"
         : "hover:bg-gray-100 text-gray-700"
     }`;

  const placeholderClass =
    "block px-4 py-2 rounded-lg text-sm text-gray-400 cursor-not-allowed";

  return (
    <aside className="w-64 min-h-screen bg-white border-r border-gray-200 p-4 py-10">
      <h2 className="text-xl font-semibold mb-6">Admin Panel</h2>

      {/* Dashboard */}
      <NavLink to="/admin/dashboard" className={linkClass}>
        <FiGrid className="inline mr-2" />
        Dashboard
      </NavLink>

      {/* Ecommerce */}
      <button
        onClick={() => toggle("ecommerce")}
        className={parentButtonClass(isEcommerceActive)}
      >
        <FiShoppingCart className="inline mr-2" />
        Ecommerce
      </button>

      {open === "ecommerce" && (
        <div className="ml-6 space-y-1">
          <NavLink to="/admin/products" end className={linkClass}>
            Products
          </NavLink>
          <NavLink to="/admin/products/new" className={linkClass}>
            Add Product
          </NavLink>
          <NavLink to="/admin/categories" className={linkClass}>
            Categories
          </NavLink>
          <NavLink to="/admin/attributes" className={linkClass}>
            Attributes
          </NavLink>
        </div>
      )}

      {/* Orders */}
      <button
        onClick={() => toggle("orders")}
        className={parentButtonClass(isOrdersActive)}
      >
        <FiBox className="inline mr-2" />
        Orders
      </button>

      {open === "orders" && (
        <div className="ml-6 space-y-1">
          <NavLink to="/admin/orders" end className={linkClass}>
            All Orders
          </NavLink>
          <NavLink to="/admin/orders/active" className={linkClass}>
            Active Rentals
          </NavLink>
          <NavLink to="/admin/orders/completed" className={linkClass}>
            Completed Orders
          </NavLink>
        </div>
      )}

      {/* Gallery */}
      <button
        onClick={() => toggle("gallery")}
        className={parentButtonClass(false)}
      >
        <FiImage className="inline mr-2" />
        Gallery
      </button>

      {open === "gallery" && (
        <div className="ml-6 space-y-1">
          <div className={placeholderClass}>Media Library</div>
          <div className={placeholderClass}>Upload Media</div>
        </div>
      )}

   {/* Reports */}
<NavLink to="/admin/reports/sales" className={linkClass}>
  <FiBarChart2 className="inline mr-2" />
  Reports
</NavLink>

   {/* Inventory */}
<NavLink to="/admin/inventory" className={linkClass}>
  <FiBarChart2 className="inline mr-2" />
  Inventory
</NavLink>
 
      {/* Calendar (placeholder) */}
      <div className={placeholderClass}>
        <FiCalendar className="inline mr-2" />
        Calendar
      </div>

      {/* Settings */}
      <button
        onClick={() => toggle("settings")}
        className={parentButtonClass(isSettingsActive)}
      >
        <FiSettings className="inline mr-2" />
        Settings
      </button>

      {open === "settings" && (
        <div className="ml-6 space-y-1">
          <div className={placeholderClass}>Store Settings</div>
          <div className={placeholderClass}>Admin Users</div>
        </div>
      )}

      {/* Logout */}
      <button
        onClick={() => {
          localStorage.removeItem("admin_token");
          window.location.href = "/admin/login";
        }}
        className="mt-6 text-red-600 text-sm px-4 py-2 hover:bg-red-50 rounded-lg w-full text-left"
      >
        <FiLogOut className="inline mr-2" />
        Logout
      </button>
    </aside>
  );
};

export default Sidebar;
