import React, { useEffect, useState } from "react";
import {
  Zap,
  Timer,
  Package,
  AlertCircle,
  ShoppingCart,
  Percent,
  Clock,
  TrendingDown,
  ChevronRight,
  Info,
} from "lucide-react";
import apiRequest from "../utils/apiRequest";
import { useDispatch } from "react-redux";
import { addToCart, openCart } from "../features/cartSlice";
import { toast } from "react-toastify";
import { Link } from "react-router";

const CountdownTimer = ({ endTime }) => {
  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

  function calculateTimeLeft() {
    const difference = +new Date(endTime) - +new Date();
    let timeLeft = {};

    if (difference > 0) {
      timeLeft = {
        h: Math.floor(difference / (1000 * 60 * 60)),
        m: Math.floor((difference / 1000 / 60) % 60),
        s: Math.floor((difference / 1000) % 60),
      };
    } else {
      timeLeft = { h: 0, m: 0, s: 0 };
    }
    return timeLeft;
  }

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);
    return () => clearInterval(timer);
  }, [endTime]);

  return (
    <div className="flex gap-1.5 sm:gap-2">
      {["h", "m", "s"].map((unit) => (
        <div key={unit} className="flex flex-col items-center">
          <div className="bg-slate-900 text-white w-8 h-8 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center font-bold text-base sm:text-lg shadow-lg shadow-indigo-500/10">
            {String(timeLeft[unit] || 0).padStart(2, "0")}
          </div>
          <span className="text-[9px] uppercase font-bold text-slate-400 mt-1">
            {unit === "h" ? "Hrs" : unit === "m" ? "Min" : "Sec"}
          </span>
        </div>
      ))}
    </div>
  );
};

const FlashSaleCard = ({ sale }) => {
  const dispatch = useDispatch();
  const {
    product,
    variant,
    variantDetail,
    originalPrice,
    discountedPrice,
    endTime,
    discountPercent,
    unitsSold,
    maxUnits,
    status,
    description,
  } = sale;

  const activeVariant =
    variantDetail || (variant && typeof variant === "object" ? variant : null);
  const showAllVariants = !activeVariant;

  const handleAddToCart = (selectedVariant = null) => {
    const finalVariant =
      selectedVariant || activeVariant || product?.variants?.[0];

    dispatch(
      addToCart({
        product: product,
        selectedVariant: finalVariant,
        quantity: 1,
        flashSalePrice: discountedPrice,
      }),
    );
    dispatch(openCart());
    toast.success(`Added ${product?.name} to cart!`);
  };

  const progress = Math.min((unitsSold / maxUnits) * 100, 100);
  const isSoldOut = unitsSold >= maxUnits;
  const isScheduled = status === "SCHEDULED";
  const isActive = status === "ACTIVE";

  return (
    <div className="bg-white rounded-[2rem] overflow-hidden border border-slate-100 hover:border-indigo-200 transition-all duration-500 group hover:shadow-2xl hover:shadow-indigo-500/5 flex flex-col h-full">
      <div className="relative aspect-[4/3] overflow-hidden bg-slate-50">
        <img
          src={activeVariant?.images?.[0] || product?.images?.[0]}
          alt={product?.name}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
        />

        {/* Badges */}
        <div className="absolute top-4 left-4 flex flex-col gap-2">
          <div className="bg-rose-600 text-white px-3 py-1.5 rounded-xl text-[10px] font-black flex items-center gap-1.5 shadow-xl shadow-rose-600/20">
            <Zap className="w-3.5 h-3.5 fill-current" />
            {discountPercent}% OFF
          </div>
          {isScheduled && (
            <div className="bg-amber-500 text-white px-3 py-1.5 rounded-xl text-[10px] font-black flex items-center gap-1.5 shadow-xl shadow-amber-500/20">
              <Clock className="w-3.5 h-3.5" />
              UPCOMING
            </div>
          )}
        </div>

        <div className="absolute bottom-4 right-4 bg-white/80 backdrop-blur-md p-2 rounded-2xl border border-white/20 shadow-2xl">
          <CountdownTimer endTime={endTime} />
        </div>
      </div>

      <div className="p-6 lg:p-8 flex flex-col flex-1">
        <div className="mb-4">
          <div className="flex justify-between items-start mb-2">
            <h3 className="text-xl font-bold text-slate-900 group-hover:text-indigo-600 transition-colors line-clamp-1">
              {product?.name}
            </h3>
            <Link
              to={`/product/${product?._id}`}
              className="text-slate-400 hover:text-indigo-600 transition-colors"
            >
              <ChevronRight className="w-5 h-5" />
            </Link>
          </div>
          <p className="text-slate-500 text-sm line-clamp-2 leading-relaxed min-h-[40px]">
            {activeVariant
              ? `Premium ${activeVariant.color} edition in ${activeVariant.size} size.`
              : description || product?.description}
          </p>
        </div>

        <div className="flex items-end gap-3 mb-6">
          <div className="flex flex-col">
            <span className="text-xs text-slate-400 line-through font-bold">
              ₹{originalPrice}
            </span>
            <span className="text-3xl font-black text-slate-900 tracking-tight">
              ₹{discountedPrice}
            </span>
          </div>
          <div className="mb-1 text-emerald-600 font-bold text-[11px] bg-emerald-50 px-2 py-1 rounded-lg flex items-center gap-1 uppercase tracking-wider">
            <TrendingDown className="w-3 h-3" />
            Save ₹{originalPrice - discountedPrice}
          </div>
        </div>

        <div className="space-y-2 mb-6">
          <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
            <span
              className={
                progress > 85 ? "text-rose-600 animate-pulse" : "text-slate-400"
              }
            >
              {progress > 85 ? "Hurry! Almost Gone" : "Stock Progress"}
            </span>
            <span className="text-slate-900">
              {unitsSold} / {maxUnits} sold
            </span>
          </div>
          <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-1000 rounded-full ${progress > 85 ? "bg-rose-500" : "bg-indigo-600"}`}
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {showAllVariants && product?.variants?.length > 0 && (
          <div className="mb-6">
            <div className="flex items-center gap-1.5 mb-3">
              <Info className="w-3.5 h-3.5 text-indigo-600" />
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                Select Variant
              </label>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {product.variants.slice(0, 4).map((v) => (
                <button
                  key={v._id}
                  onClick={() => handleAddToCart(v)}
                  className="px-3 py-2 bg-slate-50 border border-slate-100 rounded-xl text-[11px] font-bold hover:border-indigo-600 hover:bg-white transition-all flex flex-col items-start gap-0.5 group/v"
                >
                  <span className="text-slate-900 group-hover/v:text-indigo-600">
                    {v.color}
                  </span>
                  <span className="text-[9px] text-slate-400">
                    {v.size} • {v.stock} left
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="mt-auto">
          <button
            disabled={!isActive || isSoldOut}
            onClick={() => handleAddToCart()}
            className={`w-full py-4 rounded-2xl font-black text-xs uppercase tracking-[0.2em] transition-all active:scale-[0.98] flex items-center justify-center gap-3 shadow-xl ${
              isActive && !isSoldOut
                ? "bg-slate-900 text-white hover:bg-indigo-600 shadow-indigo-600/20"
                : "bg-slate-100 text-slate-400 cursor-not-allowed"
            }`}
          >
            {isSoldOut ? (
              <>Sold Out</>
            ) : isScheduled ? (
              <>Starts Soon</>
            ) : (
              <>
                <ShoppingCart className="w-4 h-4" />
                Claim Deal
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

const FlashSales = () => {
  const [flashSales, setFlashSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchFlashSales = async () => {
      try {
        const res = await apiRequest.get("/flash-sales");
        setFlashSales(res.data.data || []);
      } catch (err) {
        setError(
          err.response?.data?.message || "Unable to fetch deals at the moment.",
        );
      } finally {
        setLoading(false);
      }
    };
    fetchFlashSales();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#fcfcfd] flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-slate-400 font-black text-xs uppercase tracking-widest animate-pulse">
            Loading Deals...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#fcfcfd] flex items-center justify-center p-6">
        <div className="bg-white p-10 rounded-[2.5rem] shadow-2xl border border-slate-100 text-center max-w-md">
          <div className="w-24 h-24 bg-rose-50 text-rose-500 rounded-3xl flex items-center justify-center mx-auto mb-8">
            <AlertCircle className="w-12 h-12" />
          </div>
          <h2 className="text-3xl font-black text-slate-900 mb-4 tracking-tight">
            System Error
          </h2>
          <p className="text-slate-500 mb-10 font-medium leading-relaxed">
            {error}
          </p>
          <button
            onClick={() => window.location.reload()}
            className="w-full py-5 bg-slate-900 text-white font-black rounded-2xl hover:bg-indigo-600 transition-all shadow-xl shadow-indigo-600/10 active:scale-95 uppercase tracking-widest text-xs"
          >
            Retry Connection
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fcfcfd] py-12 pb-32 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {flashSales.length === 0 ? (
          <div className="text-center py-32 bg-white rounded-[3rem] border border-slate-100 shadow-sm">
            <div className="w-24 h-24 bg-slate-50 text-slate-300 rounded-[2rem] flex items-center justify-center mx-auto mb-8">
              <Package className="w-12 h-12" />
            </div>
            <h2 className="text-3xl font-black text-slate-900 mb-3 tracking-tight">
              No Active Drops
            </h2>
            <p className="text-slate-500 font-medium max-w-xs mx-auto">
              All our flash sales have ended. Sign up for notifications to catch
              the next one!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8 lg:gap-10">
            {flashSales.map((sale) => (
              <FlashSaleCard key={sale._id} sale={sale} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default FlashSales;
