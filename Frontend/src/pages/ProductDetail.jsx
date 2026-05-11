import {
  ArrowLeft,
  CheckCircle2,
  Heart,
  Minus,
  Plus,
  Share2,
  ShieldCheck,
  ShoppingCart,
  Star,
  Truck,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate, useParams } from "react-router";
import { toast } from "react-toastify";
import { addToCart, openCart } from "../features/cartSlice";
import apiRequest from "../utils/apiRequest";

const ProductDetail = () => {
  const { productId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [selectedImage, setSelectedImage] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState("description");

  useEffect(() => {
    const fetchProductDetail = async () => {
      try {
        setLoading(true);
        const res = await apiRequest.get(`/products/${productId}`);
        const productData = res.data.data;
        setProduct(productData);

        if (productData.variants && productData.variants.length > 0) {
          setSelectedVariant(productData.variants[0]);
          const initialImg =
            productData.variants[0].images?.[0] || productData.images?.[0];
          setSelectedImage(initialImg);
        } else {
          setSelectedImage(productData.images?.[0] || "");
        }
      } catch (error) {
        console.error("Error fetching product:", error);
        toast.error("Failed to load product details");
      } finally {
        setLoading(false);
      }
    };
    fetchProductDetail();
  }, [productId]);

  const handleVariantChange = (variant) => {
    setSelectedVariant(variant);
    if (variant.images && variant.images.length > 0) {
      setSelectedImage(variant.images[0]);
    }
  };

  const handleAddToCart = () => {
    dispatch(addToCart({ product, selectedVariant, quantity }));
    dispatch(openCart());
    toast.success(`${product.name} added to cart!`);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-slate-500 font-medium animate-pulse">
            Loading product details...
          </p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-white p-4">
        <h2 className="text-2xl font-bold text-slate-800 mb-2">
          Product Not Found
        </h2>
        <p className="text-slate-500 mb-6">
          The product you are looking for doesn't exist or has been removed.
        </p>
        <button
          onClick={() => navigate("/")}
          className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 transition-all"
        >
          <ArrowLeft size={20} />
          Back to Home
        </button>
      </div>
    );
  }

  const allImages = Array.from(
    new Set([...(product.images || []), ...(selectedVariant?.images || [])]),
  );

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-slate-500 hover:text-indigo-600 transition-colors group"
        >
          <div className="p-2 rounded-full group-hover:bg-indigo-50 transition-colors">
            <ArrowLeft size={18} />
          </div>
          <span className="font-medium">Back to products</span>
        </button>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
            <div className="p-6 lg:p-10 bg-slate-50/50 border-r border-slate-100">
              <div className="sticky top-10">
                <div className="aspect-square rounded-2xl overflow-hidden bg-white shadow-inner mb-6 group relative">
                  <img
                    src={selectedImage}
                    alt={product.name}
                    className="w-full h-full object-contain mix-blend-multiply p-4 transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute top-4 right-4 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button className="p-3 bg-white/80 backdrop-blur-md rounded-full shadow-lg text-slate-600 hover:text-red-500 transition-colors">
                      <Heart size={20} />
                    </button>
                    <button className="p-3 bg-white/80 backdrop-blur-md rounded-full shadow-lg text-slate-600 hover:text-indigo-600 transition-colors">
                      <Share2 size={20} />
                    </button>
                  </div>
                </div>

                <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
                  {allImages.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedImage(img)}
                      className={`relative min-w-20 h-20 rounded-xl overflow-hidden border-2 transition-all ${
                        selectedImage === img
                          ? "border-indigo-600 ring-2 ring-indigo-600/20"
                          : "border-transparent opacity-70 hover:opacity-100"
                      }`}
                    >
                      <img
                        src={img}
                        alt={`thumb-${idx}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-6 lg:p-10">
              <div className="mb-8">
                <span className="inline-block px-3 py-1 bg-indigo-50 text-indigo-600 text-xs font-bold tracking-wider uppercase rounded-full mb-4">
                  {product.brand} • {product.category}
                </span>
                <h1 className="text-3xl lg:text-4xl font-extrabold text-slate-900 mb-4 leading-tight">
                  {product.name}
                </h1>

                <div className="flex items-center gap-6 mb-6">
                  <div className="flex items-center gap-1.5 px-3 py-1 bg-amber-50 rounded-lg">
                    <div className="flex">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          size={16}
                          className={
                            i < Math.floor(product.averageRating || 5)
                              ? "fill-amber-400 text-amber-400"
                              : "text-slate-300"
                          }
                        />
                      ))}
                    </div>
                    <span className="text-sm font-bold text-amber-700">
                      {product.averageRating || "5.0"}
                    </span>
                  </div>
                  <span className="text-sm text-slate-400 font-medium">
                    {product.numReviews} Reviews
                  </span>
                  <div className="h-4 w-px bg-slate-200"></div>
                  <span className="text-sm text-emerald-600 font-semibold flex items-center gap-1">
                    <CheckCircle2 size={16} />
                    In Stock (
                    {selectedVariant
                      ? selectedVariant.stock
                      : product.totalStock}
                    )
                  </span>
                </div>

                <div className="flex items-baseline gap-3 mb-8">
                  <span className="text-4xl font-black text-slate-900">
                    ₹
                    {selectedVariant
                      ? selectedVariant.price
                      : product.basePrice}
                  </span>
                  {product.basePrice >
                    (selectedVariant?.price || product.basePrice) && (
                    <span className="text-xl text-slate-400 line-through">
                      ₹{product.basePrice}
                    </span>
                  )}
                </div>

                <p className="text-slate-600 leading-relaxed mb-8">
                  {product.description}
                </p>
              </div>

              {product.variants && product.variants.length > 0 && (
                <div className="space-y-6 mb-10">
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4">
                      Select Variant
                    </h4>
                    <div className="flex flex-wrap gap-3">
                      {product.variants.map((v) => (
                        <button
                          key={v._id}
                          onClick={() => handleVariantChange(v)}
                          className={`px-4 py-3 rounded-xl border-2 transition-all flex flex-col items-start gap-1 min-w-30 ${
                            selectedVariant?._id === v._id
                              ? "border-indigo-600 bg-indigo-50/30 ring-2 ring-indigo-600/10"
                              : "border-slate-100 hover:border-slate-300"
                          }`}
                        >
                          <span className="font-bold text-slate-900">
                            {v.color} / {v.size}
                          </span>
                          <span className="text-sm text-slate-500 font-medium">
                            ₹{v.price}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              <div className="flex flex-col sm:flex-row gap-4 mb-10">
                <div className="flex items-center bg-slate-100 rounded-xl p-1">
                  <button
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    className="p-3 text-slate-500 hover:text-slate-900 hover:bg-white rounded-lg transition-all"
                  >
                    <Minus size={20} />
                  </button>
                  <span className="w-12 text-center font-bold text-slate-900">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity((q) => q + 1)}
                    className="p-3 text-slate-500 hover:text-slate-900 hover:bg-white rounded-lg transition-all"
                  >
                    <Plus size={20} />
                  </button>
                </div>

                <button
                  onClick={handleAddToCart}
                  className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-4 rounded-xl font-bold flex items-center justify-center gap-3 shadow-lg shadow-indigo-200 transition-all active:scale-[0.98]"
                >
                  <ShoppingCart size={22} />
                  Add to Cart
                </button>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-8 border-t border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600">
                    <Truck size={20} />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-900">
                      Free Delivery
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
                    <ShieldCheck size={20} />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-900">
                      Secure Payment
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-12 bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="flex border-b border-slate-100">
            {["description", "specifications", "reviews"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-8 py-5 text-sm font-bold uppercase tracking-wider transition-all relative ${
                  activeTab === tab
                    ? "text-indigo-600"
                    : "text-slate-400 hover:text-slate-600"
                }`}
              >
                {tab}
                {activeTab === tab && (
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-indigo-600"></div>
                )}
              </button>
            ))}
          </div>

          <div className="p-8 lg:p-10">
            {activeTab === "description" && (
              <div className="max-w-3xl animate-in fade-in">
                <h3 className="text-xl font-bold text-slate-900 mb-4">
                  Product Overview
                </h3>
                <p className="text-slate-600 leading-relaxed mb-6">
                  {product.description}
                </p>
                <div className="grid grid-cols-2 gap-y-4">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 size={18} className="text-indigo-600" />
                    <span className="text-sm text-slate-600 font-medium">
                      Premium Build Quality
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 size={18} className="text-indigo-600" />
                    <span className="text-sm text-slate-600 font-medium">
                      Ergonomic Design
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 size={18} className="text-indigo-600" />
                    <span className="text-sm text-slate-600 font-medium">
                      Sustainable Materials
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 size={18} className="text-indigo-600" />
                    <span className="text-sm text-slate-600 font-medium">
                      1 Year Warranty
                    </span>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "specifications" && (
              <div className="animate-in fade-in">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <div className="flex justify-between py-3 border-b border-slate-50">
                      <span className="text-slate-500 font-medium">Brand</span>
                      <span className="text-slate-900 font-bold">
                        {product.brand}
                      </span>
                    </div>
                    <div className="flex justify-between py-3 border-b border-slate-50">
                      <span className="text-slate-500 font-medium">
                        Category
                      </span>
                      <span className="text-slate-900 font-bold">
                        {product.category}
                      </span>
                    </div>
                    <div className="flex justify-between py-3 border-b border-slate-50">
                      <span className="text-slate-500 font-medium">
                        Sub Category
                      </span>
                      <span className="text-slate-900 font-bold">
                        {product.subCategory}
                      </span>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="flex justify-between py-3 border-b border-slate-50">
                      <span className="text-slate-500 font-medium">SKU</span>
                      <span className="text-slate-900 font-bold">
                        {selectedVariant?.sku || "N/A"}
                      </span>
                    </div>
                    <div className="flex justify-between py-3 border-b border-slate-50">
                      <span className="text-slate-500 font-medium">Tags</span>
                      <div className="flex flex-wrap gap-2 justify-end">
                        {product.tags?.map((tag) => (
                          <span
                            key={tag}
                            className="text-xs px-2 py-1 bg-slate-100 text-slate-600 rounded-md"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "reviews" && (
              <div className="animate-in fade-in">
                {product.reviews && product.reviews.length > 0 ? (
                  <div className="space-y-8"></div>
                ) : (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-300">
                      <Star size={32} />
                    </div>
                    <h4 className="text-lg font-bold text-slate-900 mb-1">
                      No reviews yet
                    </h4>
                    <p className="text-slate-500">
                      Be the first to review this product!
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
