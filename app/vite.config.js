import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react({ jsxRuntime: 'classic' })],
  build: {
    outDir: '../assets/dist',
    emptyOutDir: true,
    cssCodeSplit: false,
    rollupOptions: {
      input: {
        index: 'src/main.jsx',
        sidebar: 'src/sidebar.jsx'
      },
      external: [
        'react',
        'react-dom',
        '@wordpress/plugins',
        '@wordpress/edit-post',
        '@wordpress/components',
        '@wordpress/data',
        '@wordpress/element',
        '@wordpress/i18n',
        '@wordpress/editor',
        '@wordpress/block-editor'
      ],
      output: {
        entryFileNames: '[name].js',
        assetFileNames: '[name].[ext]',
        chunkFileNames: '[name].js',
        globals: {
          'react': 'wp.element',
          'react-dom': 'wp.element',
          '@wordpress/plugins': 'wp.plugins',
          '@wordpress/edit-post': 'wp.editPost',
          '@wordpress/components': 'wp.components',
          '@wordpress/data': 'wp.data',
          '@wordpress/element': 'wp.element',
          '@wordpress/i18n': 'wp.i18n',
          '@wordpress/editor': 'wp.editor',
          '@wordpress/block-editor': 'wp.blockEditor'
        }
      }
    }
  }
})
