import { createSlice } from "@reduxjs/toolkit";

// Starts empty on both server and client first paint (no localStorage read
// here — that would break SSR). CartHydrator reads localStorage after mount
// and dispatches `hydrate`; persistence itself is centralized in one
// store.subscribe() next to it, instead of every thunk touching localStorage.
const initialState = { cart: [] };

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    hydrate: (state, action) => {
      state.cart = action.payload;
    },
    addToCart: (state, action) => {
      const item = action.payload;
      const isItemExist = state.cart.find((i) => i._id === item._id);
      if (isItemExist) {
        state.cart = state.cart.map((i) => (i._id === isItemExist._id ? item : i));
      } else {
        state.cart.push(item);
      }
    },
    removeFromCart: (state, action) => {
      state.cart = state.cart.filter((i) => i._id !== action.payload);
    },
  },
});

export const { hydrate, addToCart, removeFromCart } = cartSlice.actions;
export default cartSlice.reducer;
