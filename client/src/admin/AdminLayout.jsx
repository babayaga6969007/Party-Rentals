import AdminSidebar from "./AdminSidebar";

const AdminLayout = ({ children }) => {
  return (
    <div className="flex">
      <AdminSidebar />

      <main className="ml-64 w-full min-h-screen bg-[#FFF7F0] p-10">
        {children}
      </main>
    </div>
  );
};

export default AdminLayout;
