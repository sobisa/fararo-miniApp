import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"
import tsconfigPaths from "vite-tsconfig-paths"

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), tsconfigPaths()],
 base: '/',

  build: {
    outDir: 'price',
    rollupOptions: {
      output: {
       
        entryFileNames: 'assets/[name]-[hash].js',
        chunkFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]'
      }
    }
  }, 
  server: {
    host: true, // یا '0.0.0.0'
    port: 5173, // یا هر پورتی که خواستی
  },
})