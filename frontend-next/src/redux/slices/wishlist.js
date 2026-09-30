import { createSlice } from "@reduxjs/toolkit";

const initialState = { wishlist: [] };

const wishlistSlice = createSlice({
  name: "wishlist",
  initialState,
  reducers: {
    hydrate: (state, action) => {
      state.wishlist = action.payload;
    },
    addToWishlist: (state, action) => {
      const item = action.payload;
      const isItemExist = state.wishlist.find((i) => i._id === item._id);
      if (isItemExist) {
        state.wishlist = state.wishlist.map((i) => (i._id === isItemExist._id ? item : i));
      } else {
        state.wishlist.push(item);
      }
    },
    removeFromWishlist: (state, action) => {
      state.wishlist = state.wishlist.filter((i) => i._id !== action.payload);
    },
  },
});

export const { hydrate, addToWishlist, removeFromWishlist } = wishlistSlice.actions;
export default wishlistSlice.reducer;
