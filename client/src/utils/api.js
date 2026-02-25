const API_BASE =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

export async function api(path, options = {}) {
  const headers = options.body instanceof FormData
    ? options.headers || {} // ❌ do NOT set Content-Type
    : {
        "Content-Type": "application/json",
        ...(options.headers || {}),
      };

  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.message || "API request failed");
  }

  return data;
}
