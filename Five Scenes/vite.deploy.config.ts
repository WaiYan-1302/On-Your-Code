import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  root: "deploy-src",
  base: "./",
  publicDir: "../public",
  plugins: [react()],
  build: {
    outDir: "../deploy-dist",
    emptyOutDir: true,
  },
});
