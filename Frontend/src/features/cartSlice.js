import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { toast } from "react-toastify";
import apiRequest from "../utils/apiRequest";

export const createOrder = createAsyncThunk(
  "cart/createOrder",
  async (orderData, { rejectWithValue, dispatch }) => {
    try {
      const response = await apiRequest.post("/orders/create", orderData);
      toast.success("Order placed successfully!");
      dispatch(clearCart());
      return response.data;
    } catch (error) {
      const message =
        error.response?.data?.message ||
        error.message ||
        "Failed to place order";
      toast.error(message);
      return rejectWithValue(message);
    }
  },
);

export const checkout = createAsyncThunk(
  "cart/checkout",
  async ({ cartItems, orderData }, { rejectWithValue }) => {
    try {
      const response = await apiRequest.post(
        "/payment/create-checkout-session",
        {
          products: cartItems,
          orderData,
        },
      );

      const sessionUrl = response.data?.data?.url;

      if (sessionUrl) {
        window.location.href = sessionUrl;
      } else {
        throw new Error("Stripe session URL not found");
      }

      return response.data;
    } catch (error) {
      const message =
        error.response?.data?.message || error.message || "Checkout failed";
      toast.error(message);
      return rejectWithValue(message);
    }
  },
);

export const verifyPayment = createAsyncThunk(
  "cart/verifyPayment",
  async (sessionId, { rejectWithValue }) => {
    try {
      const response = await apiRequest.post("/payment/verify-session", {
        sessionId,
      });
      return response.data;
    } catch (error) {
      const message =
        error.response?.data?.message ||
        error.message ||
        "Payment verification failed";
      toast.error(message);
      return rejectWithValue(message);
    }
  },
);

const initialState = {
  cartItems: localStorage.getItem("cartItems")
    ? JSON.parse(localStorage.getItem("cartItems"))
    : [],
  cartTotalQuantity: 0,
  cartTotalAmount: 0,
  isCartOpen: false,
  isLoading: false,
};

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    addToCart(state, action) {
      const { product, selectedVariant, quantity } = action.payload;

      const itemIndex = state.cartItems.findIndex(
        (item) =>
          item.product._id === product._id &&
          item.selectedVariant?._id === selectedVariant?._id,
      );

      if (itemIndex >= 0) {
        state.cartItems[itemIndex].cartQuantity += quantity;
        if (action.payload.flashSalePrice) {
          state.cartItems[itemIndex].flashSalePrice = action.payload.flashSalePrice;
        }
      } else {
        const tempProduct = {
          product,
          selectedVariant,
          cartQuantity: quantity,
          flashSalePrice: action.payload.flashSalePrice || null,
          flashSaleId: action.payload.flashSaleId || null,
        };
        state.cartItems.push(tempProduct);
      }

      localStorage.setItem("cartItems", JSON.stringify(state.cartItems));
    },
    removeFromCart(state, action) {
      const { productId, variantId } = action.payload;

      const nextCartItems = state.cartItems.filter(
        (item) =>
          !(
            item.product._id === productId &&
            item.selectedVariant?._id === variantId
          ),
      );

      state.cartItems = nextCartItems;
      localStorage.setItem("cartItems", JSON.stringify(state.cartItems));
    },
    decreaseCart(state, action) {
      const { productId, variantId } = action.payload;

      const itemIndex = state.cartItems.findIndex(
        (item) =>
          item.product._id === productId &&
          item.selectedVariant?._id === variantId,
      );

      if (state.cartItems[itemIndex].cartQuantity > 1) {
        state.cartItems[itemIndex].cartQuantity -= 1;
      } else if (state.cartItems[itemIndex].cartQuantity === 1) {
        const nextCartItems = state.cartItems.filter(
          (item) =>
            !(
              item.product._id === productId &&
              item.selectedVariant?._id === variantId
            ),
        );

        state.cartItems = nextCartItems;
      }
      localStorage.setItem("cartItems", JSON.stringify(state.cartItems));
    },
    clearCart(state, action) {
      state.cartItems = [];
      localStorage.setItem("cartItems", JSON.stringify(state.cartItems));
    },
    getTotals(state, action) {
      let { total, quantity } = state.cartItems.reduce(
        (cartTotal, cartItem) => {
          const { product, selectedVariant, cartQuantity } = cartItem;
          const basePrice = Number(selectedVariant ? selectedVariant.price : product.basePrice) || 0;
          const priceToUse = Number(cartItem.flashSalePrice || basePrice) || 0;
          const quantity = Number(cartQuantity) || 0;
          const itemTotal = priceToUse * quantity;

          cartTotal.total += itemTotal;
          cartTotal.quantity += quantity;

          return cartTotal;
        },
        {
          total: 0,
          quantity: 0,
        },
      );

      state.cartTotalQuantity = quantity;
      state.cartTotalAmount = total;
    },
    openCart(state) {
      state.isCartOpen = true;
    },
    closeCart(state) {
      state.isCartOpen = false;
    },
    toggleCart(state) {
      state.isCartOpen = !state.isCartOpen;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(checkout.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(checkout.fulfilled, (state) => {
        state.isLoading = false;
      })
      .addCase(checkout.rejected, (state) => {
        state.isLoading = false;
      })
      .addCase(createOrder.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(createOrder.fulfilled, (state) => {
        state.isLoading = false;
      })
      .addCase(createOrder.rejected, (state) => {
        state.isLoading = false;
      })
      .addCase(verifyPayment.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(verifyPayment.fulfilled, (state) => {
        state.isLoading = false;
      })
      .addCase(verifyPayment.rejected, (state) => {
        state.isLoading = false;
      });
  },
});

export const {
  addToCart,
  removeFromCart,
  decreaseCart,
  clearCart,
  getTotals,
  openCart,
  closeCart,
  toggleCart,
} = cartSlice.actions;

export default cartSlice.reducer;
