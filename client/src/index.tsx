import React from "react";
import App from "./App";
import { createRoot } from "react-dom/client";
import { AuthContextProvider } from "./context/AuthContext";

const root = createRoot(document.getElementById("app")!);

root.render(
  <AuthContextProvider>
    <App />
  </AuthContextProvider>
);
