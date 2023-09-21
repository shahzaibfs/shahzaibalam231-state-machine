import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./index.css";
import { RegisterStateCTXProvider } from "@shahzaibalam231/state-machine";

ReactDOM.createRoot(document.getElementById("root")).render(
    <RegisterStateCTXProvider>
      <App />
    </RegisterStateCTXProvider>
);
