import {
  ArrowRight,
  ChevronRight,
  Layers,
  Package,
  ShoppingBag,
  ShoppingCart,
  Tag,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { Link } from "react-router";
import { toast } from "react-toastify";
import { addToCart, openCart } from "../features/cartSlice";
import apiRequest from "../utils/apiRequest";

const Categories = () => {
  const dispatch = useDispatch();
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [catLoading, setCatLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await apiRequest.get("/products/categories");
        setCategories(res.data.data);
        if (res.data.data.length > 0) {
        }
      } catch (err) {
        console.error("Failed to fetch categories:", err);
      } finally {
        setCatLoading(false);
      }
    };
    fetchCategories();
  }, []);

  const fetchProductsByCategory = async (category) => {
    setLoading(true);
    setSelectedCategory(category);
    try {
      const res = await apiRequest.get(`/products?category=${category}`);
      setProducts(res.data.data.products);
    } catch (err) {
      console.error("Failed to fetch products:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#fcfcfd] pb-20 pt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-12">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-16">
          {catLoading
            ? [...Array(4)].map((_, i) => (
                <div
                  key={i}
                  className="h-32 bg-white rounded-2xl animate-pulse shadow-sm border border-slate-100"
                />
              ))
            : categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => fetchProductsByCategory(cat)}
                  className={`group relative overflow-hidden p-6 rounded-2xl transition-all duration-300 text-left border ${
                    selectedCategory === cat
                      ? "bg-indigo-600 border-indigo-600 text-white shadow-xl shadow-indigo-100 scale-[1.02]"
                      : "bg-white border-slate-100 hover:border-indigo-200 hover:shadow-lg text-slate-900"
                  }`}
                >
                  <div
                    className={`mb-4 p-3 rounded-xl w-fit transition-colors ${
                      selectedCategory === cat ? "bg-white/20" : "bg-indigo-50"
                    }`}
                  >
                    <Layers
                      className={`w-6 h-6 ${selectedCategory === cat ? "text-white" : "text-indigo-600"}`}
                    />
                  </div>
                  <h3 className="font-bold text-lg mb-1">{cat}</h3>
                  <div className="flex items-center gap-2 text-sm opacity-70 group-hover:opacity-100 transition-opacity">
                    <span>View Products</span>
                    <ChevronRight className="w-4 h-4" />
                  </div>
                </button>
              ))}
        </div>

        {selectedCategory && (
          <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center justify-between border-b border-slate-200 pb-6">
              <div className="flex items-center gap-4">
                <div className="bg-indigo-600 p-2 rounded-lg">
                  <Tag className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight">
                  {selectedCategory}{" "}
                  <span className="text-slate-400 font-medium lowercase">
                    Collection
                  </span>
                </h2>
              </div>
              <p className="text-slate-500 font-bold">
                {products.length} Products Found
              </p>
            </div>

            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                {[...Array(4)].map((_, i) => (
                  <div
                    key={i}
                    className="bg-white rounded-2xl p-5 border border-slate-100"
                  >
                    <div className="aspect-4/5 bg-slate-100 rounded-xl mb-6 animate-pulse" />
                    <div className="h-5 bg-slate-100 rounded-full w-3/4 mb-3 animate-pulse" />
                    <div className="h-4 bg-slate-100 rounded-full w-1/2 animate-pulse" />
                  </div>
                ))}
              </div>
            ) : products.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                {products.map((product) => (
                  <Link
                    to={`/product/${product._id}`}
                    key={product._id}
                    className="group"
                  >
                    <div className="bg-white rounded-2xl p-4 border border-slate-100 hover:border-indigo-100 hover:shadow-2xl transition-all duration-300">
                      <div className="relative aspect-4/5 overflow-hidden rounded-xl bg-slate-50 mb-6">
                        {product.images && product.images[0] ? (
                          <img
                            src={product.images[0]}
                            alt={product.name}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-slate-300">
                            <Package className="w-16 h-16" />
                          </div>
                        )}

                        <div className="absolute top-4 right-4 translate-x-12 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all duration-300">
                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              dispatch(
                                addToCart({
                                  product: product,
                                  selectedVariant: product.variants?.[0] || null,
                                  quantity: 1,
                                }),
                              );
                              dispatch(openCart());
                              toast.success(`${product.name} added to cart!`);
                            }}
                            className="bg-white/90 backdrop-blur p-3 rounded-xl shadow-lg hover:bg-white transition-colors"
                          >
                            <ShoppingCart className="w-5 h-5 text-indigo-600" />
                          </button>
                        </div>
                      </div>

                      <div className="px-2">
                        <h3 className="font-bold text-slate-900 text-lg mb-1 group-hover:text-indigo-600 transition-colors line-clamp-1">
                          {product.name}
                        </h3>
                        <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-50">
                          <span className="text-xl font-black text-slate-900">
                            ₹{product.basePrice?.toLocaleString()}
                          </span>
                          <div className="flex items-center gap-1 text-indigo-600 font-bold text-sm">
                            Details <ArrowRight className="w-4 h-4" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-slate-200">
                <ShoppingBag className="w-16 h-16 text-slate-200 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-slate-900">
                  No products found
                </h3>
                <p className="text-slate-500">
                  This category is currently empty.
                </p>
              </div>
            )}
          </div>
        )}

        {!selectedCategory && !catLoading && (
          <div className="text-center py-32 bg-white rounded-3xl border border-dashed border-slate-200">
            <Layers className="w-20 h-20 text-slate-100 mx-auto mb-6" />
            <h2 className="text-2xl font-bold text-slate-900 mb-2">
              Select a Category
            </h2>
            <p className="text-slate-500 font-medium">
              Choose a category above to browse our exclusive products
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Categories;
