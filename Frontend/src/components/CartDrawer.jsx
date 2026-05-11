import {
  ArrowRight,
  Minus,
  Plus,
  ShoppingBag,
  Tag,
  X
} from "lucide-react";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router";
import {
  addToCart,
  closeCart,
  decreaseCart,
  getTotals,
  removeFromCart
} from "../features/cartSlice";

const CartDrawer = () => {
  const { cartItems, cartTotalAmount, cartTotalQuantity, isCartOpen, isLoading } =
    useSelector((state) => state.cart);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    dispatch(getTotals());
  }, [cartItems, dispatch]);

  const handleClose = () => {
    dispatch(closeCart());
  };

  if (!isCartOpen) return null;

  return (
    <>
      <div
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-60 transition-opacity duration-300"
        onClick={handleClose}
      />

      <div className="fixed top-0 right-0 h-full w-full max-w-md bg-white shadow-2xl z-70 transform transition-transform duration-300 flex flex-col animate-in slide-in-from-right">
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-white">
          <div className="flex items-center gap-3">
            <div className="bg-indigo-50 p-2 rounded-xl text-indigo-600">
              <ShoppingBag size={20} />
            </div>
            <h2 className="text-xl font-black text-slate-900">Your Cart</h2>
            <span className="bg-slate-100 text-slate-600 text-xs font-bold px-2 py-1 rounded-full">
              {cartTotalQuantity}
            </span>
          </div>
          <button
            onClick={handleClose}
            className="p-2 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-full transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 bg-slate-50/50">
          {cartItems.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center">
              <div className="w-20 h-20 bg-indigo-50 text-indigo-200 rounded-full flex items-center justify-center mb-4">
                <ShoppingBag size={40} />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">
                Cart is empty
              </h3>
            
              <button
                onClick={handleClose}
                className="px-6 py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-colors shadow-md shadow-indigo-200"
              >
                Start Shopping
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {cartItems.map((cartItem) => {
                const itemPrice = cartItem.selectedVariant
                  ? cartItem.selectedVariant.price
                  : cartItem.product.basePrice;
                const imgUrl =
                  cartItem.selectedVariant?.images?.[0] ||
                  cartItem.product.images?.[0];

                return (
                  <div
                    key={`${cartItem.product._id}-${cartItem.selectedVariant?._id || "base"}`}
                    className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex gap-4"
                  >
                    <div className="w-20 h-20 bg-slate-50 rounded-xl overflow-hidden shrink-0">
                      {imgUrl ? (
                        <img
                          src={imgUrl}
                          alt={cartItem.product.name}
                          className="w-full h-full object-cover mix-blend-multiply"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-300">
                          <ShoppingBag size={20} />
                        </div>
                      )}
                    </div>

                    <div className="flex-1 flex flex-col justify-between">
                      <div>
                        <div className="flex justify-between items-start gap-2 mb-1">
                          <h4 className="font-bold text-slate-900 text-sm line-clamp-1">
                            {cartItem.product.name}
                          </h4>
                          <button
                            onClick={() =>
                              dispatch(
                                removeFromCart({
                                  productId: cartItem.product._id,
                                  variantId: cartItem.selectedVariant?._id,
                                }),
                              )
                            }
                            className="text-slate-400 hover:text-rose-500 transition-colors"
                          >
                            <X size={16} />
                          </button>
                        </div>
                        {cartItem.selectedVariant && (
                          <div className="text-xs text-slate-500 font-medium mb-2 flex items-center gap-1">
                            <Tag size={10} />
                            {cartItem.selectedVariant.color} /{" "}
                            {cartItem.selectedVariant.size}
                          </div>
                        )}
                        <div className="flex flex-col">
                          {cartItem.flashSalePrice && (
                            <span className="text-[10px] text-slate-400 line-through font-bold">
                              ₹{itemPrice}
                            </span>
                          )}
                          <div className="text-sm font-black text-slate-900 flex items-center gap-2">
                            ₹{cartItem.flashSalePrice || itemPrice}
                            {cartItem.flashSalePrice && (
                              <span className="text-[10px] bg-rose-50 text-rose-600 px-1.5 py-0.5 rounded-md uppercase tracking-wider font-black">
                                Deal
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between mt-2">
                        <div className="flex items-center bg-slate-50 rounded-lg p-0.5 border border-slate-100">
                          <button
                            onClick={() =>
                              dispatch(
                                decreaseCart({
                                  productId: cartItem.product._id,
                                  variantId: cartItem.selectedVariant?._id,
                                }),
                              )
                            }
                            className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-white rounded-md transition-colors"
                          >
                            <Minus size={14} />
                          </button>
                          <span className="w-8 text-center font-bold text-slate-900 text-xs">
                            {cartItem.cartQuantity}
                          </span>
                          <button
                            onClick={() =>
                              dispatch(
                                addToCart({
                                  product: cartItem.product,
                                  selectedVariant: cartItem.selectedVariant,
                                  quantity: 1,
                                }),
                              )
                            }
                            className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-white rounded-md transition-colors"
                          >
                            <Plus size={14} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {cartItems.length > 0 && (
          <div className="p-6 bg-white border-t border-slate-100">
            <div className="space-y-3 mb-6 text-sm">
              <div className="flex justify-between text-slate-500 font-medium">
                <span>Subtotal</span>
                <span className="text-slate-900 font-bold">
                  ₹{cartTotalAmount}
                </span>
              </div>
              <div className="flex justify-between text-slate-500 font-medium">
                <span>Shipping</span>
                <span className="text-emerald-600 font-bold">Free</span>
              </div>
              <div className="pt-3 border-t border-slate-100 flex justify-between items-center">
                <span className="font-bold text-slate-900">Total</span>
                <span className="text-2xl font-black text-slate-900">
                  ₹{cartTotalAmount}
                </span>
              </div>
            </div>

            <div className="space-y-3">
              <button
                disabled={isLoading}
                onClick={() => {
                  handleClose();
                  navigate("/cart");
                }}
                className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-indigo-200 transition-all active:scale-[0.98]"
              >
                {isLoading ? "Processing..." : "Checkout (COD/Card)"}{" "}
                <ArrowRight size={18} />
              </button>
              <button
                onClick={() => {
                  handleClose();
                  navigate("/cart");
                }}
                className="w-full bg-slate-50 hover:bg-slate-100 text-slate-700 py-4 rounded-xl font-bold transition-all"
              >
                View Full Cart
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default CartDrawer;
