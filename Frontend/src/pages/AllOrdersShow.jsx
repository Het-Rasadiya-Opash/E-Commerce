import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  setLoading,
  setOrders,
  setError,
  setCurrentOrder,
  updateOrder,
} from "../features/orderSlice";
import apiRequest from "../utils/apiRequest";
import {
  Package,
  Search,
  Filter,
  Eye,
  MoreVertical,
  ChevronRight,
  Calendar,
  User,
  CreditCard,
  Truck,
  CheckCircle2,
  XCircle,
  Clock,
  RefreshCcw,
  Edit,
  X,
} from "lucide-react";
import { toast } from "react-toastify";

const AllOrdersShow = () => {
  const { orders, loading, error, currentOrder } = useSelector(
    (state) => state.orders,
  );
  const dispatch = useDispatch();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [showModal, setShowModal] = useState(false);
  const [orderStatus, setOrderStatus] = useState("");

  const fetchAllOrders = async () => {
    dispatch(setLoading(true));
    try {
      const res = await apiRequest.get("/orders/admin/all-orders");
      dispatch(setOrders(res.data.data.orders));
    } catch (err) {
      dispatch(
        setError(err.response?.data?.message || "Failed to fetch orders"),
      );
    } finally {
      dispatch(setLoading(false));
    }
  };

  const handleViewDetails = async (orderId) => {
    dispatch(setLoading(true));
    try {
      const res = await apiRequest.get(`/orders/${orderId}`);
      dispatch(setCurrentOrder(res.data.data));
      setShowModal(true);
    } catch (err) {
      dispatch(
        setError(
          err.response?.data?.message || "Failed to fetch order details",
        ),
      );
    } finally {
      dispatch(setLoading(false));
    }
  };

  const handleCancelOrder = async (orderId) => {
    if (
      !window.confirm(
        "Are you sure you want to cancel this order? This action cannot be undone.",
      )
    ) {
      return;
    }

    dispatch(setLoading(true));
    try {
      const res = await apiRequest.post(`/orders/${orderId}/cancel`, {
        reason: "Cancelled by admin from dashboard",
      });
      dispatch(updateOrder(res.data.data));
      toast.success("Order cancelled successfully");
    } catch (err) {
      const errorMsg = err.response?.data?.message || "Failed to cancel order";
      dispatch(setError(errorMsg));
      toast.error(errorMsg);
    } finally {
      dispatch(setLoading(false));
    }
  };

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      const res = await apiRequest.patch(`/orders/${orderId}/status`, {
        status: newStatus,
      });
      dispatch(updateOrder(res.data.data));
      toast.success("Order status updated successfully");
    } catch (err) {
      const errorMsg =
        err.response?.data?.message || "Failed to update order status";
      dispatch(setError(errorMsg));
      toast.error(errorMsg);
    }
  };

  useEffect(() => {
    fetchAllOrders();
  }, [dispatch]);

  const getStatusColor = (status) => {
    switch (status) {
      case "PLACED":
        return "bg-indigo-100 text-blue-700 border-blue-200";
      case "PAID":
        return "bg-indigo-100 text-indigo-700 border-indigo-200";
      case "PROCESSING":
        return "bg-amber-100 text-amber-700 border-amber-200";
      case "SHIPPED":
        return "bg-purple-100 text-purple-700 border-purple-200";
      case "OUT FOR DELIVERY":
        return "bg-orange-100 text-orange-700 border-orange-200";
      case "DELIVERED":
        return "bg-emerald-100 text-emerald-700 border-emerald-200";
      case "CANCELLED":
        return "bg-rose-100 text-rose-700 border-rose-200";
      case "REFUNDED":
        return "bg-slate-100 text-slate-700 border-slate-200";
      default:
        return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "PLACED":
        return <Clock size={14} />;
      case "PAID":
        return <CreditCard size={14} />;
      case "PROCESSING":
        return <RefreshCcw size={14} className="animate-spin-slow" />;
      case "SHIPPED":
        return <Package size={14} />;
      case "OUT FOR DELIVERY":
        return <Truck size={14} />;
      case "DELIVERED":
        return <CheckCircle2 size={14} />;
      case "CANCELLED":
        return <XCircle size={14} />;
      default:
        return null;
    }
  };

  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.shippingAddress.fullName
        .toLowerCase()
        .includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === "ALL" || order.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="min-h-screen bg-slate-50/50 p-4 md:p-8 animate-in fade-in duration-500">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">
              Order Management
            </h1>
            <p className="text-slate-500 text-sm md:text-base">
              Monitor and manage all customer orders from one central dashboard.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={fetchAllOrders}
              className="p-2.5 bg-white border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50 transition-colors shadow-sm"
              title="Refresh Orders"
            >
              <RefreshCcw size={20} className={loading ? "animate-spin" : ""} />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            {
              label: "Total Orders",
              value: orders.length,
              icon: Package,
              color: "text-indigo-600",
              bg: "bg-indigo-50",
            },
            {
              label: "Pending",
              value: orders.filter((o) =>
                ["PLACED", "PAID", "PROCESSING"].includes(o.status),
              ).length,
              icon: Clock,
              color: "text-amber-600",
              bg: "bg-amber-50",
            },
            {
              label: "Delivered",
              value: orders.filter((o) => o.status === "DELIVERED").length,
              icon: CheckCircle2,
              color: "text-emerald-600",
              bg: "bg-emerald-50",
            },
            {
              label: "Cancelled",
              value: orders.filter((o) => o.status === "CANCELLED").length,
              icon: XCircle,
              color: "text-rose-600",
              bg: "bg-rose-50",
            },
          ].map((stat, i) => (
            <div
              key={i}
              className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4"
            >
              <div className={`p-3 rounded-xl ${stat.bg} ${stat.color}`}>
                <stat.icon size={24} />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500">
                  {stat.label}
                </p>
                <p className="text-2xl font-bold text-slate-900">
                  {stat.value}
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              size={18}
            />
            <input
              type="text"
              placeholder="Search by order ID or customer name..."
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            <div className="relative">
              <Filter
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                size={18}
              />
              <select
                className="pl-10 pr-8 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-sm appearance-none cursor-pointer"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="ALL">All Statuses</option>
                <option value="PLACED">Placed</option>
                <option value="PAID">Paid</option>
                <option value="PROCESSING">Processing</option>
                <option value="SHIPPED">Shipped</option>
                <option value="OUT FOR DELIVERY">Out for Delivery</option>
                <option value="DELIVERED">Delivered</option>
                <option value="CANCELLED">Cancelled</option>
                <option value="REFUNDED">Refunded</option>
              </select>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-200">
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Order Details
                  </th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      <td colSpan="6" className="px-6 py-8">
                        <div className="h-4 bg-slate-100 rounded w-full"></div>
                      </td>
                    </tr>
                  ))
                ) : filteredOrders.length > 0 ? (
                  filteredOrders.map((order) => (
                    <tr
                      key={order._id}
                      className="hover:bg-slate-50/50 transition-colors group"
                    >
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500">
                            <Package size={20} />
                          </div>
                          <div>
                            <p className="font-semibold text-slate-900 leading-none mb-1">
                              {order.orderNumber}
                            </p>
                            <p className="text-xs text-slate-500">
                              {order.items.length}{" "}
                              {order.items.length === 1 ? "item" : "items"}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-slate-200 flex items-center justify-center text-xs font-bold text-slate-600">
                            {order.shippingAddress.fullName.charAt(0)}
                          </div>
                          <span className="text-sm font-medium text-slate-700">
                            {order.shippingAddress.fullName}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-2 text-sm text-slate-600">
                          <Calendar size={14} className="text-slate-400" />
                          {new Date(order.createdAt).toLocaleDateString(
                            "en-IN",
                            {
                              day: "2-digit",
                              month: "short",
                              year: "numeric",
                            },
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <p className="text-sm font-bold text-slate-900">
                          ₹{order.grandTotal.toLocaleString()}
                        </p>
                        <p className="text-[10px] text-slate-400 uppercase tracking-tighter font-bold">
                          {order.payment.method}
                        </p>
                      </td>
                      <td className="px-6 py-5">
                        <div className="relative inline-block group/status">
                          <select
                            className={`appearance-none pl-8 pr-8 py-1.5 rounded-full text-xs font-bold border transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-offset-1 shadow-sm hover:shadow-md ${getStatusColor(order.status)}`}
                            value={order.status}
                            onChange={(e) => handleStatusChange(order._id, e.target.value)}
                          >
                            <option value="PLACED" className="bg-white text-slate-900">PLACED</option>
                            <option value="PAID" className="bg-white text-slate-900">PAID</option>
                            <option value="PROCESSING" className="bg-white text-slate-900">PROCESSING</option>
                            <option value="SHIPPED" className="bg-white text-slate-900">SHIPPED</option>
                            <option value="OUT FOR DELIVERY" className="bg-white text-slate-900">OUT FOR DELIVERY</option>
                            <option value="DELIVERED" className="bg-white text-slate-900">DELIVERED</option>
                            <option value="CANCELLED" className="bg-white text-slate-900">CANCELLED</option>
                            <option value="REFUNDED" className="bg-white text-slate-900">REFUNDED</option>
                          </select>
                          <div className="absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none transition-transform group-hover/status:scale-110">
                            {getStatusIcon(order.status)}
                          </div>
                          <div className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none opacity-40 group-hover/status:opacity-100 transition-opacity">
                            <ChevronRight size={12} className="rotate-90" />
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5 text-right">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => handleViewDetails(order._id)}
                            className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
                            title="View Details"
                          >
                            <Eye size={18} />
                          </button>

                          <button
                            onClick={() => handleCancelOrder(order._id)}
                            className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
                          >
                            <X size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="px-6 py-20 text-center">
                      <div className="flex flex-col items-center gap-3">
                        <div className="p-4 bg-slate-50 rounded-full text-slate-300">
                          <Search size={48} />
                        </div>
                        <p className="text-slate-500 font-medium">
                          No orders found matching your criteria.
                        </p>
                        <button
                          onClick={() => {
                            setSearchTerm("");
                            setStatusFilter("ALL");
                          }}
                          className="text-sm text-indigo-600 font-semibold hover:underline"
                        >
                          Clear all filters
                        </button>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="px-6 py-4 border-t border-slate-200 flex items-center justify-between bg-slate-50/30">
            <p className="text-sm text-slate-500">
              Showing{" "}
              <span className="font-medium text-slate-900">
                {filteredOrders.length}
              </span>{" "}
              of{" "}
              <span className="font-medium text-slate-900">
                {orders.length}
              </span>{" "}
              orders
            </p>
            <div className="flex items-center gap-2">
              <button
                disabled
                className="px-3 py-1.5 text-sm font-medium text-slate-400 bg-white border border-slate-200 rounded-lg cursor-not-allowed"
              >
                Previous
              </button>
              <button
                disabled
                className="px-3 py-1.5 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors shadow-sm"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col animate-in zoom-in duration-300">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div>
                <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                  Order Details
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full border ${getStatusColor(currentOrder?.status)}`}
                  >
                    {currentOrder?.status}
                  </span>
                </h2>
                <p className="text-sm text-slate-500">
                  #{currentOrder?.orderNumber} •{" "}
                  {new Date(currentOrder?.createdAt).toLocaleString()}
                </p>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 hover:bg-slate-200 rounded-full transition-colors text-slate-400 hover:text-slate-600"
              >
                <XCircle size={24} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Customer Info */}
                <div className="space-y-4">
                  <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                    <User size={16} className="text-indigo-500" />
                    Customer Info
                  </h3>
                  <div className="bg-slate-50 p-4 rounded-2xl space-y-2">
                    <p className="text-sm font-semibold text-slate-900">
                      {currentOrder?.shippingAddress.fullName}
                    </p>
                    <p className="text-xs text-slate-600 flex items-center gap-2">
                      {currentOrder?.user?.email}
                    </p>
                    <p className="text-xs text-slate-600">
                      {currentOrder?.shippingAddress.phone}
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                    <Truck size={16} className="text-indigo-500" />
                    Shipping Address
                  </h3>
                  <div className="bg-slate-50 p-4 rounded-2xl space-y-1">
                    <p className="text-xs text-slate-600">
                      {currentOrder?.shippingAddress.addressLine1}
                    </p>
                    {currentOrder?.shippingAddress.addressLine2 && (
                      <p className="text-xs text-slate-600">
                        {currentOrder?.shippingAddress.addressLine2}
                      </p>
                    )}
                    <p className="text-xs text-slate-600">
                      {currentOrder?.shippingAddress.city},{" "}
                      {currentOrder?.shippingAddress.state} -{" "}
                      {currentOrder?.shippingAddress.pincode}
                    </p>
                    <p className="text-xs text-slate-600 font-medium mt-2">
                      {currentOrder?.shippingAddress.country}
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                    <CreditCard size={16} className="text-indigo-500" />
                    Payment Details
                  </h3>
                  <div className="bg-slate-50 p-4 rounded-2xl space-y-2">
                    <p className="text-xs text-slate-600 flex justify-between">
                      Method:{" "}
                      <span className="font-bold text-slate-900 uppercase">
                        {currentOrder?.payment.method}
                      </span>
                    </p>
                    <p className="text-xs text-slate-600 flex justify-between">
                      Status:{" "}
                      <span className="font-bold text-indigo-600">
                        {currentOrder?.payment.status}
                      </span>
                    </p>
                    {currentOrder?.payment.transactionId && (
                      <p className="text-[10px] text-slate-400 break-all mt-2">
                        TXN: {currentOrder?.payment.transactionId}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                  <Package size={16} className="text-indigo-500" />
                  Order Items ({currentOrder?.items.length})
                </h3>
                <div className="border border-slate-100 rounded-2xl overflow-hidden">
                  <table className="w-full text-left">
                    <thead className="bg-slate-50 text-[10px] font-bold text-slate-500 uppercase">
                      <tr>
                        <th className="px-4 py-3">Product</th>
                        <th className="px-4 py-3 text-center">Qty</th>
                        <th className="px-4 py-3 text-right">Price</th>
                        <th className="px-4 py-3 text-right">Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {currentOrder?.items.map((item, idx) => (
                        <tr key={idx} className="text-sm">
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-3">
                              <img
                                src={item.snapshot.image}
                                alt={item.snapshot.productName}
                                className="w-12 h-12 rounded-lg object-cover bg-slate-50"
                              />
                              <div>
                                <p className="font-semibold text-slate-900 line-clamp-1">
                                  {item.snapshot.productName}
                                </p>
                                <p className="text-[10px] text-slate-500">
                                  {item.snapshot.color} • {item.snapshot.size} •{" "}
                                  {item.snapshot.sku}
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-center text-slate-600 font-medium">
                            {item.quantity}
                          </td>
                          <td className="px-4 py-3 text-right text-slate-600">
                            ₹{item.snapshot.paidPrice.toLocaleString()}
                          </td>
                          <td className="px-4 py-3 text-right font-bold text-slate-900">
                            ₹{item.lineTotal.toLocaleString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            <div className="px-8 py-6 bg-slate-50 border-t border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex-1">
                {currentOrder?.notes && (
                  <div className="text-xs text-slate-500 max-w-md">
                    <span className="font-bold uppercase text-[10px]">
                      Notes:
                    </span>{" "}
                    {currentOrder?.notes}
                  </div>
                )}
              </div>
              <div className="w-full md:w-64 space-y-2">
                <div className="flex justify-between text-sm text-slate-600">
                  <span>Subtotal</span>
                  <span>₹{currentOrder?.subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm text-slate-600">
                  <span>Tax</span>
                  <span>₹{currentOrder?.tax.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm text-slate-600">
                  <span>Shipping</span>
                  <span>₹{currentOrder?.shippingFee.toLocaleString()}</span>
                </div>
                {currentOrder?.discount > 0 && (
                  <div className="flex justify-between text-sm text-rose-600">
                    <span>Discount</span>
                    <span>-₹{currentOrder?.discount.toLocaleString()}</span>
                  </div>
                )}
                <div className="flex justify-between text-lg font-bold text-slate-900 pt-2 border-t border-slate-200">
                  <span>Grand Total</span>
                  <span className="text-indigo-600">
                    ₹{currentOrder?.grandTotal.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AllOrdersShow;
