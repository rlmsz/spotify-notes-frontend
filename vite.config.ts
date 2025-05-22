import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current directory.
  const env = loadEnv(mode, process.cwd(), '');
  const base = env.VITE_BASE_URL || '/';
  
  // Log environment variables for debugging (remove in production)
  console.log('Environment variables:', {
    VITE_BASE_URL: env.VITE_BASE_URL,
    VITE_SPOTIFY_REDIRECT_URI: env.VITE_SPOTIFY_REDIRECT_URI,
    VITE_API_URL: env.VITE_API_URL
  });

  return {
    base: base,
    define: {
      'process.env.NODE_ENV': `"${mode}"`
    },
    plugins: [react(), tailwindcss()],
    build: {
      outDir: 'dist',
      assetsDir: 'assets',
      assetsInlineLimit: 0,
      sourcemap: false,
      minify: 'terser',
      emptyOutDir: true,
      chunkSizeWarningLimit: 1000,
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
          target: 'https://spotify-notes-backend-akzwztap9-rlmszs-projects.vercel.app',
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
