import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig({
  server: {
    port: 5173,
  },
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // Core React + Router — changes rarely, cached long-term
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          // UI component libraries
          'ui-vendor': ['framer-motion', 'lucide-react', 'class-variance-authority', 'clsx', 'tailwind-merge'],
          // Data fetching & charting
          'data-vendor': ['@tanstack/react-query', 'recharts'],
        },
      },
    },
  },
});
