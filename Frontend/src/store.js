import { configureStore } from "@reduxjs/toolkit";
import usersReducer from "./features/usersSlice";
import productReducer from "./features/productSlice";
import cartReducer from "./features/cartSlice";

export const store = configureStore({
  reducer: {
    users: usersReducer,
    products: productReducer,
    cart: cartReducer,
  },
});
