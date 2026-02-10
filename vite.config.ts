import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { defineConfig } from "vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "@components": path.resolve(__dirname, "./src/components"),
      "@services": path.resolve(__dirname, "./src/services"),
      "@utils": path.resolve(__dirname, "./src/utils"),
      "@assets": path.resolve(__dirname, "./src/assets"),
      "@screens": path.resolve(__dirname, "./src/screens"),
      "@styles": path.resolve(__dirname, "./src/styles"),
      "@navigation": path.resolve(__dirname, "./src/navigation"),
      "@store": path.resolve(__dirname, "./src/store"),
      "@providers": path.resolve(__dirname, "./src/providers"),
      "@types": path.resolve(__dirname, "./src/types"),
    },
  },
});
