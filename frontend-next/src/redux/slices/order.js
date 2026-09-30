import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "@/lib/axios";

export const getAllOrdersOfUser = createAsyncThunk(
  "order/getAllOfUser",
  async (userId, { rejectWithValue }) => {
    try {
      const { data } = await api.get(`/order/get-all-orders/${userId}`);
      return data.orders;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message);
    }
  }
);

export const getAllOrdersOfShop = createAsyncThunk(
  "order/getAllOfShop",
  async (shopId, { rejectWithValue }) => {
    try {
      const { data } = await api.get(`/order/get-seller-all-orders/${shopId}`);
      return data.orders;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message);
    }
  }
);

const orderSlice = createSlice({
  name: "order",
  initialState: { isLoading: true },
  reducers: {
    clearErrors: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getAllOrdersOfUser.pending, (state) => {
        state.isLoading = false;
      })
      .addCase(getAllOrdersOfUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.orders = action.payload;
      })
      .addCase(getAllOrdersOfUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(getAllOrdersOfShop.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getAllOrdersOfShop.fulfilled, (state, action) => {
        state.isLoading = false;
        state.orders = action.payload;
      })
      .addCase(getAllOrdersOfShop.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  },
});

export const { clearErrors } = orderSlice.actions;
export default orderSlice.reducer;
