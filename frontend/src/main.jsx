import React from "react";
import ReactDOM from "react-dom/client";
import "./styles/global.css";
import { RouterProvider } from "react-router-dom";
import { router } from "./app/router/router";
import { ThemeProvider } from "./app/providers/themeProvider";
import { AuthProvider } from "./app/providers/authProvider";

const root = document.getElementById("app");

if (!root) {
  throw new Error("Root container #app missing");
}

ReactDOM.createRoot(root).render(
  <React.StrictMode>
    <AuthProvider>
      <ThemeProvider>
        <RouterProvider router={router} />
      </ThemeProvider>
    </AuthProvider>
  </React.StrictMode>
);
