import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  cartItems: localStorage.getItem("cartItems")
    ? JSON.parse(localStorage.getItem("cartItems"))
    : [],
  cartTotalQuantity: 0,
  cartTotalAmount: 0,
  isCartOpen: false,
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
      } else {
        const tempProduct = {
          product,
          selectedVariant,
          cartQuantity: quantity,
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
          const itemTotal =
            (selectedVariant ? selectedVariant.price : product.basePrice) *
            cartQuantity;

          cartTotal.total += itemTotal;
          cartTotal.quantity += cartQuantity;

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
});

export const { addToCart, removeFromCart, decreaseCart, clearCart, getTotals, openCart, closeCart, toggleCart } =
  cartSlice.actions;

export default cartSlice.reducer;
