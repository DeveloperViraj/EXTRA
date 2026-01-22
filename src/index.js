import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import "antd/dist/reset.css";
import "./App.css";
import "./antd-overrides.css";
import App from "./App";
import { Analytics } from "@vercel/analytics/react";

import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <ToastContainer />
    <App />
    <Analytics />
  </React.StrictMode>
);
