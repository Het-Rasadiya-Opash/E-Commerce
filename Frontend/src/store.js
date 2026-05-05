import { configureStore } from "@reduxjs/toolkit";
import usersReducer from "./features/usersSlice";
import productReducer from "./features/productSlice";

export const store = configureStore({
  reducer: {
    users: usersReducer,
    products: productReducer,
  },
});
