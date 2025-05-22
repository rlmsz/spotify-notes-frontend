import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const isProduction = mode === 'production';

  return {
    base: isProduction ? '/' : '/',
    define: {
      'process.env.NODE_ENV': `"${mode}"`
    },
    plugins: [react(), tailwindcss()],
    build: {
      outDir: 'dist',
      assetsDir: 'assets',
      sourcemap: false,
      minify: 'esbuild',
      rollupOptions: {
        output: {
          manualChunks: {
            react: ['react', 'react-dom', 'react-router-dom'],
            vendor: ['axios', 'zod']
          }
        }
      }
    },
    server: {
      host: '0.0.0.0',
      port: 5173,
      strictPort: true,
      proxy: {
        '/api': {
          target: 'http://localhost:5000',
          changeOrigin: true,
          secure: false,
          ws: true,
          configure: (proxy) => {
            proxy.on('error', (err) => {
              console.log('Proxy error:', err);
            });
            proxy.on('proxyReq', (proxyReq) => {
              console.log('Proxying request to:', proxyReq.path);
            });
            proxy.on('proxyRes', (proxyRes) => {
              console.log('Received response with status:', proxyRes.statusCode);
            });
          },
          rewrite: (path) => path.replace(/^\/api/, '/api')
        }
      }
    }
  };
});
