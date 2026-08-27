import { createReducer } from "@reduxjs/toolkit";

const initialState = {
  loading: true,
  categories: [],
  featureTiles: [],
  hero: {},
  storeName: "",
  storeDescription: "",
};

export const storefrontReducer = createReducer(initialState, {
  storefrontRequest: (state) => {
    state.loading = true;
  },
  storefrontSuccess: (state, action) => {
    state.loading = false;
    state.categories = action.payload.categories || [];
    state.featureTiles = action.payload.featureTiles || [];
    state.hero = action.payload.hero || {};
    state.storeName = action.payload.name || "";
    state.storeDescription = action.payload.description || "";
  },
  storefrontFail: (state, action) => {
    state.loading = false;
    state.error = action.payload;
  },
});
