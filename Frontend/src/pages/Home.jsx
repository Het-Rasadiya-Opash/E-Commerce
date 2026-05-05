import React, { useEffect, useState, useCallback } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  Search,
  Filter,
  SlidersHorizontal,
  X,
  ChevronDown,
  Package,
  Tag,
  CreditCard,
  ShoppingBag,
  ArrowRight,
  TrendingUp,
  ShoppingCart,
} from "lucide-react";
import apiRequest from "../utils/apiRequest";
import { setProducts, setLoading, setError } from "../features/productSlice";
import { Link } from "react-router";

const Home = () => {
  const dispatch = useDispatch();
  const { loading, error, products } = useSelector((state) => state.products);

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const categories = [
    "Electronics",
    "Fashion",
    "Home",
    "Beauty",
    "Sports",
    "Books",
  ];

  const fetchProducts = useCallback(async () => {
    dispatch(setLoading(true));
    try {
      const params = new URLSearchParams();
      if (search) params.append("search", search);
      if (category) params.append("category", category);
      if (minPrice) params.append("minPrice", minPrice);
      if (maxPrice) params.append("maxPrice", maxPrice);

      const res = await apiRequest.get(`/products?${params.toString()}`);
      dispatch(setProducts(res.data.data.products));
    } catch (err) {
      dispatch(
        setError(err.response?.data?.message || "Failed to fetch products"),
      );
    }
  }, [dispatch, search, category, minPrice, maxPrice]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchProducts();
    }, 500);
    return () => clearTimeout(timeoutId);
  }, [fetchProducts]);

  return (
    <div className="min-h-screen bg-[#fcfcfd] pt-0 pb-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-8">
          <div className="flex items-center gap-4 w-full md:w-auto">
            <div className="relative group flex-1 md:w-96">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
              <input
                type="text"
                placeholder="Search products..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-12 pr-4 py-4 bg-white border border-slate-200 rounded-xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-600 outline-none transition-all text-slate-900 shadow-sm placeholder:text-slate-400"
              />
            </div>
            <button
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              className={`flex items-center gap-2 px-6 py-4 rounded-xl border transition-all font-bold shadow-sm active:scale-95 ${
                isFilterOpen
                  ? "bg-indigo-600 border-indigo-600 text-white"
                  : "bg-transparent border-slate-200 text-slate-700 hover:bg-indigo-600 hover:text-white hover:border-indigo-600"
              }`}
            >
              <SlidersHorizontal className="w-5 h-5" />
              <span className="hidden sm:inline">Filters</span>
            </button>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-12">
          <aside
            className={`${
              isFilterOpen ? "block" : "hidden lg:block"
            } w-full lg:w-72 space-y-8 shrink-0`}
          >
            <div className="sticky top-28 bg-white p-8 rounded-2xl border border-slate-100 shadow-sm">
              <div className="flex items-center justify-between mb-8">
                <h3 className="font-bold text-slate-900 flex items-center gap-3 text-lg">
                  <Filter className="w-5 h-5 text-indigo-600" /> Filters
                </h3>
                {(category || minPrice || maxPrice) && (
                  <button
                    onClick={() => {
                      setCategory("");
                      setMinPrice("");
                      setMaxPrice("");
                    }}
                    className="text-sm text-indigo-600 hover:text-indigo-700 font-bold underline underline-offset-4"
                  >
                    Reset
                  </button>
                )}
              </div>

              <div className="space-y-6 mb-10">
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                  Categories
                </label>
                <div className="flex flex-col gap-1.5">
                  <button
                    onClick={() => setCategory("")}
                    className={`flex items-center justify-between px-4 py-2.5 rounded-xl text-sm font-bold transition-all ${
                      category === ""
                        ? "bg-indigo-50 text-indigo-700"
                        : "text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    All Collection
                    {category === "" && (
                      <div className="w-1.5 h-1.5 rounded-full bg-indigo-600" />
                    )}
                  </button>
                  {categories.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setCategory(cat)}
                      className={`flex items-center justify-between px-4 py-2.5 rounded-xl text-sm font-bold transition-all ${
                        category === cat
                          ? "bg-indigo-50 text-indigo-700"
                          : "text-slate-600 hover:bg-slate-50"
                      }`}
                    >
                      {cat}
                      {category === cat && (
                        <div className="w-1.5 h-1.5 rounded-full bg-indigo-600" />
                      )}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-6">
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                  Price Filter
                </label>
                <div className="space-y-3">
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-bold">
                      ₹
                    </span>
                    <input
                      type="number"
                      placeholder="Min"
                      value={minPrice}
                      onChange={(e) => setMinPrice(e.target.value)}
                      className="w-full pl-8 pr-4 py-2.5 bg-slate-50 border-none rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-indigo-500/20 text-slate-900"
                    />
                  </div>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-bold">
                      ₹
                    </span>
                    <input
                      type="number"
                      placeholder="Max"
                      value={maxPrice}
                      onChange={(e) => setMaxPrice(e.target.value)}
                      className="w-full pl-8 pr-4 py-2.5 bg-slate-50 border-none rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-indigo-500/20 text-slate-900"
                    />
                  </div>
                </div>
              </div>
            </div>
          </aside>

          <main className="flex-1">
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-8">
                {[...Array(6)].map((_, i) => (
                  <div
                    key={i}
                    className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm"
                  >
                    <div className="aspect-[4/5] bg-slate-100 rounded-xl mb-6" />
                    <div className="h-5 bg-slate-100 rounded-full w-3/4 mb-3" />
                    <div className="h-4 bg-slate-100 rounded-full w-1/2 mb-6" />
                    <div className="flex justify-between items-center">
                      <div className="h-8 bg-slate-100 rounded-full w-1/3" />
                      <div className="h-12 w-12 bg-slate-100 rounded-xl" />
                    </div>
                  </div>
                ))}
              </div>
            ) : error ? (
              <div className="flex flex-col items-center justify-center py-24 text-center bg-white rounded-2xl border border-slate-100 shadow-sm">
                <div className="w-20 h-20 bg-rose-50 text-rose-500 rounded-2xl flex items-center justify-center mb-6">
                  <X className="w-10 h-10" />
                </div>
                <h3 className="text-xl font-bold text-slate-900">
                  Something Went Wrong
                </h3>
                <p className="text-slate-500 mt-2 max-w-sm px-6 font-medium">
                  We couldn't load the products. {error}
                </p>
                <button
                  onClick={fetchProducts}
                  className="mt-8 px-8 py-3 bg-indigo-600 text-white font-bold rounded-xl transition-all active:scale-95"
                >
                  Try Again
                </button>
              </div>
            ) : products?.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-24 text-center bg-white rounded-2xl border border-slate-100 shadow-sm">
                <div className="w-20 h-20 bg-slate-50 text-slate-300 rounded-2xl flex items-center justify-center mb-6">
                  <ShoppingBag className="w-10 h-10" />
                </div>
                <h3 className="text-xl font-bold text-slate-900">
                  Empty Collection
                </h3>
                <p className="text-slate-500 mt-2 font-medium">
                  No products matching your criteria.
                </p>
                <button
                  onClick={() => {
                    setSearch("");
                    setCategory("");
                    setMinPrice("");
                    setMaxPrice("");
                  }}
                  className="mt-8 text-indigo-600 font-bold hover:underline underline-offset-4"
                >
                  Reset all filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-8">
                {products.map((product) => (
                  <Link to={`/product/${product._id}`}>
                    <div
                      key={product._id}
                      className="bg-white rounded-2xl p-4 border border-slate-100 hover:border-indigo-100 hover:shadow-lg transition-all"
                    >
                      <div className="relative aspect-[4/5] overflow-hidden rounded-xl bg-slate-50 mb-6">
                        {product.images && product.images[0] ? (
                          <img
                            src={product.images[0]}
                            alt={product.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-slate-300">
                            <Package className="w-16 h-16" />
                          </div>
                        )}

                        <div className="absolute top-4 left-4">
                          <span className="px-3 py-1.5 bg-white shadow-sm rounded-lg text-[10px] font-bold text-slate-900 flex items-center gap-1.5 uppercase tracking-wider">
                            <Tag className="w-3 h-3 text-indigo-600" />
                            {product.category}
                          </span>
                        </div>
                      </div>

                      <div className="px-2 pb-2">
                        <h3 className="font-bold text-slate-900 text-lg hover:text-indigo-600 transition-colors line-clamp-1 mb-1">
                          {product.name}
                        </h3>
                        <p className="text-slate-500 line-clamp-2 mb-6 h-10 leading-relaxed text-sm">
                          {product.description}
                        </p>

                        <div className="flex items-center justify-between pt-5 border-t border-slate-50">
                          <div className="flex flex-col">
                            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                              Price
                            </span>
                            <span className="text-2xl font-bold text-slate-900">
                              ₹{product.basePrice?.toLocaleString()}
                            </span>
                          </div>
                          <button className="h-12 w-12 bg-slate-900 text-white rounded-xl hover:bg-indigo-600 transition-colors flex items-center justify-center group/btn">
                            <ShoppingCart className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
};

export default Home;
