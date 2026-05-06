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
  MapPin,
  Phone,
  User,
  Truck,
  MessageSquare,
} from "lucide-react";
import {
  addToCart,
  decreaseCart,
  removeFromCart,
  clearCart,
  getTotals,
  checkout,
  createOrder,
} from "../features/cartSlice";
import { useNavigate } from "react-router";
import { toast } from "react-toastify";

const Cart = () => {
  const cart = useSelector((state) => state.cart);
  const { currentUser } = useSelector((state) => state.users);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [shippingAddress, setShippingAddress] = React.useState({
    fullName: currentUser?.name || "",
    phone: "",
    street: "",
    city: "",
    state: "",
    zip: "",
    country: "India",
  });

  const [paymentMethod, setPaymentMethod] = React.useState("COD");
  const [notes, setNotes] = React.useState("");

  const handleAddressChange = (e) => {
    const { name, value } = e.target;
    setShippingAddress((prev) => ({ ...prev, [name]: value }));
  };

  const handleOrderCreation = async () => {
    if (!currentUser) {
      toast.warn("Please login to place an order");
      return navigate("/login");
    }

    if (
      !shippingAddress.fullName ||
      !shippingAddress.phone ||
      !shippingAddress.street ||
      !shippingAddress.city ||
      !shippingAddress.zip
    ) {
      return toast.error("Please fill in all shipping details");
    }

    if (shippingAddress.phone.length < 10) {
      return toast.error("Please enter a valid 10-digit phone number");
    }

    const orderData = {
      items: cart.cartItems.map((item) => ({
        productId: item.product._id,
        variantId: item.selectedVariant?._id,
        quantity: item.cartQuantity,
        price: item.selectedVariant
          ? item.selectedVariant.price
          : item.product.basePrice,
      })),
      shippingAddress,
      paymentMethod,
      subtotal: cart.cartTotalAmount,
      discount: 0,
      tax: 0,
      shippingFee: 0,
      grandTotal: cart.cartTotalAmount,
      notes,
    };

    if (paymentMethod === "COD") {
      const result = await dispatch(createOrder(orderData));
      if (createOrder.fulfilled.match(result)) {
        navigate("/orders");
      }
    } else {
      // For CARD, we pass everything to checkout and handle order creation on success
      dispatch(checkout({ cartItems: cart.cartItems, orderData }));
    }
  };

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

            {/* Shipping Address Form */}
            <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-slate-100 transition-all hover:border-indigo-100">
              <div className="flex items-center gap-3 mb-6">
                <div className="bg-indigo-50 p-2 rounded-xl text-indigo-600">
                  <MapPin size={24} />
                </div>
                <h2 className="text-xl font-black text-slate-900">
                  Shipping Details
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                    <User size={14} className="text-slate-400" />
                    Full Name
                  </label>
                  <input
                    type="text"
                    name="fullName"
                    value={shippingAddress.fullName}
                    onChange={handleAddressChange}
                    placeholder="Enter your full name"
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none transition-all text-slate-900 font-medium"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                    <Phone size={14} className="text-slate-400" />
                    Phone Number
                  </label>
                  <input
                    type="text"
                    name="phone"
                    value={shippingAddress.phone}
                    onChange={handleAddressChange}
                    placeholder="Enter 10-digit number"
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none transition-all text-slate-900 font-medium"
                  />
                </div>
                <div className="md:col-span-2 space-y-2">
                  <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                    <Truck size={14} className="text-slate-400" />
                    Street Address
                  </label>
                  <input
                    type="text"
                    name="street"
                    value={shippingAddress.street}
                    onChange={handleAddressChange}
                    placeholder="House No, Building, Street, Area"
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none transition-all text-slate-900 font-medium"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700">
                    City
                  </label>
                  <input
                    type="text"
                    name="city"
                    value={shippingAddress.city}
                    onChange={handleAddressChange}
                    placeholder="City"
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none transition-all text-slate-900 font-medium"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700">
                    State
                  </label>
                  <input
                    type="text"
                    name="state"
                    value={shippingAddress.state}
                    onChange={handleAddressChange}
                    placeholder="State"
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none transition-all text-slate-900 font-medium"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700">
                    Zip Code
                  </label>
                  <input
                    type="text"
                    name="zip"
                    value={shippingAddress.zip}
                    onChange={handleAddressChange}
                    placeholder="6-digit ZIP code"
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none transition-all text-slate-900 font-medium"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700">
                    Country
                  </label>
                  <input
                    type="text"
                    name="country"
                    value={shippingAddress.country}
                    onChange={handleAddressChange}
                    placeholder="Country"
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none transition-all text-slate-900 font-medium"
                  />
                </div>
                <div className="md:col-span-2 space-y-2">
                  <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                    <MessageSquare size={14} className="text-slate-400" />
                    Delivery Notes (Optional)
                  </label>
                  <textarea
                    rows="2"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Handle with care, please deliver after 5 PM."
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none transition-all text-slate-900 font-medium resize-none"
                  />
                </div>
              </div>
            </div>
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

              <div className="space-y-4 mb-8">
                <h3 className="text-sm font-bold text-slate-700 mb-2">
                  Payment Method
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    onClick={() => setPaymentMethod("COD")}
                    className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
                      paymentMethod === "COD"
                        ? "border-indigo-600 bg-indigo-50 text-indigo-600"
                        : "border-slate-100 bg-slate-50 text-slate-400 hover:border-slate-200"
                    }`}
                  >
                    <Truck size={20} />
                    <span className="text-xs font-bold">COD</span>
                  </button>
                  <button
                    onClick={() => setPaymentMethod("CARD")}
                    className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
                      paymentMethod === "CARD"
                        ? "border-indigo-600 bg-indigo-50 text-indigo-600"
                        : "border-slate-100 bg-slate-50 text-slate-400 hover:border-slate-200"
                    }`}
                  >
                    <CreditCard size={20} />
                    <span className="text-xs font-bold">Card</span>
                  </button>
                </div>
              </div>

              <button
                disabled={cart.isLoading}
                onClick={handleOrderCreation}
                className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-indigo-200 transition-all active:scale-[0.98]"
              >
                {cart.isLoading ? (
                  "Processing..."
                ) : (
                  <>
                    <CreditCard size={20} />
                    {paymentMethod === "COD"
                      ? "Place Order (COD)"
                      : "Checkout Securely"}
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
