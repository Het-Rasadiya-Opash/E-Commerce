import React, { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Link } from "react-router";
import {
  ArrowLeft,
  Minus,
  Plus,
  Trash2,
  ShoppingBag,
  CreditCard,
  Tag,
} from "lucide-react";
import {
  addToCart,
  decreaseCart,
  removeFromCart,
  clearCart,
  getTotals,
  checkout,
} from "../features/cartSlice";

const Cart = () => {
  const cart = useSelector((state) => state.cart);
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(getTotals());
  }, [cart, dispatch]);

  const handleRemoveFromCart = (cartItem) => {
    dispatch(
      removeFromCart({
        productId: cartItem.product._id,
        variantId: cartItem.selectedVariant?._id,
      }),
    );
  };

  const handleDecreaseCart = (cartItem) => {
    dispatch(
      decreaseCart({
        productId: cartItem.product._id,
        variantId: cartItem.selectedVariant?._id,
      }),
    );
  };

  const handleIncreaseCart = (cartItem) => {
    dispatch(
      addToCart({
        product: cartItem.product,
        selectedVariant: cartItem.selectedVariant,
        quantity: 1,
      }),
    );
  };

  const handleClearCart = () => {
    dispatch(clearCart());
  };

  if (cart.cartItems.length === 0) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center px-4 bg-slate-50/50">
        <div className="w-24 h-24 bg-indigo-50 text-indigo-200 rounded-full flex items-center justify-center mb-6">
          <ShoppingBag size={48} />
        </div>
        <h2 className="text-3xl font-black text-slate-900 mb-4">
          Your cart is empty
        </h2>

        <Link
          to="/"
          className="flex items-center gap-2 px-8 py-4 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200 active:scale-95"
        >
          <ArrowLeft size={20} />
          Start Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/50 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-black text-slate-900">Shopping Cart</h1>
          <button
            onClick={handleClearCart}
            className="text-sm font-bold text-rose-500 hover:text-rose-600 flex items-center gap-1 bg-rose-50 px-4 py-2 rounded-lg transition-colors"
          >
            <Trash2 size={16} />
            <span class="hidden lg:block">Clear Cart</span>
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            {cart.cartItems.map((cartItem) => {
              const itemPrice = cartItem.selectedVariant
                ? cartItem.selectedVariant.price
                : cartItem.product.basePrice;
              const imgUrl =
                cartItem.selectedVariant?.images?.[0] ||
                cartItem.product.images?.[0];

              return (
                <div
                  key={`${cartItem.product._id}-${cartItem.selectedVariant?._id || "base"}`}
                  className="bg-white p-4 sm:p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col sm:flex-row gap-6 transition-all hover:border-indigo-100"
                >
                  <div className="w-full sm:w-32 aspect-square bg-slate-50 rounded-xl overflow-hidden flex-shrink-0">
                    {imgUrl ? (
                      <img
                        src={imgUrl}
                        alt={cartItem.product.name}
                        className="w-full h-full object-cover mix-blend-multiply"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-300">
                        <ShoppingBag size={32} />
                      </div>
                    )}
                  </div>

                  <div className="flex-1 flex flex-col">
                    <div className="flex justify-between items-start gap-4 mb-2">
                      <Link
                        to={`/product/${cartItem.product._id}`}
                        className="text-lg font-bold text-slate-900 hover:text-indigo-600 transition-colors line-clamp-2"
                      >
                        {cartItem.product.name}
                      </Link>
                      <span className="text-xl font-black text-slate-900">
                        ₹{itemPrice * cartItem.cartQuantity}
                      </span>
                    </div>

                    {(cartItem.selectedVariant || cartItem.product.brand) && (
                      <div className="flex flex-wrap gap-2 mb-4">
                        {cartItem.product.brand && (
                          <span className="px-2.5 py-1 bg-slate-100 text-slate-600 text-xs font-bold rounded-md">
                            {cartItem.product.brand}
                          </span>
                        )}
                        {cartItem.selectedVariant && (
                          <span className="px-2.5 py-1 bg-indigo-50 text-indigo-600 text-xs font-bold rounded-md flex items-center gap-1">
                            <Tag size={12} />
                            {cartItem.selectedVariant.color} /{" "}
                            {cartItem.selectedVariant.size}
                          </span>
                        )}
                      </div>
                    )}

                    <div className="mt-auto flex items-center justify-between pt-4 border-t border-slate-50">
                      <div className="flex items-center bg-slate-50 rounded-xl p-1">
                        <button
                          onClick={() => handleDecreaseCart(cartItem)}
                          className="p-2 text-slate-500 hover:text-slate-900 hover:bg-white rounded-lg transition-all"
                        >
                          <Minus size={16} />
                        </button>
                        <span className="w-10 text-center font-bold text-slate-900 text-sm">
                          {cartItem.cartQuantity}
                        </span>
                        <button
                          onClick={() => handleIncreaseCart(cartItem)}
                          className="p-2 text-slate-500 hover:text-slate-900 hover:bg-white rounded-lg transition-all"
                        >
                          <Plus size={16} />
                        </button>
                      </div>

                      <button
                        onClick={() => handleRemoveFromCart(cartItem)}
                        className="p-2 text-slate-400 hover:text-rose-500 transition-colors rounded-lg hover:bg-rose-50"
                      >
                        <Trash2 size={20} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="lg:col-span-1">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 sticky top-28">
              <h2 className="text-xl font-black text-slate-900 mb-6">
                Order Summary
              </h2>

              <div className="space-y-4 text-sm font-medium text-slate-600 mb-6">
                <div className="flex justify-between">
                  <span>Subtotal ({cart.cartTotalQuantity} items)</span>
                  <span className="font-bold text-slate-900">
                    ₹{cart.cartTotalAmount}
                  </span>
                </div>
                <div className="flex justify-between text-emerald-600">
                  <span>Discount</span>
                  <span>-₹0</span>
                </div>
                <div className="flex justify-between">
                  <span>Delivery</span>
                  <span className="text-emerald-600">Free</span>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 mb-8">
                <div className="flex justify-between items-end">
                  <span className="text-base font-bold text-slate-900">
                    Total
                  </span>
                  <span className="text-3xl font-black text-slate-900">
                    ₹{cart.cartTotalAmount}
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-2">
                  Including all taxes
                </p>
              </div>

              <button
                disabled={cart.isLoading}
                onClick={() => dispatch(checkout(cart.cartItems))}
                className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-indigo-200 transition-all active:scale-[0.98]"
              >
                {cart.isLoading ? (
                  "Processing..."
                ) : (
                  <>
                    <CreditCard size={20} />
                    Checkout Securely
                  </>
                )}
              </button>

              <div className="mt-6 flex items-center justify-center gap-2 text-sm text-slate-500">
                <ArrowLeft size={16} />
                <Link
                  to="/"
                  className="font-bold hover:text-indigo-600 transition-colors"
                >
                  Continue Shopping
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
