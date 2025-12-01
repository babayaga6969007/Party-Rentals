import { FiBox, FiPlus, FiList, FiLogOut } from "react-icons/fi";

const AdminSidebar = () => {
  const logout = () => {
    localStorage.removeItem("admin_token");
    window.location.href = "/admin/login";
  };

  return (
    <div className="w-64 bg-white shadow-lg h-screen p-6 fixed">
      <h2 className="text-2xl font-bold text-[#8B5C42] mb-10">Admin Panel</h2>

      <nav className="space-y-4">
        <a href="/admin/products" className="flex items-center gap-3 text-xl">
          <FiBox /> Products
        </a>

        <a href="/admin/products/new" className="flex items-center gap-3 text-xl">
          <FiPlus /> Add Product
        </a>

        <a href="/admin/orders" className="flex items-center gap-3 text-xl">
          <FiList /> Orders
        </a>

        <button
          onClick={logout}
          className="flex items-center gap-3 text-xl mt-10 text-red-500"
        >
          <FiLogOut /> Logout
        </button>
      </nav>
    </div>
  );
};

export default AdminSidebar;
