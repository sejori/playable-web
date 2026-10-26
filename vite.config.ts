import { defineConfig } from 'vite';

export default defineConfig({
  base: './',
  server: {
    port: 5173,
    headers: {
      'Cross-Origin-Opener-Policy': 'same-origin',
      'Cross-Origin-Embedder-Policy': 'require-corp',
    },
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:8080',
        changeOrigin: true,
      },
      '/verify': {
        target: 'http://127.0.0.1:8080',
        changeOrigin: true,
      },
      '/probe': {
        target: 'http://127.0.0.1:8080',
        changeOrigin: true,
      },
    },
  },
});
