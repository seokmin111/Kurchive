import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          react: ["react", "react-dom", "react-router-dom"],
          icons: [
            "@fortawesome/react-fontawesome",
            "@fortawesome/free-solid-svg-icons",
            "lucide-react",
          ],
        },
      },
    },
  },
  server: {
    proxy: {
      "/uploads": {
        target: "https://api.kurchive.com",
        changeOrigin: true,
      },
    },
  },
});
