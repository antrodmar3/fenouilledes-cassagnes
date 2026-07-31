import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  base: "/fenouilledes-paso-lento/",
  plugins: [react()],
  resolve: { alias: { "@": root } },
  build: { outDir: "dist-pages", emptyOutDir: true },
});
