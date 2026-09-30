import { createSlice } from "@reduxjs/toolkit";

// Starts empty on both server and client first paint (no localStorage read
// here — that would break SSR). CartHydrator reads localStorage after mount
// and dispatches `hydrate`; persistence itself is centralized in one
// store.subscribe() next to it, instead of every thunk touching localStorage.
//
// Each cart item carries a `selected` flag — checkout buys only the selected
// items and leaves the rest in the cart. `buyNow` is a separate one-item slot
// for "Buy Now" from a product page: it skips the cart entirely, so checking
// out one product never disturbs what the customer already has in the cart.
// `hydrated` flips once storage has been read, so pages that depend on the
// cart (checkout) can tell "empty" apart from "not loaded yet".
const initialState = { cart: [], buyNow: null, hydrated: false };

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    hydrate: (state, action) => {
      state.cart = (action.payload || []).map((i) => ({ ...i, selected: i.selected !== false }));
    },
    hydrateBuyNow: (state, action) => {
      state.buyNow = action.payload || null;
    },
    markHydrated: (state) => {
      state.hydrated = true;
    },
    addToCart: (state, action) => {
      const item = action.payload;
      const existing = state.cart.find((i) => i._id === item._id);
      if (existing) {
        state.cart = state.cart.map((i) =>
          i._id === existing._id ? { ...item, selected: item.selected ?? i.selected } : i
        );
      } else {
        state.cart.push({ ...item, selected: item.selected ?? true });
      }
    },
    removeFromCart: (state, action) => {
      state.cart = state.cart.filter((i) => i._id !== action.payload);
    },
    removeManyFromCart: (state, action) => {
      const ids = new Set(action.payload);
      state.cart = state.cart.filter((i) => !ids.has(i._id));
    },
    toggleCartItem: (state, action) => {
      const item = state.cart.find((i) => i._id === action.payload);
      if (item) item.selected = !item.selected;
    },
    setAllCartSelected: (state, action) => {
      state.cart.forEach((i) => {
        i.selected = action.payload;
      });
    },
    setBuyNow: (state, action) => {
      state.buyNow = action.payload;
    },
    clearBuyNow: (state) => {
      state.buyNow = null;
    },
  },
});

// After an order is placed: drop only what was actually bought — the Buy Now
// item, or the checked-out cart items — and keep everything else in the cart.
// Storage is written directly too, because callers do a full-page navigation
// right after, before CartHydrator's persist effects would get to run.
export const completeCheckout = (orderData) => (dispatch, getState) => {
  if (orderData?.source === "buy-now") {
    dispatch(clearBuyNow());
    try {
      sessionStorage.removeItem("buyNowItem");
    } catch {}
  } else {
    dispatch(removeManyFromCart((orderData?.cart || []).map((i) => i._id)));
    try {
      localStorage.setItem("cartItems", JSON.stringify(getState().cart.cart));
    } catch {}
  }
  try {
    localStorage.removeItem("latestOrder");
  } catch {}
};

export const {
  hydrate,
  hydrateBuyNow,
  markHydrated,
  addToCart,
  removeFromCart,
  removeManyFromCart,
  toggleCartItem,
  setAllCartSelected,
  setBuyNow,
  clearBuyNow,
} = cartSlice.actions;
export default cartSlice.reducer;
