import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import apiRequest from "../utils/apiRequest";
import { toast } from "react-toastify";
import {
  Zap,
  Calendar,
  Tag,
  Package,
  Layers,
  Users,
  Info,
  ChevronLeft,
  Loader2,
} from "lucide-react";

const CreateFlashSale = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetchingProducts, setFetchingProducts] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    product: "",
    variant: "",
    discountedPrice: "",
    startTime: "",
    endTime: "",
    maxUnits: "",
    waitingRoomCapacity: 100,
  });

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await apiRequest.get("/products?limit=1000");
        const productsData = response.data.data.products || response.data.data;
        setProducts(Array.isArray(productsData) ? productsData : []);
      } catch (error) {
        console.error("Error fetching products:", error);
        toast.error("Failed to load products");
      } finally {
        setFetchingProducts(false);
      }
    };
    fetchProducts();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (name === "product") {
      const product = products.find((p) => p._id === value);
      setSelectedProduct(product);
      setFormData((prev) => ({ ...prev, variant: "", discountedPrice: "" }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await apiRequest.post("/flash-sales/create", formData);
      toast.success(
        response.data.message || "Flash sale created successfully!",
      );
      navigate("/dashboard");
    } catch (error) {
      console.error("Error creating flash sale:", error);
      toast.error(
        error.response?.data?.message || "Failed to create flash sale",
      );
    } finally {
      setLoading(false);
    }
  };

  const getOriginalPrice = () => {
    if (!selectedProduct) return 0;
    if (formData.variant) {
      const variant = selectedProduct.variants?.find(
        (v) => v._id === formData.variant,
      );
      return variant?.price || selectedProduct.basePrice;
    }
    return selectedProduct.basePrice;
  };

  if (fetchingProducts) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Loader2 className="w-12 h-12 text-indigo-600 animate-spin" />
        <p className="text-gray-500 font-medium">Loading products...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center text-gray-500 hover:text-indigo-600 transition-colors mb-8 group"
      >
        <ChevronLeft className="w-5 h-5 mr-1 group-hover:-translate-x-1 transition-transform" />
        Back to Dashboard
      </button>

      <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
        <div className="bg-indigo-600 px-8 py-10 text-white relative overflow-hidden">
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-2">
              <Zap className="w-8 h-8 fill-yellow-400 text-yellow-400" />
              <h1 className="text-3xl font-bold">Create Flash Sale</h1>
            </div>
            <p className="text-indigo-100 text-lg">
              Set up a high-energy, limited-time discount event.
            </p>
          </div>
          <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-48 h-48 bg-indigo-400/20 rounded-full blur-2xl"></div>
        </div>

        <form onSubmit={handleSubmit} className="p-8 lg:p-12 space-y-8">
          <div className="space-y-6">
            <div className="flex items-center gap-2 border-b border-gray-100 pb-2">
              <Info className="w-5 h-5 text-indigo-500" />
              <h2 className="text-xl font-bold text-gray-900">
                Basic Information
              </h2>
            </div>

            <div className="grid grid-cols-1 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700 uppercase tracking-wider">
                  Sale Title
                </label>
                <input
                  type="text"
                  name="title"
                  required
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder="e.g., Midnight Mega Sale"
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700 uppercase tracking-wider">
                  Description
                </label>
                <textarea
                  name="description"
                  rows="3"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Tell your customers about this exclusive offer..."
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all resize-none"
                />
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="flex items-center gap-2 border-b border-gray-100 pb-2">
              <Package className="w-5 h-5 text-indigo-500" />
              <h2 className="text-xl font-bold text-gray-900">
                Product Selection
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700 uppercase tracking-wider">
                  Select Product
                </label>
                <select
                  name="product"
                  required
                  value={formData.product}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                >
                  <option value="">Choose a product</option>
                  {products.map((p) => (
                    <option key={p._id} value={p._id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>

              {selectedProduct?.variants?.length > 0 && (
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700 uppercase tracking-wider">
                    Select Variant (Optional)
                  </label>
                  <select
                    name="variant"
                    value={formData.variant}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                  >
                    <option value="">Full Product</option>
                    {selectedProduct.variants.map((v) => (
                      <option key={v._id} value={v._id}>
                        {v.color || v.size || "Unnamed Variant"} (₹
                        {v.price || selectedProduct.basePrice})
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-6">
            <div className="flex items-center gap-2 border-b border-gray-100 pb-2">
              <Tag className="w-5 h-5 text-indigo-500" />
              <h2 className="text-xl font-bold text-gray-900">
                Pricing & Inventory
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700 uppercase tracking-wider">
                  Original Price
                </label>
                <div className="w-full px-4 py-3 bg-gray-100 border border-gray-200 rounded-xl text-gray-500 font-bold">
                  ₹{getOriginalPrice().toLocaleString()}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700 uppercase tracking-wider">
                  Sale Price (₹)
                </label>
                <input
                  type="number"
                  name="discountedPrice"
                  required
                  value={formData.discountedPrice}
                  onChange={handleInputChange}
                  placeholder="e.g., 499"
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700 uppercase tracking-wider">
                  Max Units for Sale
                </label>
                <input
                  type="number"
                  name="maxUnits"
                  required
                  value={formData.maxUnits}
                  onChange={handleInputChange}
                  placeholder="e.g., 50"
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                />
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="flex items-center gap-2 border-b border-gray-100 pb-2">
              <Calendar className="w-5 h-5 text-indigo-500" />
              <h2 className="text-xl font-bold text-gray-900">Sale Schedule</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700 uppercase tracking-wider">
                  Start Time
                </label>
                <input
                  type="datetime-local"
                  name="startTime"
                  required
                  value={formData.startTime}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700 uppercase tracking-wider">
                  End Time
                </label>
                <input
                  type="datetime-local"
                  name="endTime"
                  required
                  value={formData.endTime}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                />
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="flex items-center gap-2 border-b border-gray-100 pb-2">
              <Users className="w-5 h-5 text-indigo-500" />
              <h2 className="text-xl font-bold text-gray-900">
                Advanced Settings
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700 uppercase tracking-wider">
                  Waiting Room Capacity
                </label>
                <input
                  type="number"
                  name="waitingRoomCapacity"
                  value={formData.waitingRoomCapacity}
                  onChange={handleInputChange}
                  placeholder="e.g., 200"
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                />
                <p className="text-xs text-gray-400">
                  Maximum number of concurrent users allowed in the sale queue.
                </p>
              </div>
            </div>
          </div>

          <div className="pt-8">
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 rounded-2xl shadow-lg hover:shadow-indigo-500/30 transition-all duration-300 flex items-center justify-center gap-3 disabled:opacity-70 disabled:cursor-not-allowed group"
            >
              {loading ? (
                <>
                  <Loader2 className="w-6 h-6 animate-spin" />
                  Creating Sale...
                </>
              ) : (
                <>
                  <Zap className="w-6 h-6 fill-yellow-400 text-yellow-400 group-hover:scale-110 transition-transform" />
                  Launch Flash Sale
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateFlashSale;
