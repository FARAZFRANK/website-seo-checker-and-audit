import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    outDir: '../assets/dist',
    emptyOutDir: true,
    cssCodeSplit: false,
    rollupOptions: {
      input: 'src/main.jsx',
      output: {
        entryFileNames: 'index.js',
        assetFileNames: 'index.[ext]',
        chunkFileNames: '[name].js',
      }
    }
  }
})
