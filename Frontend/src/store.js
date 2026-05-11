import { configureStore } from "@reduxjs/toolkit";
import cartReducer from "./features/cartSlice";
import orderReducer from "./features/orderSlice";
import productReducer from "./features/productSlice";
import usersReducer from "./features/usersSlice";

export const store = configureStore({
  reducer: {
    users: usersReducer,
    products: productReducer,
    cart: cartReducer,
    orders: orderReducer,
  },
});
