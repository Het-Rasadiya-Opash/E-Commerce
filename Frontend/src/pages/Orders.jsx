import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import apiRequest from "../utils/apiRequest";
import {
  setLoading,
  setOrders,
  setError,
  updateOrder,
  clearOrderError,
} from "../features/orderSlice";
import {
  Package,
  ChevronRight,
  Clock,
  CheckCircle2,
  XCircle,
  Truck,
  CreditCard,
  Search,
  MapPin,
  AlertCircle,
  Calendar,
  ChevronDown,
  ShoppingBag,
  ArrowRight,
  Tag,
} from "lucide-react";
import { Link } from "react-router";

const StatusBadge = ({ status }) => {
  const statusStyles = {
    PLACED: "bg-blue-50 text-blue-700 border-blue-100",
    PAID: "bg-emerald-50 text-emerald-700 border-emerald-100",
    SHIPPED: "bg-indigo-50 text-indigo-700 border-indigo-100",
    DELIVERED: "bg-green-50 text-green-700 border-green-100",
    CANCELLED: "bg-rose-50 text-rose-700 border-rose-100",
  };

  const statusIcons = {
    PLACED: <Clock className="w-3.5 h-3.5" />,
    PAID: <CheckCircle2 className="w-3.5 h-3.5" />,

    SHIPPED: <Truck className="w-3.5 h-3.5" />,

    DELIVERED: <CheckCircle2 className="w-3.5 h-3.5" />,
    CANCELLED: <XCircle className="w-3.5 h-3.5" />,
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider border shadow-sm ${statusStyles[status] || "bg-slate-50 text-slate-700 border-slate-100"}`}
    >
      {statusIcons[status]}
      {status}
    </span>
  );
};

const OrderCard = ({ order, onCancel }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div
      className={`bg-white rounded-2xl border transition-all duration-300 overflow-hidden ${
        isExpanded
          ? "border-indigo-200 shadow-xl shadow-indigo-500/5"
          : "border-slate-100 hover:border-indigo-100 hover:shadow-lg"
      } mb-6`}
    >
      <div
        className="p-6 sm:p-8 cursor-pointer select-none"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400 border border-slate-100">
              <Package size={28} />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-3 mb-2">
                <h3 className="text-lg font-bold text-slate-900">
                  {order.orderNumber}
                </h3>
                <StatusBadge status={order.status} />
              </div>
              <div className="flex items-center gap-4 text-sm font-medium text-slate-500">
                <span className="flex items-center gap-1.5">
                  <Calendar size={14} className="text-slate-400" />
                  {formatDate(order.createdAt)}
                </span>
                <span className="w-1 h-1 rounded-full bg-slate-300 hidden sm:block"></span>
                <span className="hidden sm:flex items-center gap-1.5">
                  <ShoppingBag size={14} className="text-slate-400" />
                  {order.items?.length}{" "}
                  {order.items?.length === 1 ? "Item" : "Items"}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between md:justify-end gap-10 border-t md:border-t-0 pt-4 md:pt-0">
            <div className="text-left md:text-right">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">
                Total Amount
              </span>
              <span className="text-2xl font-bold text-slate-900 tracking-tight">
                ₹{order.grandTotal?.toLocaleString()}
              </span>
            </div>
            <div
              className={`p-3 rounded-xl bg-slate-50 text-slate-400 transition-all duration-300 ${isExpanded ? "rotate-180 bg-indigo-50 text-indigo-600" : ""}`}
            >
              <ChevronDown size={20} />
            </div>
          </div>
        </div>
      </div>

      {isExpanded && (
        <div className="px-6 pb-8 sm:px-8 border-t border-slate-50 pt-8 animate-in fade-in slide-in-from-top duration-300">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            {/* Items List */}
            <div className="lg:col-span-7 space-y-6">
              <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2 mb-2">
                Order Items
              </h4>
              <div className="space-y-4">
                {order.items?.map((item, idx) => (
                  <div key={idx} className="flex gap-5 group">
                    <div className="w-20 h-24 bg-slate-50 rounded-xl overflow-hidden border border-slate-100 shrink-0">
                      <img
                        src={
                          item.snapshot?.image ||
                          "https://via.placeholder.com/80x96"
                        }
                        alt={item.snapshot?.productName}
                        className="w-full h-full object-cover transition-transform group-hover:scale-110"
                      />
                    </div>
                    <div className="flex-1 py-1">
                      <div className="flex justify-between items-start gap-4 mb-2">
                        <h5 className="font-bold text-slate-900 leading-snug group-hover:text-indigo-600 transition-colors">
                          {item.snapshot?.productName}
                        </h5>
                        <span className="text-lg font-bold text-slate-900">
                          ₹
                          {(
                            item.snapshot?.paidPrice * item.quantity
                          ).toLocaleString()}
                        </span>
                      </div>
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs font-bold text-slate-500">
                        {item.snapshot?.size && (
                          <span className="flex items-center gap-1.5 px-2 py-1 bg-slate-50 rounded-md">
                            Size:{" "}
                            <span className="text-slate-900 uppercase">
                              {item.snapshot.size}
                            </span>
                          </span>
                        )}
                        {item.snapshot?.color && (
                          <span className="flex items-center gap-1.5 px-2 py-1 bg-slate-50 rounded-md">
                            Color:{" "}
                            <span className="text-slate-900">
                              {item.snapshot.color}
                            </span>
                          </span>
                        )}
                        <span className="px-2 py-1 bg-indigo-50 text-indigo-600 rounded-md">
                          Qty: {item.quantity}
                        </span>
                      </div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-3">
                        Unit Price: ₹
                        {item.snapshot?.paidPrice?.toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Sidebar Details */}
            <div className="lg:col-span-5 space-y-8">
              <div className="bg-slate-50/50 rounded-2xl p-6 border border-slate-100">
                <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2 mb-4">
                  <MapPin size={14} className="text-indigo-600" />
                  Delivery Details
                </h4>
                <div className="space-y-1">
                  <p className="font-bold text-slate-900">
                    {order.shippingAddress?.fullName}
                  </p>
                  <p className="text-sm font-medium text-slate-600 leading-relaxed">
                    {order.shippingAddress?.street},{" "}
                    {order.shippingAddress?.city}
                    <br />
                    {order.shippingAddress?.state} {order.shippingAddress?.zip}
                    <br />
                    {order.shippingAddress?.country}
                  </p>
                  <p className="text-xs font-bold text-slate-500 mt-4 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-300"></span>
                    {order.shippingAddress?.phone}
                  </p>
                </div>
              </div>

              <div className="px-2">
                <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2 mb-4">
                  <CreditCard size={14} className="text-indigo-600" />
                  Price Breakdown
                </h4>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm font-medium">
                    <span className="text-slate-500">Subtotal</span>
                    <span className="text-slate-900 font-bold">
                      ₹{order.subtotal?.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm font-medium">
                    <span className="text-slate-500">Shipping</span>
                    <span className="text-slate-900 font-bold">
                      ₹{order.shippingFee?.toLocaleString()}
                    </span>
                  </div>
                  {order.discount > 0 && (
                    <div className="flex justify-between text-sm font-bold text-emerald-600">
                      <span>Discount</span>
                      <span>-₹{order.discount?.toLocaleString()}</span>
                    </div>
                  )}
                  <div className="pt-4 mt-2 border-t border-slate-100 flex justify-between items-end">
                    <span className="text-sm font-bold text-slate-900">
                      Order Total
                    </span>
                    <span className="text-2xl font-bold text-indigo-600">
                      ₹{order.grandTotal?.toLocaleString()}
                    </span>
                  </div>
                </div>

                <div className="mt-6 flex items-center gap-3 p-3 bg-white border border-slate-100 rounded-xl shadow-sm">
                  <div className="w-8 h-8 bg-indigo-50 rounded-lg flex items-center justify-center text-indigo-600">
                    <CreditCard size={16} />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                      Payment Method
                    </p>
                    <p className="text-xs font-bold text-slate-900">
                      {order.payment?.method} • {order.payment?.status}
                    </p>
                  </div>
                </div>
              </div>

              {["PLACED", "PAID"].includes(order.status) && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onCancel(order._id);
                  }}
                  className="w-full py-4 text-sm font-bold text-rose-600 bg-rose-50 border border-rose-100 rounded-xl hover:bg-rose-100 hover:text-rose-700 transition-all active:scale-[0.98]"
                >
                  Cancel Order
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const Orders = () => {
  const dispatch = useDispatch();
  const { orders, loading, error } = useSelector((state) => state.orders);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchUserOrders = async () => {
    dispatch(setLoading(true));
    try {
      const response = await apiRequest.get("/orders");
      dispatch(setOrders(response.data.data));
    } catch (err) {
      dispatch(
        setError(err.response?.data?.message || "Failed to fetch orders"),
      );
    }
  };

  const handleCancelOrder = async (orderId) => {
    if (!window.confirm("Are you sure you want to cancel this order?")) return;

    try {
      const response = await apiRequest.post(`/orders/${orderId}/cancel`, {
        reason: "Cancelled by user",
      });
      dispatch(updateOrder(response.data.data));
    } catch (err) {
      alert(err.response?.data?.message || "Failed to cancel order");
    }
  };

  useEffect(() => {
    fetchUserOrders();
  }, []);

  const filteredOrders = orders.filter(
    (order) =>
      order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.items?.some((item) =>
        item.snapshot?.productName
          .toLowerCase()
          .includes(searchTerm.toLowerCase()),
      ),
  );

  if (loading && orders.length === 0) {
    return (
      <div className="min-h-screen bg-[#fcfcfd] pt-24 pb-16 px-4">
        <div className="max-w-5xl mx-auto space-y-6">
          <div className="h-12 w-64 bg-slate-200 animate-pulse rounded-2xl"></div>
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-32 w-full bg-white border border-slate-100 animate-pulse rounded-2xl"
            ></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fcfcfd] pt-24 pb-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-12">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <span className="w-8 h-1 bg-indigo-600 rounded-full"></span>
              <span className="text-[11px] font-bold text-indigo-600 uppercase tracking-[0.2em]">
                Purchase History
              </span>
            </div>
            <h1 className="text-4xl font-bold text-slate-900 tracking-tight">
              My Orders
            </h1>
          </div>

          <div className="relative group w-full md:w-80">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
            <input
              type="text"
              placeholder="Order ID or product name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-4 bg-white border border-slate-200 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-600 outline-none transition-all text-slate-900 shadow-sm placeholder:text-slate-400 font-medium"
            />
          </div>
        </header>

        {error ? (
          <div className="flex flex-col items-center justify-center py-20 text-center bg-white rounded-2xl border border-slate-100 shadow-sm px-6">
            <div className="w-20 h-20 bg-rose-50 text-rose-500 rounded-2xl flex items-center justify-center mb-6">
              <XCircle className="w-10 h-10" />
            </div>
            <h3 className="text-xl font-bold text-slate-900">
              Order Loading Failed
            </h3>
            <p className="text-slate-500 mt-2 max-w-sm font-medium">{error}</p>
            <div className="flex gap-4 mt-8">
              <button
                onClick={fetchUserOrders}
                className="px-8 py-3 bg-indigo-600 text-white font-bold rounded-xl transition-all active:scale-95"
              >
                Try Again
              </button>
              <button
                onClick={() => dispatch(clearOrderError())}
                className="px-8 py-3 bg-slate-100 text-slate-600 font-bold rounded-xl transition-all hover:bg-slate-200"
              >
                Dismiss
              </button>
            </div>
          </div>
        ) : filteredOrders.length > 0 ? (
          <div className="space-y-2">
            {filteredOrders.map((order) => (
              <OrderCard
                key={order._id}
                order={order}
                onCancel={handleCancelOrder}
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-24 text-center bg-white rounded-3xl border border-slate-100 shadow-sm px-6">
            <div className="w-20 h-20 bg-slate-50 text-slate-300 rounded-3xl flex items-center justify-center mb-6 border border-slate-100">
              <ShoppingBag className="w-10 h-10" />
            </div>
            <h3 className="text-2xl font-bold text-slate-900">
              {searchTerm ? "No Matches Found" : "No Orders Yet"}
            </h3>
            <p className="text-slate-500 mt-2 font-medium max-w-xs mx-auto">
              {searchTerm
                ? `We couldn't find any orders matching "${searchTerm}".`
                : "Your purchase history is currently empty. Time to start shopping!"}
            </p>
            {!searchTerm ? (
              <Link
                to="/"
                className="mt-10 group flex items-center gap-2 px-10 py-4 bg-slate-900 text-white font-bold rounded-2xl hover:bg-indigo-600 transition-all active:scale-95 shadow-xl shadow-indigo-500/10"
              >
                Browse Shop
                <ArrowRight
                  size={18}
                  className="group-hover:translate-x-1 transition-transform"
                />
              </Link>
            ) : (
              <button
                onClick={() => setSearchTerm("")}
                className="mt-8 text-indigo-600 font-bold hover:underline underline-offset-4"
              >
                Clear search query
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Orders;
