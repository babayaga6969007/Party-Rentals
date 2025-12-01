const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";

export const api = async (url, method = "GET", body = null, auth = false) => {
  const headers = { "Content-Type": "application/json" };

  if (auth) {
    const token = localStorage.getItem("admin_token");
    if (token) headers["Authorization"] = `Bearer ${token}`;
  }

  const options = {
    method,
    headers,
    body: body ? JSON.stringify(body) : null,
  };

  const res = await fetch(`${API_BASE}${url}`, options);
  const data = await res.json();

  if (!res.ok) throw data;

  return data;
};
