import React, { useEffect, useState } from "react";
import apiRequest from "../utils/apiRequest";
import {
  Package,
  Plus,
  Trash2,
  Edit,
  ExternalLink,
  Search,
} from "lucide-react";
import { Link } from "react-router";
import { toast } from "react-toastify";

const Dashboard = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await apiRequest.get("/products/user");
      setProducts(response.data.data);
    } catch (error) {
      console.error("Error fetching user products:", error);
      toast.error("Failed to load products");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const filteredProducts = products.filter(
    (product) =>
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.category.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      try {
        await apiRequest.delete(`/products/${id}`);
        toast.success("Product deleted successfully");
        fetchProducts();
      } catch (error) {
        toast.error(
          error.response?.data?.message || "Failed to delete product",
        );
      }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
            Admin Dashboard
          </h1>
        </div>
        <Link
          to="/add-product"
          className="inline-flex items-center px-5 py-2.5 border border-transparent rounded-xl shadow-sm text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-200"
        >
          <Plus className="w-5 h-5 mr-2" />
          Add New Product
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">
                Total Products
              </p>
              <p className="text-3xl font-bold text-gray-900 mt-1">
                {products.length}
              </p>
            </div>
            <div className="p-3 bg-indigo-50 rounded-xl">
              <Package className="w-6 h-6 text-indigo-600" />
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100 bg-white">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <h2 className="text-xl font-bold text-gray-900">Your Products</h2>
            <div className="relative group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-indigo-500 transition-colors" />
              <input
                type="text"
                placeholder="Search products..."
                className="pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none w-full sm:w-80 transition-all duration-200 bg-gray-50/50 hover:bg-white"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50/50 text-[11px] font-bold text-gray-500 uppercase tracking-[0.1em]">
                <th className="px-6 py-4">Product Info</th>
                <th className="px-6 py-4">Category</th>
                <th className="px-6 py-4">Price</th>
                <th className="px-6 py-4">Stock Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredProducts.length > 0 ? (
                filteredProducts.map((product) => (
                  <tr
                    key={product._id}
                    className="hover:bg-gray-50/50 transition-colors duration-150 group"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-14 w-14 flex-shrink-0 rounded-xl overflow-hidden bg-gray-100 border border-gray-100 shadow-sm">
                          {product.images?.[0] ? (
                            <img
                              src={product.images[0]}
                              alt={product.name}
                              className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-300"
                            />
                          ) : (
                            <div className="h-full w-full flex items-center justify-center text-gray-400">
                              <Package className="w-6 h-6" />
                            </div>
                          )}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-bold text-gray-900 group-hover:text-indigo-600 transition-colors">
                            {product.name}
                          </div>
                          <div className="text-xs text-gray-500 font-medium mt-0.5">
                            {product.brand || "No Brand"}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-3 py-1 rounded-full text-[11px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-100 uppercase tracking-wider">
                        {product.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-bold text-gray-900">
                        ₹{product.basePrice.toLocaleString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div
                          className={`h-2 w-2 rounded-full mr-2 ${
                            product.totalStock > 20
                              ? "bg-green-500"
                              : product.totalStock > 0
                                ? "bg-orange-500"
                                : "bg-red-500"
                          }`}
                        ></div>
                        <span
                          className={`text-sm font-bold ${
                            product.totalStock < 10
                              ? "text-red-600"
                              : "text-gray-700"
                          }`}
                        >
                          {product.totalStock}
                        </span>
                        <span className="ml-1 text-[11px] text-gray-500 font-bold uppercase">
                          in stock
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
                          title="Edit"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(product._id)}
                          className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                        <Link
                          to={`/product/${product._id}`}
                          className="p-2 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-all"
                          title="View"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan="5"
                    className="px-6 py-20 text-center text-gray-500"
                  >
                    {searchTerm ? (
                      <div className="flex flex-col items-center">
                        <div className="p-4 bg-gray-50 rounded-2xl mb-4">
                          <Search className="w-8 h-8 text-gray-300" />
                        </div>
                        <p className="text-gray-900 font-bold">
                          No products match your search
                        </p>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center">
                        <div className="p-4 bg-gray-50 rounded-2xl mb-4">
                          <Package className="w-8 h-8 text-gray-300" />
                        </div>
                        <p className="text-gray-900 font-bold">
                          No products found
                        </p>
                        <p className="text-sm text-gray-500 mt-1">
                          Start by adding your first product to the store
                        </p>
                        <Link
                          to="/add-product"
                          className="mt-6 text-indigo-600 font-bold hover:text-indigo-700 underline underline-offset-4"
                        >
                          Create a product now
                        </Link>
                      </div>
                    )}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
