import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    outDir: 'dist',
    chunkSizeWarningLimit: 1540,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            // Group react core, router, and framer/motion utilities together to avoid circular references
            if (
              id.includes('react') ||
              id.includes('scheduler') ||
              id.includes('framer-motion') ||
              id.includes('motion') ||
              id.includes('@remix-run') ||
              id.includes('react-router')
            ) {
              return 'vendor-react-core';
            }
            if (id.includes('firebase')) {
              return 'vendor-firebase';
            }
            if (id.includes('react-force-graph-2d') || id.includes('three') || id.includes('d3')) {
              return 'vendor-graphs';
            }
            return 'vendor-libs';
          }
        },
      },
    },
  },
});
