import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "@/lib/axios";

export const createProduct = createAsyncThunk(
  "products/create",
  async (newForm, { rejectWithValue }) => {
    try {
      const { data } = await api.post("/product/create-product", newForm, {
        headers: { "Content-Type": "application/json" },
      });
      return data.product;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message);
    }
  }
);

export const getAllProductsShop = createAsyncThunk(
  "products/getAllShop",
  async (id, { rejectWithValue }) => {
    try {
      const { data } = await api.get(`/product/get-all-products-shop/${id}`);
      return data.products;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message);
    }
  }
);

export const deleteProduct = createAsyncThunk(
  "products/delete",
  async (id, { rejectWithValue }) => {
    try {
      const { data } = await api.delete(`/product/delete-shop-product/${id}`);
      return data.message;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message);
    }
  }
);

export const getAllProducts = createAsyncThunk(
  "products/getAll",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await api.get("/product/get-all-products");
      return data.products;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message);
    }
  }
);

const productSlice = createSlice({
  name: "products",
  initialState: { isLoading: true },
  reducers: {
    clearErrors: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(createProduct.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(createProduct.fulfilled, (state, action) => {
        state.isLoading = false;
        state.product = action.payload;
        state.success = true;
      })
      .addCase(createProduct.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
        state.success = false;
      })
      .addCase(getAllProductsShop.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getAllProductsShop.fulfilled, (state, action) => {
        state.isLoading = false;
        state.products = action.payload;
      })
      .addCase(getAllProductsShop.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(deleteProduct.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(deleteProduct.fulfilled, (state, action) => {
        state.isLoading = false;
        state.message = action.payload;
      })
      .addCase(deleteProduct.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(getAllProducts.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getAllProducts.fulfilled, (state, action) => {
        state.isLoading = false;
        state.allProducts = action.payload;
      })
      .addCase(getAllProducts.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  },
});

export const { clearErrors } = productSlice.actions;
export default productSlice.reducer;
