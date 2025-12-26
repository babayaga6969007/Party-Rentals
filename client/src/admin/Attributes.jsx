import { useEffect, useMemo, useState } from "react";
import AdminLayout from "./AdminLayout";
import { FiPlus, FiTrash2, FiX } from "react-icons/fi";
import axios from "axios";

const API = import.meta.env.VITE_API_BASE_URL;

// Adjust token key to your project (this is a common pattern)
function getAdminToken() {
  return localStorage.getItem("adminToken") || localStorage.getItem("token") || "";
}

const pill = "px-3 py-1 rounded-full text-sm bg-[#FAF7F5] text-[#2D2926] border border-[#D9C7BE]";

const Attributes = () => {
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);

  // Create Group modal state
  const [createOpen, setCreateOpen] = useState(false);
  const [newGroupName, setNewGroupName] = useState("");
  const [newGroupType, setNewGroupType] = useState("multi");
  const [newGroupRequired, setNewGroupRequired] = useState(false);

  // Add option inline (per group)
  const [draftOption, setDraftOption] = useState({}); // { [groupId]: {label, hex, priceDelta} }

  const headers = useMemo(
    () => ({
      headers: {
        Authorization: `Bearer ${getAdminToken()}`,
      },
    }),
    []
  );

  async function fetchGroups() {
    setLoading(true);
    try {
      const res = await axios.get(`${API}/admin/attributes`, headers);
      setGroups(res.data || []);
    } catch (e) {
      console.error(e);
      alert("Failed to load attributes. Check API / token.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchGroups();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function createGroup() {
    if (!newGroupName.trim()) return alert("Group name required");
    try {
      const res = await axios.post(
        `${API}/admin/attributes`,
        {
          name: newGroupName.trim(),
          type: newGroupType,
          required: newGroupRequired,
        },
        headers
      );
      setGroups((prev) => [res.data, ...prev]);
      setCreateOpen(false);
      setNewGroupName("");
      setNewGroupType("multi");
      setNewGroupRequired(false);
    } catch (e) {
      console.error(e);
      alert(e?.response?.data?.message || "Failed to create group");
    }
  }

  async function deleteGroup(groupId) {
  const ok = confirm("Delete this attribute group?");
  if (!ok) return;

  try {
    await axios.delete(
      `${API}/admin/attributes/${groupId}`,
      {
        headers: headers.headers, // ✅ THIS IS THE FIX
      }
    );

    setGroups((prev) => prev.filter((g) => g._id !== groupId));
  } catch (e) {
    console.error(e);
    alert(
      e?.response?.data?.message ||
      "Failed to delete group"
    );
  }
}

  function setDraft(groupId, patch) {
    setDraftOption((prev) => ({
      ...prev,
      [groupId]: { ...(prev[groupId] || {}), ...patch },
    }));
  }

  async function addOption(group) {
    const gId = group._id;
    const d = draftOption[gId] || {};
    if (!d.label?.trim()) return alert("Option label required");

    try {
      const res = await axios.post(
        `${API}/admin/attributes/${gId}/options`,
        {
          label: d.label.trim(),
          hex: group.type === "color" ? d.hex || "#000000" : undefined,
          priceDelta: group.type === "addon" ? Number(d.priceDelta || 0) : 0,
        },
        headers
      );

      // backend returns full group
      setGroups((prev) => prev.map((x) => (x._id === gId ? res.data : x)));
      setDraft(gId, { label: "", hex: "#000000", priceDelta: "" });
    } catch (e) {
      console.error(e);
      alert(e?.response?.data?.message || "Failed to add option");
    }
  }

  async function removeOption(groupId, optionId) {
    try {
      const res = await axios.delete(
        `${API}/admin/attributes/${groupId}/options/${optionId}`,
        headers
      );
      setGroups((prev) => prev.map((x) => (x._id === groupId ? res.data : x)));
    } catch (e) {
      console.error(e);
      alert("Failed to delete option");
    }
  }

  const suggestedGroups = [
    { name: "Sizes", type: "multi" },
    { name: "Tags", type: "multi" },
    { name: "Colors", type: "color" },
    { name: "Add-ons", type: "addon" },
    { name: "Materials", type: "multi" },     
    { name: "Themes", type: "multi" },
  ];

  return (
    <AdminLayout>
      <div className="mb-10 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold text-[#2D2926]">Attributes</h1>
          <p className="text-gray-600 mt-1">
            Manage global attributes used across all products.
          </p>
        </div>

        <button
          onClick={() => setCreateOpen(true)}
          className="inline-flex items-center gap-2 bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition"
        >
          <FiPlus /> New Group
        </button>
      </div>

      {/* Quick create suggestions */}
      <div className="mb-8">
        <p className="text-sm text-gray-600 mb-2">Quick add recommended groups:</p>
        <div className="flex flex-wrap gap-2">
          {suggestedGroups.map((s) => (
            <button
              key={s.name}
              onClick={() => {
                setNewGroupName(s.name);
                setNewGroupType(s.type);
                setNewGroupRequired(false);
                setCreateOpen(true);
              }}
              className={pill + " hover:bg-white transition"}
            >
              + {s.name}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="text-gray-600">Loading attributes…</div>
      ) : groups.length === 0 ? (
        <div className="text-gray-600">No attribute groups yet. Create one.</div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {groups.map((group) => {
            const d = draftOption[group._id] || {};
            const activeOptions = (group.options || []).filter((o) => o.isActive !== false);

            return (
              <div key={group._id} className="bg-white p-6 rounded-2xl shadow-sm border">
                <div className="flex items-center justify-between gap-4 mb-4">
                  <div>
                    <h2 className="text-xl font-semibold text-[#2D2926]">{group.name}</h2>
                    <p className="text-sm text-gray-500">
                      Type: <span className="font-medium">{group.type}</span>
                      {group.required ? " • Required" : ""}
                    </p>
                  </div>

                  <button
                    onClick={() => deleteGroup(group._id)}
                    className="text-red-600 hover:opacity-80"
                    title="Delete group"
                  >
                    <FiTrash2 />
                  </button>
                </div>

                {/* Add Option Row */}
                <div className="border rounded-xl p-4 bg-[#FAF7F5] border-[#D9C7BE] mb-5">
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end">
                    <div className="md:col-span-6">
                      <label className="block text-sm text-[#2D2926] mb-1">Option label</label>
                      <input
                        value={d.label || ""}
                        onChange={(e) => setDraft(group._id, { label: e.target.value })}
                        className="w-full p-3 rounded-lg border border-[#D9C7BE] bg-white focus:outline-none focus:ring-1 focus:ring-black/40"
                        placeholder={
                          group.type === "addon"
                            ? "e.g. Extra balloons"
                            : group.type === "color"
                            ? "e.g. Rose Gold"
                            : "e.g. Large"
                        }
                      />
                    </div>

                    {group.type === "color" && (
                      <div className="md:col-span-3">
                        <label className="block text-sm text-[#2D2926] mb-1">Color</label>
                        <input
                          type="color"
                          value={d.hex || "#000000"}
                          onChange={(e) => setDraft(group._id, { hex: e.target.value })}
                          className="w-full h-[46px] rounded-lg border border-[#D9C7BE] bg-white px-2"
                        />
                      </div>
                    )}

                    {group.type === "addon" && (
                      <div className="md:col-span-3">
                        <label className="block text-sm text-[#2D2926] mb-1">Price (USD)</label>
                        <input
                          type="number"
                          value={d.priceDelta ?? ""}
                          onChange={(e) => setDraft(group._id, { priceDelta: e.target.value })}
                          className="w-full p-3 rounded-lg border border-[#D9C7BE] bg-white focus:outline-none focus:ring-1 focus:ring-black/40"
                          placeholder="e.g. 150"
                          min="0"
                          step="1"
                        />
                      </div>
                    )}

                    <div className="md:col-span-3">
                      <button
                        type="button"
                        onClick={() => addOption(group)}
                        className="w-full inline-flex items-center justify-center gap-2 bg-black text-white px-4 py-3 rounded-lg hover:bg-gray-800 transition"
                      >
                        <FiPlus /> Add
                      </button>
                    </div>
                  </div>
                </div>

                {/* Options List */}
                {activeOptions.length === 0 ? (
                  <p className="text-sm text-gray-600">No options yet. Add your first option above.</p>
                ) : (
                  <div className="space-y-2">
                    {activeOptions
                      .slice()
                      .sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0))
                      .map((opt) => (
                        <div
                          key={opt._id}
                          className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 transition"
                        >
                          <div className="flex items-center gap-3">
                            {group.type === "color" && (
                              <div
                                className="w-6 h-6 rounded-full border"
                                style={{ backgroundColor: opt.hex || "#000000" }}
                                title={opt.hex}
                              />
                            )}

                            <div className="flex flex-col">
                              <span className="font-medium text-[#2D2926]">{opt.label}</span>
                              {group.type === "addon" && (
                                <span className="text-xs text-gray-600">
                                  +${Number(opt.priceDelta || 0).toFixed(2)}
                                </span>
                              )}
                            </div>
                          </div>

                          <button
                            onClick={() => removeOption(group._id, opt._id)}
                            className="text-red-600 hover:opacity-80"
                            title="Remove option"
                          >
                            <FiTrash2 />
                          </button>
                        </div>
                      ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Footer note */}
      <p className="text-sm text-gray-500 mt-8">
        Attributes are shared across all products. Changes here affect product filtering and product creation.
      </p>

      {/* Create Group Modal */}
      {createOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center px-4">
          <div className="bg-white w-full max-w-xl rounded-2xl shadow-xl overflow-hidden">
            <div className="flex items-center justify-between p-5 border-b">
              <h3 className="text-lg font-semibold text-[#2D2926]">Create Attribute Group</h3>
              <button onClick={() => setCreateOpen(false)} className="text-gray-500 hover:text-black">
                <FiX size={20} />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm text-[#2D2926] mb-1">Group name</label>
                <input
                  value={newGroupName}
                  onChange={(e) => setNewGroupName(e.target.value)}
                  className="w-full p-3 rounded-lg border border-[#D9C7BE] bg-white focus:outline-none focus:ring-1 focus:ring-black/40"
                  placeholder="e.g. Sizes"
                />
              </div>

              <div>
                <label className="block text-sm text-[#2D2926] mb-1">Type</label>
                <select
                  value={newGroupType}
                  onChange={(e) => setNewGroupType(e.target.value)}
                  className="w-full p-3 rounded-lg border border-[#D9C7BE] bg-white focus:outline-none focus:ring-1 focus:ring-black/40"
                >
                  <option value="multi">Multi-select (tags, sizes)</option>
                  <option value="select">Single-select</option>
                  <option value="color">Color (shows swatches)</option>
                  <option value="addon">Add-on with pricing</option>
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  Use <b>Add-on</b> for paid extras. Use <b>Color</b> for swatches.
                </p>
              </div>

              <label className="flex items-center gap-2 text-sm text-[#2D2926]">
                <input
                  type="checkbox"
                  checked={newGroupRequired}
                  onChange={(e) => setNewGroupRequired(e.target.checked)}
                />
                Required on product creation
              </label>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={createGroup}
                  className="bg-black text-white px-5 py-3 rounded-lg hover:bg-gray-800 transition"
                >
                  Create
                </button>
                <button
                  onClick={() => setCreateOpen(false)}
                  className="px-5 py-3 rounded-lg border border-[#D9C7BE] hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default Attributes;
