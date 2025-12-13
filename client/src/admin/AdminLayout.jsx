import AdminSidebar from "./AdminSidebar";

const AdminLayout = ({ children }) => {
  return (
    <div className="flex min-h-screen bg-[#FFF7F0] overflow-hidden">
      
      {/* Sidebar — FIXED */}
      <aside className="w-64 bg-white border-r border-gray-200 flex-shrink-0 fixed left-0 top-0 h-screen z-40">
        <AdminSidebar />
      </aside>

      {/* Main Content — OFFSET BY SIDEBAR WIDTH */}
      <main className="flex-1 ml-64 p-8 overflow-y-auto page-wrapper-checkout">
        {children}
      </main>

    </div>
  );
};

export default AdminLayout;
