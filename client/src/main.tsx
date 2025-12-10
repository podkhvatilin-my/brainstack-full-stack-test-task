import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { bootServices } from "./services";
import { App } from "./app.tsx";
import "./index.css";

bootServices();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
