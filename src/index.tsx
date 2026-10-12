import "./index.css";
import React from "react";
import ReactDOM from "react-dom/client";
import { App } from "./App";
import { applyTheme, getStoredTheme } from "./utils/theme";

// Apply the saved theme before the first render so the wrong theme never flashes.
applyTheme(getStoredTheme());

const rootEl = document.getElementById("root");
if (rootEl) {
  ReactDOM.createRoot(rootEl).render(<App />);
}