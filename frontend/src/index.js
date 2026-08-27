import React from "react";
import ReactDOM from "react-dom";
import App from "./App";
import reportWebVitals from "./reportWebVitals";

import { Provider } from "react-redux";
import Store from "./redux/store";
import { ThemeProvider } from "./context/ThemeContext";

ReactDOM.render(
  <Provider store={Store}>
    <ThemeProvider>
      <App />
    </ThemeProvider>
  </Provider>,
  document.getElementById("root")
);

reportWebVitals();
