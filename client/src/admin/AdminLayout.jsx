import AdminSidebar from "./AdminSidebar";

const AdminLayout = ({ children }) => {
  return (
    <div className="flex">
      {/* Sidebar */}
      <div className="w-64">
        <AdminSidebar />
      </div>

      {/* Main Content */}
      <main className="flex-1 bg-[#FFF7F0] p-8">
        {children}
      </main>
    </div>
  );
};

export default AdminLayout;
