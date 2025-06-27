import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
// Bootstrap CSS
import "bootstrap/dist/css/bootstrap.min.css";
// Bootstrap JS (for modals, dropdowns, etc.)
import "bootstrap/dist/js/bootstrap.bundle.min.js";

import App from "./App";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
