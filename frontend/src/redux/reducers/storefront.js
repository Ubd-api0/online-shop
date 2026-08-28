import { createReducer } from "@reduxjs/toolkit";

const initialState = {
  loading: true,
  categories: [],
  featureTiles: [],
  hero: {},
  storeName: "",
  storeDescription: "",
  storePhone: "",
  storeAddress: "",
  storeEmail: "",
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
    state.storePhone = action.payload.phoneNumber || "";
    state.storeAddress = action.payload.address || "";
    state.storeEmail = action.payload.email || "";
  },
  storefrontFail: (state, action) => {
    state.loading = false;
    state.error = action.payload;
  },
});
