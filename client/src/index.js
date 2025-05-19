/**
 * BlundrBot App Entry Point
 *
 * This is the main entry point for the React application.
 * It renders the App component into the DOM.
 */
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";

const root = ReactDOM.createRoot(document.getElementById("root"));

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
