import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { ServicesProvider } from "./contexts";
import { App } from "./app.tsx";
import "./index.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ServicesProvider>
      <App />
    </ServicesProvider>
  </StrictMode>
);
