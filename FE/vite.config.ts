import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      "/uploads": {
        target: "http://146.56.117.219:8000",
        changeOrigin: true,
      },
    },
  },
});
