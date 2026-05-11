import {
  ArrowRight,
  CheckCircle2,
  Loader2,
  ShoppingBag,
  XCircle,
} from "lucide-react";
import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { Link, useSearchParams } from "react-router";
import { clearCart, verifyPayment } from "../features/cartSlice";

const Success = () => {
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const dispatch = useDispatch();
  const [status, setStatus] = useState("loading");
  const [order, setOrder] = useState(null);

  const verified = React.useRef(false);

  useEffect(() => {
    const handlePaymentSuccess = async () => {
      if (!sessionId || verified.current) {
        return;
      }

      verified.current = true;

      try {
        const result = await dispatch(verifyPayment(sessionId));
        if (verifyPayment.fulfilled.match(result)) {
          setOrder(result.payload.data);
          dispatch(clearCart());
          setStatus("success");
        } else {
          setStatus("error");
        }
      } catch (err) {
        setStatus("error");
      }
    };

    handlePaymentSuccess();
  }, [sessionId, dispatch]);

  if (status === "loading") {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center px-4 bg-slate-50/50">
        <div className="w-20 h-20 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center mb-6 animate-pulse">
          <Loader2 size={40} className="animate-spin" />
        </div>
        <h2 className="text-2xl font-black text-slate-900 mb-2">
          Verifying Payment...
        </h2>
        <p className="text-slate-500 font-medium">
          Please do not close this window.
        </p>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center px-4 bg-slate-50/50 text-center">
        <div className="w-20 h-20 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center mb-6">
          <XCircle size={40} />
        </div>
        <h2 className="text-3xl font-black text-slate-900 mb-4">
          Payment Verification Failed
        </h2>
        <p className="text-slate-500 font-medium mb-8 max-w-md">
          We couldn't verify your payment. If the amount was deducted, please
          contact support with your session ID: <br />
          <span className="font-mono text-xs bg-slate-200 px-2 py-1 rounded mt-2 inline-block">
            {sessionId}
          </span>
        </p>
        <Link
          to="/cart"
          className="flex items-center gap-2 px-8 py-4 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200"
        >
          Return to Cart
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/50 py-12 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="bg-emerald-500 p-12 text-center text-white">
            <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 size={48} />
            </div>
            <h1 className="text-4xl font-black mb-2">Order Confirmed!</h1>
            <p className="text-emerald-50 text-lg font-medium">
              Thank you for your purchase. Your order has been placed
              successfully.
            </p>
          </div>

          <div className="p-8 sm:p-12">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8 pb-8 border-b border-slate-100">
              <div>
                <p className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Order Number
                </p>
                <p className="text-xl font-black text-slate-900">
                  #{order?.orderNumber || "ORD-00000"}
                </p>
              </div>
              <div className="text-left sm:text-right">
                <p className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Payment Status
                </p>
                <span className="px-3 py-1 bg-emerald-100 text-emerald-600 rounded-full text-xs font-black">
                  PAID
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-12">
              <div>
                <h3 className="text-lg font-black text-slate-900 mb-4 flex items-center gap-2">
                  <ShoppingBag size={20} className="text-indigo-600" />
                  Order Summary
                </h3>
                <div className="space-y-4">
                  {order?.items?.map((item, idx) => (
                    <div key={idx} className="flex gap-4">
                      <div className="w-16 h-16 bg-slate-50 rounded-xl overflow-hidden shrink-0">
                        <img
                          src={item.snapshot.image}
                          alt={item.snapshot.productName}
                          className="w-full h-full object-cover mix-blend-multiply"
                        />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-bold text-slate-900 line-clamp-1">
                          {item.snapshot.productName}
                        </p>
                        <p className="text-xs text-slate-500 font-medium">
                          Qty: {item.quantity} × ₹{item.snapshot.paidPrice}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-6 pt-6 border-t border-slate-100">
                  <div className="flex justify-between text-lg font-black text-slate-900">
                    <span>Total Paid</span>
                    <span>₹{order?.grandTotal}</span>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-black text-slate-900 mb-4">
                  Shipping Details
                </h3>
                <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
                  <p className="font-bold text-slate-900 mb-1">
                    {order?.shippingAddress.fullName}
                  </p>
                  <p className="text-sm text-slate-600 mb-1">
                    {order?.shippingAddress.street}
                  </p>
                  <p className="text-sm text-slate-600 mb-1">
                    {order?.shippingAddress.city},{" "}
                    {order?.shippingAddress.state} {order?.shippingAddress.zip}
                  </p>
                  <p className="text-sm text-slate-600 mb-4">
                    {order?.shippingAddress.country}
                  </p>
                  <p className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <span className="text-slate-400">Phone:</span>
                    {order?.shippingAddress.phone}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                to="/orders"
                className="flex-1 flex items-center justify-center gap-2 px-8 py-4 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200 active:scale-95"
              >
                View My Orders
                <ArrowRight size={20} />
              </Link>
              <Link
                to="/"
                className="flex-1 flex items-center justify-center gap-2 px-8 py-4 bg-white text-slate-700 border border-slate-200 rounded-xl font-bold hover:bg-slate-50 transition-all active:scale-95"
              >
                Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Success;
