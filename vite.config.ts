import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tsconfigPaths from 'vite-tsconfig-paths';
import path from 'path';

export default defineConfig({
  plugins: [
    react(),
    tsconfigPaths(),
  ],
  server: {
    port: 5173,
    open: true,
    host: '0.0.0.0',
    hmr: {
      overlay: true,
    },
    proxy: {
      '/api': {
        target: process.env.NODE_ENV === 'production' 
          ? process.env.VITE_BASE_URL || 'http://localhost:3000'
          : 'http://localhost:3000',
        changeOrigin: true,
        secure: false,
      },
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
      lodash: 'lodash-es',
    },
  },
  optimizeDeps: {
    include: ['react', 'react-dom', 'lucide-react'],
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
  },
});
