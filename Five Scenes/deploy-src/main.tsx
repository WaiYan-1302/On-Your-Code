import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import Workshop from "../app/page";
import "../app/globals.css";

const root = document.getElementById("root");

if (!root) throw new Error("Workshop root element was not found.");

createRoot(root).render(
  <StrictMode>
    <Workshop />
  </StrictMode>,
);
