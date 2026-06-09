import { build } from 'vite';
import react from '@vitejs/plugin-react';

async function runBuild() {
  console.log('Building index.js...');
  // Build main index
  await build({
    configFile: false,
    plugins: [react()],
    build: {
      outDir: '../assets/dist',
      emptyOutDir: true,
      cssCodeSplit: false,
      rollupOptions: {
        input: {
          index: 'src/main.jsx'
        },
        external: [
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
          format: 'iife',
          name: 'FrankSeoDashboard',
          entryFileNames: 'index.js',
          assetFileNames: '[name].[ext]',
          globals: {
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
  });

  console.log('Building sidebar.js...');
  // Build sidebar
  await build({
    configFile: false,
    plugins: [react({ jsxRuntime: 'classic' })],
    build: {
      outDir: '../assets/dist',
      emptyOutDir: false, // Keep index.js
      cssCodeSplit: false,
      rollupOptions: {
        input: {
          sidebar: 'src/sidebar.jsx'
        },
        external: [
          'react',
          'react-dom',
          'react-dom/client',
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
          format: 'iife',
          name: 'FrankSeoSidebar',
          entryFileNames: 'sidebar.js',
          assetFileNames: '[name].[ext]',
          globals: {
            'react': 'wp.element',
            'react-dom': 'wp.element',
            'react-dom/client': 'wp.element',
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
  });
  console.log('Build complete successfully.');
}

runBuild().catch((err) => {
  console.error(err);
  process.exit(1);
});
