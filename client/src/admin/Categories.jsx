import { useState } from "react";
import AdminLayout from "./AdminLayout";
import { FiPlus, FiEdit2, FiTrash2 } from "react-icons/fi";

const initialCategories = [
  { id: 1, name: "Backdrops", type: "Rental", products: 12 },
  { id: 2, name: "Furniture", type: "Rental", products: 18 },
  { id: 3, name: "Lighting", type: "Rental", products: 9 },
  { id: 4, name: "Balloon Stands", type: "Rental", products: 6 },
  { id: 5, name: "Photo Props", type: "Rental", products: 14 },
  { id: 6, name: "Event Packages", type: "Rental", products: 4 },
  { id: 7, name: "Party Supplies", type: "Purchase", products: 22 },
];

const Categories = () => {
  const [categories, setCategories] = useState(initialCategories);

  return (
    <AdminLayout>
      {/* PAGE HEADER */}
      <div className=" flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-semibold text-[#2D2926]">
            Categories
          </h1>
          <p className="text-gray-600 mt-1">
            Manage rental and purchase product categories
          </p>
        </div>

        <button className="flex items-center gap-2 bg-[#8B5C42] text-white px-5 py-2 rounded-lg hover:bg-[#704A36] transition">
          <FiPlus />
          Add Category
        </button>
      </div>

      {/* CATEGORY TABLE */}
      <div className="bg-white rounded-2xl shadow-sm border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-[#FAF7F5] border-b">
            <tr className="text-left text-[#2D2926]">
              <th className="px-6 py-4">Category Name</th>
              <th className="px-6 py-4">Type</th>
              <th className="px-6 py-4">Products</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>

          <tbody>
            {categories.map((cat) => (
              <tr
                key={cat.id}
                className="border-b last:border-0 hover:bg-gray-50 transition"
              >
                <td className="px-6 py-4 font-medium text-[#2D2926]">
                  {cat.name}
                </td>

                <td className="px-6 py-4">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium
                      ${
                        cat.type === "Rental"
                          ? "bg-blue-100 text-blue-700"
                          : "bg-green-100 text-green-700"
                      }
                    `}
                  >
                    {cat.type}
                  </span>
                </td>

                <td className="px-6 py-4 text-gray-600">
                  {cat.products}
                </td>

                <td className="px-6 py-4 text-right">
                  <div className="flex justify-end gap-4 text-lg">
                    <button
                      className="text-[#8B5C42] hover:opacity-70"
                      title="Edit"
                    >
                      <FiEdit2 />
                    </button>
                    <button
                      className="text-red-500 hover:opacity-70"
                      title="Delete"
                    >
                      <FiTrash2 />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* FOOT NOTE */}
      <p className="text-sm text-gray-500 mt-6">
        Categories help organize rental and purchase products for easier
        management and filtering.
      </p>
    </AdminLayout>
  );
};

export default Categories;
