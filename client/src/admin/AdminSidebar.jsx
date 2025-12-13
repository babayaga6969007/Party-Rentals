import { useState } from "react";
import { NavLink } from "react-router-dom";
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

  const toggle = (menu) => {
    setOpen(open === menu ? null : menu);
  };

  const linkClass =
    "block px-4 py-2 rounded-lg text-sm hover:bg-gray-100 transition";

  return (
<aside className="page-wrapper-checkout w-64 min-h-screen bg-white border-r border-gray-200 p-4">
      <h2 className="text-xl font-semibold mb-6">Admin Panel</h2>

      {/* Dashboard */}
      <NavLink to="/admin/dashboard" className={linkClass}>
        <FiGrid className="inline mr-2" />
        Dashboard
      </NavLink>

      {/* Ecommerce */}
      <button onClick={() => toggle("ecommerce")} className={linkClass + " w-full text-left"}>
        <FiShoppingCart className="inline mr-2" />
        Ecommerce
      </button>

      {open === "ecommerce" && (
        <div className="ml-6 space-y-1">
          <NavLink to="/admin/products" className={linkClass}>
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
      <button onClick={() => toggle("orders")} className={linkClass + " w-full text-left"}>
        <FiBox className="inline mr-2" />
        Orders
      </button>

      {open === "orders" && (
        <div className="ml-6 space-y-1">
          <NavLink to="/admin/orders" className={linkClass}>
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
      <button onClick={() => toggle("gallery")} className={linkClass + " w-full text-left"}>
        <FiImage className="inline mr-2" />
        Gallery
      </button>

      {open === "gallery" && (
        <div className="ml-6 space-y-1">
          <NavLink to="/admin/media" className={linkClass}>
            Media Library
          </NavLink>
          <NavLink to="/admin/media/upload" className={linkClass}>
            Upload Media
          </NavLink>
        </div>
      )}

      {/* Reports */}
      <button onClick={() => toggle("reports")} className={linkClass + " w-full text-left"}>
        <FiBarChart2 className="inline mr-2" />
        Reports
      </button>

      {open === "reports" && (
        <div className="ml-6 space-y-1">
          <NavLink to="/admin/reports/sales" className={linkClass}>
            Sales
          </NavLink>
          <NavLink to="/admin/reports/rentals" className={linkClass}>
            Rentals
          </NavLink>
        </div>
      )}

      {/* Customers */}
      <NavLink to="/admin/customers" className={linkClass}>
        <FiUsers className="inline mr-2" />
        Customers
      </NavLink>

      {/* Calendar */}
      <NavLink to="/admin/AvailabilityCalendar" className={linkClass}>
        <FiCalendar className="inline mr-2" />
        Calendar
      </NavLink>

      {/* Settings */}
      <button onClick={() => toggle("settings")} className={linkClass + " w-full text-left"}>
        <FiSettings className="inline mr-2" />
        Settings
      </button>

      {open === "settings" && (
        <div className="ml-6 space-y-1">
          <NavLink to="/admin/settings/store" className={linkClass}>
            Store Settings
          </NavLink>
          <NavLink to="/admin/settings/users" className={linkClass}>
            Admin Users
          </NavLink>
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
