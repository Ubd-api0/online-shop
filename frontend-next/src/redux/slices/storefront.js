import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "@/lib/axios";

// Public storefront content: categories + hero + feature tiles + store info.
export const getStorefront = createAsyncThunk(
  "storefront/get",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await api.get("/shop/storefront");
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Could not load storefront");
    }
  }
);

// ---- owner category CRUD (re-fetches storefront on success) ----
export const createCategory = createAsyncThunk(
  "storefront/createCategory",
  async (payload, { dispatch }) => {
    await api.post("/category/create", payload);
    dispatch(getStorefront());
  }
);

export const updateCategory = createAsyncThunk(
  "storefront/updateCategory",
  async ({ id, payload }, { dispatch }) => {
    await api.put(`/category/update/${id}`, payload);
    dispatch(getStorefront());
  }
);

export const deleteCategory = createAsyncThunk(
  "storefront/deleteCategory",
  async (id, { dispatch }) => {
    await api.delete(`/category/delete/${id}`);
    dispatch(getStorefront());
  }
);

export const updateStorefront = createAsyncThunk(
  "storefront/update",
  async (payload, { dispatch }) => {
    await api.put("/shop/update-storefront", payload);
    dispatch(getStorefront());
  }
);

const storefrontSlice = createSlice({
  name: "storefront",
  initialState: {
    loading: true,
    categories: [],
    featureTiles: [],
    hero: {},
    storeName: "",
    storeDescription: "",
    storePhone: "",
    storeAddress: "",
    storeEmail: "",
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(getStorefront.pending, (state) => {
        state.loading = true;
      })
      .addCase(getStorefront.fulfilled, (state, action) => {
        state.loading = false;
        state.categories = action.payload.categories || [];
        state.featureTiles = action.payload.featureTiles || [];
        state.hero = action.payload.hero || {};
        state.storeName = action.payload.name || "";
        state.storeDescription = action.payload.description || "";
        state.storePhone = action.payload.phoneNumber || "";
        state.storeAddress = action.payload.address || "";
        state.storeEmail = action.payload.email || "";
      })
      .addCase(getStorefront.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default storefrontSlice.reducer;
