import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  products: [],
  currentProduct: null,
  loading: false,
  error: null,
  success: false,
};

const productSlice = createSlice({
  name: "products",
  initialState,
  reducers: {
    setProducts: (state, action) => {
      state.products = action.payload;
      state.loading = false;
      state.error = null;
    },
    setCurrentProduct: (state, action) => {
      state.currentProduct = action.payload;
      state.loading = false;
      state.error = null;
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
      state.loading = false;
      state.success = false;
    },
    setSuccess: (state, action) => {
      state.success = action.payload;
      state.loading = false;
    },
    clearError: (state) => {
      state.error = null;
    },
    clearSuccess: (state) => {
      state.success = false;
    },
    resetProductState: (state) => {
      state.currentProduct = null;
      state.loading = false;
      state.error = null;
      state.success = false;
    },
  },
});

export const {
  setProducts,
  setCurrentProduct,
  setLoading,
  setError,
  setSuccess,
  clearError,
  clearSuccess,
  resetProductState,
} = productSlice.actions;

export default productSlice.reducer;
