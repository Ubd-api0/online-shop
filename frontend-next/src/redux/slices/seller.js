import { createSlice } from "@reduxjs/toolkit";
import { loadUser } from "./user";

// The single store's config document, for the business owner. There is no
// separate request for it: it arrives with the session (GET /user/getuser)
// and is filled in here from loadUser — dispatch loadUser() to refresh it.
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
      .addCase(loadUser.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(loadUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.seller = action.payload.shop || undefined;
        state.isSeller = !!action.payload.shop;
      })
      .addCase(loadUser.rejected, (state) => {
        state.isLoading = false;
        state.seller = undefined;
        state.isSeller = false;
      });
  },
});

export const { clearErrors } = sellerSlice.actions;
export default sellerSlice.reducer;
