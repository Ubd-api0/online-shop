import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "@/lib/axios";

// Holds the single store's config document (loaded for the business owner).
export const loadSeller = createAsyncThunk("seller/load", async (_, { rejectWithValue }) => {
  try {
    const { data } = await api.get("/shop/getSeller");
    return data.seller;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || "Not a business owner");
  }
});

const sellerSlice = createSlice({
  name: "seller",
  initialState: { isLoading: true },
  reducers: {
    clearErrors: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loadSeller.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(loadSeller.fulfilled, (state, action) => {
        state.isSeller = true;
        state.isLoading = false;
        state.seller = action.payload;
      })
      .addCase(loadSeller.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
        state.isSeller = false;
      });
  },
});

export const { clearErrors } = sellerSlice.actions;
export default sellerSlice.reducer;
