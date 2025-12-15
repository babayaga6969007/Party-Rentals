import { useState } from "react";
import { api } from "../utils/api";

const AdminLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const res = await api("/admin/login", {
  method: "POST",
  body: JSON.stringify({ email, password }),
});
      localStorage.setItem("admin_token", res.token);
      window.location.href = "/admin/dashboard";
    } catch (err) {
      setError(err.message || "Invalid login");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FFF7F0] p-6">
      <div className="bg-white p-10 rounded-2xl shadow-xl max-w-md w-full">
        <h1 className="text-3xl font-semibold text-center text-[#8B5C42] mb-6">
          Admin Login
        </h1>

        {error && <p className="text-red-500 text-center">{error}</p>}

        <form className="space-y-6" onSubmit={handleLogin}>
          <div>
            <label>Email</label>
            <input
              className="w-full p-3 border rounded-lg"
              placeholder="admin@party.com"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div>
            <label>Password</label>
            <input
              className="w-full p-3 border rounded-lg"
              placeholder="••••••••"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button className="w-full py-3 bg-[#8B5C42] text-white rounded-lg hover:bg-[#704A36]">
            Login
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminLogin;
