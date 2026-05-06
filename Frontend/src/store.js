import { configureStore } from "@reduxjs/toolkit";
import usersReducer from "./features/usersSlice";
import productReducer from "./features/productSlice";
import cartReducer from "./features/cartSlice";
import orderReducer from "./features/orderSlice";

export const store = configureStore({
  reducer: {
    users: usersReducer,
    products: productReducer,
    cart: cartReducer,
    orders: orderReducer,
  },
});
