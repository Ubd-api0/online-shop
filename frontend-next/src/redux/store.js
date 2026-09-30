import { configureStore } from "@reduxjs/toolkit";
import userReducer from "./slices/user";
import sellerReducer from "./slices/seller";
import productsReducer from "./slices/products";
import eventsReducer from "./slices/events";
import cartReducer from "./slices/cart";
import wishlistReducer from "./slices/wishlist";
import orderReducer from "./slices/order";
import storefrontReducer from "./slices/storefront";

export function makeStore() {
  return configureStore({
    reducer: {
      user: userReducer,
      seller: sellerReducer,
      products: productsReducer,
      events: eventsReducer,
      cart: cartReducer,
      wishlist: wishlistReducer,
      order: orderReducer,
      storefront: storefrontReducer,
    },
  });
}
