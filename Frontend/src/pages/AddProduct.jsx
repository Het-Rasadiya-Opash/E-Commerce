import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  setLoading,
  setError,
  setSuccess,
  clearError,
  clearSuccess,
} from "../features/productSlice";
import apiRequest from "../utils/apiRequest";
import { toast } from "react-toastify";
import {
  Plus,
  Trash2,
  Upload,
  Package,
  Tag as TagIcon,
  Layers,
  Image as ImageIcon,
  CheckCircle2,
  AlertCircle,
  X,
  Type,
  DollarSign,
  Briefcase,
  ChevronRight,
  IndianRupee,
} from "lucide-react";

const AddProduct = () => {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    category: "",
    subCategory: "",
    brand: "",
    basePrice: "",
    tags: "",
  });

  const [images, setImages] = useState([]);
  const [variants, setVariants] = useState([
    { size: "", color: "", sku: "", stock: 0, price: 0, images: [] },
  ]);

  const dispatch = useDispatch();
  const { loading, error, success } = useSelector((state) => state.products);

  useEffect(() => {
    dispatch(clearError());
    dispatch(clearSuccess());
  }, [dispatch]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleVariantChange = (index, e) => {
    const { name, value } = e.target;
    const newVariants = [...variants];
    newVariants[index][name] = value;
    setVariants(newVariants);
  };

  const addVariant = () => {
    setVariants([
      ...variants,
      { size: "", color: "", sku: "", stock: 0, price: 0, images: [] },
    ]);
  };

  const removeVariant = (index) => {
    if (variants.length > 1) {
      setVariants(variants.filter((_, i) => i !== index));
    }
  };

  const handleMainImagesChange = (e) => {
    const files = Array.from(e.target.files);
    setImages((prev) => [...prev, ...files]);
  };

  const removeMainImage = (index) => {
    setImages(images.filter((_, i) => i !== index));
  };

  const handleVariantImagesChange = (index, e) => {
    const files = Array.from(e.target.files);
    const newVariants = [...variants];
    newVariants[index].images = [
      ...(newVariants[index].images || []),
      ...files,
    ];
    setVariants(newVariants);
  };

  const removeVariantImage = (vIndex, iIndex) => {
    const newVariants = [...variants];
    newVariants[vIndex].images = newVariants[vIndex].images.filter(
      (_, i) => i !== iIndex,
    );
    setVariants(newVariants);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    dispatch(setLoading(true));
    dispatch(clearError());

    try {
      const data = new FormData();

      Object.keys(formData).forEach((key) => {
        if (key === "tags") {
          const tagsArray = formData.tags
            .split(",")
            .map((t) => t.trim())
            .filter((t) => t !== "");
          data.append("tags", JSON.stringify(tagsArray));
        } else {
          data.append(key, formData[key]);
        }
      });

      images.forEach((image) => {
        data.append("images", image);
      });

      const variantsData = variants.map((v, i) => ({
        size: v.size,
        color: v.color,
        sku: v.sku,
        stock: Number(v.stock),
        price: Number(v.price),
      }));
      data.append("variants", JSON.stringify(variantsData));

      variants.forEach((v, i) => {
        if (v.images && v.images.length > 0) {
          v.images.forEach((img) => {
            data.append(`variant_${i}_images`, img);
          });
        }
      });

      const res = await apiRequest.post("/products/create", data, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      dispatch(setSuccess(true));
      toast.success("Product created successfully!");

      setFormData({
        name: "",
        description: "",
        category: "",
        subCategory: "",
        brand: "",
        basePrice: "",
        tags: "",
      });
      setImages([]);
      setVariants([
        { size: "", color: "", sku: "", stock: 0, price: 0, images: [] },
      ]);
    } catch (err) {
      const errorMsg =
        err.response?.data?.message || "Failed to create product";
      dispatch(setError(errorMsg));
      toast.error(errorMsg);
    } finally {
      dispatch(setLoading(false));
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/50 py-12 px-4 sm:px-6 lg:px-8 font-['Inter',sans-serif]">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-200">
            <Package className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-slate-900">
              Add New Product
            </h1>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100">
            <div className="flex items-center gap-2 mb-6">
              <Type className="w-5 h-5 text-indigo-600" />
              <h2 className="text-xl font-semibold text-slate-800">
                General Information
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700 ml-1">
                  Product Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="e.g. Premium Wireless Headphones"
                  className="block w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 transition-all"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700 ml-1">
                  Brand
                </label>
                <input
                  type="text"
                  name="brand"
                  value={formData.brand}
                  onChange={handleInputChange}
                  placeholder="e.g. Sony"
                  className="block w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 transition-all"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700 ml-1">
                  Category
                </label>
                <input
                  type="text"
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  placeholder="e.g. Electronics"
                  className="block w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 transition-all"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700 ml-1">
                  Sub-Category
                </label>
                <input
                  type="text"
                  name="subCategory"
                  value={formData.subCategory}
                  onChange={handleInputChange}
                  placeholder="e.g. Audio"
                  className="block w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 transition-all"
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <label className="text-sm font-semibold text-slate-700 ml-1">
                  Base Price (₹)
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <IndianRupee className="h-5 w-5 text-slate-400" />
                  </div>
                  <input
                    type="number"
                    name="basePrice"
                    value={formData.basePrice}
                    onChange={handleInputChange}
                    placeholder="0.00"
                    className="block w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 transition-all"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2 md:col-span-2">
                <label className="text-sm font-semibold text-slate-700 ml-1">
                  Description
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows="4"
                  placeholder="Provide a detailed description of the product..."
                  className="block w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 transition-all resize-none"
                  required
                ></textarea>
              </div>

              <div className="space-y-2 md:col-span-2">
                <label className="text-sm font-semibold text-slate-700 ml-1">
                  Tags (Comma separated)
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <TagIcon className="h-5 w-5 text-slate-400" />
                  </div>
                  <input
                    type="text"
                    name="tags"
                    value={formData.tags}
                    onChange={handleInputChange}
                    placeholder="wireless, audio, premium, noise-cancelling"
                    className="block w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 transition-all"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100">
            <div className="flex items-center gap-2 mb-6">
              <ImageIcon className="w-5 h-5 text-indigo-600" />
              <h2 className="text-xl font-semibold text-slate-800">
                Product Images
              </h2>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-4 mb-4">
              {images.map((img, index) => (
                <div
                  key={index}
                  className="relative group aspect-square rounded-2xl overflow-hidden bg-slate-100 border border-slate-200"
                >
                  <img
                    src={URL.createObjectURL(img)}
                    alt={`Preview ${index}`}
                    className="w-full h-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => removeMainImage(index)}
                    className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
              <label className="cursor-pointer aspect-square rounded-2xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center gap-2 hover:bg-slate-50 hover:border-indigo-400 transition-all group">
                <Upload className="w-6 h-6 text-slate-400 group-hover:text-indigo-600 transition-colors" />
                <span className="text-xs font-semibold text-slate-500 group-hover:text-indigo-600">
                  Upload
                </span>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleMainImagesChange}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <Layers className="w-5 h-5 text-indigo-600" />
                <h2 className="text-xl font-semibold text-slate-800">
                  Product Variants
                </h2>
              </div>
              <button
                type="button"
                onClick={addVariant}
                className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-600 rounded-xl font-bold text-sm hover:bg-indigo-100 transition-colors"
              >
                <Plus className="w-4 h-4" />
                Add Variant
              </button>
            </div>

            <div className="space-y-6">
              {variants.map((variant, vIndex) => (
                <div
                  key={vIndex}
                  className="p-6 rounded-2xl bg-slate-50 border border-slate-100 relative group/variant"
                >
                  <div className="absolute -top-3 -right-3">
                    {variants.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeVariant(vIndex)}
                        className="p-2 bg-white text-red-500 rounded-xl border border-red-100 shadow-md hover:bg-red-50 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">
                        Size / Dimension
                      </label>
                      <input
                        type="text"
                        name="size"
                        value={variant.size}
                        onChange={(e) => handleVariantChange(vIndex, e)}
                        placeholder="e.g. XL, 64GB"
                        className="block w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 transition-all"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">
                        Color / Finish
                      </label>
                      <input
                        type="text"
                        name="color"
                        value={variant.color}
                        onChange={(e) => handleVariantChange(vIndex, e)}
                        placeholder="e.g. Midnight Black"
                        className="block w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 transition-all"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">
                        SKU
                      </label>
                      <input
                        type="text"
                        name="sku"
                        value={variant.sku}
                        onChange={(e) => handleVariantChange(vIndex, e)}
                        placeholder="Unique SKU"
                        className="block w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 transition-all"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">
                        Stock Quantity
                      </label>
                      <input
                        type="number"
                        name="stock"
                        value={variant.stock}
                        onChange={(e) => handleVariantChange(vIndex, e)}
                        placeholder="0"
                        className="block w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 transition-all"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">
                        Variant Price (₹)
                      </label>
                      <input
                        type="number"
                        name="price"
                        value={variant.price}
                        onChange={(e) => handleVariantChange(vIndex, e)}
                        placeholder="0.00"
                        className="block w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 transition-all"
                      />
                    </div>
                  </div>

                  <div className="space-y-3">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">
                      Variant Images
                    </label>
                    <div className="flex flex-wrap gap-3">
                      {variant.images?.map((img, iIndex) => (
                        <div
                          key={iIndex}
                          className="relative group/img w-16 h-16 rounded-xl overflow-hidden bg-white border border-slate-200 shadow-sm"
                        >
                          <img
                            src={URL.createObjectURL(img)}
                            alt="Variant"
                            className="w-full h-full object-cover"
                          />
                          <button
                            type="button"
                            onClick={() => removeVariantImage(vIndex, iIndex)}
                            className="absolute inset-0 bg-red-500/80 text-white flex items-center justify-center opacity-0 group-hover/img:opacity-100 transition-opacity"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                      <label className="w-16 h-16 cursor-pointer rounded-xl border-2 border-dashed border-slate-300 flex items-center justify-center bg-white hover:border-indigo-400 hover:bg-indigo-50/50 transition-all">
                        <Plus className="w-5 h-5 text-slate-400" />
                        <input
                          type="file"
                          multiple
                          accept="image/*"
                          onChange={(e) => handleVariantImagesChange(vIndex, e)}
                          className="hidden"
                        />
                      </label>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-end gap-4">
            <button
              type="button"
              className="px-8 py-4 bg-white border border-slate-200 text-slate-600 rounded-2xl font-bold hover:bg-slate-50 transition-all active:scale-[0.98]"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-12 py-4 bg-indigo-600 text-white rounded-2xl font-bold hover:bg-indigo-700 shadow-xl shadow-indigo-200 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <span>Create Product</span>
                  <ChevronRight className="w-5 h-5" />
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddProduct;
