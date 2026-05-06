import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { viteSingleFile } from "vite-plugin-singlefile";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss(), viteSingleFile()],
  publicDir: false,
  build: {
    assetsInlineLimit: 1024 * 1024 * 20,
    cssCodeSplit: false,
  },
});
