import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import reportWebVitals from "./reportWebVitals";

import { Provider } from "react-redux";
import Store from "./redux/store";
import { ThemeProvider } from "./context/ThemeContext";
import appConfig from "./config/appConfig";

// Apply branding from the single app config file (see src/config/appConfig.js).
const applyBranding = () => {
  if (appConfig.name) document.title = appConfig.name;

  if (appConfig.tagline) {
    let meta = document.querySelector('meta[name="description"]');
    if (!meta) {
      meta = document.createElement("meta");
      meta.setAttribute("name", "description");
      document.head.appendChild(meta);
    }
    meta.setAttribute("content", appConfig.tagline);
  }

  if (appConfig.favicon) {
    let link = document.querySelector('link[rel="icon"]');
    if (!link) {
      link = document.createElement("link");
      link.setAttribute("rel", "icon");
      document.head.appendChild(link);
    }
    link.setAttribute("href", appConfig.favicon);
  }
};
applyBranding();

const root = createRoot(document.getElementById("root"));
root.render(
  <Provider store={Store}>
    <ThemeProvider>
      <App />
    </ThemeProvider>
  </Provider>
);

reportWebVitals();
